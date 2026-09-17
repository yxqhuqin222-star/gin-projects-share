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
        <Link className="error-brand" href="/">Gin</Link>
        <nav className="error-site-links" aria-label="站内导航">
          <Link href="/#selected">项目</Link>
          <Link href="/#writing">记录</Link>
          <Link href="/#contact">联系</Link>
        </nav>
        <Link className="error-nav-button" href="/">返回首页 ↗</Link>
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
            GIN ROUTE / {code ?? defaults.code}
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
          <p className="error-hint">从项目、记录或联系入口，继续浏览 Gin。</p>
        </div>

        <div className="error-archive" aria-hidden="true" style={codeStyle}>
          <div className="error-archive-index">
            <span>route interrupted</span>
            <span>gin index</span>
          </div>
          <svg className="error-trace" viewBox="0 0 520 360" role="presentation">
            <path className="trace-dark" d="M42 290 C106 288 96 122 190 118 S312 208 384 174 S446 92 500 116" />
            <path className="trace-soft" d="M18 84 C100 72 150 202 242 220 S356 156 436 258" />
            <path className="trace-soft" d="M90 320 C126 276 174 254 240 268 S344 322 424 304" />
          </svg>
          <span className="error-node node-one" />
          <span className="error-node node-two" />
          <span className="error-node node-three" />
          <div className="error-vellum">
            <span>find the next route</span>
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
