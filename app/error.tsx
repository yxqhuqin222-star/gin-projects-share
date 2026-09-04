"use client";

import { useEffect } from "react";
import { ErrorPage } from "./error-page";

export default function AppError({
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
    <ErrorPage
      kind="500"
      primaryAction={{ label: "重新尝试", onClick: reset, variant: "primary" }}
    />
  );
}
