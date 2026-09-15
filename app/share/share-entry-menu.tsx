"use client";

import { useState } from "react";

export function ShareEntryMenu({ shareId, entryId }: { shareId: string; entryId: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function removeEntry() {
    if (!window.confirm("删除后这条记录将从公开页面移除，确定继续吗？")) return;
    setBusy(true);
    const response = await fetch("/api/admin/content", { credentials: "same-origin" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      window.alert(payload.error ?? "无法读取内容，请先登录管理页面。");
      setBusy(false);
      return;
    }
    const content = payload.content;
    const share = content.shares.find((item: { id: string }) => item.id === shareId);
    if (!share) {
      window.alert("没有找到这个模块。");
      setBusy(false);
      return;
    }
    share.entries = (share.entries ?? []).filter((entry: { id: string }) => entry.id !== entryId);
    const save = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ content, expectedVersion: payload.version }),
    });
    const saved = await save.json().catch(() => ({}));
    if (!save.ok) {
      window.alert(saved.error ?? "删除失败，请刷新后重试。");
      setBusy(false);
      return;
    }
    window.location.reload();
  }

  return <div className="share-entry-actions"><button className="share-entry-more" type="button" aria-label="更多操作" aria-expanded={open} onClick={() => setOpen((value) => !value)} disabled={busy}>•••</button>{open ? <div className="share-entry-menu"><a href={`/admin?share=${encodeURIComponent(shareId)}&entry=${encodeURIComponent(entryId)}`}>编辑记录</a><button type="button" onClick={removeEntry}>删除记录</button></div> : null}</div>;
}
