"use client";

import type { ErrorAction, ErrorKind } from "./error-config";
import { getErrorConfig } from "./error-config";

type ErrorStateProps = {
  kind?: ErrorKind;
  title?: string;
  description?: string;
  action?: ErrorAction;
};

export function ErrorState({
  kind = "api",
  title,
  description,
  action,
}: ErrorStateProps) {
  const config = getErrorConfig(kind);
  const resolvedAction = action ?? config.primaryAction;

  return (
    <div className="error-state" role="status" aria-live="polite">
      <span>{config.code}</span>
      <strong>{title ?? config.title}</strong>
      <p>{description ?? config.description}</p>
      {resolvedAction.onClick ? (
        <button type="button" onClick={resolvedAction.onClick}>
          {resolvedAction.label}
        </button>
      ) : null}
    </div>
  );
}
