import { addOperatorReply } from "./consultation-store";

type RelayResult =
  | {
      mode: "mock";
      status: "mocked";
      replyText: string;
    }
  | {
      mode: "lark-cli";
      status: "sent";
      messageId?: string;
      replyText: string;
    }
  | {
      mode: "feishu";
      status: "sent";
      messageId?: string;
      replyText: string;
    };

type FeishuTokenResponse = {
  code?: number;
  msg?: string;
  tenant_access_token?: string;
};

type FeishuMessageResponse = {
  code?: number;
  msg?: string;
  data?: {
    message_id?: string;
  };
};

function env(name: string) {
  return process.env[name]?.trim() ?? "";
}

async function runtimeEnv(name: string) {
  const processValue = env(name);

  if (processValue) {
    return processValue;
  }

  try {
    const { env: workerEnv } = (await import("cloudflare:workers")) as {
      env?: Record<string, unknown>;
    };
    const value = workerEnv?.[name] ?? "";
    return String(value).trim();
  } catch {
    return "";
  }
}

async function hasFeishuConfig() {
  return Boolean(
    (await runtimeEnv("FEISHU_APP_ID")) &&
      (await runtimeEnv("FEISHU_APP_SECRET")) &&
      (await runtimeEnv("FEISHU_RECEIVE_ID")) &&
      (await runtimeEnv("FEISHU_RECEIVE_ID_TYPE")),
  );
}

async function getLarkCliChatId() {
  return (
    (await runtimeEnv("FEISHU_LARK_CLI_CHAT_ID")) ||
    (await runtimeEnv("FEISHU_BROADCAST_CHAT_ID")) ||
    (await runtimeEnv("FEISHU_POLL_CHAT_ID"))
  );
}

export async function relayConsultationMessage({
  sessionId,
  message,
}: {
  sessionId: string;
  message: string;
}): Promise<RelayResult> {
  const relayMode = await runtimeEnv("CONSULTATION_RELAY_MODE");
  const larkCliChatId = await getLarkCliChatId();

  if (relayMode === "lark-cli" && larkCliChatId) {
    const messageId = await sendLarkCliMessage(sessionId, message);
    const replyText =
      "消息已经转接到 Gin 的飞书私聊。当前本地版本已完成网站到飞书的真实发送验证。";
    addOperatorReply(sessionId, replyText);

    return {
      mode: "lark-cli",
      status: "sent",
      messageId,
      replyText,
    };
  }

  if (relayMode !== "feishu" || !(await hasFeishuConfig())) {
    const replyText = buildMockReply(message);
    addOperatorReply(sessionId, replyText);

    return {
      mode: "mock",
      status: "mocked",
      replyText,
    };
  }

  const token = await getTenantAccessToken();
  const messageId = await sendFeishuMessage(token, sessionId, message);

  return {
    mode: "feishu",
    status: "sent",
    messageId,
    replyText:
      "消息已经转接到 Gin 的飞书测试通道。收到飞书侧回复后，这里会同步更新。",
  };
}

async function sendLarkCliMessage(sessionId: string, message: string) {
  const bridgeUrl = await runtimeEnv("CONSULTATION_LARK_BRIDGE_URL");
  const text = [
    "网站咨询",
    `会话：${sessionId}`,
    `访客：${message}`,
    "",
    `如需回传到网站，请保留 #session:${sessionId}`,
  ].join("\n");

  if (bridgeUrl) {
    return sendViaLarkBridge(bridgeUrl, await getLarkCliChatId(), text);
  }

  const stdout = await runLarkCli([
    "im",
    "+messages-send",
    "--chat-id",
    await getLarkCliChatId(),
    "--text",
    text,
    "--as",
    "bot",
  ]);

  try {
    const payload = JSON.parse(stdout) as {
      data?: {
        message_id?: string;
      };
    };

    return payload.data?.message_id;
  } catch {
    return undefined;
  }
}

async function sendViaLarkBridge(
  bridgeUrl: string,
  chatId: string,
  text: string,
) {
  const response = await fetch(bridgeUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      chatId,
      text,
    }),
  });
  const payload = (await response.json()) as {
    messageId?: string;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error || "lark bridge send failed");
  }

  return payload.messageId;
}

async function runLarkCli(args: string[]) {
  const { spawn } = await import("node:child_process");

  return new Promise<string>((resolve, reject) => {
    const child = spawn("lark-cli", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("lark-cli send timed out"));
    }, 20000);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        resolve(stdout);
        return;
      }

      reject(new Error(stderr.trim() || stdout.trim() || "lark-cli send failed"));
    });
  });
}

function buildMockReply(message: string) {
  const clean = message.replace(/\s+/g, " ").trim();
  const topic = clean.length > 28 ? `${clean.slice(0, 28)}...` : clean;

  return `已收到你的咨询：${topic}。这是本地 mock 飞书回复，用来验证完整对话链路。`;
}

async function getTenantAccessToken() {
  const response = await fetch(
    "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
    {
      method: "POST",
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        app_id: await runtimeEnv("FEISHU_APP_ID"),
        app_secret: await runtimeEnv("FEISHU_APP_SECRET"),
      }),
    },
  );

  const payload = (await response.json()) as FeishuTokenResponse;

  if (!response.ok || payload.code !== 0 || !payload.tenant_access_token) {
    throw new Error(payload.msg || "Failed to get Feishu tenant access token");
  }

  return payload.tenant_access_token;
}

async function sendFeishuMessage(
  token: string,
  sessionId: string,
  message: string,
) {
  const response = await fetch(
    `https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=${encodeURIComponent(
      await runtimeEnv("FEISHU_RECEIVE_ID_TYPE"),
    )}`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        receive_id: await runtimeEnv("FEISHU_RECEIVE_ID"),
        msg_type: "text",
        content: JSON.stringify({
          text: `网站咨询\n会话：${sessionId}\n访客：${message}\n\n回复时请保留 #session:${sessionId}`,
        }),
      }),
    },
  );

  const payload = (await response.json()) as FeishuMessageResponse;

  if (!response.ok || payload.code !== 0) {
    throw new Error(payload.msg || "Failed to send Feishu message");
  }

  return payload.data?.message_id;
}
