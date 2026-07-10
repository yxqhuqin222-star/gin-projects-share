const navItems = [
  { href: "#projects", label: "项目" },
  { href: "#writing", label: "分享" },
  { href: "#contact", label: "联系" },
];

const categories = ["全部", "工具", "网站服务", "AI", "内容项目", "开源"];

const projects = [
  {
    title: "rizhuizong",
    href: "https://github.com/yxqhuqin222-star/rizhuizong",
    live: "https://rizhuizong.vercel.app",
    category: "工具 / 网站服务",
    status: "已上线",
    summary: "数据进度追踪工具，用来跟踪业务数据、进量和进度变化。",
    problem: "解决数据进度分散、人工核对慢、更新后难以及时查看的问题。",
    audience: "需要持续看进度、看数据变化的业务或运营场景。",
  },
  {
    title: "xiaoyuzhou-to-article-qwen",
    href: "https://github.com/yxqhuqin222-star/xiaoyuzhou-to-article-qwen",
    category: "AI / 内容项目",
    status: "实验项目",
    summary: "把小宇宙播客链接转成可阅读、可沉淀的总结内容。",
    problem: "解决播客内容听完难复用、难整理成文章素材的问题。",
    audience: "需要整理播客、做知识管理或内容复盘的人。",
  },
  {
    title: "dingtalk-broadcast-console",
    href: "https://github.com/yxqhuqin222-star/dingtalk-broadcast-console",
    category: "工具 / 自动化",
    status: "开发中",
    summary: "钉钉群播报控制台，用于定时推送消息和日常内容。",
    problem: "解决固定内容需要手动提醒、手动发送、容易遗漏的问题。",
    audience: "需要群通知、日报播报、内容提醒的团队或个人。",
  },
  {
    title: "pages_shouji",
    href: "https://github.com/yxqhuqin222-star/pages_shouji",
    category: "网站服务",
    status: "实验项目",
    summary: "面向网页展示的前端页面项目，适合沉淀轻量展示页面。",
    problem: "解决零散信息需要以网页方式收集、展示和访问的问题。",
    audience: "需要快速搭建静态页面或信息展示页的人。",
  },
  {
    title: "feishu-chat-replay",
    href: "https://github.com/yxqhuqin222-star/feishu-chat-replay",
    category: "工具 / 开源",
    status: "实验项目",
    summary: "飞书聊天记录回放页面，用网页方式还原和查看对话内容。",
    problem: "解决聊天记录难以复盘、难以作为过程资料展示的问题。",
    audience: "需要整理会议、协作对话或沟通过程的人。",
  },
];

const shares = [
  {
    title: "书籍",
    category: "书籍",
    summary: "读书笔记、摘录和读完之后真正留下来的想法。",
  },
  {
    title: "AI",
    category: "AI",
    summary: "关于 AI 工具、自动化、Agent 和个人工作流的记录。",
  },
  {
    title: "效率与生活",
    category: "效率 / 生活",
    summary: "把日常经验、复盘和一些小发现整理成可回看的分享。",
  },
];

export default function Home() {
  return (
    <main>
      <div className="page">
        <header className="site-header">
          <a href="#top" className="brand" aria-label="回到首页">
            Gin
          </a>
          <nav aria-label="主导航">
            {navItems.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
        </header>

        <section className="hero" id="top">
          <div className="intro">
            <p className="kicker">GIN / 李小明</p>
            <h1>
              嗨，我是 Gin。
              <br />
              这里是我自己的项目和一些分享。
            </h1>
            <p>
              我会把自己正在做的工具、网站服务、自动化项目，以及后续写下来的书籍、AI、效率和生活内容整理在这里。
            </p>
          </div>
          <div className="quick-links" aria-label="快捷入口">
            <a href="#projects">查看项目</a>
            <a href="#writing">看分享</a>
            <a href="#contact">联系我</a>
          </div>
        </section>

        <section className="section" id="projects" aria-labelledby="projects-title">
          <div className="section-title">
            <div>
              <p className="kicker">Projects</p>
              <h2 id="projects-title">项目</h2>
            </div>
            <p>从 GitHub 公开项目整理。后续可以继续补截图、访问地址和更完整的项目说明。</p>
          </div>

          <ul className="category-row" aria-label="项目分类">
            {categories.map((category) => (
              <li key={category}>{category}</li>
            ))}
          </ul>

          <div className="project-list">
            {projects.map((project) => (
              <article className="project-item" key={project.title}>
                <div className="project-main">
                  <div className="project-heading">
                    <a href={project.href} target="_blank" rel="noreferrer">
                      {project.title}
                    </a>
                    <span>{project.status}</span>
                  </div>
                  <p>{project.summary}</p>
                  <dl>
                    <div>
                      <dt>解决的问题</dt>
                      <dd>{project.problem}</dd>
                    </div>
                    <div>
                      <dt>目标用户</dt>
                      <dd>{project.audience}</dd>
                    </div>
                  </dl>
                </div>
                <div className="project-side">
                  <span>{project.category}</span>
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

        <section className="section" id="writing" aria-labelledby="writing-title">
          <div className="section-title">
            <div>
              <p className="kicker">Writing</p>
              <h2 id="writing-title">看分享</h2>
            </div>
            <p>这里先保留分享入口。等你有文章标题、链接和发布时间后，可以直接替换成真实文章列表。</p>
          </div>

          <div className="share-list">
            {shares.map((share) => (
              <article key={share.title}>
                <span>{share.category}</span>
                <h3>{share.title}</h3>
                <p>{share.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="section footer" id="contact">
          <div>
            <p className="kicker">Contact</p>
            <h2>联系我</h2>
          </div>
          <div className="contact-list">
            <a href="mailto:yxqhuqin222@gmail.com">yxqhuqin222@gmail.com</a>
            <a href="tel:18401205743">微信：18401205743</a>
            <a
              href="https://github.com/yxqhuqin222-star/"
              target="_blank"
              rel="noreferrer"
            >
              GitHub：yxqhuqin222-star
            </a>
            <span>即刻：路过美术馆</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
