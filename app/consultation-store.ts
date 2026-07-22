export type ConsultationMessage = {
  id: string;
  role: "visitor" | "assistant" | "operator";
  text: string;
  status?: "sent" | "waiting" | "delivered" | "failed";
  createdAt: string;
};

type ConsultationSession = {
  id: string;
  messages: ConsultationMessage[];
  updatedAt: number;
};

declare global {
  var consultationSessions:
    | Map<string, ConsultationSession>
    | undefined;
}

const sessions = globalThis.consultationSessions ?? new Map<string, ConsultationSession>();
globalThis.consultationSessions = sessions;

function createId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

export function normalizeSessionId(sessionId?: string) {
  const clean = sessionId?.trim();
  return clean && /^[a-zA-Z0-9_-]{8,80}$/.test(clean) ? clean : createId("chat");
}

export function addMessage(
  sessionId: string,
  message: Omit<ConsultationMessage, "id" | "createdAt">,
) {
  const session =
    sessions.get(sessionId) ?? {
      id: sessionId,
      messages: [],
      updatedAt: Date.now(),
    };

  const storedMessage = {
    ...message,
    id: createId(message.role),
    createdAt: nowIso(),
  };

  session.messages.push(storedMessage);
  session.updatedAt = Date.now();
  sessions.set(sessionId, session);
  pruneSessions();

  return storedMessage;
}

export function getMessages(sessionId: string) {
  return sessions.get(sessionId)?.messages ?? [];
}

export function addOperatorReply(sessionId: string, text: string) {
  return addMessage(sessionId, {
    role: "operator",
    text,
    status: "delivered",
  });
}

function pruneSessions() {
  const expiresBefore = Date.now() - 1000 * 60 * 60 * 6;

  for (const [id, session] of sessions) {
    if (session.updatedAt < expiresBefore) {
      sessions.delete(id);
    }
  }
}
