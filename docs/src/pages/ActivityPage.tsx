import * as React from "react";
import {
  ActivityIndicator,
  ProgressBar,
  ProgressRing,
  Skeleton,
  ActivitySteps,
  LoadingOverlay,
  Button,
  Pill,
  type ActivityStep,
} from "@jm/ui";
import { PageHeader, Section } from "../components/Doc";

const Row = ({ children }: { children: React.ReactNode }) => <div className="flex flex-wrap items-center gap-6">{children}</div>;
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-control-lg border border-border bg-surface p-4 ${className}`}>{children}</div>;
}

/* ---------- demos ---------- */

function UploadDemo() {
  const [files, setFiles] = React.useState<number | null>(null);
  const [pct, setPct] = React.useState(0);
  const start = () => {
    setFiles(0);
    setPct(0);
    let p = 0;
    const t = setInterval(() => {
      p = Math.min(100, p + 3 + Math.random() * 7);
      setPct(p);
      setFiles(Math.min(5, Math.floor(p / 20)));
      if (p >= 100) {
        clearInterval(t);
        setTimeout(() => setFiles(null), 1200);
      }
    }, 180);
  };
  const running = files !== null;
  return (
    <div className="grid w-full max-w-md gap-5">
      <ProgressBar
        label="Uploading photos"
        value={running ? pct : 0}
        showValue={() => `${files ?? 0} of 5 files`}
        valueText={`${files ?? 0} of 5 files uploaded`}
        striped={running && pct < 100}
        tone={pct >= 100 ? "success" : "primary"}
      />
      <div className="flex items-center gap-4">
        <ProgressRing value={running ? pct : 0} size="lg" label="Upload progress" tone={pct >= 100 ? "success" : "primary"} />
        <Button onClick={start} disabled={running && pct < 100} size="sm" variant="secondary" leadingIcon="bi bi-cloud-arrow-up">
          {running && pct < 100 ? "Uploading…" : "Start upload"}
        </Button>
      </div>
    </div>
  );
}

function SkeletonDemo() {
  const [loaded, setLoaded] = React.useState(false);
  React.useEffect(() => {
    if (loaded) return;
    const t = setTimeout(() => setLoaded(true), 2200);
    return () => clearTimeout(t);
  }, [loaded]);
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Card>
        {loaded ? (
          <div className="grid gap-3">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary">MS</span>
              <div>
                <p className="text-sm font-medium">Maria Santos</p>
                <p className="text-xs text-fg-muted">Product designer · 2h ago</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-fg-muted">
              The new invoice layout is ready for review. I moved the totals to the top and added the payment link.
            </p>
            <div className="grid h-28 place-items-center rounded-control bg-secondary-hover text-xs text-fg-muted">invoice-v2.png</div>
          </div>
        ) : (
          <div className="grid gap-3" aria-busy="true" aria-label="Loading post">
            <div className="flex items-center gap-3">
              <Skeleton shape="circle" className="size-10" />
              <div className="grid flex-1 gap-2">
                <Skeleton className="h-3 w-32 rounded-full" />
                <Skeleton className="h-2.5 w-24 rounded-full" />
              </div>
            </div>
            <Skeleton shape="text" lines={2} />
            <Skeleton className="h-28 w-full" />
          </div>
        )}
      </Card>
      <div>
        <Button size="sm" variant="ghost" onClick={() => setLoaded(false)} disabled={!loaded}>Load again</Button>
      </div>
    </div>
  );
}

const deploySteps = ["Install dependencies", "Build", "Run tests", "Deploy to production"];
function StepsDemo() {
  const [stage, setStage] = React.useState(-1); // -1 not started, 0..3 active, 4 done
  const [fail, setFail] = React.useState(false);
  const [running, setRunning] = React.useState(false);
  const run = async (shouldFail: boolean) => {
    setFail(false);
    setRunning(true);
    for (let i = 0; i < deploySteps.length; i++) {
      setStage(i);
      await wait(1100);
      if (shouldFail && i === 2) {
        setFail(true);
        setRunning(false);
        return;
      }
    }
    setStage(deploySteps.length);
    setRunning(false);
  };
  const steps: ActivityStep[] = deploySteps.map((label, i) => {
    let status: ActivityStep["status"] = i < stage ? "done" : i === stage ? "active" : "pending";
    if (fail && i === stage) status = "error";
    if (fail && i > stage) status = "skipped";
    return {
      label,
      status,
      meta: status === "done" ? `${(i + 1) * 7}s` : undefined,
      description:
        status === "error" ? "2 tests failed in InvoiceTotalsTest. Fix them and deploy again." : status === "active" ? "Running…" : undefined,
    };
  });
  return (
    <div className="grid w-full max-w-md gap-4">
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">Deployment #218</p>
          {stage === deploySteps.length ? (
            <Pill tone="success" size="sm" dot>Live</Pill>
          ) : fail ? (
            <Pill tone="danger" size="sm" dot>Failed</Pill>
          ) : running ? (
            <Pill tone="primary" size="sm" dot="pulse">Deploying</Pill>
          ) : (
            <Pill size="sm">Ready</Pill>
          )}
        </div>
        <ActivitySteps steps={steps} />
      </Card>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => run(false)} disabled={running}>Deploy</Button>
        <Button size="sm" variant="secondary" onClick={() => run(true)} disabled={running}>Deploy with failing tests</Button>
      </div>
    </div>
  );
}

function OverlayDemo() {
  const [loading, setLoading] = React.useState(false);
  const [n, setN] = React.useState(0);
  const refresh = async () => {
    setLoading(true);
    await wait(1600);
    setN((x) => x + 1);
    setLoading(false);
  };
  const rows = [
    ["Northwind Traders", 48200 + n * 350],
    ["Blue Harbor Café", 12750 + n * 120],
    ["Luzon Freight", 96000 + n * 900],
  ] as const;
  return (
    <div className="grid w-full max-w-md gap-3">
      <LoadingOverlay loading={loading} label="Refreshing totals" className="rounded-control-lg">
        <Card className="p-0">
          <ul className="divide-y divide-border text-sm">
            {rows.map(([name, amount]) => (
              <li key={name} className="flex justify-between px-4 py-3">
                <span>{name}</span>
                <span className="tabular-nums">₱{amount.toLocaleString("en-PH")}.00</span>
              </li>
            ))}
          </ul>
        </Card>
      </LoadingOverlay>
      <div>
        <Button size="sm" variant="secondary" leadingIcon="bi bi-arrow-clockwise" onClick={refresh} disabled={loading}>Refresh</Button>
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export function ActivityPage() {
  return (
    <>
      <PageHeader
        title="Activity indicators"
        intro="Ways to show that something is happening — from a small spinner to a full multi-step job. Pick the one that says the most: a known percentage beats a spinner, and a skeleton beats a blank screen."
        importLine={`import {
  ActivityIndicator, ProgressBar, ProgressRing,
  Skeleton, ActivitySteps, LoadingOverlay,
} from "@jm/ui";`}
      />

      <Section
        title="Indicators"
        desc="Five styles, each suited to a different kind of waiting. All of them announce their label to screen readers."
        code={`
