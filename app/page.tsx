import Link from "next/link";
import { categories, navItems, projects, shares } from "./site-data";

const projectAnchor = (slug: string) => `project-${slug}`;
const categoryAnchors = new Map<string, string>();

projects.forEach((project) => {
  if (!categoryAnchors.has(project.category)) {
    categoryAnchors.set(project.category, `#${projectAnchor(project.slug)}`);
  }
});

export default function Home() {
  return (
    <main id="top">
      <div className="page-shell">
        <header className="site-header" aria-label="站点头部">
          <div className="header-left">
            <Link className="brand" href="/" aria-label="Gin Home">
              Gin
            </Link>
            <nav aria-label="主导航">
              {navItems.map((item, index) => (
                <Link
                  className={index === 0 ? "active" : undefined}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <section className="hero">
          <h1>
            嗨，我是 Gin，
            <br />
            这里记录我正在搭建的工具和系统
          </h1>
          <p>
            这里整理我正在做的 Web App、AI workflow、automation console 和 open-source experiments。每个项目尽量保留真实截图、GitHub 链接和可复盘的实现说明。
          </p>
        </section>

        <section className="products" id="projects" aria-labelledby="products-title">
          <div className="section-copy">
            <h2 id="products-title">项目</h2>
            <p>从真实工作流出发，做可复用、可验证、可继续迭代的系统</p>
          </div>

          <ul className="category-tabs" aria-label="产品分类">
            {categories.map((category) => {
              const href = category === "All" ? "#projects" : categoryAnchors.get(category);

              return (
                <li key={category}>
                  {href ? <a href={href}>{category}</a> : <span>{category}</span>}
                </li>
              );
            })}
          </ul>

          <div className="product-grid">
            {projects.map((project) => (
              <article
                className="product-card"
                id={projectAnchor(project.slug)}
                key={project.title}
              >
                <Link
                  className="product-visual"
                  href={`/product/${project.slug}`}
                  aria-label={`Open ${project.title} project detail`}
                >
                  <img
                    alt={`${project.title} project preview`}
                    loading="lazy"
                    src={project.image}
                  />
                  <span>{project.category}</span>
                </Link>
                <Link className="product-title" href={`/product/${project.slug}`}>
                  {project.title}
                </Link>
                <p>{project.summary}</p>
                <div className="tags">
                  <span>{project.category}</span>
                  <span>{project.role}</span>
                  <strong>{project.status}</strong>
                </div>
                <div className="project-links">
                  <Link href={`/product/${project.slug}`}>Case study</Link>
                  <a href={project.githubUrl} target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="sharing" id="writing" aria-labelledby="sharing-title">
          <div className="section-copy">
            <h2 id="sharing-title">分享</h2>
            <p>日常收集到的可分享的东西，有书籍、AI、工具和生活相关的。</p>
          </div>
          <div className="share-grid">
            {shares.map((share) => (
              <article key={share.title}>
                <span>{share.group}</span>
                <h3>{share.title}</h3>
                <p>{share.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="footer" id="contact">
          <div className="section-copy">
            <h2>联系</h2>
            <p>如果你对这些工具、工作流或项目实现感兴趣，可以从下面入口联系我</p>
          </div>
          <div className="footer-links">
            <a href="mailto:yxqhuqin222@gmail.com">邮箱：yxqhuqin222@gmail.com</a>
            <a href="tel:18401205743">微信：18401205743</a>
            <a href="https://github.com/yxqhuqin222-star/" target="_blank" rel="noreferrer">
              GitHub：yxqhuqin222-star
            </a>
            <span>即刻：路过美术馆</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
