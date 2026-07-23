import { spawn } from "node:child_process";
import { createServer } from "node:http";

const port = Number(process.env.CONSULTATION_LARK_BRIDGE_PORT || "8788");
const pollEnabled = process.env.CONSULTATION_LARK_BRIDGE_POLL === "true";
const pollIntervalMs = Number(
  process.env.CONSULTATION_LARK_BRIDGE_POLL_INTERVAL_MS || "3000",
);
const siteCallbackUrl =
  process.env.CONSULTATION_SITE_CALLBACK_URL ||
  "http://127.0.0.1:3001/api/consult/feishu-events";
const eventToken =
  process.env.FEISHU_EVENT_VERIFY_TOKEN ||
  process.env.CONSULTATION_EVENT_TOKEN ||
  "";
const pollChatId =
  process.env.FEISHU_LARK_CLI_CHAT_ID ||
  process.env.FEISHU_BROADCAST_CHAT_ID ||
  process.env.FEISHU_POLL_CHAT_ID ||
  "";
const seenMessageIds = new Set();

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 12000) {
        reject(new Error("request body too large"));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function runLarkCli(args) {
  return new Promise((resolve, reject) => {
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

function extractText(content) {
  if (typeof content !== "string") {
    return "";
  }

  try {
    const parsed = JSON.parse(content);
    return String(parsed?.text || parsed?.content || content);
  } catch {
    return content;
  }
}

async function listRecentMessages(chatId) {
  const stdout = await runLarkCli([
    "im",
    "+chat-messages-list",
    "--chat-id",
    chatId,
    "--page-size",
    "10",
    "--as",
    "user",
  ]);
  const envelope = JSON.parse(stdout || "{}");
  return envelope?.data?.messages || [];
}

async function postReplyToSite(text, messageId) {
  const response = await fetch(siteCallbackUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      token: eventToken,
      header: {
        event_id: messageId,
        event_type: "im.message.receive_v1",
        token: eventToken,
      },
      event: {
        sender: { sender_type: "user" },
        message: {
          message_id: messageId,
          content: JSON.stringify({ text }),
        },
      },
    }),
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || `site callback failed: ${response.status}`);
  }

  return payload;
}

async function pollReplies({ prime = false } = {}) {
  if (!pollChatId) {
    throw new Error("Missing FEISHU_LARK_CLI_CHAT_ID, FEISHU_BROADCAST_CHAT_ID, or FEISHU_POLL_CHAT_ID");
  }

  const messages = await listRecentMessages(pollChatId);

  for (const message of messages.toReversed()) {
    const messageId = message?.message_id;

    if (!messageId || seenMessageIds.has(messageId)) {
      continue;
    }

    seenMessageIds.add(messageId);

    if (prime) {
      continue;
    }

    if (message?.sender?.sender_type !== "user") {
      continue;
    }

    const text = extractText(message.content);

    if (!/#session:[a-zA-Z0-9_-]{8,80}/.test(text)) {
      continue;
    }

    const result = await postReplyToSite(text, messageId);
    console.log(`forwarded Feishu reply ${messageId} to site session ${result.sessionId || ""}`);
  }
}

async function startPolling() {
  if (!pollEnabled) {
    return;
  }

  if (!eventToken) {
    throw new Error("FEISHU_EVENT_VERIFY_TOKEN or CONSULTATION_EVENT_TOKEN is required when polling replies");
  }

  await pollReplies({ prime: true });
  console.log(`polling Feishu replies every ${pollIntervalMs}ms`);
  setInterval(() => {
    pollReplies().catch((error) => {
      console.error(`poll failed: ${error instanceof Error ? error.message : String(error)}`);
    });
  }, pollIntervalMs);
}

async function handleSend(request, response) {
  try {
    const payload = JSON.parse(await readBody(request));
    const chatId = String(payload.chatId || "").trim();
    const text = String(payload.text || "").trim();

    if (!chatId || !text) {
      sendJson(response, 400, { error: "chatId and text are required" });
      return;
    }

    const stdout = await runLarkCli([
      "im",
      "+messages-send",
      "--chat-id",
      chatId,
      "--text",
      text,
      "--as",
      "bot",
    ]);
    let messageId = "";

    try {
      const result = JSON.parse(stdout);
      messageId = result?.data?.message_id || "";
    } catch {
      messageId = "";
    }

    sendJson(response, 200, { ok: true, messageId });
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : "Unexpected bridge error",
    });
  }
}

const server = createServer((request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "POST" && request.url === "/send") {
    void handleSend(request, response);
    return;
  }

  sendJson(response, 404, { error: "not found" });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`lark-cli bridge listening on http://127.0.0.1:${port}`);
  startPolling().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
});
