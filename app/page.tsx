const navItems = [
  { href: "#top", label: "首页" },
  { href: "#projects", label: "项目" },
  { href: "#writing", label: "分享" },
  { href: "#contact", label: "联系" },
];

const categories = ["人工智能", "应用", "网站服务", "开源项目", "工具", "全部"];

const projects = [
  {
    title: "rizhuizong",
    href: "https://github.com/yxqhuqin222-star/rizhuizong",
    live: "https://rizhuizong.vercel.app",
    category: "网站服务",
    role: "主理人",
    status: "已上线",
    monogram: "RZ",
    summary: "数据进度追踪工具，用来查看业务数据、进量和进度变化。",
    tags: ["网站服务", "Python", "已上线"],
  },
  {
    title: "xiaoyuzhou-to-article-qwen",
    href: "https://github.com/yxqhuqin222-star/xiaoyuzhou-to-article-qwen",
    category: "AI",
    role: "开发者",
    status: "实验中",
    monogram: "XA",
    summary: "把小宇宙播客链接转成可阅读、可沉淀的总结内容。",
    tags: ["AI", "Shell", "内容"],
  },
  {
    title: "dingtalk-broadcast-console",
    href: "https://github.com/yxqhuqin222-star/dingtalk-broadcast-console",
    category: "工具",
    role: "开发者",
    status: "开发中",
    monogram: "DB",
    summary: "钉钉群播报控制台，用于定时推送消息和日常内容。",
    tags: ["工具", "Python", "自动化"],
  },
  {
    title: "pages_shouji",
    href: "https://github.com/yxqhuqin222-star/pages_shouji",
    category: "应用",
    role: "开发者",
    status: "实验中",
    monogram: "PS",
    summary: "面向网页展示的前端页面项目，适合沉淀轻量展示页。",
    tags: ["应用", "JavaScript", "页面"],
  },
  {
    title: "feishu-chat-replay",
    href: "https://github.com/yxqhuqin222-star/feishu-chat-replay",
    category: "开源项目",
    role: "开发者",
    status: "实验中",
    monogram: "FR",
    summary: "飞书聊天记录回放页面，用网页方式还原和查看对话内容。",
    tags: ["开源项目", "HTML", "回放"],
  },
];

const shares = [
  {
    title: "书籍",
    group: "书籍",
    summary: "读书笔记、摘录和读完之后真正留下来的想法。",
  },
  {
    title: "AI",
    group: "AI 笔记",
    summary: "关于 AI 工具、自动化、Agent 和个人工作流的记录。",
  },
  {
    title: "效率与生活",
    group: "生活",
    summary: "把日常经验、复盘和一些小发现整理成可回看的分享。",
  },
];

export default function Home() {
  return (
    <main id="top">
      <div className="page-shell">
        <header className="site-header" aria-label="站点头部">
          <div className="header-left">
            <a className="brand" href="#top" aria-label="Gin 首页">
              GIN
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
            欢迎来到我的个人网站。我会把正在做的工具、网站服务、自动化项目，以及后续关于书籍、AI、效率和生活的分享整理在这里。
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
                <a className="product-visual" href={project.href} target="_blank" rel="noreferrer">
                  <span>{project.monogram}</span>
                </a>
                <a className="product-title" href={project.href} target="_blank" rel="noreferrer">
                  {project.title}
                </a>
                <p>{project.summary}</p>
                <div className="tags">
                  <span>{project.category}</span>
                  <span>{project.role}</span>
                  <strong>{project.status}</strong>
                </div>
                <div className="project-links">
                  <a href={project.href} target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                  {"live" in project && project.live ? (
                    <a href={project.live} target="_blank" rel="noreferrer">
                      访问网站
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="sharing" id="writing" aria-labelledby="sharing-title">
          <div className="section-copy">
            <h2 id="sharing-title">分享</h2>
            <p>关于书籍、AI、效率和生活的一些记录</p>
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
              GitHub：yxqhuqin222-star
            </a>
            <span>即刻：路过美术馆</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
