# Gin - 项目与分享

这是 Gin 的个人网站，用来展示自己的项目、分享内容和联系方式。

线上地址：

https://gin-projects-share.aurora-bear-8002.chatgpt.site

## 网站内容

- 首页介绍：Gin / 李小明，以及个人项目和分享入口。
- 项目展示：从 GitHub 仓库中整理项目说明、项目链接和详情页。
- 项目详情：每个项目都有独立页面，包含项目说明、相关链接和项目图片。
- 分享区域：预留书籍、AI、效率与生活等内容分类。
- 联系方式：邮箱、微信、GitHub 和即刻。

## 设计方向

网站采用黑色背景、低饱和文字层级和大留白排版，整体参考 `caicai.me` 的个人站风格，并适配中文内容。

项目详情页中的图片遵循一个原则：只使用 GitHub 仓库 README、文件结构、代码入口、已有截图或用户提供内容中可以确认的信息。没有来源的内容不编造。

## 本地运行

需要 Node.js `>=22.13.0`。

```bash
npm install
npm run dev
```

启动后访问终端里显示的本地地址。

## 构建验证

```bash
npm run build
```

构建通过后，说明站点可以正常打包。

## 目录说明

```text
app/                 网站页面、样式和项目数据
public/projects/     项目详情页展示图片
.openai/hosting.json Sites 部署配置
work/                本地临时生成物，不提交
```

## 常用发布流程

推送到 GitHub：

```bash
git push
```

Sites 线上部署通过 Codex 的 Sites 发布流程完成。
