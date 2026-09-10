import assert from "node:assert/strict";
import test from "node:test";

process.env.NODE_ENV = "test";

function createConsultationDb() {
  const messages = [];
  const sessions = new Set();
  const syncState = new Map();
  let siteContent = null;
  const loginAttempts = new Map();

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
          if (sql.includes("INSERT INTO site_content")) {
            if (siteContent) return { meta: { changes: 0 } };
            siteContent = { payload: values[1], version: 1 };
            return { meta: { changes: 1 } };
          }

          if (sql.includes("UPDATE site_content")) {
            if (!siteContent || siteContent.version !== values[3]) return { meta: { changes: 0 } };
            siteContent = { payload: values[0], version: siteContent.version + 1 };
            return { meta: { changes: 1 } };
          }

          if (sql.includes("INSERT INTO admin_login_attempts")) {
            loginAttempts.set(values[0], {
              failedCount: values[1],
              windowStartedAt: values[2],
              blockedUntil: values[3],
            });
            return { meta: { changes: 1 } };
          }

          if (sql.includes("DELETE FROM admin_login_attempts")) {
            loginAttempts.delete(values[0]);
            return { meta: { changes: 1 } };
          }

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
          if (sql.includes("FROM site_content")) {
            return siteContent;
          }

          if (sql.includes("FROM admin_login_attempts")) {
            return loginAttempts.get(values[0]) ?? null;
          }

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
  assert.match(html, /从工作中的具体问题出发/);
  assert.match(html, /把自己的笔记素材保存到 Mac/);
  assert.match(html, /兴趣与记录/);
  assert.match(html, /复制微信号/);
  assert.match(html, /拨打电话/);
  assert.doesNotMatch(html, /4 notes|href="\/#other"/);
  assert.match(html, /流程示意/);
  assert.match(html, /工作 - 工具/);
  assert.match(html, /skills及工具 - Skill/);
  assert.match(html, /个人提效 - 静态应用/);
  assert.match(html, /工作/);
  assert.match(html, /skills及工具/);
  assert.match(html, /个人提效/);
  assert.match(html, /分享/);
  assert.match(html, /联系/);
  assert.match(html, /DialKit 界面调参/);
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
  assert.match(html, /href="\/admin"/);
  assert.match(html, /管理内容/);
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
  assert.match(html, /人效与成本看板/);
  assert.match(html, /计算成本与转化/);
  assert.match(html, /查看代码与使用指南/);
  assert.match(html, /打开页面/);
  assert.doesNotMatch(html, /来源/);
  assert.doesNotMatch(html, /GitHub README 和本地项目截图/);
  assert.doesNotMatch(html, /CASE STUDY|Overview|Stack \/ Type|Links|Back to Projects/);
  assert.doesNotMatch(html, /代码仓库|所属类别|相关链接/);
});

