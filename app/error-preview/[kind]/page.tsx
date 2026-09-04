import { notFound } from "next/navigation";
import type { ErrorKind } from "../../error-config";
import { ErrorPage } from "../../error-page";
import { RuntimeCrash } from "./runtime-crash";

type ErrorTestPageProps = {
  params: {
    kind: string;
  };
};

const previewKinds = new Set(["403", "500", "502", "503", "network", "api"]);

export default function ErrorTestPage({ params }: ErrorTestPageProps) {
  if (process.env.NEXT_PUBLIC_ENABLE_ERROR_TESTS !== "1") {
    notFound();
  }

  if (params.kind === "runtime") {
    return <RuntimeCrash />;
  }

  if (params.kind === "throw") {
    throw new Error("Server error boundary verification");
  }

  if (!previewKinds.has(params.kind)) {
    notFound();
  }

  return (
    <ErrorPage
      kind={params.kind as ErrorKind}
      primaryAction={{
        label: "重新尝试",
        href: `/error-preview/${params.kind}`,
        variant: "primary",
      }}
    />
  );
}
