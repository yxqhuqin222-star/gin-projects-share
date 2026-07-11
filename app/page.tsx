import { categories, navItems, projects, shares } from "./site-data";

export default function Home() {
  return (
    <main id="top">
      <div className="page-shell">
        <header className="site-header" aria-label="站点头部">
          <div className="header-left">
            <a className="brand" href="/" aria-label="Gin 首页">
              Gin
            </a>
            <nav aria-label="主导航">
              {navItems.map((item, index) => (
                <a
                  className={index === 0 ? "active" : undefined}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="language" aria-label="语言">
            <span>中文</span>
          </div>
        </header>

        <section className="hero">
          <h1>
            嗨，我是 Gin，
            <br />
            这里是我自己的项目和一些分享
          </h1>
          <p>
            欢迎来到我的个人网站。我会把正在做的工具、网站服务、自动化项目，以及后续关于书籍、人工智能、效率和生活的分享整理在这里。
          </p>
        </section>

        <section className="products" id="projects" aria-labelledby="products-title">
          <div className="section-copy">
            <h2 id="products-title">项目</h2>
            <p>做自己会用的产品，搭自己真正需要的系统</p>
          </div>

          <ul className="category-tabs" aria-label="产品分类">
            {categories.map((category, index) => (
              <li className={index === 0 ? "selected" : undefined} key={category}>
                {category}
              </li>
            ))}
          </ul>

          <div className="product-grid">
            {projects.map((project) => (
              <article className="product-card" key={project.title}>
                <a
                  className="product-visual"
                  href={`/product/${project.slug}`}
                  aria-label={`查看 ${project.title} 项目详情`}
                >
                  <span>{project.monogram}</span>
                </a>
                <a className="product-title" href={`/product/${project.slug}`}>
                  {project.title}
                </a>
                <p>{project.summary}</p>
                <div className="tags">
                  <span>{project.category}</span>
                  <span>{project.role}</span>
                  <strong>{project.status}</strong>
                </div>
                <div className="project-links">
                  <a href={`/product/${project.slug}`}>查看详情</a>
                  <a href={project.githubUrl} target="_blank" rel="noreferrer">
                    代码仓库
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="sharing" id="writing" aria-labelledby="sharing-title">
          <div className="section-copy">
            <h2 id="sharing-title">分享</h2>
            <p>关于书籍、人工智能、效率和生活的一些记录</p>
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
            <p>欢迎通过下面这些方式联系我</p>
          </div>
          <div className="footer-links">
            <a href="mailto:yxqhuqin222@gmail.com">yxqhuqin222@gmail.com</a>
            <a href="tel:18401205743">微信：18401205743</a>
            <a href="https://github.com/yxqhuqin222-star/" target="_blank" rel="noreferrer">
              代码仓库：yxqhuqin222-star
            </a>
            <span>即刻：路过美术馆</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
