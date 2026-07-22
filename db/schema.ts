import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const consultationSessions = sqliteTable("consultation_sessions", {
  id: text("id").primaryKey(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const consultationMessages = sqliteTable(
  "consultation_messages",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => consultationSessions.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["visitor", "assistant", "operator"] }).notNull(),
    text: text("text").notNull(),
    status: text("status", {
      enum: ["sent", "waiting", "delivered", "failed"],
    }),
    externalEventId: text("external_event_id").unique(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("consultation_messages_session_created_idx").on(
      table.sessionId,
      table.createdAt,
    ),
  ],
);
