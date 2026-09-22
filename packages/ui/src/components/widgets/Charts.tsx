import * as React from "react";
import { cn } from "../../lib/cn";
import { DataTable, formatCompact, linearPath, monotonePath, niceTicks, seriesColor, useAnimate, useReducedMotion, useTweenedRows, useWidth } from "./chart-utils";

/*
 * LineChart (and AreaChart) and BarChart — hand-built SVG, no chart library.
 * Crosshair tooltip on hover/touch, arrow keys to step through points, legend that toggles
 * series, optional target line, draw-in animation, and a hidden data table for screen readers.
 */

export type Datum = Record<string, string | number | null | undefined>;

export interface ChartSeries {
  /** Field in each data row. */
  key: string;
  label?: string;
  /** Any CSS color. Defaults to the chart palette (--ui-chart-1 … 6). */
  color?: string;
}

export interface BaseChartProps {
  data: Datum[];
  /** The field used along the bottom, e.g. "month". */
  index: string;
  series: ChartSeries[];
  /** Height in px. Default 240. */
  height?: number;
  formatValue?: (value: number) => string;
  formatIndex?: (value: string | number) => string;
  /** Legend above the chart (click to show/hide a series). Default true for 2+ series. */
  showLegend?: boolean;
  showGrid?: boolean;
  /** A horizontal reference line, e.g. a target. */
  referenceLine?: { value: number; label?: string };
  /** Accessible summary, e.g. "Revenue by month, January to December". */
  "aria-label": string;
  /** Draw in on first load. Default true (inside a DashboardGrid, follows its animate setting). */
  animate?: boolean;
  /** Glide to new values when the data changes (live dashboards). Default true. */
  transition?: boolean;
  className?: string;
}

type Hover = { i: number; x: number } | null;

const PAD = { top: 12, right: 12, bottom: 26, left: 44 };

function useChartFrame(props: BaseChartProps, stackedMax?: (visible: ChartSeries[]) => number) {
  const { data, series, height = 240, referenceLine } = props;
  const [hidden, setHidden] = React.useState<string[]>([]);
  const visible = series.filter((s) => !hidden.includes(s.key));
  const values = data.flatMap((d) => visible.map((s) => Number(d[s.key] ?? 0)));
  let max = stackedMax ? stackedMax(visible) : Math.max(0, ...values);
  let min = Math.min(0, ...values);
  if (referenceLine) {
    max = Math.max(max, referenceLine.value);
    min = Math.min(min, referenceLine.value);
  }
  const ticks = niceTicks(min, max || 1, height < 180 ? 3 : 4);
  return { hidden, setHidden, visible, ticks, lo: ticks[0], hi: ticks[ticks.length - 1] };
}

function Legend({ series, hidden, onToggle }: { series: ChartSeries[]; hidden: string[]; onToggle: (k: string) => void }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
      {series.map((s, i) => {
        const off = hidden.includes(s.key);
        return (
          <button
            key={s.key}
            type="button"
            aria-pressed={!off}
            onClick={() => onToggle(s.key)}
            className={cn("inline-flex cursor-pointer items-center gap-1.5 rounded-control-sm text-xs text-fg-muted outline-none hover:text-fg focus-visible:outline-2 focus-visible:outline-ring", off && "opacity-45")}
          >
            <span aria-hidden="true" className="size-2.5 rounded-[3px]" style={{ background: seriesColor(i, s.color) }} />
            {s.label ?? s.key}
          </button>
        );
      })}
    </div>
  );
}

function Tooltip({
  left,
  width,
  title,
  rows,
}: {
  left: number;
  width: number;
  title: string;
  rows: Array<{ label: string; value: string; color: string }>;
}) {
  // Keep the tooltip inside the chart: flip to the left side past the middle.
  const right = left > width / 2;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-1 z-10 min-w-32 rounded-control-lg border border-border bg-surface px-3 py-2 text-xs shadow-[var(--ui-shadow-lg)]"
      style={right ? { right: width - left + 12 } : { left: left + 12 }}
    >
      <p className="mb-1 font-medium text-fg">{title}</p>
      {rows.map((r) => (
        <p key={r.label} className="flex items-center gap-2 tabular-nums text-fg-muted">
          <span className="size-2 rounded-full" style={{ background: r.color }} />
          <span className="flex-1">{r.label}</span>
          <span className="font-medium text-fg">{r.value}</span>
        </p>
      ))}
    </div>
  );
}