<ActivityIndicator />                      {/* spinner: general loading */}
<ActivityIndicator variant="dots" />       {/* a reply is coming */}
<ActivityIndicator variant="bars" />       {/* listening, processing */}
<ActivityIndicator variant="pulse" />      {/* live, connected, recording */}
<ActivityIndicator variant="orbit" />      {/* a longer task in progress */}`}
      >
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-5">
          {(
            [
              ["spinner", "Spinner"],
              ["dots", "Dots"],
              ["bars", "Bars"],
              ["pulse", "Pulse"],
              ["orbit", "Orbit"],
            ] as const
          ).map(([v, name]) => (
            <Card key={v} className="grid place-items-center gap-3 py-6">
              <ActivityIndicator variant={v} size="lg" label={name} />
              <span className="text-xs text-fg-muted">{name}</span>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        title="Sizes and colors"
        desc={'Five sizes from xs to xl. tone="current" takes the surrounding text color, which is handy inside buttons and links.'}
        code={`
<ActivityIndicator size="xs" />  … <ActivityIndicator size="xl" />
<ActivityIndicator tone="success" variant="pulse" />
<ActivityIndicator tone="current" />`}
      >
        <div className="grid gap-5">
          <Row>
            {(["xs", "sm", "md", "lg", "xl"] as const).map((s) => (
              <ActivityIndicator key={s} size={s} label={`Size ${s}`} />
            ))}
          </Row>
          <Row>
            {(["primary", "neutral", "success", "warning", "danger", "info"] as const).map((t) => (
              <ActivityIndicator key={t} tone={t} variant="orbit" label={t} />
            ))}
          </Row>
        </div>
      </Section>

      <Section
        title="In context"
        desc="A visible label makes the wait clear. Use it beside the indicator in lists and toolbars, or under it in empty panels."
        code={`
<ActivityIndicator variant="dots" size="sm" label="Ana is typing" showLabel />
<ActivityIndicator variant="pulse" size="sm" tone="danger" label="Live · 128 watching" showLabel />
<ActivityIndicator variant="bars" size="sm" label="Listening…" showLabel />
<ActivityIndicator size="lg" label="Loading invoices" showLabel labelPosition="stacked" />`}
      >
        <div className="grid w-full gap-3 sm:grid-cols-2">
          <Card className="grid gap-3">
            <ActivityIndicator variant="dots" size="sm" tone="neutral" label="Ana is typing" showLabel />
            <ActivityIndicator variant="pulse" size="sm" tone="danger" label="Live · 128 watching" showLabel />
            <ActivityIndicator variant="bars" size="sm" label="Listening…" showLabel />
            <ActivityIndicator variant="pulse" size="sm" tone="success" label="Connected to printer" showLabel />
          </Card>
          <Card className="grid place-items-center py-8">
            <ActivityIndicator size="lg" variant="orbit" label="Loading invoices" showLabel labelPosition="stacked" />
          </Card>
        </div>
      </Section>

      <Section
        title="Progress bar"
        desc="When you know how far along something is, show it. Pass value for real progress, or leave it out for an indeterminate bar. The label names it for screen readers too."
        code={`
