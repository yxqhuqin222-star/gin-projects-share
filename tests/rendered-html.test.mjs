import assert from "node:assert/strict";
import test from "node:test";

process.env.NODE_ENV = "test";

function createConsultationDb() {
  const messages = [];
  const sessions = new Set();
  const syncState = new Map();

  return {
    seedSession(sessionId) {
      sessions.add(sessionId);
    },
    prepare(sql) {
      let values = [];

      return {
        bind(...boundValues) {
          values = boundValues;
          return this;
        },
        async run() {
          if (sql.includes("INSERT INTO consultation_sessions")) {
            sessions.add(values[0]);
            return { meta: { changes: 1 } };
          }

          if (sql.includes("INSERT INTO consultation_sync_state")) {
            const [source, syncedAt, threshold] = values;
            const previous = syncState.get(source);

            if (previous && previous > threshold) {
              return { meta: { changes: 0 } };
            }

            syncState.set(source, syncedAt);
            return { meta: { changes: 1 } };
          }

          if (sql.includes("INSERT OR IGNORE INTO consultation_messages")) {
            const [id, sessionId, role, text, status, externalEventId, createdAt] =
              values;
            const duplicate =
              externalEventId &&
              messages.some((message) => message.externalEventId === externalEventId);

            if (!duplicate) {
              messages.push({
                id,
                sessionId,
                role,
                text,
                status,
                externalEventId,
                createdAt,
              });
            }

            return { meta: { changes: duplicate ? 0 : 1 } };
          }

          throw new Error(`Unexpected SQL in test D1: ${sql}`);
        },
        async first() {
          if (!sql.includes("FROM consultation_sessions")) {
            throw new Error(`Unexpected SQL in test D1: ${sql}`);
          }

          return sessions.has(values[0]) ? { id: values[0] } : null;
        },
        async all() {
          if (!sql.includes("FROM consultation_messages")) {
            throw new Error(`Unexpected SQL in test D1: ${sql}`);
          }

          return {
            results: messages
              .filter((message) => message.sessionId === values[0])
              .map((message) => ({
                id: message.id,
                role: message.role,
                text: message.text,
                status: message.status,
                createdAt: message.createdAt,
              })),
          };
        },
      };
    },
  };
}

function workerEnvironment(overrides = {}) {
  return {
    ASSETS: {
      fetch: async () => new Response("Not found", { status: 404 }),
    },
    ...overrides,
  };
}

async function render(path = "/") {
  globalThis.consultationTestD1 = createConsultationDb();
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    workerEnvironment(),
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Gin homepage", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Gin - 项目与分享/);
  assert.match(html, /My Work\./);
  assert.match(html, /projects/);
  assert.match(html, /首页先展示项目主图、类型标签和标题/);
  assert.match(html, /暂无可核验公开截图/);
  assert.match(html, /工作 - 工具/);
  assert.match(html, /skills及工具 - Skill/);
  assert.match(html, /个人提效 - 静态应用/);
  assert.match(html, /工作/);
  assert.match(html, /skills及工具/);
  assert.match(html, /个人提效/);
  assert.match(html, /分享/);
  assert.match(html, /联系/);
  assert.match(html, /DialKit Tuner/);
  assert.match(html, /xhs-photo-downloader/);
  assert.match(html, /xiaoming-feishu-bot/);
  assert.match(html, /href="\/product\/rizhuizong"/);
  assert.match(html, /id="project-renxiao"/);
  assert.match(html, /id="project-gin-words"/);
  assert.match(html, /href="\/product\/paltform"/);
  assert.match(html, /href="\/product\/dialkit-tuner"/);
  assert.match(html, /href="\/product\/xhs-photo-downloader"/);
  assert.match(html, /href="\/product\/xiaoming-feishu-bot"/);
  assert.match(html, /href="\/product\/opencodex-codex-desktop-model-catalog-json"/);
  assert.match(html, /href="\/product\/skill-description-translator"/);
  assert.match(html, /href="\/product\/xiaomao-custom-rules"/);
  assert.match(html, /邮箱/);
  assert.doesNotMatch(html, /GitHub README 和仓库元数据/);
  assert.doesNotMatch(html, /GitHub 仓库描述、文件结构和现有站内材料/);
  assert.doesNotMatch(html, /project-feishu-chat-replay/);
  assert.doesNotMatch(html, /product\/dsandqwen/);
  assert.doesNotMatch(html, /xhs-photo-downloader\/settings/);
  assert.doesNotMatch(html, /Stack \/ Type|Live site|Selected work|More projects/);
  assert.match(html, /咨询/);
  assert.doesNotMatch(html, /人工智能|代码仓库/);
});

