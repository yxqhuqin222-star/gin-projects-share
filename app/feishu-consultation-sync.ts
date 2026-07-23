import {
  addOperatorReply,
  claimConsultationSync,
  hasConsultationSession,
} from "./consultation-store";
import {
  isFeishuConsultationSyncConfigured,
  listFeishuConsultationReplies,
} from "./feishu-adapter";

const syncIntervalMs = 4000;

export async function syncFeishuConsultationReplies() {
  if (!(await isFeishuConsultationSyncConfigured())) {
    return;
  }

  if (!(await claimConsultationSync("feishu-replies", syncIntervalMs))) {
    return;
  }

  const replies = await listFeishuConsultationReplies();

  for (const reply of replies.reverse()) {
    if (!(await hasConsultationSession(reply.sessionId))) {
      continue;
    }

    await addOperatorReply(reply.sessionId, reply.text, reply.eventId);
  }
}
