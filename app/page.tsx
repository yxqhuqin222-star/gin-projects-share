import Link from "next/link";
import { ConsultationWidget } from "./consultation-widget";
import { getPublicSiteContent } from "./content-store";
import { PortfolioRail } from "./portfolio-rail";
import { ProjectWorkflow } from "./project-workflow";
import { ContactList } from "./contact-list";
import {
  experience,
  experienceSkills,
  getVisibleModuleItems,
  projectCategories,
  type ManagedProject,
} from "./site-data";

const projectAnchor = (slug: string) => `project-${slug}`;

function ProjectEntry({
  categoryLabel,
  project,
}: {
  categoryLabel: string;
  project: ManagedProject;
}) {
  const projectMeta = project.status
    ? `${categoryLabel} - ${project.status}`
    : `${categoryLabel} - ${project.monogram}`;

  return (
    <article className="work-card" id={projectAnchor(project.slug)}>
      <Link className="work-card-link" href={`/product/${project.slug}`}>
        <div className={`work-card-visual${project.workflow && !project.image ? " work-card-flow" : ""}`}>
          {project.image ? (
            <img
              alt={`${project.title} 项目展示图`}
              loading="lazy"
              src={project.image}
            />
          ) : project.workflow ? (
            <ProjectWorkflow workflow={project.workflow} compact />
          ) : (
            <span className="work-card-placeholder">
              <strong>{project.monogram}</strong>
              <small>暂无可核验公开截图</small>
            </span>
          )}
        </div>
        <div className="work-card-copy">
          <small>{projectMeta}</small>
          <strong>{project.title}</strong>
          <p>{project.summary}</p>
        </div>
      </Link>
    </article>
  );
}

function ProjectGroup({
  projectGroup,
}: {
  projectGroup: {
    id: string;
    label: string;
    description: string;
    projects: ManagedProject[];
  };
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
            key={project.id}
          />
        ))}
      </div>
    </div>
  );
}

export default async function Home() {
  const content = await getPublicSiteContent();
  const publishedProjects = content.projects.filter((project) => project.isPublished);
  const visibleModuleItems = getVisibleModuleItems(content);
  const projectGroups = projectCategories.map((category) => ({
    ...category,
    description: "description" in category ? category.description : "",
    projects: publishedProjects.filter((project) => project.categoryId === category.id),
  }));

  return (
    <main id="top">
      <PortfolioRail items={visibleModuleItems} />

      <div className="portfolio-page">
        <header className="portfolio-mobile-header" aria-label="移动端站点头部">
          <Link className="mobile-brand" href="/">
            Gin
          </Link>
          <a href="#experience">经历</a>
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
            <a className="button secondary" href="#experience">
              工作经历
            </a>
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
          className="portfolio-section experience-section"
          id="experience"
          aria-labelledby="experience-title"
        >
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">Experience</p>
              <h2 id="experience-title">工作经历</h2>
            </div>
            <p>从项目管理、产品运营到 AI 产品实践，持续把业务问题转化为可落地的产品与流程。</p>
          </div>

          <div className="experience-grid">
            {experience.map((item, index) => (
              <article className="experience-card" key={item.company}>
                <span className="experience-index">{String(index + 1).padStart(2, "0")}</span>
                <div className="experience-card-copy">
                  <h3>{item.company}</h3>
                  <p className="experience-role">{item.role}</p>
                  <p className="experience-summary">{item.summary}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="experience-skills">
            <div>
              <p className="eyebrow">Skills</p>
              <h3>核心技能</h3>
            </div>
            <div className="skill-list" aria-label="核心技能列表">
              {experienceSkills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </div>
        </section>

        <section
          className="portfolio-section"
          id="selected"
          aria-labelledby="featured-title"
        >
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">{publishedProjects.length} projects</p>
              <h2 id="featured-title">项目</h2>
            </div>
            <p>
              从工作中的具体问题出发，记录工具、流程和实际产出。
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
              <p className="eyebrow">Notes & interests</p>
              <h2 id="writing-title">兴趣与记录</h2>
            </div>
          </div>

          <div className="writing-list">
            {content.shares.map((share) => (
              <article className="writing-card" key={share.id}>
                <span>{share.group}</span>
                <h3>{share.title}</h3>
                <p>{share.summary}</p>
              </article>
            ))}
          </div>
        </section>

        {content.otherLinks.length ? (
          <section
            className="portfolio-section other-section"
            id="other"
            aria-labelledby="other-title"
          >
            <div className="section-heading split-heading">
              <div>
                <p className="eyebrow">{content.otherLinks.length} links</p>
                <h2 id="other-title">其他</h2>
              </div>
              <p>不需要项目截图或详情页的轻量入口，保留必要说明与跳转链接。</p>
            </div>

            <div className="other-link-list">
              {content.otherLinks.map((link) => (
                <a
                  href={link.href}
                  key={link.id}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>
                    <strong>{link.title}</strong>
                    <small>{link.summary}</small>
                  </span>
                  <b aria-hidden="true">打开链接 →</b>
                </a>
              ))}
            </div>
          </section>
        ) : null}

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

          <ContactList links={content.contactLinks} />
          <Link className="admin-entry-link" href="/admin">
            管理内容
          </Link>
        </section>
      </div>
      <ConsultationWidget />
    </main>
  );
}
