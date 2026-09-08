import { getD1 } from "../db";
import { validateSiteContent } from "./content-schema";
import { createDefaultSiteContent, type SiteContent } from "./site-data";

const CONTENT_ID = "primary";

export class ContentStoreUnavailableError extends Error {}

export type StoredSiteContent = {
  content: SiteContent;
  version: number;
};

type ContentRecord = { payload: string; version: number };

function parseStoredContent(record: ContentRecord): StoredSiteContent {
  const result = validateSiteContent(JSON.parse(record.payload));
  if (!result.ok) throw new ContentStoreUnavailableError("Stored site content is invalid.");
  return { content: result.data, version: record.version };
}

export async function getPublicSiteContent(): Promise<SiteContent> {
  try {
    const record = await (await getD1())
      .prepare("SELECT payload FROM site_content WHERE id = ? LIMIT 1")
      .bind(CONTENT_ID)
      .first<{ payload: string }>();
    if (!record?.payload) return createDefaultSiteContent();

    const result = validateSiteContent(JSON.parse(record.payload));
    if (result.ok) return result.data;
    console.error("Ignoring invalid D1 site content", result.issues);
  } catch (error) {
    console.error("Using checked-in site content because D1 is unavailable", error);
  }
  return createDefaultSiteContent();
}

export async function getAdminSiteContent(): Promise<StoredSiteContent> {
  try {
    const record = await (await getD1())
      .prepare("SELECT payload, version FROM site_content WHERE id = ? LIMIT 1")
      .bind(CONTENT_ID)
      .first<ContentRecord>();
    if (!record?.payload) return { content: createDefaultSiteContent(), version: 0 };
    return parseStoredContent(record);
  } catch (error) {
    if (error instanceof ContentStoreUnavailableError) throw error;
    throw new ContentStoreUnavailableError("Content storage is unavailable.");
  }
}

export async function saveSiteContent(content: unknown, expectedVersion: unknown) {
  const result = validateSiteContent(content);
  if (!result.ok) return result;
  if (!Number.isInteger(expectedVersion) || (expectedVersion as number) < 0) {
    return { ok: false as const, issues: ["内容版本无效，请刷新后重试。"] };
  }

  const updatedAt = new Date().toISOString();
  const database = await getD1();
  const payload = JSON.stringify(result.data);
  const write = expectedVersion === 0
    ? await database
      .prepare("INSERT INTO site_content (id, payload, updated_at, version) VALUES (?, ?, ?, 1) ON CONFLICT(id) DO NOTHING")
      .bind(CONTENT_ID, payload, updatedAt)
      .run()
    : await database
      .prepare("UPDATE site_content SET payload = ?, updated_at = ?, version = version + 1 WHERE id = ? AND version = ?")
      .bind(payload, updatedAt, CONTENT_ID, expectedVersion)
      .run();

  if (write.meta.changes !== 1) {
    return { ok: false as const, conflict: true as const, issues: ["内容已被其他会话更新，请刷新后再保存。"] };
  }
  return { ok: true as const, data: result.data, updatedAt, version: (expectedVersion as number) + 1 };
}
