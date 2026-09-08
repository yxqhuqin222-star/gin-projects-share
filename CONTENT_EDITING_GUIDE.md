# 网站文案编辑指南

网站提供受保护的 `/admin` 内容管理页，可维护项目、分享、其他入口和联系方式；保存后会写入 Cloudflare D1，并立即影响公开首页和项目详情页。源码里的数据仍是首次使用和 D1 不可用时的安全兜底。

真实源码目录：

```bash
cd /Users/kityhello/workplace/project/gin-projects-share
```

不要改 `/Users/kityhello/workplace/geren/wangzhan` 里的旧探索稿；当前网站源码在上面的 `gin-projects-share` 目录。

## 用管理页编辑（推荐）

访问 `/admin` 并使用管理员密码登录。首版支持：

- 项目新增、编辑、隐藏/恢复、排序；图片填写已有 `/projects/...` 路径或安全外链，不上传文件。
- 分享、其他入口与联系方式的新增、编辑、删除、排序。
- 其他入口不需要图片或详情页，只填写名称、简单说明和安全跳转链接；至少有一条时才会显示在公开首页。
- 保存前服务端校验 slug、分类、链接与重复条目；校验失败不会写入数据库。

部署前需在每个目标环境设置以下私密变量，绝不能写入仓库：

```text
ADMIN_PASSWORD=<管理员密码>
ADMIN_SESSION_SECRET=<至少 32 个字符的随机字符串>
```

新的 D1 迁移 `drizzle/0002_site_content.sql` 和 `drizzle/0003_admin_login_attempts.sql` 必须先应用；删除 `site_content` 表中 id 为 `primary` 的记录即可恢复为源码默认内容。管理登录以来源 IP 为维度限制为 15 分钟内 5 次失败尝试，因此 `ADMIN_PASSWORD` 应使用高强度且唯一的密码。

## 改源码默认内容

### 1. 大部分项目文案：`app/site-data.ts`

这个文件是网站内容的主数据源。首页项目卡片、详情页标题、详情页段落，大部分都从这里读取。

常改区域：

| 页面位置 | 改 `app/site-data.ts` 里的内容 |
| --- | --- |
| 侧边导航和分组名称 | `projectModuleItems[].label` |
| 分组说明 | `projectModuleItems[].description` |
| 代表项目显示哪些卡片 | `featuredProjectSlugs` |
| 首页项目卡片标题 | `projects[].title` |
| 首页项目卡片状态 | `projects[].status` |
| 首页项目卡片小标签 | `projects[].monogram` |
| 首页项目卡片一句话 | `projects[].summary` |
| 详情页大标题 | `projects[].title` |
| 详情页标题下说明 | `projects[].intro` |
| 详情页“一句话” | `projects[].summary` |
| 详情页正文段落 | `projects[].paragraphs` |
| 详情页 GitHub 链接 | `projects[].githubUrl` |
| 详情页“打开页面/访问”链接 | `projects[].liveUrl` |
| 项目主图 | `projects[].image` |
| 项目详情图组 | `projects[].galleryImages` |
| 分享区卡片 | `shares` |
| 其他入口列表 | `otherLinks` |
| 联系方式 | `contactLinks` |

一个项目的数据大概长这样：

```ts
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
}
```

改字段时注意：

- `slug` 会影响详情页网址 `/product/xxx`，已有页面不要随便改。
- `categoryId` 只能用现有分组：`work`、`skills-tools`、`personal-efficiency`。
- `image` 和 `galleryImages` 写的是 `/projects/xxx.png`，实际文件放在 `public/projects/`。
- 如果项目没有线上地址，可以不写 `liveUrl`。
- `sourceNote` 现在只是内部证据备注，前台不展示；不想维护时可以删掉这一行。
- 公开站文案只写能被仓库、README、截图或真实页面支持的事实，不写无法确认的客户、结果或指标。

### 2. 首页固定文案：`app/page.tsx`

首页上有一部分不是项目数据，而是直接写在页面组件里。

常见位置：

| 页面位置 | 搜索文案或组件 |
| --- | --- |
| 顶部移动端小导航 | `portfolio-mobile-header` |
| 首页主标题 | `Gin 的项目与分享。` |
| 首页主说明 | `hero-lede` |
| 首页补充说明 | `hero-note` |
| 首页按钮 | `查看项目`、`GitHub`、`联系` |
| 截图里选中的英文小标题 | `Selected projects` |
| 截图里选中的大标题 | `代表项目。` |
| 代表项目右侧说明 | `先用一屏展示能打开...` |
| 分享区标题和说明 | `writing-section` |
| 联系区标题和说明 | `contact-section` |

例如要把截图里的“代表项目。”改成“精选作品。”，就在 `app/page.tsx` 搜：

```tsx
<h2 id="featured-title">代表项目。</h2>
```

改成：

```tsx
<h2 id="featured-title">精选作品。</h2>
```

### 3. 详情页通用标签：`app/product/[slug]/page.tsx`

详情页模板里的固定标签在这里，例如：

| 页面位置 | 当前文案 |
| --- | --- |
| 返回分组 | `返回{categoryLabel}` |
| GitHub 按钮 | `仓库主页` |
| 线上页面按钮 | `打开页面` |
| 概览卡片标题 | `一句话` |
| 底部按钮 | `返回列表`、`仓库主页` |

这里是所有详情页共用模板。改这里会影响每一个 `/product/...` 页面。

### 4. 图片：`public/projects/`

项目图都放在：

```text
public/projects/
```

添加新图后，在 `app/site-data.ts` 里引用：

```ts
image: "/projects/new-image.png",
galleryImages: ["/projects/new-image.png", "/projects/new-image-2.png"],
```

建议图片文件名只用英文、数字和短横线，避免空格和中文名。

## 改完怎么验证

### 最小检查

```bash
cd /Users/kityhello/workplace/project/gin-projects-share
npm test
```

这个命令会先构建，再跑服务端渲染测试。

### 本地 8081 预览

当前 `http://127.0.0.1:8081/` 是构建后的本地预览，不是实时 dev server。改完源码后需要重新构建，并重启 8081 服务才会看到最新内容。

```bash
cd /Users/kityhello/workplace/project/gin-projects-share
npm run build
```

查看 8081 当前是谁在占用：

```bash
lsof -nP -iTCP:8081 -sTCP:LISTEN
```

只有确认它是这个项目的 `node /tmp/gin-worker-server.mjs` 时，才停止它：

```bash
kill <PID>
```

再启动本地预览：

```bash
PORT=8081 node /tmp/gin-worker-server.mjs
```

然后打开：

```text
http://127.0.0.1:8081/
```

## 常用编辑方式

### 方式 A：直接让 Codex 改

给 Codex 的指令尽量具体：

```text
把首页“代表项目。”改成“精选作品。”，只改文案，不改布局。
```

或：

```text
把小宇宙播客转文章详情页的 intro 改成“...”，只改 app/site-data.ts。
```

### 方式 B：自己用编辑器改

打开项目目录：

```bash
open /Users/kityhello/workplace/project/gin-projects-share
```

然后优先改：

```text
app/site-data.ts
app/page.tsx
app/product/[slug]/page.tsx
```

改完执行：

```bash
npm test
```
