"use client";

import { useEffect } from "react";
import { ErrorPage } from "./error-page";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error(error);
    }
  }, [error]);

  return (
    <html lang="zh-CN">
      <body>
        <ErrorPage
          kind="500"
          primaryAction={{ label: "重新尝试", onClick: reset, variant: "primary" }}
        />
      </body>
    </html>
  );
}
