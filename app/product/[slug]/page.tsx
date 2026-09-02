import type { Metadata } from "next";
import Link from "next/link";
import {
  getProjectBySlug,
  getProjectCategoryLabel,
  navItems,
  projects,
} from "../../site-data";

type ProductPageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export function generateMetadata({ params }: ProductPageProps): Metadata {
  const project = getProjectBySlug(params.slug);

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
  const project = getProjectBySlug(params.slug);

  if (!project) {
    return (
      <main>
        <div className="workbench-page">
          <Link className="back-link" href="/#work">
            返回首页
          </Link>
          <h1 className="not-found-title">项目不存在</h1>
        </div>
      </main>
    );
  }

  const galleryImages = project.galleryImages ?? (project.image ? [project.image] : []);
  const categoryLabel = getProjectCategoryLabel(project.categoryId);

  return (
    <main>
      <div className="workbench-page detail-page">
        <header className="minimal-header" aria-label="站点头部">
          <Link className="brand" href="/" aria-label="Gin Home">
            Gin
          </Link>
          <nav aria-label="主导航">
            {navItems.map((item) => (
              <a href={item.href} key={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
        </header>

        <Link className="back-link" href={`/#${project.categoryId}`}>
          返回{categoryLabel}
        </Link>

        <header className="detail-hero">
          <p>{project.status}</p>
          <h1>{project.title}</h1>
          <h2>{project.intro}</h2>
          <div className="detail-actions">
            <a href={project.githubUrl} target="_blank" rel="noreferrer">
              仓库主页
            </a>
            {project.liveUrl ? (
              <a href={project.liveUrl} target="_blank" rel="noreferrer">
                打开页面
              </a>
            ) : null}
          </div>
        </header>

        <section className="detail-summary" aria-label="项目概览">
          <div>
            <span>一句话</span>
            <p>{project.summary}</p>
          </div>
          <div>
            <span>来源</span>
            <p>{project.sourceNote}</p>
          </div>
        </section>
      </div>

      {galleryImages.length > 0 ? (
        <section className="project-gallery" aria-label="项目图片">
          {galleryImages.map((image, index) => (
            <figure key={image}>
              <img
                alt={`${project.title} 项目展示图 ${index + 1}`}
                loading={index === 0 ? "eager" : "lazy"}
                src={image}
              />
            </figure>
          ))}
        </section>
      ) : null}

      <article className="detail-article" aria-label="项目说明">
        <div>
          {project.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>

      <section className="detail-bottom">
        <Link href={`/#${project.categoryId}`}>返回列表</Link>
        <a href={project.githubUrl} target="_blank" rel="noreferrer">
          仓库主页
        </a>
      </section>
    </main>
  );
}
