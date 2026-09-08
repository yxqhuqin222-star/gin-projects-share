import {
  type ContactLink,
  type ManagedProject,
  type OtherLink,
  type ProjectCategoryId,
  projectCategories,
  type Share,
  type SiteContent,
} from "./site-data";

export type ContentValidationResult =
  | { ok: true; data: SiteContent }
  | { ok: false; issues: string[] };

const ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,79}$/;
const PROJECT_SLUG_PATTERN = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;
const MAX_PROJECTS = 100;
const MAX_SHARES = 100;
const MAX_CONTACTS = 30;
const MAX_OTHER_LINKS = 100;
const categoryIds = new Set<string>(projectCategories.map((item) => item.id));

function text(
  value: unknown,
  label: string,
  issues: string[],
  { required = true, max = 800 }: { required?: boolean; max?: number } = {},
) {
  if (typeof value !== "string") {
    if (required) issues.push(`${label}不能为空。`);
    return "";
  }

  const clean = value.trim();
  if (required && !clean) issues.push(`${label}不能为空。`);
  if (clean.length > max) issues.push(`${label}不能超过${max}个字符。`);
  return clean;
}

function safeUrl(
  value: unknown,
  label: string,
  issues: string[],
  options: { required?: boolean; allowProjectAsset?: boolean; allowContact?: boolean } = {},
) {
  const clean = text(value, label, issues, { required: options.required ?? false, max: 2000 });
  if (!clean) return undefined;

  if (options.allowProjectAsset && clean.startsWith("/projects/")) return clean;

  try {
    const protocol = new URL(clean).protocol;
    if (protocol === "https:" || protocol === "http:") return clean;
  } catch {
    // The error below is deliberately the same for malformed and unsafe URLs.
  }

  if (options.allowContact && (clean.startsWith("mailto:") || clean.startsWith("tel:"))) {
    return clean;
  }

  issues.push(`${label}只能使用安全的链接地址。`);
  return undefined;
}

function array(value: unknown, label: string, issues: string[], max: number) {
  if (!Array.isArray(value)) {
    issues.push(`${label}格式不正确。`);
    return [];
  }
  if (value.length > max) issues.push(`${label}最多可包含${max}项。`);
  return value.slice(0, max);
}

function validateProject(value: unknown, index: number, issues: string[]): ManagedProject | null {
  if (!value || typeof value !== "object") {
    issues.push(`第${index + 1}个项目格式不正确。`);
    return null;
  }
  const input = value as Record<string, unknown>;
  const prefix = `项目 ${index + 1}`;
  const id = text(input.id, `${prefix} ID`, issues, { max: 80 });
  if (id && !ID_PATTERN.test(id)) issues.push(`${prefix} ID格式无效。`);
  const slug = text(input.slug, `${prefix} slug`, issues, { max: 80 }).toLowerCase();
  if (slug && !PROJECT_SLUG_PATTERN.test(slug)) {
    issues.push(`${prefix} slug只能使用小写字母、数字、短横线和下划线。`);
  }
  const categoryId = text(input.categoryId, `${prefix} 分类`, issues, { max: 40 });
  if (categoryId && !categoryIds.has(categoryId)) issues.push(`${prefix}分类无效。`);

  const galleryImages = array(input.galleryImages ?? [], `${prefix}图库`, issues, 12)
    .map((image, imageIndex) =>
      safeUrl(image, `${prefix}图库 ${imageIndex + 1}`, issues, { allowProjectAsset: true }),
    )
    .filter((image): image is string => Boolean(image));

  const paragraphs = array(input.paragraphs, `${prefix}正文段落`, issues, 20)
    .map((paragraph, paragraphIndex) =>
      text(paragraph, `${prefix}正文段落 ${paragraphIndex + 1}`, issues, { max: 2400 }),
    )
    .filter(Boolean);

  return {
    id,
    slug,
    title: text(input.title, `${prefix}标题`, issues, { max: 140 }),
    githubUrl: safeUrl(input.githubUrl, `${prefix}仓库链接`, issues, { required: true }) ?? "",
    liveUrl: safeUrl(input.liveUrl, `${prefix}线上链接`, issues),
    categoryId: categoryId as ProjectCategoryId,
    status: text(input.status, `${prefix}状态`, issues, { required: false, max: 80 }),
    monogram: text(input.monogram, `${prefix}标签`, issues, { max: 80 }),
    summary: text(input.summary, `${prefix}摘要`, issues, { max: 500 }),
    intro: text(input.intro, `${prefix}介绍`, issues, { max: 800 }),
    sourceNote: text(input.sourceNote, `${prefix}证据备注`, issues, { required: false, max: 800 }) || undefined,
    image: safeUrl(input.image, `${prefix}封面图`, issues, { allowProjectAsset: true }),
    galleryImages: galleryImages.length ? galleryImages : undefined,
    paragraphs,
    isPublished: input.isPublished !== false,
  };
}

