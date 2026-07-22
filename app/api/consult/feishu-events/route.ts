import { addOperatorReply } from "../../../consultation-store";

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

function extractText(content: unknown) {
  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content) as { text?: string };
      return parsed.text ?? content;
    } catch {
      return content;
    }
  }

  if (content && typeof content === "object" && "text" in content) {
    return String((content as { text?: unknown }).text ?? "");
  }

  return "";
}

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    schema?: string;
    challenge?: string;
    token?: string;
    header?: {
      event_id?: string;
      event_type?: string;
      token?: string;
    };
    event?: {
      sender?: {
        sender_type?: string;
      };
      message?: {
        content?: unknown;
      };
    };
  };

  const verifyToken = await runtimeEnv("FEISHU_EVENT_VERIFY_TOKEN");

  if (!verifyToken) {
    return Response.json(
      { error: "FEISHU_EVENT_VERIFY_TOKEN is required" },
      { status: 503 },
    );
  }

  const requestToken = payload.header?.token ?? payload.token;

  if (requestToken !== verifyToken) {
    return Response.json({ error: "invalid verify token" }, { status: 401 });
  }

  if (payload.challenge) {
    return Response.json({ challenge: payload.challenge });
  }

  if (
    payload.header?.event_type &&
    payload.header.event_type !== "im.message.receive_v1"
  ) {
    return Response.json({ accepted: false, reason: "unsupported event type" });
  }

  if (payload.event?.sender?.sender_type === "app") {
    return Response.json({ accepted: false, reason: "ignored app message" });
  }

  const text = extractText(payload.event?.message?.content);
  const sessionMatch = text.match(/#session:([a-zA-Z0-9_-]{8,80})/);

  if (!sessionMatch) {
    return Response.json({
      accepted: false,
      reason: "missing #session:<id> marker",
    });
  }

  const sessionId = sessionMatch[1];
  const reply = text.replace(sessionMatch[0], "").trim();

  if (!reply) {
    return Response.json({ accepted: false, reason: "empty reply" });
  }

  if (reply.length > 800) {
    return Response.json(
      { accepted: false, reason: "reply too long" },
      { status: 400 },
    );
  }

  const { message, inserted } = await addOperatorReply(
    sessionId,
    reply,
    payload.header?.event_id,
  );

  return Response.json({
    accepted: true,
    duplicate: !inserted,
    sessionId,
    message,
  });
}
