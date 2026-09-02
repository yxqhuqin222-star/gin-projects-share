const projectModuleItems = [
  {
    id: "work",
    label: "工作",
    description: "实际工作里沉淀出来的看板、控制台和协作工具。",
  },
  {
    id: "skills-tools",
    label: "skills及工具",
    description: "面向 Codex、Agent 和内容处理流程的可复用工具。",
  },
  {
    id: "personal-efficiency",
    label: "个人提效",
    description: "给自己长期使用的信息收集、学习和规则工具。",
  },
] as const;

export const moduleItems = [
  ...projectModuleItems,
  {
    id: "writing",
    label: "分享",
    description: "读书、AI 工作流、生活观察和工具清单。",
  },
  {
    id: "contact",
    label: "联系",
    description: "邮箱、微信和 GitHub 入口。",
  },
] as const;

export const projectCategories = projectModuleItems;

export const navItems = moduleItems.map((item) => ({
  href: `/#${item.id}`,
  label: item.label,
}));

export type ProjectCategoryId = (typeof projectCategories)[number]["id"];

export type Project = {
  slug: string;
  title: string;
  githubUrl: string;
  liveUrl?: string;
  categoryId: ProjectCategoryId;
  status: string;
  monogram: string;
  summary: string;
  intro: string;
  sourceNote: string;
  image?: string;
  galleryImages?: string[];
  paragraphs: string[];
};

