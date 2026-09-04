"use client";

export function RuntimeCrash() {
  if (typeof window !== "undefined") {
    throw new Error("Runtime error boundary verification");
  }

  return null;
}
