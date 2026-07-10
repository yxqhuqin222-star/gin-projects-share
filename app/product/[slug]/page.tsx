import type { Metadata } from "next";
import { navItems, projects } from "../../site-data";

type ProductPageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export function generateMetadata({ params }: ProductPageProps): Metadata {
  const project = projects.find((item) => item.slug === params.slug);

  if (!project) {
    return {
      title: "项目不存在 - Gin",
    };
  }

  return {
    title: `${project.title} - Gin 项目`,
    description: project.summary,
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const project = projects.find((item) => item.slug === params.slug);

  if (!project) {
    return (
      <main>
        <div className="page-shell">
          <a className="back-link" href="/#projects">
            返回项目
          </a>
          <h1 className="not-found-title">项目不存在</h1>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="page-shell detail-shell">
        <header className="site-header" aria-label="站点头部">
          <div className="header-left">
            <a className="brand" href="/" aria-label="Gin 首页">
              GIN
            </a>
            <nav aria-label="主导航">
              {navItems.map((item) => (
                <a href={item.href} key={item.href}>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="language" aria-label="语言">
            <span>中文</span>
          </div>
        </header>

        <a className="back-link" href="/#projects">
          ← 返回项目
        </a>

        <header className="detail-hero">
          <p>项目</p>
          <h1>{project.title}</h1>
          <h2>{project.intro}</h2>
        </header>

        <section className="detail-meta" aria-label="项目概览">
          <div>
            <h2>项目介绍</h2>
            <p>{project.summary}</p>
          </div>
          <div>
            <h2>我的角色</h2>
            <p>{project.roleDescription}</p>
          </div>
          <div>
            <h2>所属类别</h2>
            <div className="detail-tags">
              {project.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
          <div>
            <h2>相关链接</h2>
            <div className="detail-actions">
              <a href={project.githubUrl} target="_blank" rel="noreferrer">
                GitHub ↗
              </a>
              {"liveUrl" in project && project.liveUrl ? (
                <a href={project.liveUrl} target="_blank" rel="noreferrer">
                  访问网站 ↗
                </a>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      <section className="detail-gallery" aria-label="项目图片">
        <img alt={`${project.title} 项目展示图`} src={project.image} />
      </section>

      <article className="detail-article">
        <div>
          {project.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>

      <section className="detail-bottom">
        <a href="/#projects">返回全部项目</a>
        <a href={project.githubUrl} target="_blank" rel="noreferrer">
          查看 GitHub
        </a>
      </section>
    </main>
  );
}
