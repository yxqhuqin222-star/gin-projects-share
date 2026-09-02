import Link from "next/link";

export default function AdminPage() {
  return (
    <main>
      <div className="workbench-page detail-page">
        <header className="minimal-header" aria-label="站点头部">
          <Link className="brand" href="/" aria-label="Gin Home">
            Gin
          </Link>
          <Link className="admin-back" href="/">
            返回首页
          </Link>
        </header>

        <section className="admin-placeholder" aria-labelledby="admin-title">
          <p className="eyebrow">Private content studio</p>
          <h1 id="admin-title">内容管理入口预留。</h1>
          <p>
            后续接入登录后，用于维护项目、分享和联系方式。当前公开站只展示已经整理好的内容。
          </p>
          <Link href="/">返回公开页面</Link>
        </section>
      </div>
    </main>
  );
}