function Axes({ w, h, ticks, y, labels, x, fmt, showGrid, referenceLine }: {
  w: number; h: number; ticks: number[]; y: (v: number) => number; labels: string[]; x: (i: number) => number; fmt: (v: number) => string; showGrid: boolean; referenceLine?: { value: number; label?: string };
}) {
  // Thin out bottom labels so they never collide.
  const every = Math.max(1, Math.ceil(labels.length / Math.max(2, Math.floor((w - PAD.left - PAD.right) / 64))));
  return (
    <g aria-hidden="true" className="text-[11px]">
      {ticks.map((t) => (
        <g key={t}>
          {showGrid && <line x1={PAD.left} x2={w - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--ui-chart-grid)" strokeDasharray={t === 0 ? undefined : "3 4"} />}
          <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fill="var(--color-fg-muted)" className="tabular-nums">
            {fmt(t)}
          </text>
        </g>
      ))}
      {labels.map((l, i) =>
        i % every === 0 || i === labels.length - 1 ? (
          <text key={i} x={x(i)} y={h - 6} textAnchor={i === 0 ? "start" : i === labels.length - 1 ? "end" : "middle"} fill="var(--color-fg-muted)">
            {i % every === 0 || labels.length - 1 - i >= every / 2 ? l : ""}
          </text>
        ) : null
      )}
      {referenceLine && (
        <g>
          <line x1={PAD.left} x2={w - PAD.right} y1={y(referenceLine.value)} y2={y(referenceLine.value)} stroke="var(--color-fg-muted)" strokeDasharray="5 4" strokeWidth={1.2} />
          {referenceLine.label && (
            <text x={w - PAD.right} y={y(referenceLine.value) - 5} textAnchor="end" fill="var(--color-fg-muted)" className="font-medium">
              {referenceLine.label}
            </text>
          )}
        </g>
      )}
    </g>
  );
}

/* ---------- LineChart / AreaChart ---------- */

export interface LineChartProps extends BaseChartProps {
  /** Fill under the lines. */
  area?: boolean;
  /** "smooth" (default) or "linear". */
  curve?: "smooth" | "linear";
  /** Show a dot on every point. Default: only when there are few points. */
  dots?: boolean;
}

export function LineChart(props: LineChartProps) {
  const { data, index, series, height = 240, formatValue = formatCompact, formatIndex = String, area = false, curve = "smooth", dots, showGrid = true, referenceLine, className } = props;
  const [ref, w] = useWidth<HTMLDivElement>();
  const wantsAnimation = useAnimate(props.animate);
  const prefersReduced = useReducedMotion();
  const reduced = !wantsAnimation || prefersReduced;
  // Geometry uses smoothly-moving values; tooltips and the data table use the real ones.
  const shown = useTweenedRows(data, series.map((s) => s.key), { enabled: props.transition ?? true });
  const { hidden, setHidden, visible, ticks, lo, hi } = useChartFrame({ ...props, data: shown });
  const [hover, setHover] = React.useState<Hover>(null);
  const gid = React.useId().replace(/:/g, "");
  const n = data.length;
  const x = (i: number) => PAD.left + (n <= 1 ? 0 : (i / (n - 1)) * (w - PAD.left - PAD.right));
  const y = (v: number) => PAD.top + (1 - (v - lo) / (hi - lo || 1)) * (height - PAD.top - PAD.bottom);
  const path = curve === "smooth" ? monotonePath : linearPath;
  const labels = data.map((d) => formatIndex(d[index] as string));
  const showDots = dots ?? n <= 14;

  const pick = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect();
    const i = Math.round(((clientX - r.left - PAD.left) / (w - PAD.left - PAD.right)) * (n - 1));
    const c = Math.min(n - 1, Math.max(0, i));
    setHover({ i: c, x: x(c) });
  };

  return (
    <div className={cn("grid gap-3", className)}>
      {(props.showLegend ?? series.length > 1) && <Legend series={series} hidden={hidden} onToggle={(k) => setHidden((h) => (h.includes(k) ? h.filter((x) => x !== k) : [...h, k]))} />}
      <div
        ref={ref}
        className="relative touch-pan-y outline-none focus-visible:rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        style={{ height }}
        tabIndex={0}
        role="group"
        aria-label={`${props["aria-label"]}. Use the arrow keys to read values.`}
        onPointerMove={(e) => pick(e.clientX)}
        onPointerDown={(e) => pick(e.clientX)}
        onPointerLeave={() => setHover(null)}
        onBlur={() => setHover(null)}
        onKeyDown={(e) => {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "Home" && e.key !== "End") return;
          e.preventDefault();
          const cur = hover?.i ?? -1;
          const next = e.key === "Home" ? 0 : e.key === "End" ? n - 1 : Math.min(n - 1, Math.max(0, cur + (e.key === "ArrowRight" ? 1 : -1)));
          setHover({ i: next, x: x(next) });
        }}
      >
        {w > 0 && (
          <svg width={w} height={height} className="block overflow-visible">
            <defs>
              {visible.map((s) => {
                const i = series.indexOf(s);
                return (
                  <linearGradient key={s.key} id={`${gid}-${i}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={seriesColor(i, s.color)} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={seriesColor(i, s.color)} stopOpacity={0} />
                  </linearGradient>
                );
              })}
            </defs>
            <Axes w={w} h={height} ticks={ticks} y={y} labels={labels} x={x} fmt={formatValue} showGrid={showGrid} referenceLine={referenceLine} />
            {visible.map((s) => {
              const i = series.indexOf(s);
              const pts = shown.map((d, j) => [x(j), y(Number(d[s.key] ?? 0))] as [number, number]);
              const line = path(pts);
              const color = seriesColor(i, s.color);
              return (
                <g key={s.key}>
                  {area && (
                    <path
                      d={`${line}L${x(n - 1)},${y(Math.max(lo, 0))}L${x(0)},${y(Math.max(lo, 0))}Z`}
                      fill={`url(#${gid}-${i})`}
                      style={reduced ? undefined : { animation: "ui-chart-fade 700ms ease-out both" }}
                    />
                  )}
                  <path
                    d={line}
                    fill="none"
                    stroke={color}
                    strokeWidth={2.25}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray={reduced ? undefined : "1"}
                    style={reduced ? undefined : { animation: "ui-chart-draw 900ms cubic-bezier(0.4,0,0.2,1) both" }}
                  />
                  {showDots &&
                    pts.map(([px, py], j) => (
                      <circle key={j} cx={px} cy={py} r={3} fill="var(--color-surface)" stroke={color} strokeWidth={2} style={reduced ? undefined : { animation: `ui-chart-fade 300ms ${600 + j * 20}ms both` }} />
                    ))}
                </g>
              );
            })}
            {hover && (
              <g aria-hidden="true">
                <line x1={hover.x} x2={hover.x} y1={PAD.top} y2={height - PAD.bottom} stroke="var(--color-fg-muted)" strokeOpacity={0.35} />
                {visible.map((s) => {
                  const i = series.indexOf(s);
                  return <circle key={s.key} cx={hover.x} cy={y(Number(shown[hover.i]?.[s.key] ?? 0))} r={5} fill={seriesColor(i, s.color)} stroke="var(--color-surface)" strokeWidth={2} />;
                })}
              </g>
            )}
          </svg>
        )}
        {hover && (
          <Tooltip
            left={hover.x}
            width={w}
            title={labels[hover.i]}
            rows={visible.map((s) => ({ label: s.label ?? s.key, value: formatValue(Number(data[hover.i][s.key] ?? 0)), color: seriesColor(series.indexOf(s), s.color) }))}
          />
        )}
        <span className="sr-only" aria-live="polite">
          {hover ? `${labels[hover.i]}: ${visible.map((s) => `${s.label ?? s.key} ${formatValue(Number(data[hover.i][s.key] ?? 0))}`).join(", ")}` : ""}
        </span>
      </div>
      <DataTable caption={props["aria-label"]} columns={[index, ...series.map((s) => s.label ?? s.key)]} rows={data.map((d, j) => [labels[j], ...series.map((s) => formatValue(Number(d[s.key] ?? 0)))])} />
    </div>
  );
}

