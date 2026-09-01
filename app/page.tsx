import Link from "next/link";
import { ConsultationWidget } from "./consultation-widget";
import { categories, navItems, projects, shares } from "./site-data";

const projectAnchor = (slug: string) => `project-${slug}`;
const categoryAnchor = (category: string) =>
  `category-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
const representativeProjectSlugs = [
  "rizhuizong",
  "renxiao",
  "gin-words",
  "xiaoyuzhou-to-article-qwen",
];
const representativeProjects = representativeProjectSlugs
  .map((slug) => projects.find((project) => project.slug === slug))
  .filter((project): project is (typeof projects)[number] => Boolean(project));
const primaryProject = representativeProjects[0];
const secondaryProjects = representativeProjects.slice(1);
const compactProjects = projects.filter(
  (project) => !representativeProjectSlugs.includes(project.slug),
);
const compactGroups = categories
  .filter((category) => category !== "All")
  .map((category) => ({
    category,
    projects: compactProjects.filter((project) => project.category === category),
  }))
  .filter((group) => group.projects.length > 0);
const featuredCategoryAnchors = new Map<string, string>();

representativeProjects.forEach((project) => {
  if (!featuredCategoryAnchors.has(project.category)) {
    featuredCategoryAnchors.set(project.category, `#${projectAnchor(project.slug)}`);
  }
});