test("XHS sample shows a concise workflow without repeating the legacy copy", async () => {
  const response = await render("/product/xhs-photo-downloader");
  assert.equal(response.status, 200);
  const html = await response.text();
  // Restrict assertions to rendered UI; RSC payloads may retain legacy data.
  const main = html.match(/<main\b[\s\S]*?<\/main>/)?.[0] ?? "";
  assert.match(main, /小红书 Live Photo 备份整理/);
  assert.match(main, /登录自己的账号[\s\S]*导出笔记链接[\s\S]*下载原始素材[\s\S]*另行整理文件/);
  assert.equal((main.match(/把自己的笔记素材保存到 Mac/g) ?? []).length, 1);
  assert.match(main, /照片与动态文件配对命名/);
  assert.match(main, /整理需单独执行/);
  assert.match(main, /查看代码与使用指南/);
  assert.doesNotMatch(main, /一句话|README 明确|不抓取|href="\/#other"/);
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

test("admin content management protects, validates, saves, and publishes D1 content", async () => {
  process.env.ADMIN_PASSWORD = "test-admin-password";
  process.env.ADMIN_SESSION_SECRET = "test-admin-session-secret-that-is-long-enough";
  const database = createConsultationDb();
  globalThis.consultationTestD1 = database;
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-admin`);
  const { default: worker } = await import(workerUrl.href);
  const environment = workerEnvironment();
  const context = { waitUntil() {}, passThroughOnException() {} };

  try {
    const request = (path, options = {}) => worker.fetch(
      new Request(`http://localhost${path}`, options),
      environment,
      context,
    );

    assert.equal((await request("/api/admin/content")).status, 401);

    const rejectedLogin = await request("/api/admin/auth", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: "wrong-password" }),
    });
    assert.equal(rejectedLogin.status, 401);

    const login = await request("/api/admin/auth", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: process.env.ADMIN_PASSWORD }),
    });
    assert.equal(login.status, 200);
    const cookie = login.headers.get("set-cookie").split(";")[0];
    assert.match(login.headers.get("set-cookie"), /HttpOnly; Secure; SameSite=Strict/);
    assert.match(login.headers.get("set-cookie"), /Max-Age=43200/);

    const initialResponse = await request("/api/admin/content", { headers: { cookie } });
    assert.equal(initialResponse.status, 200);
    const initial = await initialResponse.json();
    assert.equal(initial.version, 0);
    const content = structuredClone(initial.content);
    const xhs = content.projects.find((project) => project.slug === "xhs-photo-downloader");
    const legacyParagraphs = [...xhs.paragraphs];
    xhs.workflow.note = "本地编辑后的使用说明";
    content.projects[0].galleryCaptions = ["工具广场界面"];
    content.projects[0].title = "D1 管理页测试项目";
    content.projects[1].isPublished = false;
    content.otherLinks.push({
      id: "other-test-link",
      title: "其他入口测试",
      summary: "不使用图片的轻量入口。",
      href: "https://example.com/other-test",
    });

    const unsafeContent = structuredClone(content);
    unsafeContent.projects[0].githubUrl = "javascript:alert(1)";
    const invalidSave = await request("/api/admin/content", {
      method: "PUT",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({ content: unsafeContent, expectedVersion: initial.version }),
    });
    assert.equal(invalidSave.status, 400);

    for (const patch of [
      { steps: ["一", "二", "三", "四", "五"] },
      { steps: [] },
      { features: ["一", "二", "三", "四"] },
    ]) {
      const invalidContent = structuredClone(content);
      const sample = invalidContent.projects.find((project) => project.slug === xhs.slug);
      Object.assign(sample.workflow, patch);
      const rejected = await request("/api/admin/content", {
        method: "PUT", headers: { "content-type": "application/json", cookie },
        body: JSON.stringify({ content: invalidContent, expectedVersion: initial.version }),
      });
      assert.equal(rejected.status, 400);
    }

    const save = await request("/api/admin/content", {
      method: "PUT",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({ content, expectedVersion: initial.version }),
    });
    assert.equal(save.status, 200, JSON.stringify(await save.clone().json()));
    const saved = await save.clone().json();
    assert.equal(saved.version, 1);
    const readBack = await (await request("/api/admin/content", { headers: { cookie } })).json();
    const savedSample = readBack.content.projects.find((project) => project.slug === xhs.slug);
    assert.deepEqual(savedSample.workflow, xhs.workflow);
    assert.deepEqual(savedSample.paragraphs, legacyParagraphs);
    assert.deepEqual(readBack.content.projects[0].workflow, content.projects[0].workflow);
    assert.deepEqual(readBack.content.projects[0].galleryCaptions, ["工具广场界面"]);
    const samplePage = await request(`/product/${xhs.slug}`);
    const sampleHtml = await samplePage.text();
    assert.match(sampleHtml, /本地编辑后的使用说明/);
    assert.doesNotMatch(sampleHtml.match(/<main\b[\s\S]*?<\/main>/)?.[0] ?? "", /README 明确/);

    const staleSave = await request("/api/admin/content", {
      method: "PUT",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({ content, expectedVersion: initial.version }),
    });
    assert.equal(staleSave.status, 409);
    assert.match(staleSave.headers.get("cache-control"), /no-store/);

    const homepage = await request("/");
    const homepageHtml = await homepage.text();
    assert.match(homepageHtml, /D1 管理页测试项目/);
    assert.doesNotMatch(homepageHtml, /钉钉播报控制台/);
    assert.match(homepageHtml, /其他入口测试/);
    assert.match(homepageHtml, /不使用图片的轻量入口/);

    const detail = await request("/product/paltform");
    assert.equal(detail.status, 200);
    assert.match(await detail.text(), /D1 管理页测试项目/);
    assert.equal((await request("/product/dingtalk-broadcast-console")).status, 404);

    const logout = await request("/api/admin/auth", { method: "DELETE", headers: { cookie } });
    assert.equal(logout.status, 200);
    assert.match(logout.headers.get("set-cookie"), /Max-Age=0/);

    for (const attempt of [1, 2, 3, 4, 5]) {
      const response = await request("/api/admin/auth", {
        method: "POST",
        headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.8" },
        body: JSON.stringify({ password: "wrong-password" }),
      });
      assert.equal(response.status, attempt === 5 ? 429 : 401);
    }
    const blocked = await request("/api/admin/auth", {
      method: "POST",
      headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.8" },
      body: JSON.stringify({ password: process.env.ADMIN_PASSWORD }),
    });
    assert.equal(blocked.status, 429);
    assert.match(blocked.headers.get("cache-control"), /no-store/);
  } finally {
    delete process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_SESSION_SECRET;
  }
});

test("server-renders the admin login without a missing page", async () => {
  const response = await render("/admin");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /管理站点内容/);
  assert.match(html, /管理密码/);
});
