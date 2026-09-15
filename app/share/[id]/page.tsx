import Link from "next/link";
import { isCurrentAdminAuthenticated } from "../../admin-auth";
import { getPublicSiteContent } from "../../content-store";
import { ShareEntryMenu } from "../share-entry-menu";

function formatDate(value: string) {
  if (value === "1970-01-01T00:00:00.000Z") return "时间未记录";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "时间未记录";
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date).replace(", ", " ");
}

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const content = await getPublicSiteContent();
  const isAdmin = await isCurrentAdminAuthenticated();
  const share = content.shares.find((item) => item.id === id);

  if (!share) {
    return <main><div className="workbench-page share-page"><Link className="back-link" href="/">← 返回首页</Link><p className="admin-empty">没有找到这个模块。</p></div></main>;
  }

  const entries = [...(share.entries ?? [])].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  return <main><div className="workbench-page share-page"><div className="share-page-topbar"><Link className="back-link" href="/#writing">← 返回兴趣与记录</Link><Link className="share-home-link" href="/">返回首页</Link></div><header className="share-page-header"><div><p className="eyebrow">{share.group}</p><h1>{share.title}</h1></div><span className="share-entry-count">{entries.length} 条记录</span></header><section className="share-entry-list" aria-label={`${share.title}记录`}>{entries.length ? entries.map((entry) => <article className="share-entry-card" key={entry.id}><time dateTime={entry.createdAt}>{formatDate(entry.createdAt)}</time><p>{entry.content}</p><span className="share-entry-tag">{share.group}</span>{isAdmin ? <ShareEntryMenu shareId={share.id} entryId={entry.id} /> : null}</article>) : <p className="share-empty">还没有记录。</p>}</section></div></main>;
}
