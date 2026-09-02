import Link from "next/link";
import { ConsultationWidget } from "./consultation-widget";
import {
  contactLinks,
  moduleItems,
  projectCategories,
  projects,
  shares,
} from "./site-data";

const projectAnchor = (slug: string) => `project-${slug}`;

const projectGroups = projectCategories.map((category) => ({
  ...category,
  projects: projects.filter((project) => project.categoryId === category.id),
}));

const projectGroupById = new Map(projectGroups.map((group) => [group.id, group]));

const moduleCounts = new Map<string, number>([
  ...projectGroups.map((group) => [group.id, group.projects.length] as const),
  ["writing", shares.length],
  ["contact", contactLinks.length],
]);

function ProjectEntry({ project }: { project: (typeof projects)[number] }) {
  return (
    <article className="entry-card" id={projectAnchor(project.slug)}>
      <div className="entry-main">
        <span className="entry-status">{project.status}</span>
        <h3>
          <Link href={`/product/${project.slug}`}>{project.title}</Link>
        </h3>
        <p>{project.summary}</p>
      </div>
      <div className="entry-actions" aria-label={`${project.title} 入口`}>
        <Link href={`/product/${project.slug}`}>详情</Link>
        <a href={project.githubUrl} target="_blank" rel="noreferrer">
          仓库主页
        </a>
        {project.liveUrl ? (
          <a href={project.liveUrl} target="_blank" rel="noreferrer">
            打开页面
          </a>
        ) : null}
      </div>
    </article>
  );
}

export default function Home() {
  return (
    <main id="top">
      <div className="workbench-page">
        <header className="minimal-header home-header" aria-label="站点头部">
          <Link className="brand" href="/" aria-label="Gin Home">
            Gin
          </Link>
        </header>

        <div className="workbench-layout">
          <aside className="workbench-rail" aria-label="模块导航">
            <div className="rail-title">
              <Link href="/" aria-label="Gin Home">
                Gin
              </Link>
              <p>项目与分享</p>
            </div>

            <nav className="rail-nav">
              {moduleItems.map((item) => (
                <a href={`#${item.id}`} key={item.id}>
                  <span>{item.label}</span>
                  <small>{moduleCounts.get(item.id) ?? 0}</small>
                </a>
              ))}
            </nav>

            <a className="admin-entry" href="/admin">
              管理入口 /admin
            </a>
          </aside>

          <div className="workbench-main">
            <section className="workbench-hero" aria-labelledby="hero-title">
              <p className="eyebrow">项目工作台</p>
              <h1 id="hero-title">按用途打开作品。</h1>
              <p>
                这里按工作、skills及工具、个人提效整理公开项目。每条只展示标题、一句话、状态和必要入口；更多说明放到详情页。
              </p>

              <nav className="mobile-module-nav" aria-label="移动端模块导航">
                {moduleItems.map((item) => (
                  <a href={`#${item.id}`} key={item.id}>
                    {item.label}
                  </a>
                ))}
              </nav>
            </section>

            <div className="module-stack">
              {moduleItems.map((module) => {
                const projectGroup = projectGroupById.get(
                  module.id as (typeof projectCategories)[number]["id"],
                );

                if (projectGroup) {
                  return (
                    <section
                      className="module-section"
                      id={projectGroup.id}
                      key={projectGroup.id}
                      aria-labelledby={`${projectGroup.id}-title`}
                    >
                      <header className="module-heading">
                        <div>
                          <span className="eyebrow">
                            {projectGroup.projects.length} entries
                          </span>
                          <h2 id={`${projectGroup.id}-title`}>{projectGroup.label}</h2>
                          <p>{projectGroup.description}</p>
                        </div>
                      </header>

                      <div className="entry-list">
                        {projectGroup.projects.map((project) => (
                          <ProjectEntry project={project} key={project.slug} />
                        ))}
                      </div>
                    </section>
                  );
                }

                if (module.id === "writing") {
                  return (
                    <section
                      className="module-section"
                      id="writing"
                      key={module.id}
                      aria-labelledby="writing-title"
                    >
                      <header className="module-heading">
                        <div>
                          <span className="eyebrow">{shares.length} entries</span>
                          <h2 id="writing-title">{module.label}</h2>
                          <p>整理正在形成的判断和素材，不和项目列表混在一起。</p>
                        </div>
                      </header>

                      <div className="share-list">
                        {shares.map((share) => (
                          <article className="share-card" key={share.title}>
                            <span>{share.group}</span>
                            <h3>{share.title}</h3>
                            <p>{share.summary}</p>
                          </article>
                        ))}
                      </div>
                    </section>
                  );
                }

                return (
                  <section
                    className="module-section contact-section"
                    id="contact"
                    key={module.id}
                    aria-labelledby="contact-title"
                  >
                    <header className="module-heading">
                      <div>
                        <span className="eyebrow">Contact</span>
                        <h2 id="contact-title">{module.label}</h2>
                        <p>如果你对这些工具、工作流或项目实现感兴趣，可以从下面入口联系我。</p>
                      </div>
                    </header>

                    <div className="contact-list">
                      {contactLinks.map((link) => (
                        <a
                          href={link.href}
                          key={link.label}
                          target={link.href.startsWith("http") ? "_blank" : undefined}
                          rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                        >
                          <span>{link.label}</span>
                          <strong>{link.value}</strong>
                        </a>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <ConsultationWidget />
    </main>
  );
}
