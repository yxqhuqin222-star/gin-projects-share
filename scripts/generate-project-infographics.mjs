import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const outDir = join(root, "public/projects");
const backupDir = join(outDir, "original-detail-visuals");
const tempDir = join(root, "tmp/infographic-render");
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

mkdirSync(backupDir, { recursive: true });
mkdirSync(tempDir, { recursive: true });

const theme = {
  bg: "#050505",
  panel: "#101010",
  panel2: "#151515",
  text: "#f7f7f7",
  soft: "#b8b8b8",
  dim: "#777777",
  line: "rgba(255,255,255,.18)",
  blue: "#6aa9ff",
  green: "#a6ff5d",
  amber: "#f7c15d",
};

const visuals = [
  {
    file: "rizhuizong-2.png",
    mark: "RZ",
    eyebrow: "DATA SERVICE / 02",
    title: "数据服务链路",
    subtitle: "从 demo 数据和 target 目标进入 Summary 计算，再输出 Dashboard 与播报图。",
    accent: theme.blue,
    steps: ["demo 数据", "target 目标", "Summary", "Dashboard", "播报图", "导出"],
    notes: ["本地数据", "目标口径", "计算结果", "看板视图", "运营播报", "Workbook"],
    footer: "数据更新 · Summary · Dashboard · Broadcast Image",
  },
  {
    file: "rizhuizong-3.png",
    mark: "RZ",
    eyebrow: "OPERATING LOOP / 03",
    title: "日常运营闭环",
    subtitle: "上传、校验、筛选、计算、查询和复盘组成每天可重复执行的 workflow。",
    accent: theme.green,
    steps: ["上传", "校验", "筛选", "计算", "查询", "复盘"],
    notes: ["demo", "规则", "维度", "完成率", "自然语言", "留痕"],
    footer: "Daily Workflow · Filter · Query · Review",
  },
  {
    file: "xiaoyuzhou-to-article-qwen-2.png",
    mark: "XA",
    eyebrow: "DEPENDENCY MAP / 02",
    title: "Skill 依赖结构",
    subtitle: "README、SKILL、Agent 配置、输出规范和音频脚本共同构成播客转文章 pipeline。",
    accent: theme.green,
    steps: ["SKILL.md", "agents/openai.yaml", "output-format", "prepare_audio.sh", "podpull", "ffprobe"],
    notes: ["整理规则", "模型配置", "笔记格式", "下载校验", "音频抓取", "格式时长"],
    footer: "README.md · SKILL.md · scripts · references",
  },
  {
    file: "xiaoyuzhou-to-article-qwen-3.png",
    mark: "XA",
    eyebrow: "CONTENT PIPELINE / 03",
    title: "播客转文章流程",
    subtitle: "小宇宙链接进入音频下载、通义听悟转写、transcript 校验和结构化笔记生成。",
    accent: theme.blue,
    steps: ["episode URL", "下载音频", "上传转写", "导出 transcript", "检查分段", "生成笔记"],
    notes: ["输入", "原始音频", "通义听悟", "文稿", "开头/中段/结尾", "Markdown"],
    footer: "Episode · Audio · Transcript · Structured Notes",
  },
  {
    file: "dingtalk-broadcast-console-2.png",
    mark: "DB",
    eyebrow: "MESSAGE FLOW / 02",
    title: "播报消息链路",
    subtitle: "Console 先生成 preview，再经 message schema 进入 send API，最后推送到钉钉群。",
    accent: theme.blue,
    steps: ["Console", "preview", "message schema", "send API", "DingTalk Bot", "群播报"],
    notes: ["操作入口", "内容预览", "字段规范", "发送接口", "机器人", "送达"],
    footer: "Preview · Schema · API · Bot Message",
  },
  {
    file: "dingtalk-broadcast-console-3.png",
    mark: "DB",
    eyebrow: "SCHEDULE SYSTEM / 03",
    title: "定时播报系统",
    subtitle: "早间、中午、行业、倒计时和晚间播报按默认 trigger time 执行。",
    accent: theme.amber,
    steps: ["早间", "中午", "行业", "倒计时", "晚间", "日志"],
    notes: ["morning", "noon", "industry", "countdown", "evening", "trace"],
    footer: "Trigger Time · Scheduled Script · Broadcast Type",
  },
  {
    file: "pages_shouji-2.png",
    mark: "IN",
    eyebrow: "INBOX SYSTEM / 02",
    title: "信息收集模型",
    subtitle: "输入内容、图片和 tag 后进入 Local Storage，再以 timeline、搜索和卡片流管理。",
    accent: theme.green,
    steps: ["输入内容", "粘贴图片", "tag 识别", "Local Storage", "timeline", "搜索"],
    notes: ["text", "image", "label", "browser", "feed", "query"],
    footer: "Inbox · Tag · Timeline · Search",
  },
  {
    file: "pages_shouji-3.png",
    mark: "IN",
    eyebrow: "BACKUP LOOP / 03",
    title: "轻量备份闭环",
    subtitle: "编辑、删除、表格导出和 backup import/export 让碎片内容可迁移、可恢复。",
    accent: theme.blue,
    steps: ["编辑", "删除", "表格导出", "backup export", "backup import", "恢复"],
    notes: ["update", "remove", "table", "export", "import", "restore"],
    footer: "Edit · Export · Import · Restore",
  },
  {
    file: "feishu-chat-replay-2.png",
    mark: "FR",
    eyebrow: "VIEWER CONTROLS / 02",
    title: "聊天回放控制台",
    subtitle: "keyword search、高亮、日期筛选、sender filter 和图片预览共同构成 Viewer 交互。",
    accent: theme.blue,
    steps: ["导入记录", "keyword search", "高亮", "日期筛选", "sender filter", "图片预览"],
    notes: ["local data", "query", "match", "range", "people", "media"],
    footer: "Viewer · Search · Filter · Media Preview",
  },
  {
    file: "feishu-chat-replay-3.png",
    mark: "FR",
    eyebrow: "SEARCH WORKFLOW / 03",
    title: "检索与定位流程",
    subtitle: "搜索结果可上一条/下一条跳转，并结合日期跳转和只看图片模式快速定位上下文。",
    accent: theme.green,
    steps: ["输入关键词", "匹配结果", "上一条", "下一条", "日期跳转", "只看图片"],
    notes: ["query", "highlight", "prev", "next", "date", "media"],
    footer: "Query · Highlight · Navigate · Context",
  },
];

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function labelLines(value) {
  const text = String(value);
  if (text.includes(" ")) {
    const parts = text.split(" ");
    return [parts[0], parts.slice(1).join(" ")].filter(Boolean);
  }
  if (text.length > 7) {
    return [text.slice(0, 6), text.slice(6)];
  }
  return [text];
}

