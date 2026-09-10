import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicSiteContent } from "../../content-store";
import { ProjectWorkflow } from "../../project-workflow";
import { ProjectGallery } from "../../project-gallery";
import styles from "../../project-presentation.module.css";
import {
  getProjectCategoryLabel,
  getVisibleModuleItems,
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

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const content = await getPublicSiteContent();
  const project = content.projects.find(
    (item) => item.slug === params.slug && item.isPublished,
  );

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

export default async function ProductPage({ params }: ProductPageProps) {
  const content = await getPublicSiteContent();
  const project = content.projects.find(
    (item) => item.slug === params.slug && item.isPublished,
  );

  if (!project) {
    notFound();
  }

  const galleryImages = project.galleryImages ?? (project.image ? [project.image] : []);
  const categoryLabel = getProjectCategoryLabel(project.categoryId);
  const navigation = getVisibleModuleItems(content);

  return (
    <main className={project.workflow ? styles.concisePage : undefined}>
      <div className="workbench-page detail-page">
        <header className="minimal-header" aria-label="站点头部">
          <Link className="brand" href="/" aria-label="Gin Home">
            Gin
          </Link>
          <nav aria-label="主导航">
            {navigation.map((item) => (
              <a href={`/#${item.id}`} key={item.id}>
                {item.label}
              </a>
            ))}
          </nav>
        </header>

        <Link className="back-link" href={`/#${project.categoryId}`}>
          返回{categoryLabel}
        </Link>

        <header className={`detail-hero${project.workflow ? ` ${styles.conciseHero}` : ""}`}>
          {project.status ? <p>{project.status}</p> : null}
          <h1>{project.title}</h1>
          {project.workflow ? <p className={styles.intro}>{project.intro}</p> : <h2>{project.intro}</h2>}
          {!project.workflow ? <div className="detail-actions">
            <a href={project.githubUrl} target="_blank" rel="noreferrer">
              仓库主页
            </a>
            {project.liveUrl ? (
              <a href={project.liveUrl} target="_blank" rel="noreferrer">
                打开页面
              </a>
            ) : null}
          </div> : null}
        </header>

        {project.workflow ? (
          <>
            <ProjectWorkflow workflow={project.workflow} />
            <div className={styles.actions}>
              <a className="button primary" href={project.githubUrl} target="_blank" rel="noreferrer">查看代码与使用指南 <span aria-hidden="true">↗</span></a>
              {project.liveUrl ? <a className="button secondary" href={project.liveUrl} target="_blank" rel="noreferrer">打开页面 ↗</a> : null}
            </div>
          </>
        ) : <section className="detail-summary" aria-label="项目概览">
          <div>
            <span>一句话</span>
            <p>{project.summary}</p>
          </div>
        </section>}
      </div>

      <ProjectGallery title={project.title} images={galleryImages} captions={project.galleryCaptions} />

      {!project.workflow ? <article className="detail-article" aria-label="项目说明">
        <div>
          {project.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article> : null}

      <section className="detail-bottom">
        <Link href={`/#${project.categoryId}`}>返回列表</Link>
        {!project.workflow ? <a href={project.githubUrl} target="_blank" rel="noreferrer">
          仓库主页
        </a> : null}
      </section>
    </main>
  );
}
