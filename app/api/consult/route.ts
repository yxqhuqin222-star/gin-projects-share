import {
  addMessage,
  getMessages,
  normalizeSessionId,
} from "../../consultation-store";
import {
  ConsultationRelayConfigError,
  relayConsultationMessage,
} from "../../feishu-adapter";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = normalizeSessionId(url.searchParams.get("sessionId") ?? "");

  return Response.json({
    sessionId,
    messages: await getMessages(sessionId),
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
    const relay = await relayConsultationMessage({ sessionId, message });
    const { message: visitorMessage } = await addMessage(sessionId, {
      role: "visitor",
      text: message,
      status: "sent",
    });

    return Response.json({
      sessionId,
      message: visitorMessage,
      relay,
      messages: await getMessages(sessionId),
    });
  } catch (error) {
    if (error instanceof ConsultationRelayConfigError) {
      return Response.json(
        { error: "咨询服务暂未配置，请稍后再试。" },
        { status: 503 },
      );
    }

    console.error("Failed to relay consultation message", error);

    return Response.json(
      { error: "消息发送失败，请稍后再试。" },
      { status: 502 },
    );
  }
}
