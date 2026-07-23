# 咨询入口与飞书转接

## 当前第一版

网站新增一个悬浮咨询入口。访客打开后可以发送消息，并通过 `/api/consult` 转接到后端适配层；站内只显示真实发送结果。

系统只在消息真实发送到飞书后返回成功：

- 访客发送消息。
- 后端调用飞书转接通道。
- 飞书确认接收后，站内显示访客已经发送的消息。
- 没有配置飞书凭证或飞书发送失败时，站内显示真实错误并保留输入内容。

## 本地验证

```bash
npm run build
npm test
npm run dev
```

打开本地地址后，点击右下角“咨询”，发送一条消息。未配置转接通道时，成功标志是页面显示“咨询服务暂未配置，请稍后再试”，且不会出现模拟回复。

也可以直接验证接口：

```bash
curl -s -X POST http://localhost:3000/api/consult \
  -H 'content-type: application/json' \
  -d '{"message":"想咨询一个自动化项目"}'
```

## 沿用小明机器人私聊

本地可以先沿用 `/Users/kityhello/workplace/geren/xiaoming` 里的“小明”飞书机器人。这个模式依赖本机已登录的 `lark-cli`，适合验证“网站咨询消息发到我的飞书私聊”。

```bash
CONSULTATION_RELAY_MODE=lark-cli
CONSULTATION_LARK_BRIDGE_URL=http://127.0.0.1:8788/send
FEISHU_LARK_CLI_CHAT_ID=飞书私聊会话 ID
```

如果不单独配置 `FEISHU_LARK_CLI_CHAT_ID`，适配层会依次尝试复用旧项目常见变量：

```bash
FEISHU_BROADCAST_CHAT_ID
FEISHU_POLL_CHAT_ID
```

成功标志是：网站发出的咨询消息会通过 `lark-cli im +messages-send --as bot` 进入你和“小明”的飞书私聊。

由于当前网站本地运行在 Cloudflare worker 模拟环境里，API 路由不能直接启动本机进程。需要先启动本地 bridge：

```bash
CONSULTATION_LARK_BRIDGE_PORT=8788 node scripts/lark-cli-bridge.mjs
```

bridge 只监听 `127.0.0.1`，用于本地验证，不用于线上部署。

如果要本地验证“飞书回复回网站”，bridge 还可以轮询小明私聊中带 `#session:<sessionId>` 的新用户消息，并写回当前网站会话：

```bash
CONSULTATION_LARK_BRIDGE_PORT=8788 \
CONSULTATION_LARK_BRIDGE_POLL=true \
CONSULTATION_SITE_CALLBACK_URL=http://127.0.0.1:3001/api/consult/feishu-events \
FEISHU_EVENT_VERIFY_TOKEN=本地回调校验值 \
FEISHU_LARK_CLI_CHAT_ID=飞书私聊会话 ID \
node scripts/lark-cli-bridge.mjs
```

bridge 启动时会先把当前私聊里的历史消息标记为已读，只处理启动后新出现的回复。你在飞书里回复时需要保留会话标记，例如：

```text
#session:chat_xxx 这是我的回复
```

## 飞书 Open API 接入变量

线上长期运行更适合使用飞书 Open API。真实飞书发送只在 `CONSULTATION_RELAY_MODE=feishu` 且以下变量齐备时启用：

```bash
CONSULTATION_RELAY_MODE=feishu
FEISHU_APP_ID=cli_xxx
FEISHU_APP_SECRET=xxx
FEISHU_RECEIVE_ID=oc_xxx
FEISHU_RECEIVE_ID_TYPE=chat_id
FEISHU_EVENT_VERIFY_TOKEN=xxx
```

这些值不能写进仓库。线上部署时应通过部署平台的环境变量配置。

## 飞书侧配置

第一版使用飞书服务端 API 向指定会话发送文本消息。消息里会带上会话标记：

```text
#session:<sessionId>
```

线上网站通过飞书 Open API 轮询目标会话最近的文本消息，不需要修改“小明”现有的长连接订阅方式。回复时仍需保留：

```text
#session:<sessionId>
```

网站最多每 4 秒同步一次最近 50 条消息，只写入用户发送、带有效会话标记且不超过 800 字的文本。飞书 `message_id` 用于 D1 去重；如果同一条回复同时经过事件回调和轮询，两个入口也必须使用同一个 `message_id`。

`/api/consult/feishu-events` 保留为经过 `FEISHU_EVENT_VERIFY_TOKEN` 校验的兼容回调入口，但当前生产链路不依赖它。

## 数据保存

咨询会话和消息保存在 Cloudflare D1 的 `DB` 绑定中。数据库结构位于 `db/schema.ts`，部署迁移位于 `drizzle/`。因此网站发送和飞书回调即使落在不同 Worker 实例，也会读取同一份消息记录。

## 边界

当前入口允许任何访客咨询。飞书回复必须保留会话标记，纯文本之外的消息类型暂不写回网站。
