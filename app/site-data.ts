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
    id: "other",
    label: "其他",
    description: "不需要图片或详情页的轻量入口。",
  },
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

export type ProjectWorkflow = {
  steps: string[];
  features: string[];
  note: string;
};

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
  sourceNote?: string;
  image?: string;
  galleryImages?: string[];
  galleryCaptions?: string[];
  workflow?: ProjectWorkflow;
  paragraphs: string[];
};

export type ManagedProject = Project & {
  id: string;
  isPublished: boolean;
};

export type Share = {
  id: string;
  title: string;
  group: string;
  summary: string;
};

export type ContactLink = {
  id: string;
  label: string;
  value: string;
  href: string;
};

export type OtherLink = {
  id: string;
  title: string;
  summary: string;
  href: string;
};

export type SiteContent = {
  projects: ManagedProject[];
  shares: Share[];
  contactLinks: ContactLink[];
  otherLinks: OtherLink[];
};

export const featuredProjectSlugs = [
  "paltform",
  "dingtalk-broadcast-console",
  "rizhuizong",
  "renxiao",
  "xiaoyuzhou-to-article-qwen",
  "gin-words",
] as const;

export const projects: Project[] = [
  {
    slug: "paltform",
    githubUrl: "https://github.com/yxqhuqin222-star/paltform",
    liveUrl: "https://yxqhuqin222-star.github.io/paltform/#/",
    categoryId: "work",
    monogram: "工具",
    sourceNote: "GitHub README 和仓库元数据",
    title: "小工具集合平台",
    summary: "把常用工具集中在一页，按名称或分类快速找到入口。",
    intro: "把常用工具集中在一页，按名称或分类快速找到入口。",
    workflow: {
      steps: ["收集常用工具", "搜索或分类", "打开工具", "维护工具清单"],
      features: ["名称搜索", "分类管理", "配置导入导出"],
      note: "工具清单可导出备份；同步到 GitHub 需单独配置。",
    },
    image: "/projects/paltform.png",
    galleryImages: ["/projects/paltform.png"],
    galleryCaptions: ["工具广场：按分类浏览、搜索工具入口"],
    paragraphs: [
      "README 记录当前能力：首页展示工具卡片，支持按工具名称或描述搜索，支持按分类筛选工具。",
      "工具管理页支持添加、编辑、删除工具，创建或删除分类，并支持导入、导出工具配置 JSON。",
    ],
    status: "",
  },
  {
    slug: "dingtalk-broadcast-console",
    githubUrl: "https://github.com/yxqhuqin222-star/dingtalk-broadcast-console",
    categoryId: "work",
    monogram: "播报",
    title: "钉钉播报控制台",
    summary: "从 CSV 中筛选并统计订单，预览消息后发送到钉钉群。",
    intro: "从 CSV 中筛选并统计订单，预览消息后发送到钉钉群。",
    workflow: {
      steps: ["上传 CSV", "设置筛选条件", "预览播报内容", "发送到钉钉"],
      features: ["条件计数", "消息模板", "指定提醒对象"],
      note: "发送需要配置钉钉群机器人。",
    },
    galleryImages: [],
    galleryCaptions: [],
    sourceNote: "GitHub netlify/functions/preview.js、broadcast.js 与 _shared/bobao.js",
    paragraphs: [
      "GitHub 公开仓库描述为“钉钉播报”，主语言为 Python。",
      "公开文件结构包含 bobao、jump、netlify 和 renxiao 目录；更细功能以补充 README 后为准。",
    ],
    status: "",
  },
  {
    slug: "rizhuizong",
    githubUrl: "https://github.com/yxqhuqin222-star/rizhuizong",
    categoryId: "work",
    monogram: "日追踪",
    sourceNote: "GitHub README、仓库描述和现有项目截图",
    title: "日追踪看板",
    summary: "把每日数据和每周目标汇总成看板，查看进度与落后项。",
    intro: "把每日数据和每周目标汇总成看板，查看进度与落后项。",
    workflow: {
      steps: ["更新数据与目标", "汇总计算", "查看进度", "导出与播报"],
      features: ["多维筛选", "渠道与年级汇总", "播报图导出"],
      note: "本地更新后同步只读看板，群播报需配置机器人。",
    },
    image: "/projects/rizhuizong-live-dashboard.png",
    galleryImages: ["/projects/rizhuizong-live-dashboard.png"],
    galleryCaptions: ["日追踪看板：期次筛选、目标进度与明细"],
    paragraphs: [
      "README 明确记录：项目读取每日 demo 和每周 target，生成 Summary、网页看板、工作簿、总进度/学部/专项播报图，并支持线上只读同步。",
      "项目能力包括最新期次/全部期次切换、多选筛选、CSV 导出、渠道聚合、年级聚合，以及本地更新后的线上只读 state 同步。",
    ],
    status: "",
  },
  {
    slug: "renxiao",
    githubUrl: "https://github.com/yxqhuqin222-star/renxiao",
    liveUrl: "https://yxqhuqin222-star.github.io/renxiao/",
    categoryId: "work",
    status: "在线快照",
    monogram: "人效",
    sourceNote: "GitHub README 和本地项目截图",
    title: "人效与成本看板",
    summary: "把业务表转成成本、转化率和趋势看板，支持只读分享。",
    intro: "把业务表转成成本、转化率和趋势看板，支持只读分享。",
    workflow: {
      steps: ["上传业务表", "计算成本与转化", "筛选查看结果", "导出只读快照"],
      features: ["成本监控", "趋势与明细", "只读分享"],
      note: "公开页面只读，上传和重新计算在本地服务完成。",
    },
    image: "/projects/renxiao-dashboard.png",
    galleryImages: ["/projects/renxiao-dashboard.png"],
    galleryCaptions: ["人效看板：成本、转化率、趋势与明细"],
    paragraphs: [
      "README 说明本项目维护两类目标：本地 Flask 服务用于上传、重新计算、下载和完整交互；GitHub Pages 用于公开查看静态前端快照。",
      "只读快照由 scripts/export_readonly.py 导出到 docs/index.html，会剥离上传表单、下载链接和后端请求，只保留查看功能。",
    ],
  },
  {
    slug: "xiaoyuzhou-to-article-qwen",
    githubUrl: "https://github.com/yxqhuqin222-star/xiaoyuzhou-to-article-qwen",
    categoryId: "skills-tools",
    status: "Skill",
    monogram: "播客",
    sourceNote: "GitHub README 和现有项目截图",
    title: "小宇宙播客转文章",
    summary: "把一集播客整理成完整文字稿和结构化笔记，方便回看。",
    intro: "把一集播客整理成完整文字稿和结构化笔记，方便回看。",
    workflow: {
      steps: ["提供单集链接", "下载并转写", "检查文字稿", "生成结构化笔记"],
      features: ["完整文字稿", "按内容顺序整理", "Markdown 笔记"],
      note: "需登录通义听悟，上传或导出可能需要手动接管。",
    },
    galleryImages: [],
    galleryCaptions: [],
    paragraphs: [
      "README 给出的流程是：小宇宙链接、下载原始音频、上传通义听悟转写、导出完整文字稿、检查开头/中段/结尾、生成结构化 Markdown 笔记。",
      "项目明确说明它不是阿里云、通义听悟或 Qwen 官方项目；名称中的 qwen 表示面向通义/Qwen 使用场景。",
    ],
  },
  {
    slug: "skill-description-translator",
    githubUrl: "https://github.com/yxqhuqin222-star/skill-description-translator",
    categoryId: "skills-tools",
    status: "Skill",
    monogram: "Skill",
    sourceNote: "GitHub README 和仓库描述",
    title: "Skill 简介汉化",
    summary: "把英文 Skill 简介改成简洁中文，方便在选择器里判断用途。",
    intro: "把英文 Skill 简介改成简洁中文，方便在选择器里判断用途。",
    workflow: {
      steps: ["扫描简介", "整理中文说明", "确认修改", "备份并写回"],
      features: ["批量扫描", "同步短简介", "修改前备份"],
      note: "先预演再写回，只调整简介，不改变 Skill 正文。",
    },
    paragraphs: [
      "README 记录仓库包含 SKILL.md、scripts/skill_description_i18n.py、agents/openai.yaml 和 agents/interface.yaml。",
      "脚本支持扫描 Codex skill 目录、输出 Markdown 或 JSON 清单，并在人工确认后写回中文简介；写回前会自动备份文件。",
    ],
  },
  {
    slug: "opencodex-codex-desktop-model-catalog-json",
    githubUrl:
      "https://github.com/yxqhuqin222-star/opencodex-codex-desktop-model-catalog-json",
    categoryId: "skills-tools",
    status: "工具",
    monogram: "模型",
    sourceNote: "GitHub README 和仓库描述",
    title: "OpenCodex 模型菜单",
    summary: "把已配置的 OpenCodex 模型加入 Codex 桌面端菜单。",
    intro: "把已配置的 OpenCodex 模型加入 Codex 桌面端菜单。",
    workflow: {
      steps: ["检查已有模型", "备份配置", "同步模型菜单", "验证实际调用"],
      features: ["原生菜单", "精简模型列表", "配置可恢复"],
      note: "依赖已配置的 OpenCodex；刷新缓存可能短暂重启桌面服务。",
    },
    paragraphs: [
      "README 记录核心原则：保留 Codex 原生 OpenAI provider，不新增 model_provider 或 model_providers 配置。",
      "脚本会备份配置、启用 moonshot-cn、设置 openai_base_url 和 model_catalog_json、执行 ocx sync，并真实调用测试多类模型。",
    ],
  },
  {
    slug: "dialkit-tuner",
    githubUrl: "https://github.com/yxqhuqin222-star/dialkit-tuner",
    categoryId: "skills-tools",
    status: "Skill",
    monogram: "Dial",
    sourceNote: "GitHub README 和仓库元数据",
    intro:
      "一个面向 Codex 的 skill：先定位真实前端项目和目标组件，再用最小范围接入 DialKit 调参面板。",
    title: "DialKit 界面调参",
    summary: "在页面上实时调整样式和动效，把确认后的参数写回代码。",
    intro: "在页面上实时调整样式和动效，把确认后的参数写回代码。",
    workflow: {
      steps: ["指定页面组件", "接入调参面板", "实时调整参数", "固化回代码"],
      features: ["样式与动效调参", "保存预设", "参数写回"],
      note: "用于开发调试，确认参数后写回正式样式。",
    },
    paragraphs: [
      "README 说明它用于开发期界面调参，不作为生产功能接入；可暴露圆角、间距、模糊、阴影、颜色、缩放、透明度、时长、弹性和阻尼等控制项。",
      "流程要求先检查目标项目的框架、路由和组件入口，再按项目已有包管理器安装依赖，并把调好的参数固化回 CSS、Tailwind、CSS 变量或 Motion 配置。",
    ],
  },
  {
    slug: "xhs-photo-downloader",
    title: "小红书 Live Photo 备份整理",
    githubUrl: "https://github.com/yxqhuqin222-star/xhs-photo-downloader",
    categoryId: "skills-tools",
    status: "本地工具",
    monogram: "XHS",
    sourceNote: "GitHub README 和仓库元数据",
    summary: "把自己的笔记素材保存到 Mac，方便归档和查找。",
    intro: "把自己的笔记素材保存到 Mac，方便归档和查找。",
    workflow: {
      steps: ["登录自己的账号", "导出笔记链接", "下载原始素材", "另行整理文件"],
      features: ["分批下载", "照片与动态文件配对命名", "失败记录可查"],
      note: "macOS 本地运行，下载通过 XHS-Downloader 完成，整理需单独执行。",
    },
    paragraphs: [
      "README 明确写出核心边界：不直接请求图片接口、不抓取 img src、不保存用户密码、不绕过登录、验证码、权限或平台限制。",
      "推荐流程是先导出账号主页笔记链接，再用 XHS-Downloader 小批量验证，最后整理 raw-downloads 中的 HEIC、MOV、JPG、MP4、PNG 或 ZIP 文件。",
    ],
  },
  {
    slug: "gin-words",
    githubUrl: "https://github.com/yxqhuqin222-star/gin-words",
    categoryId: "personal-efficiency",
    status: "静态应用",
    monogram: "Words",
    sourceNote: "GitHub README 和 README 预览图",
    title: "Gin Words 旅行英语",
    summary: "按旅行场景查单词和常用句，结合例句、朗读记录学习进度。",
    intro: "按旅行场景查单词和常用句，结合例句、朗读记录学习进度。",
    workflow: {
      steps: ["选择学习模式", "按场景查找", "查看例句与朗读", "记录掌握进度"],
      features: ["单词与常用句", "场景检索", "进度记录"],
      note: "朗读依赖浏览器，跨设备进度同步需云端服务。",
    },
    image: "/projects/gin-words-web-preview.png",
    galleryImages: ["/projects/gin-words-web-preview.png", "/projects/gin-words-app-preview.png"],
    galleryCaptions: ["桌面端：单词卡与掌握进度", "手机端：旅行场景与单词学习"],
    paragraphs: [
      "README 说明前端可直接打开 index.html，零依赖、无需联网；朗读功能依赖浏览器 Web Speech API。",
      "项目包含单词卡和常用句两种学习模式，进度各自独立；词库与句库可通过 validate.mjs 校验。",
    ],
  },
  {
    slug: "pages_shouji",
    githubUrl: "https://github.com/yxqhuqin222-star/pages_shouji",
    categoryId: "personal-efficiency",
    status: "静态应用",
    monogram: "收集",
    sourceNote: "GitHub README 和现有项目截图",
    title: "碎片收集页",
    summary: "随手保存文字和图片，再通过搜索和标签找回。",
    intro: "随手保存文字和图片，再通过搜索和标签找回。",
    workflow: {
      steps: ["输入文字或图片", "保存到本地", "搜索与标签筛选", "导出备份"],
      features: ["图片粘贴", "标签检索", "备份导入导出"],
      note: "内容保存在当前浏览器，换设备前先导出备份。",
    },
    image: "/projects/pages-shouji-desktop.png",
    galleryImages: ["/projects/pages-shouji-desktop.png", "/projects/pages-shouji-mobile.png"],
    galleryCaptions: ["桌面端：碎片记录与标签筛选", "手机端：输入内容与查看记录"],
    paragraphs: [
      "README 记录功能包括：直接输入保存、剪贴板图片粘贴、大图自动压缩、卡片流展示、搜索、标签识别与筛选。",
      "项目支持一键导出 Excel、JSON 备份导入导出；数据保存在当前浏览器本地，不依赖服务器和数据库。",
    ],
  },
  {
    slug: "xiaomao-custom-rules",
    githubUrl: "https://github.com/yxqhuqin222-star/xiaomao-custom-rules",
    categoryId: "personal-efficiency",
    status: "规则",
    monogram: "Rules",
    sourceNote: "GitHub README 和仓库文件结构",
    title: "xiaomao 自定义路由",
    summary: "为 xiaomao 配置 Doubao 相关域名的代理路由规则。",
    intro: "为 xiaomao 配置 Doubao 相关域名的代理路由规则。",
    workflow: {
      steps: ["访问匹配域名", "匹配路由规则", "按代理模式连接"],
      features: ["AutoProxy 格式", "Doubao 相关域名"],
      note: "规则需在 xiaomao 中配置使用，不提供代理服务。",
    },
    paragraphs: [
      "README 说明 doubao.txt 用来让 Doubao traffic 通过 proxy mode，格式为 AutoProxy。",
      "公开文件结构包含 README.md、doubao.txt 和 doubao-www.txt。",
    ],
  },
  {
    slug: "xiaoming-feishu-bot",
    githubUrl: "https://github.com/yxqhuqin222-star/xiaoming-feishu-bot",
    categoryId: "personal-efficiency",
    status: "飞书机器人",
    monogram: "飞书",
    sourceNote: "GitHub README 和仓库元数据",
    intro:
      "小明是一个本地运行的飞书机器人，用于在飞书私聊和群聊里回复消息，并承接早安、知识卡、大道消息、摸鱼日历、晚间收尾等播报能力。",
    title: "小明飞书机器人",
    summary: "在飞书里回答问题、查询实时信息，并发送日常内容播报。",
    intro: "在飞书里回答问题、查询实时信息，并发送日常内容播报。",
    workflow: {
      steps: ["私聊或群内提问", "生成回复或查询", "回复原消息"],
      features: ["群聊按需响应", "实时信息查询", "日常内容播报"],
      note: "机器人需在本地运行，群聊默认被 @ 才回复。",
    },
    paragraphs: [
      "README 记录它支持私聊直接回复，群聊默认只在被 @小明 时回复，并通过飞书开放平台机器人身份回复原消息。",
      "项目使用事件监听加轮询兜底，已处理消息 ID 会持久化到 state/xiaoming-seen.json；也提供 macOS LaunchAgent 常驻运行模板。",
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

export function getVisibleModuleItems(content: SiteContent) {
  return moduleItems.filter((item) => {
    if (item.id === "other") return content.otherLinks.length > 0;
    if (item.id === "writing") return content.shares.length > 0;
    if (item.id === "contact") return true;
    return content.projects.some((project) => project.isPublished && project.categoryId === item.id);
  });
}

/**
 * The checked-in data is the initial public site and the safe runtime fallback.
 * D1 overrides are validated before use and must have this same shape.
 */
export function createDefaultSiteContent(): SiteContent {
  return {
    projects: projects.map((project) => ({
      ...project,
      id: `project-${project.slug.replaceAll("_", "-")}`,
      galleryImages: project.galleryImages ? [...project.galleryImages] : undefined,
      galleryCaptions: project.galleryCaptions ? [...project.galleryCaptions] : undefined,
      workflow: project.workflow ? {
        ...project.workflow,
        steps: [...project.workflow.steps],
        features: [...project.workflow.features],
      } : undefined,
      paragraphs: [...project.paragraphs],
      isPublished: true,
    })),
    shares: shares.map((share, index) => ({
      ...share,
      id: `share-${index + 1}`,
    })),
    contactLinks: contactLinks.map((link, index) => ({
      ...link,
      id: `contact-${index + 1}`,
    })),
    otherLinks: [],
  };
}
