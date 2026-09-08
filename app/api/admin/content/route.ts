import { adminCookieFromRequest, isAdminAuthenticated } from "../../../admin-auth";
import { getAdminSiteContent, saveSiteContent } from "../../../content-store";

const privateHeaders = {
  "cache-control": "no-store, private",
  vary: "Cookie",
};

async function requireAdmin(request: Request) {
  return isAdminAuthenticated(adminCookieFromRequest(request));
}

export async function GET(request: Request) {
  if (!(await requireAdmin(request))) {
    return Response.json({ error: "请先登录管理页面。" }, { status: 401, headers: privateHeaders });
  }
  try {
    const { content, version } = await getAdminSiteContent();
    return Response.json({ content, version }, { headers: privateHeaders });
  } catch (error) {
    console.error("Failed to read admin content", error);
    return Response.json(
      { error: "内容暂时无法读取，请稍后重试。" },
      { status: 503, headers: privateHeaders },
    );
  }
}

export async function PUT(request: Request) {
  if (!(await requireAdmin(request))) {
    return Response.json({ error: "请先登录管理页面。" }, { status: 401, headers: privateHeaders });
  }

  const payload = (await request.json().catch(() => null)) as {
    content?: unknown;
    expectedVersion?: unknown;
  } | null;
  try {
    const result = await saveSiteContent(payload?.content, payload?.expectedVersion);
    if (!result.ok) {
      const conflict = "conflict" in result && result.conflict;
      return Response.json(
        { error: conflict ? "内容已更新。" : "内容校验失败。", issues: result.issues },
        { status: conflict ? 409 : 400, headers: privateHeaders },
      );
    }
    return Response.json(
      { content: result.data, updatedAt: result.updatedAt, version: result.version },
      { headers: privateHeaders },
    );
  } catch (error) {
    console.error("Failed to save admin content", error);
    return Response.json(
      { error: "内容暂时无法保存，请稍后重试。" },
      { status: 503, headers: privateHeaders },
    );
  }
}
