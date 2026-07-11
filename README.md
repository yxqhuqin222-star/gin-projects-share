# Gin 项目与分享

这是 Gin 的个人网站，用来集中展示自己的项目、工具、网站服务，以及关于书籍、人工智能、效率和生活的分享。

网站目前包含：

- 首页项目列表
- 项目详情页
- 分享入口
- 联系方式
- 黑白基调的响应式页面样式

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

- `app/page.tsx`：首页结构。
- `app/site-data.ts`：导航、项目和分享内容。
- `app/product/[slug]/page.tsx`：项目详情页。
- `app/globals.css`：全站样式。
- `public/projects/`：项目展示图片。

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
