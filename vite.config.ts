import vinext from "vinext";
import { defineConfig } from "vite";
import { sites } from "./build/sites-vite-plugin";

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";
const consultationEnvNames = [
  "CONSULTATION_RELAY_MODE",
  "CONSULTATION_LARK_BRIDGE_URL",
  "FEISHU_LARK_CLI_CHAT_ID",
  "FEISHU_BROADCAST_CHAT_ID",
  "FEISHU_POLL_CHAT_ID",
  "FEISHU_APP_ID",
  "FEISHU_APP_SECRET",
  "FEISHU_RECEIVE_ID",
  "FEISHU_RECEIVE_ID_TYPE",
  "FEISHU_EVENT_VERIFY_TOKEN",
  "ADMIN_PASSWORD",
  "ADMIN_SESSION_SECRET",
];

function getConsultationVars() {
  return Object.fromEntries(
    consultationEnvNames.flatMap((name) => {
      const value = process.env[name];
      return value ? [[name, value]] : [];
    }),
  );
}

const localBindingConfig = {
  main: "./worker/index.ts",
  compatibility_date: "2026-07-15",
  vars: getConsultationVars(),
  // The project's wrangler.jsonc owns the real DB binding. Do not add the
  // generic Site Creator placeholder here: the generated deploy config would
  // otherwise contain two bindings with the same name.
};

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: {
      host: "127.0.0.1",
      port: Number(process.env.PORT ?? 3000),
      ...(isCodexSeatbeltSandbox
        ? { watch: { useFsEvents: false, usePolling: true } }
        : {}),
    },
    plugins: [
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        config: localBindingConfig,
      }),
    ],
  };
});
