import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

declare global {
  var consultationTestD1: D1Database | undefined;
}

export async function getD1() {
  try {
    const { env } = (await import("cloudflare:workers")) as {
      env: { DB?: D1Database };
    };

    if (env.DB) {
      return env.DB;
    }
  } catch {
    if (globalThis.consultationTestD1) {
      return globalThis.consultationTestD1;
    }
  }

  throw new Error(
    "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB`.",
  );
}

export async function getDb() {
  return drizzle(await getD1(), { schema });
}
