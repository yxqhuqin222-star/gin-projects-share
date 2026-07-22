import {
  addMessage,
  getMessages,
  normalizeSessionId,
} from "../../consultation-store";
import { relayConsultationMessage } from "../../feishu-adapter";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = normalizeSessionId(url.searchParams.get("sessionId") ?? "");

  return Response.json({
    sessionId,
    messages: getMessages(sessionId),
  });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      sessionId?: string;
      message?: string;
    };
    const message = payload.message?.trim() ?? "";

    if (!message) {
      return Response.json({ error: "message is required" }, { status: 400 });
    }

    if (message.length > 800) {
      return Response.json(
        { error: "message must be 800 characters or fewer" },
        { status: 400 },
      );
    }

    const sessionId = normalizeSessionId(payload.sessionId);
    const visitorMessage = addMessage(sessionId, {
      role: "visitor",
      text: message,
      status: "sent",
    });

    addMessage(sessionId, {
      role: "assistant",
      text: "正在转接 Gin 的飞书咨询通道，请稍等。",
      status: "waiting",
    });

    const relay = await relayConsultationMessage({ sessionId, message });

    return Response.json({
      sessionId,
      message: visitorMessage,
      relay,
      messages: getMessages(sessionId),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";

    return Response.json({ error: message }, { status: 500 });
  }
}
