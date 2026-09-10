"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { projectCategories, type ContactLink, type ManagedProject, type OtherLink, type Share, type SiteContent } from "../site-data";

type Section = "projects" | "shares" | "others" | "contacts";
const emptyContent: SiteContent = { projects: [], shares: [], otherLinks: [], contactLinks: [] };

function localId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="admin-field"><span>{label}</span>{children}</label>;
}

function move<T>(items: T[], index: number, direction: -1 | 1) {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function AdminClient({ initiallyAuthenticated }: { initiallyAuthenticated: boolean }) {
  const [authenticated, setAuthenticated] = useState(initiallyAuthenticated);
  const [password, setPassword] = useState("");
  const [content, setContent] = useState<SiteContent>(emptyContent);
  const [version, setVersion] = useState<number | null>(null);
  const [section, setSection] = useState<Section>("projects");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(initiallyAuthenticated);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [issues, setIssues] = useState<string[]>([]);
  const [dirty, setDirty] = useState(false);

  const selected = useMemo(() => {
    if (section === "projects") return content.projects[selectedIndex];
    if (section === "shares") return content.shares[selectedIndex];
    if (section === "others") return content.otherLinks[selectedIndex];
    return content.contactLinks[selectedIndex];
  }, [content, section, selectedIndex]);

  async function loadContent() {
    setLoading(true); setIssues([]);
    const response = await fetch("/api/admin/content", { credentials: "same-origin" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setIssues([payload.error ?? "无法读取站点内容。"]);
      if (response.status === 401) setAuthenticated(false);
    } else { setContent(payload.content); setVersion(payload.version); setDirty(false); }
    setLoading(false);
  }

  useEffect(() => {
    if (!authenticated) return;
    void Promise.resolve().then(loadContent);
  }, [authenticated]);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setNotice(""); setIssues([]);
    const response = await fetch("/api/admin/auth", { method: "POST", headers: { "content-type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ password }) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) { setIssues([payload.error ?? "登录失败。"]); return; }
    setPassword(""); setAuthenticated(true);
  }

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE", credentials: "same-origin" });
    setAuthenticated(false); setContent(emptyContent); setVersion(null); setNotice(""); setIssues([]);
  }

  async function save() {
    setSaving(true); setNotice(""); setIssues([]);
    const response = await fetch("/api/admin/content", { method: "PUT", headers: { "content-type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ content, expectedVersion: version }) });
    const payload = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setIssues(payload.issues ?? [payload.error ?? "保存失败。"]);
      if (response.status === 401) setAuthenticated(false);
      return;
    }
    setContent(payload.content); setVersion(payload.version); setDirty(false); setNotice("已保存，公开页面已使用新内容。");
  }

  function updateProject(patch: Partial<ManagedProject>) {
    setContent((current) => ({ ...current, projects: current.projects.map((item, index) => index === selectedIndex ? { ...item, ...patch } : item) })); setDirty(true);
  }
  function updateShare(patch: Partial<Share>) {
    setContent((current) => ({ ...current, shares: current.shares.map((item, index) => index === selectedIndex ? { ...item, ...patch } : item) })); setDirty(true);
  }
  function updateContact(patch: Partial<ContactLink>) {
    setContent((current) => ({ ...current, contactLinks: current.contactLinks.map((item, index) => index === selectedIndex ? { ...item, ...patch } : item) })); setDirty(true);
  }
  function updateOtherLink(patch: Partial<OtherLink>) {
    setContent((current) => ({ ...current, otherLinks: current.otherLinks.map((item, index) => index === selectedIndex ? { ...item, ...patch } : item) })); setDirty(true);
  }

  function addEntry() {
    if (section === "projects") {
      setContent((current) => ({ ...current, projects: [...current.projects, { id: localId("project"), slug: "new-project", title: "新项目", githubUrl: "https://github.com/", categoryId: projectCategories[0].id, status: "", monogram: "项目", summary: "请填写项目摘要。", intro: "请填写项目介绍。", paragraphs: ["请填写可核验的项目说明。"], isPublished: false }] })); setSelectedIndex(content.projects.length);
    } else if (section === "shares") {
      setContent((current) => ({ ...current, shares: [...current.shares, { id: localId("share"), title: "新分享", group: "Notes", summary: "请填写分享说明。" }] })); setSelectedIndex(content.shares.length);
    } else if (section === "others") {
      setContent((current) => ({ ...current, otherLinks: [...current.otherLinks, { id: localId("other"), title: "新入口", summary: "请填写入口说明。", href: "https://" }] })); setSelectedIndex(content.otherLinks.length);
    } else {
      setContent((current) => ({ ...current, contactLinks: [...current.contactLinks, { id: localId("contact"), label: "新联系方式", value: "", href: "mailto:" }] })); setSelectedIndex(content.contactLinks.length);
    }
    setDirty(true);
  }

  function removeEntry() {
    if (section === "projects") return;
    if (section === "shares") setContent((current) => ({ ...current, shares: current.shares.filter((_, index) => index !== selectedIndex) }));
    else if (section === "others") setContent((current) => ({ ...current, otherLinks: current.otherLinks.filter((_, index) => index !== selectedIndex) }));
    else setContent((current) => ({ ...current, contactLinks: current.contactLinks.filter((_, index) => index !== selectedIndex) }));
    setSelectedIndex((current) => Math.max(0, current - 1));
    setDirty(true);
  }
  function reorder(direction: -1 | 1) {
    if (section === "projects") setContent((current) => ({ ...current, projects: move(current.projects, selectedIndex, direction) }));
    if (section === "shares") setContent((current) => ({ ...current, shares: move(current.shares, selectedIndex, direction) }));
    if (section === "others") setContent((current) => ({ ...current, otherLinks: move(current.otherLinks, selectedIndex, direction) }));
    if (section === "contacts") setContent((current) => ({ ...current, contactLinks: move(current.contactLinks, selectedIndex, direction) }));
    setSelectedIndex((current) => current + direction); setDirty(true);
  }

  if (!authenticated) return <section className="admin-login" aria-labelledby="admin-title"><p className="eyebrow">Private content studio</p><h1 id="admin-title">管理站点内容。</h1><p>登录后可维护项目、分享、其他入口与联系方式。保存后公开页面会即时更新。</p><form onSubmit={login}><Field label="管理密码"><input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></Field><button className="button primary" type="submit">登录</button></form>{issues.length ? <p className="admin-message error">{issues[0]}</p> : null}</section>;

  const entries = section === "projects" ? content.projects : section === "shares" ? content.shares : section === "others" ? content.otherLinks : content.contactLinks;
  const entryName = (entry: ManagedProject | Share | OtherLink | ContactLink) => "title" in entry ? entry.title : entry.label;
  const onText = (key: string) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    if (section === "projects") updateProject({ [key]: value } as Partial<ManagedProject>);
    if (section === "shares") updateShare({ [key]: value } as Partial<Share>);
    if (section === "others") updateOtherLink({ [key]: value } as Partial<OtherLink>);
    if (section === "contacts") updateContact({ [key]: value } as Partial<ContactLink>);
  };

  return <section className="admin-studio" aria-labelledby="admin-title">
    <div className="admin-studio-header"><div><p className="eyebrow">Private content studio</p><h1 id="admin-title">内容管理</h1></div><div className="admin-header-actions"><span>{dirty ? "有未保存改动" : "已同步"}</span><button type="button" className="text-button" onClick={logout}>退出登录</button></div></div>
    {loading ? <p className="admin-message">正在读取内容…</p> : <div className="admin-grid">
      <aside className="admin-list" aria-label="内容条目"><div className="admin-sections">{(["projects", "shares", "others", "contacts"] as Section[]).map((item) => <button key={item} type="button" className={section === item ? "active" : ""} onClick={() => { setSection(item); setSelectedIndex(0); }}>{item === "projects" ? "项目" : item === "shares" ? "分享" : item === "others" ? "其他" : "联系"}</button>)}</div><div className="admin-list-actions"><button type="button" onClick={addEntry}>新增</button><button type="button" disabled={selectedIndex === 0} onClick={() => reorder(-1)}>上移</button><button type="button" disabled={selectedIndex >= entries.length - 1} onClick={() => reorder(1)}>下移</button>{section !== "projects" ? <button type="button" className="danger" onClick={removeEntry}>删除</button> : null}</div><div className="admin-entry-list">{entries.map((entry, index) => <button type="button" key={entry.id} className={selectedIndex === index ? "active" : ""} onClick={() => setSelectedIndex(index)}>{entryName(entry)}</button>)}</div></aside>
      <div className="admin-editor">{section === "projects" && selected ? <ProjectEditor project={selected as ManagedProject} onText={onText} updateProject={updateProject} /> : null}{section === "shares" && selected ? <ShareEditor share={selected as Share} onText={onText} /> : null}{section === "others" && selected ? <OtherLinkEditor link={selected as OtherLink} onText={onText} /> : null}{section === "contacts" && selected ? <ContactEditor contact={selected as ContactLink} onText={onText} /> : null}{!selected ? <p className="admin-empty">选择或新增一条内容开始编辑。</p> : null}</div>
      <aside className="admin-preview" aria-label="保存与预览"><p className="eyebrow">Publish check</p><h2>{dirty ? "改动尚未公开" : "内容已保存"}</h2><p>保存会一次性更新项目、分享、其他入口和联系方式。字段有误时不会写入数据库。</p>{section === "projects" && selected && "slug" in selected ? <a href={`/product/${selected.slug}`} target="_blank" rel="noreferrer">打开项目公开页 ↗</a> : <a href="/" target="_blank" rel="noreferrer">打开首页 ↗</a>}<button type="button" className="button primary" disabled={!dirty || saving} onClick={save}>{saving ? "保存中…" : "保存并发布"}</button>{notice ? <p className="admin-message success">{notice}</p> : null}{issues.length ? <ul className="admin-message error">{issues.map((issue) => <li key={issue}>{issue}</li>)}</ul> : null}</aside>
    </div>}
  </section>;
}

function WorkflowEditor({ project, updateProject }: { project: ManagedProject; updateProject: (patch: Partial<ManagedProject>) => void }) {
  const workflow = project.workflow;
  return <fieldset className="admin-workflow-fields">
    <legend>流程介绍</legend>
    <label className="admin-toggle"><input type="checkbox" checked={Boolean(workflow)} onChange={(event) => updateProject({ workflow: event.target.checked ? { steps: [""], features: [], note: "" } : undefined })} />使用简洁流程模板</label>
    <p className="admin-workflow-help">开启后，详情显示一句介绍、流程和功能点；原正文保留但不重复展示。</p>
    {workflow ? <div className="admin-fields">
      <Field label="流程步骤（每行一步，最多 4 步）"><textarea rows={4} value={workflow.steps.join("\n")} onChange={(event) => updateProject({ workflow: { ...workflow, steps: event.target.value.split("\n") } })} /></Field>
      <Field label="功能点（每行一个，最多 3 个）"><textarea rows={3} value={workflow.features.join("\n")} onChange={(event) => updateProject({ workflow: { ...workflow, features: event.target.value ? event.target.value.split("\n") : [] } })} /></Field>
      <Field label="使用说明（可选）"><textarea value={workflow.note} onChange={(event) => updateProject({ workflow: { ...workflow, note: event.target.value } })} /></Field>
    </div> : null}
  </fieldset>;
}

function ProjectEditor({ project, onText, updateProject }: { project: ManagedProject; onText: (key: string) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; updateProject: (patch: Partial<ManagedProject>) => void }) {
  return <><div className="admin-editor-heading"><div><p className="eyebrow">Project</p><h2>{project.title}</h2></div><label className="admin-toggle"><input type="checkbox" checked={project.isPublished} onChange={(event) => updateProject({ isPublished: event.target.checked })} />公开显示</label></div><div className="admin-fields two-columns"><Field label="标题"><input value={project.title} onChange={onText("title")} /></Field><Field label="slug"><input value={project.slug} onChange={onText("slug")} /></Field><Field label="分类"><select value={project.categoryId} onChange={(event) => updateProject({ categoryId: event.target.value as ManagedProject["categoryId"] })}>{projectCategories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}</select></Field><Field label="状态"><input value={project.status} onChange={onText("status")} /></Field><Field label="卡片标签"><input value={project.monogram} onChange={onText("monogram")} /></Field><Field label="GitHub 链接"><input value={project.githubUrl} onChange={onText("githubUrl")} /></Field><Field label="线上链接（可选）"><input value={project.liveUrl ?? ""} onChange={onText("liveUrl")} /></Field><Field label="封面图 URL（可选）"><input value={project.image ?? ""} onChange={onText("image")} /></Field></div><div className="admin-fields"><Field label="项目摘要"><textarea value={project.summary} onChange={onText("summary")} /></Field><Field label="详情介绍"><textarea value={project.intro} onChange={onText("intro")} /></Field><WorkflowEditor project={project} updateProject={updateProject} /><Field label="正文段落（每行一段）"><textarea value={project.paragraphs.join("\n")} onChange={(event) => updateProject({ paragraphs: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean) })} /></Field><Field label="图库 URL（每行一个，可使用 /projects/...）"><textarea value={(project.galleryImages ?? []).join("\n")} onChange={(event) => updateProject({ galleryImages: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean) })} /></Field><Field label="图片说明（与图库逐行对应，可留空）"><textarea value={(project.galleryCaptions ?? []).join("\n")} onChange={(event) => updateProject({ galleryCaptions: event.target.value.split("\n") })} /></Field><Field label="证据备注（仅后台）"><textarea value={project.sourceNote ?? ""} onChange={onText("sourceNote")} /></Field></div></>;
}

function ShareEditor({ share, onText }: { share: Share; onText: (key: string) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void }) {
  return <><div className="admin-editor-heading"><div><p className="eyebrow">Share</p><h2>{share.title}</h2></div></div><div className="admin-fields"><Field label="标题"><input value={share.title} onChange={onText("title")} /></Field><Field label="分组"><input value={share.group} onChange={onText("group")} /></Field><Field label="摘要"><textarea value={share.summary} onChange={onText("summary")} /></Field></div></>;
}

function OtherLinkEditor({ link, onText }: { link: OtherLink; onText: (key: string) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void }) {
  return <><div className="admin-editor-heading"><div><p className="eyebrow">Other</p><h2>{link.title}</h2></div></div><div className="admin-fields"><Field label="名称"><input value={link.title} onChange={onText("title")} /></Field><Field label="简单说明"><textarea value={link.summary} onChange={onText("summary")} /></Field><Field label="跳转链接"><input inputMode="url" value={link.href} onChange={onText("href")} /></Field></div></>;
}

function ContactEditor({ contact, onText }: { contact: ContactLink; onText: (key: string) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void }) {
  return <><div className="admin-editor-heading"><div><p className="eyebrow">Contact</p><h2>{contact.label}</h2></div></div><div className="admin-fields"><Field label="标签"><input value={contact.label} onChange={onText("label")} /></Field><Field label="显示内容"><input value={contact.value} onChange={onText("value")} /></Field><Field label="链接"><input value={contact.href} onChange={onText("href")} /></Field></div></>;
}