function labelText(value, x, y) {
  const lines = labelLines(value).slice(0, 2);
  return lines
    .map((line, index) => `<text x="${x}" y="${y + index * 18}" font-size="17" fill="${theme.text}" font-weight="700">${esc(line)}</text>`)
    .join("");
}

function stepCards(visual) {
  const x0 = 610;
  const y0 = 300;
  const gap = 148;
  const cardWidth = 124;
  return visual.steps
    .map((step, index) => {
      const x = x0 + index * gap;
      const note = visual.notes[index] ?? "";
      const connectorStart = x - gap + cardWidth + 12;
      const connectorEnd = x - 12;
      return `
        <g>
          ${index > 0 ? `<path d="M ${connectorStart} ${y0 + 50} L ${connectorEnd} ${y0 + 50}" stroke="${visual.accent}" stroke-width="3" opacity=".75" />` : ""}
          <rect x="${x}" y="${y0}" width="${cardWidth}" height="100" rx="16" fill="${theme.panel2}" stroke="rgba(255,255,255,.16)" />
          <circle cx="${x + 22}" cy="${y0 + 25}" r="10" fill="${visual.accent}" opacity=".9" />
          <text x="${x + 22}" y="${y0 + 29}" text-anchor="middle" font-size="12" fill="${theme.bg}" font-weight="800">${index + 1}</text>
          ${labelText(step, x + 18, y0 + 58)}
          <text x="${x + 18}" y="${y0 + 86}" font-size="13" fill="${theme.dim}">${esc(note)}</text>
        </g>`;
    })
    .join("");
}

