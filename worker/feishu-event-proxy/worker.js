const targetEventUrl =
  "https://gin-projects-share.aurora-bear-8002.chatgpt.site/api/consult/feishu-events";

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}

function bytesFromBase64(value) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function sha256Bytes(value) {
  return new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
  );
}

async function decryptFeishuPayload(encryptKey, encryptedValue) {
  const keyBytes = await sha256Bytes(encryptKey);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-CBC" },
    false,
    ["decrypt"],
  );
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv: keyBytes.slice(0, 16) },
    cryptoKey,
    bytesFromBase64(encryptedValue),
  );

  return JSON.parse(new TextDecoder().decode(decrypted));
}

export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return json({ error: "method not allowed" }, 405);
    }

    const body = await request.text();
    let payload;

    try {
      payload = JSON.parse(body);
    } catch {
      return json({ error: "invalid JSON" }, 400);
    }

    if (payload?.encrypt) {
      if (!env.FEISHU_ENCRYPT_KEY) {
        return json({ error: "FEISHU_ENCRYPT_KEY is required" }, 503);
      }

      try {
        payload = await decryptFeishuPayload(env.FEISHU_ENCRYPT_KEY, payload.encrypt);
      } catch {
        return json({ error: "failed to decrypt Feishu payload" }, 400);
      }
    }

    if (payload?.challenge) {
      return json({ challenge: payload.challenge });
    }

    const response = await fetch(targetEventUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    });
    const text = await response.text();
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return new Response(text, {
        status: response.status,
        headers: {
          "content-type": "application/json; charset=utf-8",
        },
      });
    }

    return json(
      {
        accepted: false,
        error: "target returned non-JSON response",
        status: response.status,
      },
      502,
    );
  },
};
