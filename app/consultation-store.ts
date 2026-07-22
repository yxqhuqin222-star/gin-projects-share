import { getD1 } from "../db";

export type ConsultationMessage = {
  id: string;
  role: "visitor" | "assistant" | "operator";
  text: string;
  status?: "sent" | "waiting" | "delivered" | "failed";
  createdAt: string;
};

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

export async function addMessage(
  sessionId: string,
  message: Omit<ConsultationMessage, "id" | "createdAt">,
  externalEventId?: string,
) {
  const database = await getD1();
  const createdAt = nowIso();
  const storedMessage: ConsultationMessage = {
    ...message,
    id: createId(message.role),
    createdAt,
  };

  await database
    .prepare(
      `INSERT INTO consultation_sessions (id, created_at, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET updated_at = excluded.updated_at`,
    )
    .bind(sessionId, createdAt, createdAt)
    .run();

  const result = await database
    .prepare(
      `INSERT OR IGNORE INTO consultation_messages
       (id, session_id, role, text, status, external_event_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      storedMessage.id,
      sessionId,
      storedMessage.role,
      storedMessage.text,
      storedMessage.status ?? null,
      externalEventId ?? null,
      storedMessage.createdAt,
    )
    .run();

  return { message: storedMessage, inserted: result.meta.changes > 0 };
}

export async function getMessages(sessionId: string) {
  const result = await (await getD1())
    .prepare(
      `SELECT id, role, text, status, created_at AS createdAt
       FROM consultation_messages
       WHERE session_id = ?
       ORDER BY created_at ASC, rowid ASC`,
    )
    .bind(sessionId)
    .all<ConsultationMessage>();

  return result.results ?? [];
}

export async function addOperatorReply(
  sessionId: string,
  text: string,
  externalEventId?: string,
) {
  return addMessage(
    sessionId,
    {
      role: "operator",
      text,
      status: "delivered",
    },
    externalEventId,
  );
}
