import type { Metadata } from "next";
import Link from "next/link";
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
          <Link className="back-link" href="/#projects">
            返回项目
          </Link>
          <h1 className="not-found-title">项目不存在</h1>
        </div>
      </main>
    );
  }

  const galleryImages =
    "galleryImages" in project
      ? project.galleryImages
      : [
          project.image,
          project.image.replace(".png", "-2.png"),
          project.image.replace(".png", "-3.png"),
        ];

  return (
    <main>
      <div className="page-shell detail-shell">
        <header className="site-header" aria-label="站点头部">
          <div className="header-left">
            <Link className="brand" href="/" aria-label="Gin Home">
              Gin
            </Link>
            <nav aria-label="主导航">
              {navItems.map((item) => (
                <Link href={item.href} key={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <Link className="back-link" href="/#projects">
          Back to Projects
        </Link>

        <header className="detail-hero">
          <p>CASE STUDY</p>
          <h1>{project.title}</h1>
          <h2>{project.intro}</h2>
        </header>

        <section className="detail-meta" aria-label="项目概览">
          <div>
            <h2>Overview</h2>
            <p>{project.summary}</p>
          </div>
          <div>
            <h2>Role</h2>
            <p>{project.roleDescription}</p>
          </div>
          <div>
            <h2>Stack / Type</h2>
            <div className="detail-tags">
              {project.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
          <div>
            <h2>Links</h2>
            <div className="detail-actions">
              <a href={project.githubUrl} target="_blank" rel="noreferrer">
                GitHub
              </a>
              {"liveUrl" in project && project.liveUrl ? (
                <a href={project.liveUrl} target="_blank" rel="noreferrer">
                  Live site
                </a>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      <section className="detail-gallery" aria-label="项目图片">
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

      <article className="detail-article">
        <div>
          {project.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>

      <section className="detail-bottom">
        <Link href="/#projects">Back to all projects</Link>
        <a href={project.githubUrl} target="_blank" rel="noreferrer">
          Open GitHub
        </a>
      </section>
    </main>
  );
}