const directions = [
  {
    title: "数据看板",
    description: "把零散表格、目标、筛选和播报整理成能持续运行的 Dashboard。",
    metric: "2 个代表项目",
  },
  {
    title: "AI 工作流",
    description: "把转写、整理、规则和 Agent 协作做成可以复用的个人生产流程。",
    metric: "内容与工具链",
  },
  {
    title: "个人工具",
    description: "从自己的真实使用场景出发，做轻量、公开、可继续迭代的小系统。",
    metric: "公开仓库索引",
  },
];

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

        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">Gin 的项目与分享</p>
            <h1 id="hero-title">
              把真实工作里的重复问题，
              <br />
              整理成能运行的工具。
            </h1>
            <p>
              我在这里整理自己正在做的数据看板、AI 工作流、个人 Web App 和 Codex 工具。代表项目展开讲清楚问题和做法，其余公开仓库作为索引保留。
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#projects">
                看代表项目
              </a>
              <a className="button secondary" href="#contact">
                联系交流
              </a>
            </div>
          </div>

          <aside className="hero-panel" aria-label="网站内容概览">
            <div>
              <span>Focus</span>
              <strong>Dashboard / AI Workflow / Tools</strong>
            </div>
            <div>
              <span>Projects</span>
              <strong>{projects.length} 个公开项目</strong>
            </div>
            <div>
              <span>Style</span>
              <strong>简洁、可验证、持续迭代</strong>
            </div>
          </aside>
        </section>

        <section className="directions" aria-labelledby="directions-title">
          <div className="section-copy">
            <p className="eyebrow">What I build</p>
            <h2 id="directions-title">不是堆仓库，而是三类长期问题。</h2>
          </div>
          <div className="direction-grid">
            {directions.map((direction) => (
              <article className="direction-card" key={direction.title}>
                <span>{direction.metric}</span>
                <h3>{direction.title}</h3>
                <p>{direction.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="products" id="projects" aria-labelledby="products-title">
          <div className="section-copy">
            <p className="eyebrow">Selected work</p>
            <h2 id="products-title">代表项目</h2>
            <p>先看最能说明能力边界的项目：它们来自真实需求，有可核验的页面、截图或公开仓库。</p>
          </div>

          <ul className="category-tabs" aria-label="产品分类">
            {categories.map((category) => {
              const href =
                category === "All"
                  ? "#repository-index"
                  : featuredCategoryAnchors.get(category) ?? `#${categoryAnchor(category)}`;

              return (
                <li key={category}>
                  {href ? <a href={href}>{category}</a> : <span>{category}</span>}
                </li>
              );
            })}
          </ul>

          <div className="project-summary" aria-label="项目数量说明">
            <span>{representativeProjects.length} 个代表项目</span>
            <span>{projects.length} 个公开仓库</span>
            <span>{compactProjects.length} 个更多项目</span>
          </div>

          {primaryProject ? (
            <div className="showcase-grid">
              <article
                className="product-card showcase-card primary-showcase"
                id={projectAnchor(primaryProject.slug)}
              >
                <Link
                  className="product-visual"
                  href={`/product/${primaryProject.slug}`}
                  aria-label={`查看 ${primaryProject.title} 项目详情`}
                >
                  {primaryProject.image ? (
                    <img
                      alt={`${primaryProject.title} 项目截图`}
                      loading="eager"
                      src={primaryProject.image}
                    />
                  ) : (
                    <span className="visual-placeholder">{primaryProject.monogram}</span>
                  )}
                  <span className="visual-shade" aria-hidden="true" />
                  <span className="visual-label">{primaryProject.category}</span>
                </Link>
                <div className="product-body">
                  <span className="project-kicker">主项目</span>
                  <Link className="product-title" href={`/product/${primaryProject.slug}`}>
                    {primaryProject.title}
                  </Link>
                  <p>{primaryProject.summary}</p>
                </div>
                <div className="product-meta">
                  <strong className="project-status">{primaryProject.status}</strong>
                  <div className="project-links">
                    <Link href={`/product/${primaryProject.slug}`}>查看详情</Link>
                    <a href={primaryProject.githubUrl} target="_blank" rel="noreferrer">
                      GitHub
                    </a>
                  </div>
                </div>
              </article>

              <div className="showcase-side">
                {secondaryProjects.map((project) => (
                  <article
                    className="product-card compact-showcase"
                    id={projectAnchor(project.slug)}
                    key={project.title}
                  >
                    <Link
                      className="product-visual"
                      href={`/product/${project.slug}`}
                      aria-label={`查看 ${project.title} 项目详情`}
                    >
                      {project.image ? (
                        <img
                          alt={`${project.title} 项目截图`}
                          loading="eager"
                          src={project.image}
                        />
                      ) : (
                        <span className="visual-placeholder">{project.monogram}</span>
                      )}
                      <span className="visual-shade" aria-hidden="true" />
                      <span className="visual-label">{project.category}</span>
                    </Link>
                    <div className="product-body">
                      <Link className="product-title" href={`/product/${project.slug}`}>
                        {project.title}
                      </Link>
                      <p>{project.summary}</p>
                    </div>
                    <div className="project-links">
                      <Link href={`/product/${project.slug}`}>详情</Link>
                      <a href={project.githubUrl} target="_blank" rel="noreferrer">
                        GitHub
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          <section
            className="repository-index"
            id="repository-index"
            aria-labelledby="repository-index-title"
          >
            <div className="section-copy compact-heading">
              <p className="eyebrow">More projects</p>
              <h2 id="repository-index-title">更多公开项目</h2>
              <p>
                不把每个仓库都拉成长篇作品集。这里用更轻的方式保留用途、状态和 GitHub 入口。
              </p>
            </div>

            <div className="compact-groups">
              {compactGroups.map((group) => (
                <section
                  className="compact-group"
                  id={categoryAnchor(group.category)}
                  key={group.category}
                >
                  <header>
                    <h3>{group.category}</h3>
                    <span>{group.projects.length}</span>
                  </header>
                  <div className="compact-grid">
                    {group.projects.map((project) => (
                      <article className="compact-card" key={project.slug}>
                        <div className="compact-monogram" aria-hidden="true">
                          {project.monogram}
                        </div>
                        <div className="compact-body">
                          <Link href={`/product/${project.slug}`}>{project.title}</Link>
                          <p>{project.summary}</p>
                          <div className="compact-meta">
                            <span>{project.status}</span>
                            <span>{project.tags.slice(0, 2).join(" / ")}</span>
                          </div>
                        </div>
                        <div className="compact-links">
                          <Link href={`/product/${project.slug}`}>Detail</Link>
                          <a href={project.githubUrl} target="_blank" rel="noreferrer">
                            GitHub
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        </section>

        <section className="sharing" id="writing" aria-labelledby="sharing-title">
          <div className="section-copy">
            <p className="eyebrow">Notes</p>
            <h2 id="sharing-title">分享正在形成的判断和素材。</h2>
            <p>这些不是另一个仓库列表，而是我会持续整理的输入来源：书、AI 工具、生活观察和实用工具。</p>
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
            <p>如果你对这些工具、工作流或项目实现感兴趣，可以从下面入口联系我。</p>
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
      <ConsultationWidget />
    </main>
  );
}
