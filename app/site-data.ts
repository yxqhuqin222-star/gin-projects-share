export const navItems = [
  { href: "/", label: "首页" },
  { href: "/#projects", label: "代表项目" },
  { href: "/#writing", label: "分享" },
  { href: "/#contact", label: "联系" },
];

export const categories = [
  "Dashboard",
  "Web App",
  "AI / Agent",
  "Automation",
  "Codex Tooling",
  "Rules",
  "All",
];

export type Project = {
  slug: string;
  title: string;
  githubUrl: string;
  liveUrl?: string;
  category: (typeof categories)[number];
  role: string;
  status: string;
  monogram: string;
  summary: string;
  intro: string;
  roleDescription: string;
  tags: string[];
  featured: boolean;
  sourceNote: string;
  image?: string;
  galleryImages?: string[];
  paragraphs: string[];
};

export const projects: Project[] = [
  {
    slug: "rizhuizong",
    title: "日追踪看板",
    githubUrl: "https://github.com/yxqhuqin222-star/rizhuizong",
    liveUrl: "https://yxqhuqin222-star.github.io/rizhuizong/",
    category: "Dashboard",
    role: "Owner / Builder",
    status: "Live",
    monogram: "日追踪",
    featured: true,
    sourceNote: "GitHub README、仓库描述和现有项目截图",
    summary: "读取每日数据和每周 target，生成统一 Summary、网页看板、工作簿、播报图和线上只读同步。",
    intro:
      "读取每日 tongji_demo.xlsx 和每周 tongji_target.xlsx，生成统一 Summary、网页看板、工作簿、总进度/学部/专项播报图，并支持线上只读同步、钉钉群播报和规则化自然语言查询。",
    roleDescription: "负责需求拆解、数据口径整理、前端 Dashboard、自动化脚本、部署和迭代。",
    tags: ["Dashboard", "Python", "GitHub Pages", "Automation"],
    image: "/projects/rizhuizong-live-dashboard.png",
    galleryImages: [
      "/projects/rizhuizong-live-dashboard.png",
      "/projects/rizhuizong-2.png",
      "/projects/rizhuizong-3.png",
    ],
    paragraphs: [
      "README 明确记录：项目读取每日 demo 和每周 target，生成 Summary、网页看板、工作簿、总进度/学部/专项播报图，并支持线上只读同步。",
      "项目能力包括最新期次/全部期次切换、多选筛选、CSV 导出、渠道聚合、年级聚合，以及本地更新后的线上只读 state 同步。",
    ],
  },
  {
    slug: "renxiao",
    title: "Renxiao Dashboard",
    githubUrl: "https://github.com/yxqhuqin222-star/renxiao",
    liveUrl: "https://yxqhuqin222-star.github.io/renxiao/",
    category: "Dashboard",
    role: "Owner / Builder",
    status: "Live snapshot",
    monogram: "人效",
    featured: true,
    sourceNote: "GitHub README 和本地项目截图",
    summary: "用 Flask 展示上传表计算后的成本、转化率、趋势图和明细表，并导出 GitHub Pages 只读快照。",
    intro:
      "人效数据看板，用 Flask 展示上传表计算后的成本、转化率、趋势图和明细表；公开页面以 GitHub Pages 只读快照为主。",
    roleDescription: "负责看板计算、筛选展示、本地 Flask 服务和只读快照导出链路。",
    tags: ["Dashboard", "Flask", "Python", "GitHub Pages"],
    image: "/projects/renxiao-dashboard.png",
    galleryImages: ["/projects/renxiao-dashboard.png"],
    paragraphs: [
      "README 说明本项目维护两类目标：本地 Flask 服务用于上传、重新计算、下载和完整交互；GitHub Pages 用于公开查看静态前端快照。",
      "只读快照由 scripts/export_readonly.py 导出到 docs/index.html，会剥离上传表单、下载链接和后端请求，只保留查看功能。",
    ],
  },
  {
    slug: "paltform",
    title: "小工具集合平台",
    githubUrl: "https://github.com/yxqhuqin222-star/paltform",
    liveUrl: "https://yxqhuqin222-star.github.io/paltform/#/",
    category: "Web App",
    role: "Owner / Builder",
    status: "Live",
    monogram: "工具",
    featured: true,
    sourceNote: "GitHub README 和仓库元数据",
    summary: "React + TypeScript 个人工具广场，集中展示和管理常用小工具，支持搜索、分类筛选、导入导出。",
    intro:
      "一个 React + TypeScript 的个人工具广场，用来集中展示和管理常用小工具；公开版本通过 GitHub Pages 提供静态页面。",
    roleDescription: "负责工具广场的信息结构、工具卡片、分类管理、导入导出和 GitHub Pages 静态发布结构。",
    tags: ["Web App", "React", "TypeScript", "GitHub Pages"],
    paragraphs: [
      "README 记录当前能力：首页展示工具卡片，支持按工具名称或描述搜索，支持按分类筛选工具。",
      "工具管理页支持添加、编辑、删除工具，创建或删除分类，并支持导入、导出工具配置 JSON；HashRouter 适合部署在 GitHub Pages 子路径环境。",
    ],
  },
  {
    slug: "gin-words",
    title: "Gin Words",
    githubUrl: "https://github.com/yxqhuqin222-star/gin-words",
    category: "Web App",
    role: "Owner / Builder",
    status: "Public repo",
    monogram: "Words",
    featured: true,
    sourceNote: "GitHub README 和 README 预览图",
    summary: "欧洲旅游英语单词卡，纯前端单词速查网站，配套 CloudBase 云函数做云端进度持久化。",
    intro:
      "欧洲旅游英语单词卡：给自己用的纯前端单词速查网站，配套 CloudBase 云函数做云端进度持久化。",
    roleDescription: "负责单词卡/常用句学习界面、词库校验、进度存储云函数和发布清单整理。",
    tags: ["Web App", "HTML", "CloudBase", "Vocabulary"],
    image: "/projects/gin-words-web-preview.png",
    galleryImages: ["/projects/gin-words-web-preview.png", "/projects/gin-words-app-preview.png"],
    paragraphs: [
      "README 说明前端可直接打开 index.html，零依赖、无需联网；朗读功能依赖浏览器 Web Speech API。",
      "项目包含单词卡和常用句两种学习模式，进度各自独立；词库与句库可通过 validate.mjs 校验。",
    ],
  },
  {
    slug: "xiaoyuzhou-to-article-qwen",
    title: "小宇宙播客转文章",
    githubUrl: "https://github.com/yxqhuqin222-star/xiaoyuzhou-to-article-qwen",
    category: "AI / Agent",
    role: "Developer",
    status: "Skill",
    monogram: "播客",
    featured: true,
    sourceNote: "GitHub README 和现有项目截图",
    summary: "把小宇宙单集链接交给 Agent，下载音频、转写、检查文字稿，并生成结构化 Markdown 播客笔记。",
    intro:
      "输入小宇宙 episode URL 后，流程会下载原始音频、上传通义听悟转写、导出 transcript，并整理成结构化播客笔记。",
    roleDescription: "负责 workflow 设计、skill 打包、音频准备脚本和输出结构说明。",
    tags: ["AI / Agent", "Transcript", "Skill", "Content Pipeline"],
    image: "/projects/xiaoyuzhou-to-article-qwen.png",
    galleryImages: [
      "/projects/xiaoyuzhou-to-article-qwen-2.png",
      "/projects/xiaoyuzhou-to-article-qwen-3.png",
    ],
    paragraphs: [
      "README 给出的流程是：小宇宙链接、下载原始音频、上传通义听悟转写、导出完整文字稿、检查开头/中段/结尾、生成结构化 Markdown 笔记。",
      "项目明确说明它不是阿里云、通义听悟或 Qwen 官方项目；名称中的 qwen 表示面向通义/Qwen 使用场景。",
    ],
  },
  {
    slug: "pages_shouji",
    title: "碎片收集页",
    githubUrl: "https://github.com/yxqhuqin222-star/pages_shouji",
    category: "Web App",
    role: "Developer",
    status: "Static app",
    monogram: "收集",
    featured: true,
    sourceNote: "GitHub README 和现有项目截图",
    summary: "个人轻量网页 Inbox，直接保存碎片信息、粘贴图片、时间线查看、搜索、标签筛选和备份导入导出。",
    intro:
      "一个给个人使用的轻量网页，用来快速收集碎片化信息，并按时间线查看、搜索和管理；数据保存在当前浏览器本地。",
    roleDescription: "负责单文件静态应用的信息结构、输入保存、图片粘贴、本地数据管理和导入导出。",
    tags: ["Web App", "JavaScript", "Local Storage", "Information Inbox"],
    image: "/projects/pages_shouji.png",
    galleryImages: ["/projects/pages_shouji-2.png", "/projects/pages_shouji-3.png"],
    paragraphs: [
      "README 记录功能包括：直接输入保存、剪贴板图片粘贴、大图自动压缩、卡片流展示、搜索、标签识别与筛选。",
      "项目支持一键导出 Excel、JSON 备份导入导出；数据保存在当前浏览器本地，不依赖服务器和数据库。",
    ],
  },
  {
    slug: "dingtalk-broadcast-console",
    title: "钉钉播报控制台",
    githubUrl: "https://github.com/yxqhuqin222-star/dingtalk-broadcast-console",
    category: "Automation",
    role: "Developer",
    status: "Public repo",
    monogram: "播报",
    featured: false,
    sourceNote: "GitHub 仓库描述、文件结构和现有站内材料；仓库当前没有 README",
    summary: "公开仓库描述为“钉钉播报”，文件结构包含 bobao、jump、netlify 和 renxiao 相关目录。",
    intro: "钉钉播报相关公开仓库；当前可核验证据来自仓库描述和目录结构，仓库尚未提供 README。",
    roleDescription: "负责播报相关脚本和控制台材料整理；更细功能以补充 README 后为准。",
    tags: ["Automation", "Python", "Netlify", "Bot Message"],
    image: "/projects/dingtalk-broadcast-console.png",
    galleryImages: [
      "/projects/dingtalk-broadcast-console.png",
      "/projects/dingtalk-broadcast-console-2.png",
      "/projects/dingtalk-broadcast-console-3.png",
    ],
    paragraphs: [
      "GitHub 公开仓库描述为“钉钉播报”，主语言为 Python。",
      "公开文件结构包含 bobao、jump、netlify 和 renxiao 目录；当前详情页不扩大描述到 README 未支持的功能。",
    ],
  },
  {
    slug: "dsandqwen",
    title: "Codex DeepSeek / Qwen Fallback",
    githubUrl: "https://github.com/yxqhuqin222-star/dsandqwen",
    category: "Codex Tooling",
    role: "Developer",
    status: "Utility",
    monogram: "DS/QW",
    featured: false,
    sourceNote: "GitHub README",
    summary: "macOS 上给 Codex CLI 使用的 DeepSeek / Qwen 手动 fallback profiles 和辅助命令。",
    intro:
      "Safe, manual fallback profiles for Codex CLI on macOS：保持默认 codex 登录流不变，额外提供 DeepSeek 或 Qwen 命令。",
    roleDescription: "负责配置模板、安装脚本、Keychain 存取命令和手动 fallback 使用说明。",
    tags: ["Codex Tooling", "Shell", "macOS", "Keychain"],
    paragraphs: [
      "README 说明项目只包含配置模板和辅助脚本；API keys 存放在 macOS Keychain，不进入仓库。",
      "安装后提供 cx、cx-ds、cx-qw、cx-resume-ds、cx-resume-qw、codex-provider-key 等命令。",
    ],
  },
  {
    slug: "opencodex-codex-desktop-model-catalog-json",
    title: "OpenCodex Desktop 模型菜单",
    githubUrl:
      "https://github.com/yxqhuqin222-star/opencodex-codex-desktop-model-catalog-json",
    category: "Codex Tooling",
    role: "Developer",
    status: "Utility",
    monogram: "模型",
    featured: false,
    sourceNote: "GitHub README 和仓库描述",
    summary: "把本机 OpenCodex 已配置模型接入 Codex Desktop 原生模型菜单，并收窄到少量可用模型。",
    intro:
      "把本机 OpenCodex 已配置的模型接入 Codex Desktop 原生模型菜单，并通过 model_catalog_json 控制菜单可见模型。",
    roleDescription: "负责稳定配置方案、脚本化应用流程、缓存刷新和真实模型调用验证说明。",
    tags: ["Codex Tooling", "Shell", "OpenCodex", "Model Menu"],
    paragraphs: [
      "README 记录核心原则：保留 Codex 原生 OpenAI provider，不新增 model_provider 或 model_providers 配置。",
      "脚本会备份配置、启用 moonshot-cn、设置 openai_base_url 和 model_catalog_json、执行 ocx sync，并真实调用测试多类模型。",
    ],
  },
  {
    slug: "skill-description-translator",
    title: "Skill Description Translator",
    githubUrl: "https://github.com/yxqhuqin222-star/skill-description-translator",
    category: "AI / Agent",
    role: "Developer",
    status: "Skill",
    monogram: "Skill",
    featured: false,
    sourceNote: "GitHub README 和仓库描述",
    summary: "把英文或中英混合的 Codex skill 简介整理成简洁中文，方便在 skill 选择器里快速判断用途。",
    intro:
      "一个可分享的 Codex skill，用来扫描 SKILL.md frontmatter，找出英文偏重 description，并辅助生成/写回中文简介。",
    roleDescription: "负责 skill 使用说明、扫描与写回脚本、元数据结构和安全备份策略。",
    tags: ["AI / Agent", "Python", "Skill", "i18n"],
    paragraphs: [
      "README 记录仓库包含 SKILL.md、scripts/skill_description_i18n.py、agents/openai.yaml 和 agents/interface.yaml。",
      "脚本支持扫描 Codex skill 目录、输出 Markdown 或 JSON 清单，并在人工确认后写回中文简介；写回前会自动备份文件。",
    ],
  },
  {
    slug: "gin-projects-share",
    title: "Gin 项目与分享网站",
    githubUrl: "https://github.com/yxqhuqin222-star/gin-projects-share",
    liveUrl: "https://gin-projects-share.aurora-bear-8002.chatgpt.site/",
    category: "Web App",
    role: "Owner / Builder",
    status: "This site",
    monogram: "Gin",
    featured: false,
    sourceNote: "本站 README 和当前源码",
    summary: "Gin 的个人网站，用来展示项目、工具、网站服务、分享内容、联系方式和咨询入口。",
    intro:
      "这是 Gin 的个人项目与分享网站，用来整理项目说明、GitHub 链接、详情页、分享内容、联系方式和咨询入口。",
    roleDescription: "负责 Next/Vinext 网站结构、项目详情页、咨询入口和 Sites 部署配置。",
    tags: ["Web App", "TypeScript", "Next", "Sites"],
    paragraphs: [
      "README 记录网站内容包括首页介绍、项目展示、项目详情、分享区域、联系方式和右下角咨询入口。",
      "项目详情页遵循来源约束：只使用项目仓库说明、文件结构、代码入口、已有截图或用户提供内容中可以确认的信息。",
    ],
  },
  {
    slug: "xiaomao-custom-rules",
    title: "xiaomao custom rules",
    githubUrl: "https://github.com/yxqhuqin222-star/xiaomao-custom-rules",
    category: "Rules",
    role: "Maintainer",
    status: "Ruleset",
    monogram: "Rules",
    featured: false,
    sourceNote: "GitHub README 和仓库文件结构",
    summary: "用于 xiaomao 的自定义路由规则，当前 README 记录了 Doubao 相关 AutoProxy 规则。",
    intro:
      "Custom routing rules for xiaomao：当前包含 doubao.txt 和 doubao-www.txt，用于 Doubao 流量的 proxy mode 规则。",
    roleDescription: "负责维护规则文件和 README 说明。",
    tags: ["Rules", "AutoProxy", "xiaomao", "Doubao"],
    paragraphs: [
      "README 说明 doubao.txt 用来让 Doubao traffic 通过 proxy mode，格式为 AutoProxy。",
      "公开文件结构包含 README.md、doubao.txt 和 doubao-www.txt。",
    ],
  },
];

export const shares = [
  {
    title: "读书摘记",
    group: "Books",
    summary: "记录读完之后真正留下来的句子、判断和可继续追问的问题。",
  },
  {
    title: "AI 工作流笔记",
    group: "AI Workflow",
    summary: "记录我实际使用过的 agent、automation、Codex tooling 和个人生产流程。",
  },
  {
    title: "生活观察",
    group: "Life",
    summary: "把日常里的小经验和观察留下来，让网站不只是一份项目清单。",
  },
  {
    title: "实用工具清单",
    group: "Tools",
    summary: "只记录真实用过、能说清楚使用场景和关键体验的工具。",
  },
];