function validateShare(value: unknown, index: number, issues: string[]): Share | null {
  if (!value || typeof value !== "object") {
    issues.push(`第${index + 1}条分享格式不正确。`);
    return null;
  }
  const input = value as Record<string, unknown>;
  const id = text(input.id, `分享 ${index + 1} ID`, issues, { max: 80 });
  if (id && !ID_PATTERN.test(id)) issues.push(`分享 ${index + 1} ID格式无效。`);
  return {
    id,
    title: text(input.title, `分享 ${index + 1}标题`, issues, { max: 140 }),
    group: text(input.group, `分享 ${index + 1}分组`, issues, { max: 80 }),
    summary: text(input.summary, `分享 ${index + 1}摘要`, issues, { max: 800 }),
  };
}

function validateContact(value: unknown, index: number, issues: string[]): ContactLink | null {
  if (!value || typeof value !== "object") {
    issues.push(`第${index + 1}条联系方式格式不正确。`);
    return null;
  }
  const input = value as Record<string, unknown>;
  const id = text(input.id, `联系方式 ${index + 1} ID`, issues, { max: 80 });
  if (id && !ID_PATTERN.test(id)) issues.push(`联系方式 ${index + 1} ID格式无效。`);
  return {
    id,
    label: text(input.label, `联系方式 ${index + 1}标签`, issues, { max: 80 }),
    value: text(input.value, `联系方式 ${index + 1}内容`, issues, { max: 300 }),
    href: safeUrl(input.href, `联系方式 ${index + 1}链接`, issues, { required: true, allowContact: true }) ?? "",
  };
}

function validateOtherLink(value: unknown, index: number, issues: string[]): OtherLink | null {
  if (!value || typeof value !== "object") {
    issues.push(`第${index + 1}条其他内容格式不正确。`);
    return null;
  }
  const input = value as Record<string, unknown>;
  const id = text(input.id, `其他内容 ${index + 1} ID`, issues, { max: 80 });
  if (id && !ID_PATTERN.test(id)) issues.push(`其他内容 ${index + 1} ID格式无效。`);
  return {
    id,
    title: text(input.title, `其他内容 ${index + 1}名称`, issues, { max: 140 }),
    summary: text(input.summary, `其他内容 ${index + 1}说明`, issues, { max: 500 }),
    href: safeUrl(input.href, `其他内容 ${index + 1}链接`, issues, { required: true }) ?? "",
  };
}

function duplicateIssues(values: string[], label: string, issues: string[]) {
  const seen = new Set<string>();
  for (const value of values) {
    if (!value || seen.has(value)) issues.push(`${label}不能重复。`);
    seen.add(value);
  }
}

export function validateSiteContent(value: unknown): ContentValidationResult {
  const issues: string[] = [];
  if (!value || typeof value !== "object") return { ok: false, issues: ["内容格式不正确。"] };
  const input = value as Record<string, unknown>;
  const projects = array(input.projects, "项目", issues, MAX_PROJECTS)
    .map((project, index) => validateProject(project, index, issues))
    .filter((project): project is ManagedProject => Boolean(project));
  const shares = array(input.shares, "分享", issues, MAX_SHARES)
    .map((share, index) => validateShare(share, index, issues))
    .filter((share): share is Share => Boolean(share));
  const contactLinks = array(input.contactLinks, "联系方式", issues, MAX_CONTACTS)
    .map((contact, index) => validateContact(contact, index, issues))
    .filter((contact): contact is ContactLink => Boolean(contact));
  const otherLinks = array(input.otherLinks ?? [], "其他内容", issues, MAX_OTHER_LINKS)
    .map((link, index) => validateOtherLink(link, index, issues))
    .filter((link): link is OtherLink => Boolean(link));

  duplicateIssues(projects.map((project) => project.slug), "项目 slug", issues);
  duplicateIssues(projects.map((project) => project.id), "项目 ID", issues);
  duplicateIssues(shares.map((share) => share.id), "分享 ID", issues);
  duplicateIssues(contactLinks.map((contact) => contact.id), "联系方式 ID", issues);
  duplicateIssues(otherLinks.map((link) => link.id), "其他内容 ID", issues);

  return issues.length ? { ok: false, issues } : { ok: true, data: { projects, shares, contactLinks, otherLinks } };
}
