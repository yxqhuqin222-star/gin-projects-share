import {
  clearAdminSessionCookie,
  createAdminSessionCookie,
  verifyAdminPassword,
} from "../../../admin-auth";
import {
  clearLoginFailures,
  loginRetryAfter,
  recordFailedLogin,
} from "../../../admin-login-store";

const privateHeaders = {
  "cache-control": "no-store, private",
  vary: "Cookie",
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof payload?.password === "string" ? payload.password : "";
  if (!password || password.length > 512) {
    return Response.json({ error: "请输入有效的管理密码。" }, { status: 400, headers: privateHeaders });
  }

  try {
    const retryAfter = await loginRetryAfter(request);
    if (retryAfter > 0) {
      return Response.json(
        { error: "尝试次数过多，请稍后再试。" },
        { status: 429, headers: { ...privateHeaders, "retry-after": String(retryAfter) } },
      );
    }
  } catch (error) {
    console.error("Failed to check admin login limit", error);
    return Response.json({ error: "管理登录暂时不可用。" }, { status: 503, headers: privateHeaders });
  }

  const result = await verifyAdminPassword(password);
  if (!result.configured) {
    return Response.json({ error: "管理登录尚未配置。" }, { status: 503, headers: privateHeaders });
  }
  if (!result.ok) {
    const retryAfter = await recordFailedLogin(request);
    if (retryAfter > 0) {
      return Response.json(
        { error: "尝试次数过多，请稍后再试。" },
        { status: 429, headers: { ...privateHeaders, "retry-after": String(retryAfter) } },
      );
    }
    return Response.json({ error: "密码不正确。" }, { status: 401, headers: privateHeaders });
  }

  await clearLoginFailures(request);

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "content-type": "application/json",
      ...privateHeaders,
      "set-cookie": await createAdminSessionCookie(),
    },
  });
}

export function DELETE() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "content-type": "application/json",
      ...privateHeaders,
      "set-cookie": clearAdminSessionCookie(),
    },
  });
}
