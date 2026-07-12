import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
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
  assert.doesNotMatch(html, /人工智能|代码仓库/);
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