export const projects: Project[] = [
  {
    slug: "paltform",
    title: "小工具集合平台",
    githubUrl: "https://github.com/yxqhuqin222-star/paltform",
    liveUrl: "https://yxqhuqin222-star.github.io/paltform/#/",
    categoryId: "work",
    status: "在线",
    monogram: "工具",
    sourceNote: "GitHub README 和仓库元数据",
    summary: "个人工具广场，集中展示和管理常用小工具，支持搜索、分类和导入导出。",
    intro: "一个集中管理常用小工具的个人工具广场，公开版本通过 GitHub Pages 提供静态页面。",
    paragraphs: [
      "README 记录当前能力：首页展示工具卡片，支持按工具名称或描述搜索，支持按分类筛选工具。",
      "工具管理页支持添加、编辑、删除工具，创建或删除分类，并支持导入、导出工具配置 JSON。",
    ],
  },
  {
    slug: "dingtalk-broadcast-console",
    title: "钉钉播报控制台",
    githubUrl: "https://github.com/yxqhuqin222-star/dingtalk-broadcast-console",
    categoryId: "work",
    status: "仓库",
    monogram: "播报",
    sourceNote: "GitHub 仓库描述、文件结构和现有站内材料；仓库当前没有 README",
    summary: "钉钉播报相关控制台和脚本材料，用来整理播报链路。",
    intro: "钉钉播报相关公开仓库；当前可核验证据来自仓库描述和目录结构。",
    image: "/projects/dingtalk-broadcast-console.png",
    galleryImages: [
      "/projects/dingtalk-broadcast-console.png",
      "/projects/dingtalk-broadcast-console-2.png",
      "/projects/dingtalk-broadcast-console-3.png",
    ],
    paragraphs: [
      "GitHub 公开仓库描述为“钉钉播报”，主语言为 Python。",
      "公开文件结构包含 bobao、jump、netlify 和 renxiao 目录；更细功能以补充 README 后为准。",
    ],
  },
  {
    slug: "rizhuizong",
    title: "日追踪看板",
    githubUrl: "https://github.com/yxqhuqin222-star/rizhuizong",
    liveUrl: "https://yxqhuqin222-star.github.io/rizhuizong/",
    categoryId: "work",
    status: "在线",
    monogram: "日追踪",
    sourceNote: "GitHub README、仓库描述和现有项目截图",
    summary: "读取每日数据和每周目标，生成网页看板、工作簿、播报图和线上只读同步。",
    intro:
      "读取每日数据和每周目标，生成统一 Summary、网页看板、工作簿、播报图，并支持线上只读同步。",
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
    categoryId: "work",
    status: "在线快照",
    monogram: "人效",
    sourceNote: "GitHub README 和本地项目截图",
    summary: "展示上传表计算后的成本、转化率、趋势图和明细表，并导出只读快照。",
    intro: "人效数据看板，用于查看成本、转化率、趋势图和明细表；公开页面以只读快照为主。",
    image: "/projects/renxiao-dashboard.png",
    galleryImages: ["/projects/renxiao-dashboard.png"],
    paragraphs: [
      "README 说明本项目维护两类目标：本地 Flask 服务用于上传、重新计算、下载和完整交互；GitHub Pages 用于公开查看静态前端快照。",
      "只读快照由 scripts/export_readonly.py 导出到 docs/index.html，会剥离上传表单、下载链接和后端请求，只保留查看功能。",
    ],
  },
  {
    slug: "xiaoyuzhou-to-article-qwen",
    title: "小宇宙播客转文章",
    githubUrl: "https://github.com/yxqhuqin222-star/xiaoyuzhou-to-article-qwen",
    categoryId: "skills-tools",
    status: "Skill",
    monogram: "播客",
    sourceNote: "GitHub README 和现有项目截图",
    summary: "把小宇宙单集链接转成转写稿和结构化 Markdown 播客笔记。",
    intro: "输入小宇宙 episode URL 后，流程会下载音频、转写、检查文字稿，并整理成结构化播客笔记。",
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
    slug: "skill-description-translator",
    title: "Skill Description Translator",
    githubUrl: "https://github.com/yxqhuqin222-star/skill-description-translator",
    categoryId: "skills-tools",
    status: "Skill",
    monogram: "Skill",
    sourceNote: "GitHub README 和仓库描述",
    summary: "把英文或中英混合的 Codex skill 简介整理成简洁中文。",
    intro: "一个可分享的 Codex skill，用来整理 skill 简介，方便在选择器里快速判断用途。",
    paragraphs: [
      "README 记录仓库包含 SKILL.md、scripts/skill_description_i18n.py、agents/openai.yaml 和 agents/interface.yaml。",
      "脚本支持扫描 Codex skill 目录、输出 Markdown 或 JSON 清单，并在人工确认后写回中文简介；写回前会自动备份文件。",
    ],
  },
  {
    slug: "opencodex-codex-desktop-model-catalog-json",
    title: "OpenCodex Desktop 模型菜单",
    githubUrl:
      "https://github.com/yxqhuqin222-star/opencodex-codex-desktop-model-catalog-json",
    categoryId: "skills-tools",
    status: "工具",
    monogram: "模型",
    sourceNote: "GitHub README 和仓库描述",
    summary: "把 OpenCodex 已配置模型接入 Codex Desktop 原生模型菜单。",
    intro: "把本机 OpenCodex 已配置的模型接入 Codex Desktop 原生模型菜单，并控制菜单可见模型。",
    paragraphs: [
      "README 记录核心原则：保留 Codex 原生 OpenAI provider，不新增 model_provider 或 model_providers 配置。",
      "脚本会备份配置、启用 moonshot-cn、设置 openai_base_url 和 model_catalog_json、执行 ocx sync，并真实调用测试多类模型。",
    ],
  },
  {
    slug: "dialkit-tuner",
    title: "DialKit Tuner",
    githubUrl: "https://github.com/yxqhuqin222-star/dialkit-tuner",
    categoryId: "skills-tools",
    status: "待补详情",
    monogram: "Dial",
    sourceNote: "公开 GitHub 仓库主页",
    summary: "公开仓库入口，详细说明和截图后续补充。",
    intro: "DialKit Tuner 的公开仓库入口；当前页面先保留最小说明，避免扩写未经确认的功能细节。",
    paragraphs: [
      "当前先展示仓库主页和最小说明。",
      "详情页先只保留仓库入口和最小说明；README、截图或使用场景补充后，再扩展为完整项目介绍。",
    ],
  },
  {
    slug: "xhs-photo-downloader",
    title: "xhs-photo-downloader",
    githubUrl: "https://github.com/yxqhuqin222-star/xhs-photo-downloader",
    categoryId: "skills-tools",
    status: "待补详情",
    monogram: "XHS",
    sourceNote: "公开 GitHub 仓库主页",
    summary: "公开仓库入口，详细说明和截图后续补充。",
    intro: "xhs-photo-downloader 的公开仓库主页入口；当前页面先保留最小说明。",
    paragraphs: [
      "当前先展示仓库主页和最小说明。",
      "详情页先只保留仓库入口和最小说明；README、截图或使用场景补充后，再扩展为完整项目介绍。",
    ],
  },
  {
    slug: "gin-words",
    title: "Gin Words",
    githubUrl: "https://github.com/yxqhuqin222-star/gin-words",
    categoryId: "personal-efficiency",
    status: "仓库",
    monogram: "Words",
    sourceNote: "GitHub README 和 README 预览图",
    summary: "欧洲旅游英语单词卡，纯前端单词速查网站，配套云端进度持久化。",
    intro: "给自己用的欧洲旅游英语单词卡，包含单词卡和常用句学习模式。",
    image: "/projects/gin-words-web-preview.png",
    galleryImages: ["/projects/gin-words-web-preview.png", "/projects/gin-words-app-preview.png"],
    paragraphs: [
      "README 说明前端可直接打开 index.html，零依赖、无需联网；朗读功能依赖浏览器 Web Speech API。",
      "项目包含单词卡和常用句两种学习模式，进度各自独立；词库与句库可通过 validate.mjs 校验。",
    ],
  },
  {
    slug: "pages_shouji",
    title: "碎片收集页",
    githubUrl: "https://github.com/yxqhuqin222-star/pages_shouji",
    categoryId: "personal-efficiency",
    status: "静态应用",
    monogram: "收集",
    sourceNote: "GitHub README 和现有项目截图",
    summary: "轻量网页 Inbox，用来保存碎片信息、粘贴图片、搜索、标签筛选和备份导入导出。",
    intro: "一个给个人使用的轻量网页，用来快速收集碎片化信息，并按时间线查看、搜索和管理。",
    image: "/projects/pages_shouji.png",
    galleryImages: ["/projects/pages_shouji-2.png", "/projects/pages_shouji-3.png"],
    paragraphs: [
      "README 记录功能包括：直接输入保存、剪贴板图片粘贴、大图自动压缩、卡片流展示、搜索、标签识别与筛选。",
      "项目支持一键导出 Excel、JSON 备份导入导出；数据保存在当前浏览器本地，不依赖服务器和数据库。",
    ],
  },
  {
    slug: "xiaomao-custom-rules",
    title: "xiaomao custom rules",
    githubUrl: "https://github.com/yxqhuqin222-star/xiaomao-custom-rules",
    categoryId: "personal-efficiency",
    status: "规则",
    monogram: "Rules",
    sourceNote: "GitHub README 和仓库文件结构",
    summary: "用于 xiaomao 的自定义路由规则，当前包含 Doubao 相关规则。",
    intro: "Custom routing rules for xiaomao：当前包含 doubao.txt 和 doubao-www.txt。",
    paragraphs: [
      "README 说明 doubao.txt 用来让 Doubao traffic 通过 proxy mode，格式为 AutoProxy。",
      "公开文件结构包含 README.md、doubao.txt 和 doubao-www.txt。",
    ],
  },
  {
    slug: "xiaoming-feishu-bot",
    title: "xiaoming-feishu-bot",
    githubUrl: "https://github.com/yxqhuqin222-star/xiaoming-feishu-bot",
    categoryId: "personal-efficiency",
    status: "待补详情",
    monogram: "飞书",
    sourceNote: "公开 GitHub 仓库主页",
    summary: "公开仓库入口，详细说明和截图后续补充。",
    intro: "xiaoming-feishu-bot 的公开仓库入口；当前页面先保留最小说明。",
    paragraphs: [
      "当前先展示仓库主页和最小说明。",
      "详情页先只保留仓库入口和最小说明；README、截图或使用场景补充后，再扩展为完整项目介绍。",
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

export const contactLinks = [
  {
    label: "邮箱",
    value: "yxqhuqin222@gmail.com",
    href: "mailto:yxqhuqin222@gmail.com",
  },
  {
    label: "微信 / 电话",
    value: "18401205743",
    href: "tel:18401205743",
  },
  {
    label: "GitHub",
    value: "yxqhuqin222-star",
    href: "https://github.com/yxqhuqin222-star/",
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getProjectCategoryLabel(categoryId: ProjectCategoryId) {
  return projectCategories.find((category) => category.id === categoryId)?.label ?? "项目";
}
