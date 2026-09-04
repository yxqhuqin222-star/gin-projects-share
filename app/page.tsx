import Link from "next/link";
import { ConsultationWidget } from "./consultation-widget";
import { PortfolioRail } from "./portfolio-rail";
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
  description: "description" in category ? category.description : "",
  projects: projects.filter((project) => project.categoryId === category.id),
}));

function ProjectEntry({
  categoryLabel,
  project,
}: {
  categoryLabel: string;
  project: (typeof projects)[number];
}) {
  const projectMeta = project.status
    ? `${categoryLabel} - ${project.status}`
    : `${categoryLabel} - ${project.monogram}`;

  return (
    <article className="work-card" id={projectAnchor(project.slug)}>
      <Link className="work-card-link" href={`/product/${project.slug}`}>
        <span className="work-card-visual">
          {project.image ? (
            <img
              alt={`${project.title} 项目截图`}
              loading="lazy"
              src={project.image}
            />
          ) : (
            <span className="work-card-placeholder">
              <strong>{project.monogram}</strong>
              <small>暂无可核验公开截图</small>
            </span>
          )}
        </span>
        <span className="work-card-copy">
          <small>{projectMeta}</small>
          <strong>{project.title}</strong>
        </span>
      </Link>
    </article>
  );
}

function ProjectGroup({
  projectGroup,
}: {
  projectGroup: (typeof projectGroups)[number];
}) {
  return (
    <div
      className="project-list-group"
      id={projectGroup.id}
      aria-label={projectGroup.label}
    >
      <div className="project-list">
        {projectGroup.projects.map((project) => (
          <ProjectEntry
            categoryLabel={projectGroup.label}
            project={project}
            key={project.slug}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main id="top">
      <PortfolioRail items={moduleItems} />

      <div className="portfolio-page">
        <header className="portfolio-mobile-header" aria-label="移动端站点头部">
          <Link className="mobile-brand" href="/">
            Gin
          </Link>
          <a href="#selected">项目</a>
          <a href="#contact">联系</a>
        </header>

        <section className="portfolio-hero" aria-labelledby="hero-title">
          <div className="hero-identity">
            <div className="hero-avatar" aria-hidden="true">
              Gin
            </div>
            <div>
              <h1 id="hero-title">My Work.</h1>
            </div>
          </div>

          <p className="hero-lede">
            我喜欢把工作中反复出现的问题，做成工具、流程和系统。
            <br />
            这里主要记录我的数据看板、自动化工具、AI 工作流，以及一些已经实际使用过的项目和方法。
          </p>

          <div className="hero-actions" aria-label="快速入口">
            <a className="button primary" href="#selected">
              查看项目
            </a>
            <a
              className="button secondary"
              href="https://github.com/yxqhuqin222-star/"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a className="button secondary" href="#contact">
              联系
            </a>
          </div>
        </section>

        <section
          className="portfolio-section"
          id="selected"
          aria-labelledby="featured-title"
        >
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">{projects.length} projects</p>
              <h2 id="featured-title">项目</h2>
            </div>
            <p>
              首页先展示项目主图、类型标签和标题，点击项目进入详情页查看完整背景、边界和更多截图。
            </p>
          </div>

          <div className="project-index" aria-label="完整项目列表">
            {projectGroups.map((projectGroup) => (
              <ProjectGroup projectGroup={projectGroup} key={projectGroup.id} />
            ))}
          </div>
        </section>
        <section
          className="portfolio-section writing-section"
          id="writing"
          aria-labelledby="writing-title"
        >
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">{shares.length} notes</p>
              <h2 id="writing-title">分享</h2>
            </div>
          </div>

          <div className="writing-list">
            {shares.map((share) => (
              <article className="writing-card" key={share.title}>
                <span>{share.group}</span>
                <h3>{share.title}</h3>
                <p>{share.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="portfolio-section contact-section"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div className="section-heading">
            <p className="eyebrow">Contact</p>
            <h2 id="contact-title">联系</h2>
            <p>如果你对我感兴趣，可以通过以下方式联系我。</p>
          </div>

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
      </div>
      <ConsultationWidget />
    </main>
  );
}