/** A LineChart with the area filled. */
export const AreaChart = (props: Omit<LineChartProps, "area">) => <LineChart {...props} area />;

/* ---------- BarChart ---------- */

export interface BarChartProps extends BaseChartProps {
  /** Stack series on top of each other instead of side by side. */
  stacked?: boolean;
}

export function BarChart(props: BarChartProps) {
  const { data, index, series, height = 240, formatValue = formatCompact, formatIndex = String, stacked = false, showGrid = true, referenceLine, className } = props;
  const [ref, w] = useWidth<HTMLDivElement>();
  const wantsAnimation = useAnimate(props.animate);
  const prefersReduced = useReducedMotion();
  const reduced = !wantsAnimation || prefersReduced;
  const shown = useTweenedRows(data, series.map((s) => s.key), { enabled: props.transition ?? true });
  const { hidden, setHidden, visible, ticks, lo, hi } = useChartFrame({ ...props, data: shown }, stacked ? (vis) => Math.max(0, ...shown.map((d) => vis.reduce((s, x) => s + Number(d[x.key] ?? 0), 0))) : undefined);
  const [hover, setHover] = React.useState<Hover>(null);
  const n = data.length;
  const inner = w - PAD.left - PAD.right;
  const band = inner / Math.max(1, n);
  const x = (i: number) => PAD.left + band * i + band / 2;
  const y = (v: number) => PAD.top + (1 - (v - lo) / (hi - lo || 1)) * (height - PAD.top - PAD.bottom);
  const groupW = Math.min(band * 0.72, stacked ? 36 : 18 * visible.length + 4 * (visible.length - 1));
  const barW = stacked ? groupW : (groupW - 4 * (visible.length - 1)) / Math.max(1, visible.length);
  const labels = data.map((d) => formatIndex(d[index] as string));
  const base = y(Math.max(lo, 0));

  const pick = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect();
    const i = Math.min(n - 1, Math.max(0, Math.floor((clientX - r.left - PAD.left) / band)));
    setHover({ i, x: x(i) });
  };

  return (
    <div className={cn("grid gap-3", className)}>
      {(props.showLegend ?? series.length > 1) && <Legend series={series} hidden={hidden} onToggle={(k) => setHidden((h) => (h.includes(k) ? h.filter((x) => x !== k) : [...h, k]))} />}
      <div
        ref={ref}
        className="relative touch-pan-y outline-none focus-visible:rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        style={{ height }}
        tabIndex={0}
        role="group"
        aria-label={`${props["aria-label"]}. Use the arrow keys to read values.`}
        onPointerMove={(e) => pick(e.clientX)}
        onPointerDown={(e) => pick(e.clientX)}
        onPointerLeave={() => setHover(null)}
        onBlur={() => setHover(null)}
        onKeyDown={(e) => {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "Home" && e.key !== "End") return;
          e.preventDefault();
          const cur = hover?.i ?? -1;
          const next = e.key === "Home" ? 0 : e.key === "End" ? n - 1 : Math.min(n - 1, Math.max(0, cur + (e.key === "ArrowRight" ? 1 : -1)));
          setHover({ i: next, x: x(next) });
        }}
      >
        {w > 0 && (
          <svg width={w} height={height} className="block overflow-visible">
            {hover && <rect x={x(hover.i) - band / 2 + 2} y={PAD.top} width={band - 4} height={height - PAD.top - PAD.bottom} rx={6} fill="var(--color-fg)" fillOpacity={0.05} />}
            <Axes w={w} h={height} ticks={ticks} y={y} labels={labels} x={x} fmt={formatValue} showGrid={showGrid} referenceLine={undefined} />
            {shown.map((d, j) => {
              let acc = 0;
              return (
                <g key={j} style={reduced ? undefined : { transformOrigin: `0 ${base}px`, animation: `ui-chart-grow 600ms ${j * 30}ms cubic-bezier(0.3,1.1,0.5,1) both` }}>
                  {visible.map((s, k) => {
                    const i = series.indexOf(s);
                    const v = Number(d[s.key] ?? 0);
                    const x0 = stacked ? x(j) - barW / 2 : x(j) - groupW / 2 + k * (barW + 4);
                    const top = stacked ? y(acc + v) : y(Math.max(v, 0));
                    const bottom = stacked ? y(acc) : y(Math.min(v, 0));
                    acc += v;
                    const isTop = !stacked || k === visible.length - 1;
                    const r = Math.min(4, barW / 2);
                    const hgt = Math.max(0, bottom - top);
                    // Round only the top corners of the topmost bar.
                    const dPath = isTop && hgt > r
                      ? `M${x0},${bottom}V${top + r}Q${x0},${top} ${x0 + r},${top}H${x0 + barW - r}Q${x0 + barW},${top} ${x0 + barW},${top + r}V${bottom}Z`
                      : `M${x0},${bottom}V${top}H${x0 + barW}V${bottom}Z`;
                    return <path key={s.key} d={dPath} fill={seriesColor(i, s.color)} fillOpacity={hover && hover.i !== j ? 0.55 : 1} className="transition-[fill-opacity] duration-150" />;
                  })}
                </g>
              );
            })}
            {referenceLine && <Axes w={w} h={height} ticks={[]} y={y} labels={[]} x={x} fmt={formatValue} showGrid={false} referenceLine={referenceLine} />}
          </svg>
        )}
        {hover && (
          <Tooltip
            left={hover.x}
            width={w}
            title={labels[hover.i]}
            rows={[
              ...visible.map((s) => ({ label: s.label ?? s.key, value: formatValue(Number(data[hover.i][s.key] ?? 0)), color: seriesColor(series.indexOf(s), s.color) })),
              ...(stacked && visible.length > 1
                ? [{ label: "Total", value: formatValue(visible.reduce((t, s) => t + Number(data[hover.i][s.key] ?? 0), 0)), color: "transparent" }]
                : []),
            ]}
          />
        )}
        <span className="sr-only" aria-live="polite">
          {hover ? `${labels[hover.i]}: ${visible.map((s) => `${s.label ?? s.key} ${formatValue(Number(data[hover.i][s.key] ?? 0))}`).join(", ")}` : ""}
        </span>
      </div>
      <DataTable caption={props["aria-label"]} columns={[index, ...series.map((s) => s.label ?? s.key)]} rows={data.map((d, j) => [labels[j], ...series.map((s) => formatValue(Number(d[s.key] ?? 0)))])} />
    </div>
  );
}
