"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import type { ErrorAction, ErrorKind } from "./error-config";
import { getErrorConfig } from "./error-config";

type ErrorPageProps = {
  kind?: ErrorKind;
  code?: string;
  title?: string;
  description?: string;
  primaryAction?: ErrorAction;
  secondaryAction?: ErrorAction;
};

function ActionLink({ action }: { action: ErrorAction }) {
  const className = `button ${action.variant ?? "secondary"}`;

  if (action.href) {
    return (
      <Link className={className} href={action.href}>
        {action.label}
      </Link>
    );
  }

  return (
    <button className={className} type="button" onClick={action.onClick}>
      {action.label}
    </button>
  );
}

export function ErrorShell({ children }: { children: ReactNode }) {
  return (
    <main className="error-page-shell">
      <header className="error-topbar" aria-label="错误页导航">
        <Link className="error-nav-button" href="/">
          ‹‹ 返回首页
        </Link>
        <Link className="error-nav-button" href="/#selected">
          项目档案 »
        </Link>
      </header>
      {children}
    </main>
  );
}

export function ErrorPage({
  kind = "500",
  code,
  title,
  description,
  primaryAction,
  secondaryAction,
}: ErrorPageProps) {
  const defaults = getErrorConfig(kind);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const resolvedPrimaryAction = useMemo(
    () => ({
      ...defaults.primaryAction,
      ...primaryAction,
      onClick: primaryAction?.onClick ?? defaults.primaryAction.onClick ?? (() => window.location.reload()),
    }),
    [defaults.primaryAction, primaryAction],
  );
  const resolvedSecondaryAction = secondaryAction ?? defaults.secondaryAction;

  function handleMouseMove(event: MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 18;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 14;

    setOffset({ x, y });
  }

  const codeStyle = {
    "--error-code-x": `${offset.x}px`,
    "--error-code-y": `${offset.y}px`,
  } as CSSProperties;

  return (
    <ErrorShell>
      <section
        className="error-stage"
        aria-labelledby="error-title"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      >
        <div className="error-copy">
          <p className="error-sheet-label">
            SHEET {code ?? defaults.code} · GIN ARCHIVE · UNFILED ROUTE
          </p>
          <h1
            className="error-code"
            style={codeStyle}
            aria-label={`错误 ${code ?? defaults.code}`}
          >
            {code ?? defaults.code}
          </h1>
          <h2 id="error-title">{title ?? defaults.title}</h2>
          <p>{description ?? defaults.description}</p>
          <div className="error-actions">
            <ActionLink action={resolvedPrimaryAction} />
            {resolvedSecondaryAction ? <ActionLink action={resolvedSecondaryAction} /> : null}
          </div>
          <p className="error-hint">› 这张页面没有归档，先沿着公开项目索引返回。</p>
        </div>

        <div className="error-archive" aria-hidden="true" style={codeStyle}>
          <div className="error-archive-index">
            <span>after the public work index</span>
            <span>gin archive</span>
          </div>
          <svg className="error-trace" viewBox="0 0 520 360" role="presentation">
            <path className="trace-dark" d="M62 326 C92 260 116 208 148 160 C186 104 236 74 310 76" />
            <path className="trace-dark" d="M155 162 C128 130 94 122 70 144 C44 169 48 214 82 232 C116 250 154 228 166 190" />
            <path className="trace-dark" d="M86 154 C105 176 125 201 144 224" />
            <path className="trace-dark" d="M100 194 C127 182 153 183 178 199" />
            <path className="trace-dark" d="M224 108 C210 76 218 48 242 36 C268 23 296 37 306 66 C316 96 294 122 264 124" />
            <path className="trace-dark" d="M244 48 C260 70 278 92 300 114" />
            <path className="trace-dark" d="M252 88 C272 76 292 73 312 78" />
            <path className="trace-dark" d="M306 78 C342 80 374 95 402 124 C432 156 462 170 492 166" />
            <path className="trace-dark" d="M198 288 C224 236 260 207 306 204 C344 202 368 226 360 256 C352 288 312 302 278 282" />
            <path className="trace-dark" d="M282 218 C306 236 330 254 356 270" />
            <path className="trace-soft" d="M174 324 C210 278 240 248 280 234 C328 218 376 238 438 286" />
            <path className="trace-soft" d="M312 184 L366 134 L496 184" />
            <path className="trace-soft" d="M262 176 C294 196 326 200 360 188" />
            <path className="trace-soft" d="M338 104 C354 96 371 96 388 106" />
          </svg>
          <span className="error-node node-one" />
          <span className="error-node node-two" />
          <span className="error-node node-three" />
          <div className="error-vellum">
            <span>vellum · loose</span>
            <strong>{code ?? defaults.code}</strong>
          </div>
        </div>
      </section>
      <footer className="error-footer">
        gin-projects-share · project archive · {code ?? defaults.code}
      </footer>
    </ErrorShell>
  );
}
