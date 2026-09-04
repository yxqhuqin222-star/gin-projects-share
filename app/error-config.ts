export type ErrorKind =
  | "401"
  | "403"
  | "404"
  | "500"
  | "502"
  | "503"
  | "network"
  | "timeout"
  | "api";

export type ErrorAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
};

export type ErrorPageConfig = {
  code: string;
  title: string;
  description: string;
  primaryAction: ErrorAction;
  secondaryAction?: ErrorAction;
};

export const errorConfig: Record<ErrorKind, ErrorPageConfig> = {
  "401": {
    code: "401",
    title: "需要登录",
    description: "请先完成登录或返回公开页面继续浏览。",
    primaryAction: { label: "返回首页", href: "/", variant: "primary" },
  },
  "403": {
    code: "403",
    title: "没有访问权限",
    description: "当前账号没有访问这个页面的权限。",
    primaryAction: { label: "返回首页", href: "/", variant: "primary" },
  },
  "404": {
    code: "404",
    title: "页面没有找到",
    description: "这个页面可能已经被移动、删除，或者地址输入有误。",
    primaryAction: { label: "返回首页", href: "/", variant: "primary" },
  },
  "500": {
    code: "500",
    title: "页面出现了一些问题",
    description: "请稍后再试，或者回到首页继续浏览公开项目。",
    primaryAction: { label: "重新尝试", variant: "primary" },
    secondaryAction: { label: "返回首页", href: "/", variant: "secondary" },
  },
  "502": {
    code: "502",
    title: "连接服务失败",
    description: "网站已打开，但核心服务暂时没有返回可用结果。",
    primaryAction: { label: "重新尝试", variant: "primary" },
    secondaryAction: { label: "返回首页", href: "/", variant: "secondary" },
  },
  "503": {
    code: "503",
    title: "服务暂时不可用",
    description: "核心服务正在恢复，请稍后再来。",
    primaryAction: { label: "重新尝试", variant: "primary" },
    secondaryAction: { label: "返回首页", href: "/", variant: "secondary" },
  },
  network: {
    code: "OFF",
    title: "网络连接不可用",
    description: "当前设备似乎已经断网，恢复连接后可以继续访问。",
    primaryAction: { label: "重新尝试", variant: "primary" },
    secondaryAction: { label: "返回首页", href: "/", variant: "secondary" },
  },
  timeout: {
    code: "408",
    title: "请求等待太久",
    description: "网络或服务响应超时，请稍后重试。",
    primaryAction: { label: "重新尝试", variant: "primary" },
    secondaryAction: { label: "返回首页", href: "/", variant: "secondary" },
  },
  api: {
    code: "API",
    title: "内容加载失败",
    description: "页面核心内容暂时没有加载成功，请重新尝试。",
    primaryAction: { label: "重新尝试", variant: "primary" },
    secondaryAction: { label: "返回首页", href: "/", variant: "secondary" },
  },
};

export function getErrorConfig(kind: ErrorKind = "500") {
  return errorConfig[kind] ?? errorConfig["500"];
}

export function classifyRequestFailure(error: unknown): ErrorKind {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return "network";
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return "timeout";
  }

  return "api";
}

export function classifyStatus(status: number): ErrorKind {
  if (status === 401) {
    return "401";
  }

  if (status === 403) {
    return "403";
  }

  if (status === 404) {
    return "404";
  }

  if (status === 502) {
    return "502";
  }

  if (status === 503) {
    return "503";
  }

  return status >= 500 ? "500" : "api";
}
