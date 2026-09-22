import * as React from "react";
import { Button } from "@jm/ui";

export function Code({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <div className="relative min-w-0 rounded-[0.5rem] border border-border bg-surface">
      <div className="absolute right-1.5 top-1.5">
        <Button size="sm" variant="ghost" onClick={copy} leadingIcon={copied ? "bi bi-check2" : "bi bi-copy"}>
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 pr-24 text-[0.8125rem] leading-[1.6] text-fg">
        <code className="font-mono">{code.trim()}</code>
      </pre>
    </div>
  );
}

export function Section({ title, desc, code, children }: { title: string; desc: React.ReactNode; code: string; children: React.ReactNode }) {
  return (
    <section className="grid grid-cols-[minmax(0,1fr)] gap-4 border-t border-border py-9 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-10">
      <div>
        <h2 className="text-[1.0625rem] font-semibold tracking-[-0.01em]">{title}</h2>
        <div className="mt-1.5 max-w-[34ch] text-sm leading-relaxed text-fg-muted">{desc}</div>
      </div>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-3 [&>*]:min-w-0 [&>*]:max-w-full">{children}</div>
        <Code code={code} />
      </div>
    </section>
  );
}

export function PageHeader({ title, intro, importLine }: { title: string; intro: string; importLine?: string }) {
  return (
    <header className="pb-9">
      <h1 className="text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.03em] md:text-[3.25rem]">{title}</h1>
      <p className="mt-4 max-w-[58ch] text-[1.0625rem] leading-relaxed text-fg-muted">{intro}</p>
      {importLine && (
        <div className="mt-6 max-w-md">
          <Code code={importLine} />
        </div>
      )}
    </header>
  );
}

/** A prose block for guide pages. */
export function Prose({ children }: { children: React.ReactNode }) {
  return <div className="max-w-[62ch] text-[0.9375rem] leading-relaxed text-fg [&_p]:mt-3 [&_code]:font-mono [&_code]:text-[0.8125rem]">{children}</div>;
}
