import * as React from "react";
import {
  KpiCard,
  WidgetCard,
  DashboardGrid,
  LineChart,
  AreaChart,
  BarChart,
  DonutChart,
  Gauge,
  BarList,
  CalendarHeatmap,
  Sparkline,
  PillGroup,
  PillOption,
  Button,
  Text,
} from "@jm/ui";
import { PageHeader, Section } from "../components/Doc";

const peso = (v: number) => `₱${v.toLocaleString("en-PH")}`;
const pesoShort = (v: number) => `₱${new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(v)}`;

const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
const revenue = months.map((m, i) => ({
  month: m,
  invoiced: Math.round(210000 + i * 9000 + Math.sin(i * 1.3) * 26000),
  collected: Math.round(180000 + i * 10500 + Math.sin(i * 1.3 + 0.6) * 22000),
}));
const methods = months.slice(-6).map((m, i) => ({
  month: m,
  card: 60000 + i * 6000 + (i % 2) * 9000,
  gcash: 80000 + i * 9000 - (i % 3) * 7000,
  bank: 45000 + i * 3000 + (i % 2) * 5000,
}));

// A deterministic "random" so the heatmap looks the same every time.
function heatmap() {
  const out: Array<{ date: string; value: number }> = [];
  const end = new Date();
  for (let i = 0; i < 26 * 7; i++) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    const weekday = d.getDay();
    const seed = Math.sin(i * 12.9898) * 43758.5453;
    const r = seed - Math.floor(seed);
    const v = weekday === 0 || weekday === 6 ? Math.floor(r * 2) : Math.floor(r * 9);
    if (v > 0) out.push({ date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`, value: v });
  }
  return out;
}
const payments = heatmap();

const clients = [
  { label: "Luzon Freight", value: 1240000, meta: "21 invoices", icon: "bi bi-truck" },
  { label: "Bayanihan Build", value: 640000, meta: "15 invoices", icon: "bi bi-bricks" },
  { label: "Northwind Traders", value: 312400, meta: "12 invoices", icon: "bi bi-building" },
  { label: "Northgate Clinic", value: 158000, meta: "9 invoices", icon: "bi bi-heart-pulse" },
  { label: "Blue Harbor Café", value: 96250, meta: "8 invoices", icon: "bi bi-cup-hot" },
  { label: "Mabuhay Tours", value: 74900, meta: "6 invoices", icon: "bi bi-airplane" },
  { label: "Pixel & Pine", value: 38000, meta: "4 invoices", icon: "bi bi-palette" },
];

function Dashboard() {
  const [range, setRange] = React.useState<string | null>("12");
  const [loading, setLoading] = React.useState(false);
  const data = revenue.slice(-Number(range ?? 12));
  const reload = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  };
  return (
    <div className="grid w-full gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-fg-muted">A billing dashboard built only from these widgets.</p>
        <Button size="sm" variant="secondary" leadingIcon="bi bi-arrow-clockwise" onClick={reload}>Show loading state</Button>
      </div>
      <DashboardGrid columns={4}>
        <KpiCard label="Revenue this month" value={peso(318400)} change={8.2} changeLabel="vs August" icon="bi bi-graph-up-arrow" sparkline={revenue.map((r) => r.invoiced)} loading={loading} />
        <KpiCard label="Outstanding" value={peso(86400)} change={-4.1} invertTrend changeLabel="vs August" icon="bi bi-hourglass-split" sparkline={[120, 132, 118, 110, 104, 98, 96, 91, 94, 90, 88, 86]} loading={loading} />
        <KpiCard label="Average days to pay" value="18 days" change={6} invertTrend changeLabel="slower than August" icon="bi bi-clock-history" sparkline={[22, 21, 20, 19, 18, 17, 17, 16, 16, 17, 17, 18]} sparklineType="bar" loading={loading} />
        <KpiCard label="Quarter target" value={peso(812000)} icon="bi bi-bullseye" progress={{ value: 0.78, label: "78% of ₱1.04M · 9 days left" }} loading={loading} />

        <WidgetCard
          data-span="3"
          title="Invoiced vs collected"
          description="Monthly, with the ₱280K monthly target"
          value={pesoShort(data.reduce((s, d) => s + d.collected, 0))}
          loading={loading}
          action={
            <PillGroup value={range} onValueChange={setRange} size="sm" aria-label="Period">
              <PillOption value="6">6M</PillOption>
              <PillOption value="12">12M</PillOption>
            </PillGroup>
          }
        >
          <AreaChart
            data={data}
            index="month"
            series={[
              { key: "invoiced", label: "Invoiced" },
              { key: "collected", label: "Collected" },
            ]}
            formatValue={pesoShort}
            referenceLine={{ value: 280000, label: "Target" }}
            aria-label="Invoiced and collected revenue by month"
          />
        </WidgetCard>
        <WidgetCard title="Invoice status" description="All open and closed invoices" loading={loading}>
          <DonutChart
            size={160}
            legend="bottom"
            centerLabel="Invoices"
            formatValue={(v) => v.toLocaleString()}
            data={[
              { label: "Paid", value: 312, color: "var(--color-success)" },
              { label: "Sent", value: 64, color: "var(--ui-chart-1)" },
              { label: "Overdue", value: 18, color: "var(--color-danger)" },
              { label: "Draft", value: 23, color: "var(--color-border-strong)" },
            ]}
            aria-label="Invoices by status"
          />
        </WidgetCard>

        <WidgetCard data-span="2" title="Payment methods" description="Last 6 months, stacked" loading={loading}>
          <BarChart
            data={methods}
            index="month"
            stacked
            series={[
              { key: "gcash", label: "GCash" },
              { key: "card", label: "Card" },
              { key: "bank", label: "Bank transfer" },
            ]}
            formatValue={pesoShort}
            height={220}
            aria-label="Payments by method, last six months"
          />
        </WidgetCard>
        <WidgetCard data-span="2" title="Top clients" description="Billed this year" loading={loading} footer="Updated 5 minutes ago">
          <BarList items={clients} formatValue={pesoShort} limit={5} aria-label="Top clients by amount billed" />
        </WidgetCard>

        <WidgetCard data-span="full" title="Payment activity" description="Payments received per day, last 6 months" loading={loading}>
          <CalendarHeatmap data={payments} formatValue={(v) => `${v} payment${v === 1 ? "" : "s"}`} aria-label="Payments received per day over the last six months" />
        </WidgetCard>
      </DashboardGrid>
    </div>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="w-full rounded-card border border-border bg-surface p-4">{children}</div>;
}

export function WidgetsPage() {
  return (
    <>
      <PageHeader
        title="Dashboard widgets"
        intro="Ready-made pieces for KPI dashboards: headline numbers, trend charts, comparisons, shares, targets, rankings and activity. Hand-built SVG — no chart library to install — so they share one look, one color palette and one tooltip, resize to their space, and read out to screen readers."
        importLine={`import {
  DashboardGrid, KpiCard, WidgetCard,
  LineChart, AreaChart, BarChart, DonutChart, Gauge, BarList, CalendarHeatmap, Sparkline,
} from "@jm/ui";`}
      />

      <Section
        wide
        title="A complete dashboard"
        desc="Hover or touch the charts for values, click legend items to hide a series, switch the period, or show the loading state. DashboardGrid lays widgets out in four columns on wide screens, two on tablets and one on phones; data-span makes a widget wider."
        code={`
<DashboardGrid columns={4}>
  <KpiCard label="Revenue this month" value="₱318,400" change={8.2} changeLabel="vs August"
    icon="bi bi-graph-up-arrow" sparkline={monthly} />
  <KpiCard label="Outstanding" value="₱86,400" change={-4.1} invertTrend … />
  <KpiCard label="Quarter target" value="₱812,000" progress={{ value: 0.78, label: "78% of ₱1.04M" }} />

  <WidgetCard data-span="3" title="Invoiced vs collected" action={<PeriodPicker />} loading={isLoading}>
    <AreaChart data={rows} index="month" series={[{ key: "invoiced" }, { key: "collected" }]}
      referenceLine={{ value: 280000, label: "Target" }} formatValue={pesoShort}
      aria-label="Invoiced and collected revenue by month" />
  </WidgetCard>
  …
</DashboardGrid>`}
      >
        <Dashboard />
      </Section>

      <Section
        title="KpiCard"
        desc="The headline number, its change against the last period (green when good — use invertTrend for costs and delays), and an optional sparkline or progress to a target. Give it href to make the whole card a link to the details."
        code={`
<KpiCard
  label="Revenue this month"
  value="₱318,400"
  change={8.2}                    // percent; negative for down
  changeLabel="vs August"
  icon="bi bi-graph-up-arrow"
  sparkline={last12Months}        // sparklineType: "area" | "line" | "bar"
  href="/reports/revenue"
/>
<KpiCard label="Churned clients" value="3" change={-40} invertTrend />   {/* down is good */}
<KpiCard label="Quarter target" value="₱812,000" progress={{ value: 0.78, label: "78% of ₱1.04M" }} />
<KpiCard label="Revenue" value="" loading />`}
      >
        <div className="grid w-full gap-3 sm:grid-cols-2">
          <KpiCard label="Revenue this month" value={peso(318400)} change={8.2} changeLabel="vs August" sparkline={revenue.map((r) => r.invoiced)} href="#/widgets" />
          <KpiCard label="Churned clients" value="3" change={-40} invertTrend changeLabel="vs last quarter" sparkline={[6, 5, 7, 5, 4, 5, 3]} sparklineType="bar" />
        </div>
      </Section>

      <Section
        title="LineChart and AreaChart"
        desc="Trends over time. Smooth lines that never overshoot the data, a crosshair tooltip, and a dashed reference line for targets. Focus the chart and use ← → to read each point."
        code={`
<LineChart
  data={rows}                      // [{ month: "Jan", invoiced: 210000, collected: 180000 }, …]
  index="month"
  series={[{ key: "invoiced", label: "Invoiced" }, { key: "collected", label: "Collected", color: "var(--color-success)" }]}
  formatValue={(v) => \`₱\${v.toLocaleString()}\`}
  referenceLine={{ value: 280000, label: "Target" }}
  height={240}
  aria-label="Revenue by month"
/>
<AreaChart … />                    {/* same, filled */}`}
      >
        <Frame>
          <LineChart
            data={revenue}
            index="month"
            series={[
              { key: "invoiced", label: "Invoiced" },
              { key: "collected", label: "Collected", color: "var(--color-success)" },
            ]}
            formatValue={pesoShort}
            referenceLine={{ value: 280000, label: "Target" }}
            aria-label="Invoiced and collected revenue by month"
          />
        </Frame>
      </Section>

      <Section
        title="BarChart"
        desc="Side-by-side comparisons, or stacked to show parts of a total (the tooltip adds the total). Hovering a month dims the others."
        code={`
<BarChart data={rows} index="month" series={[{ key: "gcash" }, { key: "card" }, { key: "bank" }]} />
<BarChart … stacked />`}
      >
        <Frame>
          <BarChart
            data={methods}
            index="month"
            series={[
              { key: "gcash", label: "GCash" },
              { key: "card", label: "Card" },
              { key: "bank", label: "Bank" },
            ]}
            formatValue={pesoShort}
            height={220}
            aria-label="Payments by method"
          />
        </Frame>
      </Section>

      <Section
        title="DonutChart and Gauge"
        desc="A donut shows shares of a whole — hover a slice or legend row to see its share in the middle. A gauge shows progress toward a goal, with an optional target mark and color bands."
        code={`
<DonutChart
  data={[{ label: "Paid", value: 312, color: "var(--color-success)" }, { label: "Overdue", value: 18, color: "var(--color-danger)" }, …]}
  centerLabel="Invoices"
  aria-label="Invoices by status"
/>

<Gauge
  value={812000} max={1040000} target={900000} label="Q3"
  formatValue={pesoShort}
  bands={[{ upTo: 0.5, color: "var(--color-danger)" }, { upTo: 0.8, color: "var(--color-warning)" }, { upTo: 1, color: "var(--color-success)" }]}
/>`}
      >
        <Frame>
          <div className="flex flex-wrap items-center justify-around gap-8">
            <DonutChart
              size={170}
              legend={false}
              centerLabel="Invoices"
              formatValue={(v) => v.toLocaleString()}
              data={[
                { label: "Paid", value: 312, color: "var(--color-success)" },
                { label: "Sent", value: 64 },
                { label: "Overdue", value: 18, color: "var(--color-danger)" },
                { label: "Draft", value: 23, color: "var(--color-border-strong)" },
              ]}
              aria-label="Invoices by status"
            />
            <Gauge
              value={812000}
              max={1040000}
              target={900000}
              label="Q3"
              formatValue={pesoShort}
              bands={[
                { upTo: 0.5, color: "var(--color-danger)" },
                { upTo: 0.8, color: "var(--color-warning)" },
                { upTo: 1, color: "var(--color-success)" },
              ]}
            />
          </div>
        </Frame>
      </Section>

      <Section
        title="BarList"
        desc="Rankings — top clients, products or pages — with the bar behind the label so long names still fit. Items can be links; limit adds a “Show all” button."
        code={`
<BarList
  items={[{ label: "Luzon Freight", value: 1240000, meta: "21 invoices", icon: "bi bi-truck", href: "/clients/7" }, …]}
  formatValue={pesoShort}
  limit={5}
/>`}
      >
        <Frame>
          <BarList items={clients} formatValue={pesoShort} limit={4} color="var(--ui-chart-2)" aria-label="Top clients" />
        </Frame>
      </Section>

      <Section
        title="CalendarHeatmap and Sparkline"
        desc="The heatmap shows daily activity at a glance — darker means more; hover a day for its count. Sparklines are tiny trends for cards and table rows."
        code={`
<CalendarHeatmap data={[{ date: "2026-09-21", value: 4 }, …]} weeks={26} />

<Sparkline data={[12, 15, 11, 18, 21, 19, 24]} />                // line
<Sparkline data={…} type="area" color="var(--color-success)" />
<Sparkline data={…} type="bar" />`}
      >
        <div className="grid w-full gap-4">
          <Frame>
            <CalendarHeatmap data={payments} weeks={20} color="var(--ui-chart-2)" formatValue={(v) => `${v} payments`} aria-label="Payments per day" />
          </Frame>
          <div className="grid gap-3 sm:grid-cols-3">
            {(["line", "area", "bar"] as const).map((t, i) => (
              <Frame key={t}>
                <Text size="xs" tone="muted">{t}</Text>
                <Sparkline data={[12, 15, 11, 18, 21, 19, 24, 22, 27]} type={t} color={`var(--ui-chart-${i + 1})`} />
              </Frame>
            ))}
          </div>
        </div>
      </Section>

      <Section
        title="States, colors and data"
        desc="WidgetCard handles the in-between moments: loading skeletons, an empty message, and errors with Try again. Chart colors come from six theme tokens you can rebrand."
        code={`
<WidgetCard title="Revenue" loading={isLoading} error={error && "Couldn't load revenue."} onRetry={refetch}
  empty={rows.length === 0 && "No invoices yet this period."}>
  <AreaChart … />
</WidgetCard>

/* Chart colors (light and dark) — override after the theme import */
:root { --ui-chart-1: #0d6efd; --ui-chart-2: #0d9488; --ui-chart-3: #ea580c; … }

// Laravel: shape rows for a chart
return Invoice::selectRaw("DATE_FORMAT(issued_at, '%b') as month, SUM(total) as invoiced")
  ->groupBy('month')->orderBy('issued_at')->get();`}
      >
        <div className="grid w-full gap-3 sm:grid-cols-2">
          <WidgetCard title="Refunds" empty="No refunds this period — nice." />
          <WidgetCard title="Bank sync" error="Couldn't reach the bank feed." onRetry={() => undefined} />
        </div>
      </Section>
    </>
  );
}