function svg(visual) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#050505"/>
      <stop offset="58%" stop-color="#0b0b0b"/>
      <stop offset="100%" stop-color="#111111"/>
    </linearGradient>
    <radialGradient id="glow" cx="76%" cy="18%" r="64%">
      <stop offset="0%" stop-color="${visual.accent}" stop-opacity=".24"/>
      <stop offset="42%" stop-color="${visual.accent}" stop-opacity=".06"/>
      <stop offset="100%" stop-color="${visual.accent}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(255,255,255,.045)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1600" height="900" fill="url(#bg)"/>
  <rect width="1600" height="900" fill="url(#grid)"/>
  <rect width="1600" height="900" fill="url(#glow)"/>
  <rect x="54" y="54" width="1492" height="792" fill="rgba(255,255,255,.025)" stroke="rgba(255,255,255,.12)"/>
  <rect x="54" y="54" width="416" height="792" fill="rgba(255,255,255,.035)"/>
  <text x="114" y="144" font-size="24" fill="${theme.dim}" font-weight="700" letter-spacing="4">${esc(visual.eyebrow)}</text>
  <text x="114" y="334" font-size="94" fill="${theme.text}" font-weight="300">${esc(visual.mark)}</text>
  <text x="114" y="446" font-size="52" fill="${theme.text}" font-weight="300">${esc(visual.title)}</text>
  <text x="114" y="614" font-size="24" fill="${theme.soft}">${esc(visual.footer)}</text>
  <rect x="114" y="726" width="260" height="8" rx="4" fill="rgba(255,255,255,.16)"/>
  <rect x="114" y="726" width="168" height="8" rx="4" fill="${visual.accent}"/>
  <text x="590" y="148" font-size="26" fill="${theme.dim}" font-weight="700" letter-spacing="5">SYSTEM MAP</text>
  <text x="590" y="204" font-size="32" fill="${theme.text}" font-weight="700">${esc(visual.title)}</text>
  <foreignObject x="590" y="226" width="840" height="80">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font: 24px -apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif; color: ${theme.soft}; line-height: 1.45;">${esc(visual.subtitle)}</div>
  </foreignObject>
  <path d="M 590 474 C 740 564, 1030 564, 1420 474" stroke="rgba(255,255,255,.08)" stroke-width="54" fill="none"/>
  ${stepCards(visual)}
  <rect x="600" y="620" width="780" height="102" rx="20" fill="rgba(255,255,255,.035)" stroke="rgba(255,255,255,.12)"/>
  <text x="634" y="666" font-size="18" fill="${theme.dim}" font-weight="700">OUTPUT</text>
  <text x="634" y="700" font-size="28" fill="${theme.text}" font-weight="700">${esc(visual.footer)}</text>
  <path d="M 1340 660 L 1418 660" stroke="${visual.accent}" stroke-width="4"/>
  <circle cx="1432" cy="660" r="12" fill="${visual.accent}"/>
  <text x="1390" y="796" font-size="16" fill="${theme.dim}" text-anchor="end">Generated as technical infographic · 16:9</text>
</svg>`;
}

for (const visual of visuals) {
  const out = join(outDir, visual.file);
  const backup = join(backupDir, visual.file);
  if (existsSync(out) && !existsSync(backup)) {
    copyFileSync(out, backup);
  }

  const htmlPath = join(tempDir, `${visual.file}.html`);
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#050505;width:1600px;height:900px;overflow:hidden}</style></head><body>${svg(visual)}</body></html>`;
  writeFileSync(htmlPath, html);

  const result = spawnSync(chrome, [
    "--headless",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--window-size=1600,900",
    `--screenshot=${out}`,
    `file://${htmlPath}`,
  ], { stdio: "pipe" });

  if (result.status !== 0) {
    throw new Error(`Failed to render ${basename(out)}: ${result.stderr.toString()}`);
  }
  console.log(`rendered ${visual.file}`);
}
