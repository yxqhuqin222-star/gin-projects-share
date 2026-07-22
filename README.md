# Gin - 项目与分享

这是 Gin 的个人网站，用来展示自己的项目、工具、网站服务、分享内容和联系方式。

线上地址：

https://gin-projects-share.aurora-bear-8002.chatgpt.site

## 网站内容

- 首页介绍：Gin，以及个人项目和分享入口。
- 项目展示：整理项目说明、项目链接和详情页。
- 项目详情：每个项目都有独立页面，包含项目说明、相关链接和项目图片。
- 分享区域：预留书籍、人工智能、效率与生活等内容分类。
- 联系方式：邮箱、微信、代码仓库和即刻。
- 咨询入口：右下角悬浮对话窗口，只在消息真实发送到“小明”或飞书 Open API 后显示成功；未配置时返回明确错误。

## 设计方向

网站采用黑色背景、低饱和文字层级和大留白排版，整体保持黑白基调，并适配中文内容。

项目详情页中的图片遵循一个原则：只使用项目仓库说明、文件结构、代码入口、已有截图或用户提供内容中可以确认的信息。没有来源的内容不编造。

## 本地运行

需要 Node.js `^22.13.0` 或 `>=24`。仓库已提供 `.nvmrc`，建议本地直接使用 Node 24。

```bash
npm install
npm run dev
```

开发服务启动后，打开终端里显示的本地地址即可预览。

## 常用命令

```bash
npm run dev
npm run build
npm run start
npm run lint
```

- `npm run dev`：启动本地开发服务。
- `npm run build`：生成生产构建，用来检查页面是否能正常打包。
- `npm run start`：启动生产预览服务。
- `npm run lint`：运行代码规范检查。

## 内容位置

- `docs/requirements.md`：项目需求文档和首版网站蓝图补充。
- `app/page.tsx`：首页结构。
- `app/consultation-widget.tsx`：咨询入口和站内对话界面。
- `app/api/consult/route.ts`：咨询消息接口。
- `app/feishu-adapter.ts`：mock/飞书消息转接适配层。
- `docs/consultation-feishu.md`：真实飞书接入变量和回调说明。
- `app/site-data.ts`：导航、项目和分享内容。
- `app/product/[slug]/page.tsx`：项目详情页。
- `app/globals.css`：全站样式。
- `public/projects/`：项目展示图片。
- `.openai/hosting.json`：Sites 部署配置。

## 更新项目内容

新增或修改项目时，主要编辑 `app/site-data.ts`：

- `title`：页面上展示的中文项目名。
- `summary`：首页卡片摘要。
- `intro`：详情页首屏介绍。
- `paragraphs`：详情页正文说明。
- `image`：项目展示图路径。
- `githubUrl`：代码仓库地址。
- `liveUrl`：线上访问地址，可选。

新增详情页不需要单独建页面，只要在 `projects` 数组里增加一项，并准备对应图片即可。