test("consultation api rejects an unconfigured relay without fake success", async () => {
  const response = await render("/api/consult");
  assert.equal(response.status, 200);

  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-consult`);
  const { default: worker } = await import(workerUrl.href);

  const apiResponse = await worker.fetch(
    new Request("http://localhost/api/consult", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({ message: "想咨询一个自动化项目" }),
    }),
    workerEnvironment(),
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(apiResponse.status, 503);

  const payload = await apiResponse.json();
  assert.equal(payload.error, "咨询服务暂未配置，请稍后再试。");
  assert.doesNotMatch(JSON.stringify(payload), /正在转接|mock 飞书回复/);
});

test("Feishu schema 2.0 replies persist once and are returned to the website", async () => {
  process.env.FEISHU_EVENT_VERIFY_TOKEN = "test-verify-token";
  globalThis.consultationTestD1 = createConsultationDb();
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-feishu-callback`);
  const { default: worker } = await import(workerUrl.href);
  const environment = workerEnvironment();
  const sessionId = "chat_callback_test";
  const event = {
    schema: "2.0",
    header: {
      event_id: "evt_callback_test",
      event_type: "im.message.receive_v1",
      token: "test-verify-token",
    },
    event: {
      sender: { sender_type: "user" },
      message: {
        message_id: "om_callback_test",
        content: JSON.stringify({
          text: `#session:${sessionId} 这是来自飞书的回复`,
        }),
      },
    },
  };

  for (const duplicate of [false, true]) {
    const response = await worker.fetch(
      new Request("http://localhost/api/consult/feishu-events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(event),
      }),
      environment,
      { waitUntil() {}, passThroughOnException() {} },
    );

    assert.equal(response.status, 200);
    assert.equal((await response.json()).duplicate, duplicate);
  }

  const response = await worker.fetch(
    new Request(`http://localhost/api/consult?sessionId=${sessionId}`),
    environment,
    { waitUntil() {}, passThroughOnException() {} },
  );
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.messages.length, 1);
  assert.equal(payload.messages[0].role, "operator");
  assert.equal(payload.messages[0].text, "这是来自飞书的回复");
  delete process.env.FEISHU_EVENT_VERIFY_TOKEN;
});

test("consultation api polls Feishu replies as an event fallback", async () => {
  const environmentKeys = {
    CONSULTATION_RELAY_MODE: "feishu",
    FEISHU_APP_ID: "test-app",
    FEISHU_APP_SECRET: "test-secret",
    FEISHU_RECEIVE_ID: "test-chat",
    FEISHU_RECEIVE_ID_TYPE: "chat_id",
  };
  Object.assign(process.env, environmentKeys);

  const sessionId = "chat_polling_fallback_test";
  const database = createConsultationDb();
  database.seedSession(sessionId);
  globalThis.consultationTestD1 = database;
  const originalFetch = globalThis.fetch;
  let listRequestCount = 0;

  globalThis.fetch = async (input) => {
    const url = String(input);

    if (url.includes("tenant_access_token/internal")) {
      return Response.json({ code: 0, tenant_access_token: "test-token" });
    }

    if (url.includes("/open-apis/im/v1/messages?")) {
      listRequestCount += 1;
      return Response.json({
        code: 0,
        data: {
          items: [
            {
              message_id: "om_operator_reply",
              msg_type: "text",
              sender: { sender_type: "user" },
              body: {
                content: JSON.stringify({
                  text: `#session:${sessionId} 这是飞书中的真人回复`,
                }),
              },
            },
            {
              message_id: "om_bot_message",
              msg_type: "text",
              sender: { sender_type: "app" },
              body: {
                content: JSON.stringify({
                  text: `#session:${sessionId} 机器人消息不应回传`,
                }),
              },
            },
          ],
        },
      });
    }

    throw new Error(`Unexpected fetch in test: ${url}`);
  };

  try {
    const workerUrl = new URL("../dist/server/index.js", import.meta.url);
    workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-feishu-fallback`);
    const { default: worker } = await import(workerUrl.href);
    const request = () =>
      worker.fetch(
        new Request(`http://localhost/api/consult?sessionId=${sessionId}`),
        workerEnvironment(),
        { waitUntil() {}, passThroughOnException() {} },
      );

    const firstResponse = await request();
    const firstPayload = await firstResponse.json();
    assert.equal(firstResponse.status, 200);
    assert.equal(firstPayload.messages.length, 1);
    assert.equal(firstPayload.messages[0].role, "operator");
    assert.equal(firstPayload.messages[0].text, "这是飞书中的真人回复");

    const secondResponse = await request();
    assert.equal(secondResponse.status, 200);
    assert.equal(listRequestCount, 1);
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of Object.keys(environmentKeys)) {
      delete process.env[key];
    }
  }
});

