import assert from "node:assert/strict";
import test from "node:test";

process.env.NODE_ENV = "test";

function createConsultationDb() {
  const messages = [];
  const sessions = new Set();

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
  assert.match(html, /Web App/);
  assert.match(html, /AI workflow/);
  assert.match(html, /GitHub/);
  assert.match(html, /href="\/product\/rizhuizong"/);
  assert.match(html, /src="\/projects\/rizhuizong-live-dashboard\.png"/);
  assert.match(html, /href="#project-feishu-chat-replay"/);
  assert.match(html, /id="project-feishu-chat-replay"/);
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

test("consultation api does not poll Feishu when reading website messages", async () => {
  const environmentKeys = {
    CONSULTATION_RELAY_MODE: "feishu",
    FEISHU_APP_ID: "test-app",
    FEISHU_APP_SECRET: "test-secret",
    FEISHU_RECEIVE_ID: "test-chat",
    FEISHU_RECEIVE_ID_TYPE: "chat_id",
  };
  Object.assign(process.env, environmentKeys);

  const sessionId = "chat_event_only_test";
  const database = createConsultationDb();
  database.seedSession(sessionId);
  globalThis.consultationTestD1 = database;
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (input) => {
    throw new Error(`GET /api/consult should not call fetch: ${String(input)}`);
  };

  try {
    const workerUrl = new URL("../dist/server/index.js", import.meta.url);
    workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-event-only`);
    const { default: worker } = await import(workerUrl.href);
    const response = await worker.fetch(
      new Request(`http://localhost/api/consult?sessionId=${sessionId}`),
      workerEnvironment(),
      { waitUntil() {}, passThroughOnException() {} },
    );
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(payload.messages, []);
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of Object.keys(environmentKeys)) {
      delete process.env[key];
    }
  }
});

test("server-renders project detail pages with professional labels", async () => {
  const response = await render("/product/rizhuizong");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /日追踪看板/);
  assert.match(html, /CASE STUDY/);
  assert.match(html, /Overview/);
  assert.match(html, /Back to Projects/);
  assert.match(html, /GitHub/);
  assert.doesNotMatch(html, /代码仓库|所属类别|相关链接/);
});