<ProgressBar label="Uploading photos" value={pct}
  showValue={() => \`\${done} of 5 files\`} valueText={\`\${done} of 5 files uploaded\`}
  striped />
<ProgressRing value={pct} size="lg" label="Upload progress" />

<ProgressBar label="Preparing export" />        {/* indeterminate */}
<ProgressBar value={92} tone="warning" size="sm" label="Storage" showValue />`}
      >
        <div className="grid w-full gap-8">
          <UploadDemo />
          <div className="grid max-w-md gap-5">
            <ProgressBar label="Preparing export" />
            <ProgressBar value={92} tone="warning" size="sm" label="Storage" showValue />
            <ProgressBar value={40} size="lg" aria-label="Profile completeness" />
          </div>
        </div>
      </Section>

      <Section
        title="Progress ring"
        desc="A compact circular gauge with the value in the middle — good for dashboards and stat cards. Put your own content in the center if you like."
        code={`
<ProgressRing value={72} size="xl" label="Storage used">
  <span className="grid text-center">72%<small>of 20 GB</small></span>
</ProgressRing>
<ProgressRing value={3} max={4} size="lg" label="Onboarding" tone="success">3/4</ProgressRing>
<ProgressRing size="md" label="Syncing" />      {/* indeterminate */}`}
      >
        <Row>
          <ProgressRing value={72} size="xl" label="Storage used">
            <span className="grid text-center leading-tight">
              <span className="text-2xl font-semibold">72%</span>
              <span className="text-[0.6875rem] font-normal text-fg-muted">of 20 GB</span>
            </span>
          </ProgressRing>
          <ProgressRing value={3} max={4} size="lg" label="Onboarding" tone="success">3/4</ProgressRing>
          <ProgressRing value={45} size="md" label="Profile" />
          <ProgressRing value={80} size="sm" label="Quota" tone="danger" />
          <ProgressRing size="md" label="Syncing" />
        </Row>
      </Section>

      <Section
        title="Skeleton"
        desc="Placeholders in the shape of the content feel faster than a spinner, and the page doesn't jump when it arrives. Size them with classes."
        code={`
{loading ? (
  <div aria-busy="true" aria-label="Loading post">
    <Skeleton shape="circle" className="size-10" />
    <Skeleton className="h-3 w-32 rounded-full" />
    <Skeleton shape="text" lines={2} />
    <Skeleton className="h-28 w-full" />
  </div>
) : (
  <Post … />
)}`}
      >
        <SkeletonDemo />
      </Section>

      <Section
        title="Steps"
        desc="For jobs with several stages — deployments, imports, checkouts — show every step and where it's at: done, in progress, failed, skipped or not started. Try both buttons."
        code={`
<ActivitySteps steps={[
  { label: "Install dependencies", status: "done", meta: "7s" },
  { label: "Build", status: "done", meta: "14s" },
  { label: "Run tests", status: "error",
    description: "2 tests failed in InvoiceTotalsTest." },
  { label: "Deploy to production", status: "skipped" },
]} />

// Across the page
<ActivitySteps orientation="horizontal" steps={checkoutSteps} />`}
      >
        <div className="grid w-full gap-8">
          <StepsDemo />
          <Card className="w-full max-w-xl">
            <ActivitySteps
              orientation="horizontal"
              size="sm"
              steps={[
                { label: "Cart", status: "done" },
                { label: "Shipping", status: "done" },
                { label: "Payment", status: "active" },
                { label: "Review", status: "pending" },
              ]}
            />
          </Card>
        </div>
      </Section>

      <Section
        title="Loading overlay"
        desc="Covers a region while it refreshes: the old content stays in place but dimmed and unclickable. A short delay means quick refreshes don't flash."
        code={`
<LoadingOverlay loading={refreshing} label="Refreshing totals">
  <InvoiceTotals />
</LoadingOverlay>`}
      >
        <OverlayDemo />
      </Section>

      <Section
        title="Accessibility"
        desc="Every indicator has a name, and progress is announced with its value."
        code={`
// Indicators are role="status"; the label is read even when hidden
<ActivityIndicator label="Loading invoices" />

// Progress bars and rings are role="progressbar" with the value
<ProgressBar label="Upload" value={40} valueText="2 of 5 files" />

// Mark the region that's loading
<section aria-busy={loading}>…</section>`}
      >
        <ul className="grid gap-1.5 text-sm text-fg-muted">
          <li>With reduced motion on, spinners slow down and the rest gently fade instead of moving.</li>
          <li>Steps read their state aloud, like “Run tests — Failed”.</li>
          <li>The loading overlay keeps focus and clicks out of the covered content.</li>
        </ul>
      </Section>
    </>
  );
}
