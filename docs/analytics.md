# 访问统计（Counterscale）

网站使用官方 `@counterscale/tracker@3.4.1`，统计服务由独立的 Counterscale Worker 和 Cloudflare Analytics Engine 提供。网站没有新增统计数据库、统计 API 或 Dashboard。

## 接入配置

- `siteId`：`gin-personal-site`
- 正式网站：`https://gin-projects-share.yxqhuqin222.workers.dev`
- Counterscale 地址：`https://counterscale.yxqhuqin222.workers.dev`
- Dashboard：[https://counterscale.yxqhuqin222.workers.dev](https://counterscale.yxqhuqin222.workers.dev)（已启用官方密码保护）
- **当前状态：Counterscale 与网站 tracker 已部署。Dashboard 已确认可登录并显示 `gin-personal-site` 的访问数据。**

`app/counterscale.tsx` 在页面挂载后动态加载官方 tracker，仅在生产构建且浏览器 origin 与正式网站一致时启用。本地开发、本地生产预览、其他域名和 `/admin` 均不统计。

Vinext 使用保存的原始 History 方法提交部分路由，可能绕过普通 `pushState` 监听。因此使用官方的 `autoTrackPageviews: false` 和 `trackPageview()` 接口，由 `usePathname()` 跟随已提交的页面路径，每次路径变化只上报一次。刷新、新进入页面及前进/后退会统计；同页锚点、查询参数变化和组件重复渲染不额外计数。tracker 不修改页面 DOM 或样式，也不创建浏览器 Cookie。

如正式网站域名或 Counterscale 地址改变，更新该组件中的对应常量并重新构建部署。保持 tracker 只在根布局挂载一次，不再同时加入 CDN 自动脚本。

## 安装与保护

按照 [Counterscale 官方 README](https://github.com/benvinegar/counterscale#installation)：

1. 在 Cloudflare 账户中启用 Analytics Engine。
2. 创建仅包含目标账户 `Account Analytics: Read` 权限的 API Token。Token 只供 Counterscale Worker 查询数据，不写进网站代码、Git 或浏览器。
3. 使用已登录的 Wrangler 和官方安装器：

   ```bash
   npx @counterscale/cli@latest install
   ```

4. 使用 `counterscale` Worker 名称，并在密码保护提示选择 **Yes**，设置独立后台密码。检查官方认证 Secrets `CF_AUTH_ENABLED`、`CF_PASSWORD_HASH`、`CF_JWT_SECRET` 已配置；匿名访问 Dashboard 必须进入登录页，统计读接口不能匿名返回数据。
5. 在网站发布前，确认匿名 `/tracker.js` 可读取，`/cache` 和 `/collect` 可被网站访问；不要把整台 Worker 加上会阻断采集的登录拦截。

官方 3.4.1 安装配置包含 Counterscale 管理的 R2 日归档；当前部署已启用。它不属于网站自建统计数据库。Analytics Engine 本身保留最近 90 天数据，见官方 README。

## 正式环境验收

1. 打开正式首页，在浏览器 Network 中筛选 `collect`。本项目采用 npm 模块方式，因此 tracker 是网站按需加载的 JS chunk，而非额外的 `/tracker.js` 标签。
2. 确认 `/cache?sid=gin-personal-site` 和 `/collect?...` 成功，采集参数 `sid=gin-personal-site`、`p=/`。
3. 点击两个项目详情，确认每次进入只新增一次 `/collect`，`p` 分别是对应 `/product/...`；返回首页应新增一次，锚点点击不新增。
4. 刷新一次页面，确认新增一次 Page View；Unique Visitors 和 Visits 由 Counterscale 自身规则计算，不应要求每次刷新都增加。
5. 使用后台密码登录 Dashboard，选择 `gin-personal-site` 和包含本次访问的时间范围，检查 Page Views、Unique Visitors、Visits、页面、来源、国家、设备和趋势。部署验收已确认 Dashboard 显示首页、`/product/paltform` 与验证页的访问记录。
6. 退出后台或用无痕窗口访问，确认统计后台受保护。
7. 本地 `npm run dev` 和本地生产预览不应向 Counterscale 发出请求。

tracker 被拦截或网络不可用时会损失对应统计，但网站浏览和原有交互应继续正常工作。正式环境已确认匿名 Dashboard 访问进入登录页，tracker 和采集请求正常，网站原有页面可加载。
