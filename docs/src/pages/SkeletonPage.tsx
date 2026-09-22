import * as React from "react";
import {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonImage,
  SkeletonCard,
  SkeletonList,
  SkeletonTable,
  SkeletonChart,
  SkeletonSwap,
  useDelayedLoading,
  Button,
  Avatar,
  Pill,
  Text,
  PillGroup,
  PillOption,
  WidgetCard,
  KpiCard,
} from "@jm/ui";
import { PageHeader, Section } from "../components/Doc";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function SwapDemo() {
  const [loading, setLoading] = React.useState(false);
  const [speed, setSpeed] = React.useState<string | null>("slow");
  const run = async () => {
    setLoading(true);
    await wait(speed === "fast" ? 120 : speed === "borderline" ? 260 : 2200);
    setLoading(false);
  };
  const showing = useDelayedLoading(loading);
  return (
    <div className="grid w-full max-w-md gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <PillGroup value={speed} onValueChange={setSpeed} size="sm" aria-label="How long the request takes">
          <PillOption value="fast">Quick reply (120ms)</PillOption>
          <PillOption value="borderline">Just over the line (260ms)</PillOption>
          <PillOption value="slow">Slow reply (2.2s)</PillOption>
        </PillGroup>
        <Button size="sm" onClick={run} disabled={loading}>Load</Button>
      </div>
      <SkeletonSwap loading={loading} label="Loading the invoice" skeleton={<SkeletonCard media lines={2} footer />}>
        <article className="grid gap-4 rounded-card border border-border bg-surface p-4">
          <div className="h-32 rounded-card bg-[linear-gradient(120deg,#0d6efd22,#db277722)]" />
          <div className="flex items-center gap-3">
            <Avatar name="Northwind Traders" size="md" decorative />
            <div className="grid leading-tight">
              <span className="text-sm font-medium">Northwind Traders</span>
              <span className="text-xs text-fg-muted">INV-1047 · due in 14 days</span>
            </div>
          </div>
          <p className="text-sm text-fg-muted">Design retainer for September, including two rounds of revisions and the handover call.</p>
          <div className="flex gap-2">
            <Button size="sm">Send</Button>
            <Button size="sm" variant="secondary">Preview</Button>
          </div>
        </article>
      </SkeletonSwap>
      <Text size="xs" tone="muted">
        {loading && !showing ? "Loading… (no skeleton yet — it may finish first)" : showing ? "Skeleton showing" : "Content"}
      </Text>
    </div>
  );
}