test("Feishu callback and polling fallback share the message id dedupe key", async () => {
  const environmentKeys = {
    CONSULTATION_RELAY_MODE: "feishu",
    FEISHU_APP_ID: "test-app",
    FEISHU_APP_SECRET: "test-secret",
    FEISHU_RECEIVE_ID: "test-chat",
    FEISHU_RECEIVE_ID_TYPE: "chat_id",
    FEISHU_EVENT_VERIFY_TOKEN: "test-verify-token",
  };
  Object.assign(process.env, environmentKeys);

  const sessionId = "chat_shared_dedupe";
  globalThis.consultationTestD1 = createConsultationDb();
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (input) => {
    const url = String(input);

    if (url.includes("tenant_access_token/internal")) {
      return Response.json({ code: 0, tenant_access_token: "test-token" });
    }

    if (url.includes("/open-apis/im/v1/messages?")) {
      return Response.json({
        code: 0,
        data: {
          items: [
            {
              message_id: "om_shared_reply",
              msg_type: "text",
              sender: { sender_type: "user" },
              body: {
                content: JSON.stringify({
                  text: `#session:${sessionId} 你好`,
                }),
              },
            },
          ],
        },
      });
    }

    throw new Error(`Unexpected fetch in test: ${url}`);
  };

  try {
    const workerUrl = new URL("../dist/server/index.js", import.meta.url);
    workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-shared-dedupe`);
    const { default: worker } = await import(workerUrl.href);
    const environment = workerEnvironment();
    const callbackResponse = await worker.fetch(
      new Request("http://localhost/api/consult/feishu-events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          schema: "2.0",
          header: {
            event_id: "evt_shared_reply",
            event_type: "im.message.receive_v1",
            token: "test-verify-token",
          },
          event: {
            sender: { sender_type: "user" },
            message: {
              message_id: "om_shared_reply",
              content: JSON.stringify({
                text: `#session:${sessionId} 你好`,
              }),
            },
          },
        }),
      }),
      environment,
      { waitUntil() {}, passThroughOnException() {} },
    );

    assert.equal(callbackResponse.status, 200);
    assert.equal((await callbackResponse.json()).duplicate, false);

    const pollingResponse = await worker.fetch(
      new Request(`http://localhost/api/consult?sessionId=${sessionId}`),
      environment,
      { waitUntil() {}, passThroughOnException() {} },
    );
    const payload = await pollingResponse.json();

    assert.equal(pollingResponse.status, 200);
    assert.equal(payload.messages.length, 1);
    assert.equal(payload.messages[0].role, "operator");
    assert.equal(payload.messages[0].text, "你好");
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of Object.keys(environmentKeys)) {
      delete process.env[key];
    }
  }
});

test("server-renders project detail pages with professional labels", async () => {
  const response = await render("/product/renxiao");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Renxiao Dashboard/);
  assert.match(html, /一句话/);
  assert.match(html, /仓库主页/);
  assert.match(html, /打开页面/);
  assert.doesNotMatch(html, /来源/);
  assert.doesNotMatch(html, /GitHub README 和本地项目截图/);
  assert.doesNotMatch(html, /CASE STUDY|Overview|Stack \/ Type|Links|Back to Projects/);
  assert.doesNotMatch(html, /代码仓库|所属类别|相关链接/);
});

test("unknown routes render the branded 404 page", async () => {
  const response = await render("/randompagethatdoesntexist");
  assert.equal(response.status, 404);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /页面没有找到/);
  assert.match(html, /这个页面可能已经被移动、删除，或者地址输入有误。/);
  assert.match(html, /返回首页/);
  assert.match(html, /error-code/);
  assert.doesNotMatch(html, /nginx|Vercel 404|stack trace|Error:/i);
});

test("unknown project slugs use the same branded 404 page", async () => {
  const response = await render("/product/not-a-real-project");
  assert.equal(response.status, 404);

  const html = await response.text();
  assert.match(html, /页面没有找到/);
  assert.doesNotMatch(html, /项目不存在/);
});

test("error preview routes render shared error page variants when explicitly enabled", async () => {
  process.env.NEXT_PUBLIC_ENABLE_ERROR_TESTS = "1";

  try {
    for (const [path, title] of [
      ["/error-preview/403", "没有访问权限"],
      ["/error-preview/500", "页面出现了一些问题"],
      ["/error-preview/502", "连接服务失败"],
      ["/error-preview/503", "服务暂时不可用"],
      ["/error-preview/network", "网络连接不可用"],
    ]) {
      const response = await render(path);
      assert.equal(response.status, 200);

      const html = await response.text();
      assert.match(html, new RegExp(title));
      assert.match(html, /重新尝试|返回首页/);
      assert.match(html, /error-code/);
    }
  } finally {
    delete process.env.NEXT_PUBLIC_ENABLE_ERROR_TESTS;
  }
});

test("server-renders the reserved admin entry without a missing page", async () => {
  const response = await render("/admin");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /内容管理入口预留/);
  assert.match(html, /返回公开页面/);
});