export function SkeletonPage() {
  const [anim, setAnim] = React.useState<string | null>("shimmer");
  const a = (anim ?? "shimmer") as "shimmer";
  return (
    <>
      <PageHeader
        title="Skeleton"
        intro="Placeholder shapes that stand in for content while it loads, so the page keeps its shape instead of jumping. A soft shimmer travels across them, rippling down a stack of rows. Ready-made pieces and whole blocks — cards, lists, tables, charts — plus a swap that only shows a skeleton when loading actually takes a moment."
        importLine={`import { Skeleton, SkeletonText, SkeletonCard, SkeletonList, SkeletonTable, SkeletonSwap } from "@jm/ui";`}
      />

      <Section
        title="Only when it's worth it"
        desc="The two things that make skeletons feel cheap: flashing one for a request that finishes in a blink, and swapping it away half-drawn. SkeletonSwap waits ~180ms before showing one, keeps it up for at least half a second once shown, and cross-fades to the content. Try all three speeds — the quick one never shows a skeleton at all."
        code={`
<SkeletonSwap loading={isLoading} skeleton={<SkeletonCard media footer />} label="Loading the invoice">
  <Invoice … />
</SkeletonSwap>

// Or just the timing, for your own markup
const show = useDelayedLoading(isLoading, { delay: 180, minDuration: 500 });`}
      >
        <SwapDemo />
      </Section>

      <Section
        title="Whole blocks"
        desc="Presets for the shapes you build most. Each ripples: rows start their shimmer slightly after the one above, so a list looks alive rather than flickering all at once."
        code={`
<SkeletonCard media header lines={3} footer />
<SkeletonList rows={5} />              // avatar + two lines + a value
<SkeletonTable rows={5} columns={4} />
<SkeletonChart variant="bars" />       // or "line"`}
      >
        <div className="grid w-full gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <PillGroup value={anim} onValueChange={setAnim} size="sm" aria-label="Animation">
              <PillOption value="shimmer">Shimmer</PillOption>
              <PillOption value="pulse">Pulse</PillOption>
              <PillOption value="none">None</PillOption>
            </PillGroup>
            <Text size="xs" tone="muted">animation="{a}"</Text>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <SkeletonCard media footer animation={a} />
            <SkeletonList rows={4} animation={a} />
            <SkeletonTable rows={4} columns={4} animation={a} />
            <WidgetCard title="Revenue" description="Loading…">
              <SkeletonChart animation={a} />
            </WidgetCard>
          </div>
        </div>
      </Section>

      <Section
        title="Pieces"
        desc="Build your own shapes: text lines (the last one shorter), avatars in the Avatar sizes, buttons, pictures that keep their ratio, and plain rectangles, pills or lines."
        code={`
<SkeletonText lines={3} lastLineWidth="45%" />
<SkeletonAvatar size="lg" />
<SkeletonButton size="sm" width={120} />
<SkeletonImage ratio="4/3" />
<Skeleton width={140} height={28} radius="999px" />     // anything else
<Skeleton shape="line" delay={120} />                   // start its shimmer later`}
      >
        <div className="grid w-full max-w-lg gap-5">
          <div className="flex items-center gap-4">
            {(["xs", "sm", "md", "lg", "xl"] as const).map((s) => <SkeletonAvatar key={s} size={s} animation={a} />)}
            <SkeletonAvatar size="lg" shape="square" animation={a} />
          </div>
          <SkeletonText lines={3} animation={a} />
          <div className="flex flex-wrap items-center gap-3">
            <SkeletonButton size="sm" animation={a} />
            <SkeletonButton animation={a} />
            <Skeleton shape="pill" width={90} height={26} animation={a} />
            <Skeleton shape="pill" width={64} height={26} animation={a} />
          </div>
          <SkeletonImage ratio="21/9" animation={a} />
        </div>
      </Section>

      <Section
        title="Matching what loads"
        desc="A skeleton should sit where the real thing will, at the same size — that's what stops the page from jumping. Here the same row is shown loading and loaded, so you can see they line up."
        code={`
{loading
  ? <SkeletonList rows={3} />
  : invoices.map((i) => <InvoiceRow key={i.id} invoice={i} />)}

// Dashboards: WidgetCard has loading built in, or use a skeleton chart
<WidgetCard title="Revenue" loading={isLoading}>…</WidgetCard>`}
      >
        <div className="grid w-full gap-4 lg:grid-cols-2">
          <div className="grid gap-2">
            <Text size="xs" tone="muted">Loading</Text>
            <SkeletonList rows={3} animation={a} />
          </div>
          <div className="grid gap-2">
            <Text size="xs" tone="muted">Loaded</Text>
            <ul className="grid divide-y divide-border rounded-card border border-border bg-surface">
              {[["Northwind Traders", "INV-1047 · due in 14 days", "₱48,200"], ["Blue Harbor Café", "INV-1046 · paid", "₱12,750"], ["Luzon Freight", "INV-1045 · overdue", "₱96,000"]].map(([n, d, amt]) => (
                <li key={n} className="flex items-center gap-3 px-4 py-3">
                  <Avatar name={n} size="sm" decorative />
                  <div className="grid min-w-0 flex-1 leading-tight">
                    <span className="truncate text-sm font-medium">{n}</span>
                    <span className="truncate text-xs text-fg-muted">{d}</span>
                  </div>
                  <span className="text-sm tabular-nums">{amt}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-2">
            <Text size="xs" tone="muted">KPI card, loading</Text>
            <KpiCard label="Revenue this month" value="" loading />
          </div>
          <div className="grid gap-2">
            <Text size="xs" tone="muted">KPI card, loaded</Text>
            <KpiCard label="Revenue this month" value={318400} formatValue={(v) => `₱${v.toLocaleString()}`} change={8.2} changeLabel="vs August" sparkline={[5, 7, 6, 9, 8, 11, 12]} />
          </div>
        </div>
      </Section>

      <Section
        title="Details"
        desc="Skeletons are decorative, so screen readers skip the shapes; SkeletonSwap announces “Loading invoices…” instead. With reduced motion the shimmer becomes a slow, gentle fade."
        code={`
<Skeleton animation="shimmer" | "pulse" | "none" />
<SkeletonSwap loading={…} skeleton={…} label="Loading invoices" delay={180} minDuration={500} fade={250} />`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Pill size="sm">Decorative — hidden from screen readers</Pill>
          <Pill size="sm">Reduced motion — a slow fade</Pill>
          <Pill size="sm">Ripples down stacks of rows</Pill>
        </div>
      </Section>
    </>
  );
}
