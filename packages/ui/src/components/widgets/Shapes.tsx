import * as React from "react";
import { cn } from "../../lib/cn";
import { renderIcon, type IconInput } from "../button/Button";
import { DataTable, formatCompact, linearPath, monotonePath, seriesColor, useAnimate, useReducedMotion, useTweenedNumbers, useWidth } from "./chart-utils";

/* DonutChart, Gauge, BarList, CalendarHeatmap and Sparkline. */

/* ---------- DonutChart ---------- */

export interface DonutSlice {
  label: string;
  value: number;
  color?: string;
}

export interface DonutChartProps {
  data: DonutSlice[];
  /** Diameter in px. Default 180. */
  size?: number;
  /** Ring thickness in px. Default 22. */
  thickness?: number;
  formatValue?: (value: number) => string;
  /** Text under the number in the middle. Default "Total". */
  centerLabel?: string;
  /** Legend beside ("side", default when there's room), "bottom", or none. */
  legend?: "side" | "bottom" | false;
  /** Sweep in on first load. Default true (inside a DashboardGrid, follows its animate setting). */
  animate?: boolean;
  "aria-label": string;
  className?: string;
}

export function DonutChart({ data, size = 180, thickness = 22, formatValue = formatCompact, centerLabel = "Total", legend = "side", animate, className, ...rest }: DonutChartProps) {
  const anim = useAnimate(animate);
  const [active, setActive] = React.useState<number | null>(null);
  // Slices sweep in from nothing on first load and glide when values change.
  const tw = useTweenedNumbers(data.map((d) => Math.max(0, d.value)), { from: anim ? 0 : undefined, duration: 800 });
  const realTotal = data.reduce((s, d) => s + Math.max(0, d.value), 0);
  const total = Math.max(realTotal, tw.reduce((a, b) => a + b, 0));
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const gap = data.length > 1 ? Math.min(4, c * 0.01) : 0; // small gaps between slices
  let offset = 0;
  const shown = active !== null ? data[active] : null;

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-x-8 gap-y-4", legend === "bottom" && "flex-col", className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={rest["aria-label"]} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-secondary-hover)" strokeWidth={thickness} />
          {data.map((d, i) => {
            const len = total ? ((tw[i] ?? 0) / total) * c : 0;
            const seg = (
              <circle
                key={d.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={seriesColor(i, d.color)}
                strokeWidth={active === i ? thickness + 6 : thickness}
                strokeDasharray={`${Math.max(0, len - gap)} ${c}`}
                strokeDashoffset={-offset}
                opacity={active !== null && active !== i ? 0.4 : 1}
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
                className="cursor-pointer transition-[stroke-width,opacity] duration-200"
              />
            );
            offset += len;
            return seg;
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-content-center text-center" aria-hidden="true">
          {/* Sized to fit the hole, so smaller donuts still leave space around the number. */}
          <span className="font-semibold leading-tight tabular-nums tracking-[-0.02em] text-fg" style={{ fontSize: Math.max(14, Math.min(24, (size - thickness * 2) * 0.17)) }}>
            {formatValue(shown ? shown.value : Math.round(tw.reduce((a, b) => a + b, 0)))}
          </span>
          <span className="text-xs text-fg-muted">{shown ? `${shown.label} · ${realTotal ? Math.round((shown.value / realTotal) * 100) : 0}%` : centerLabel}</span>
        </div>
      </div>
      {legend && (
        <ul className={cn("grid min-w-40 gap-2 text-sm", legend === "bottom" && "w-full")}>
          {data.map((d, i) => (
            <li
              key={d.label}
              tabIndex={0}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              onPointerEnter={() => setActive(i)}
              onPointerLeave={() => setActive(null)}
              className={cn("flex items-center gap-2.5 rounded-control-sm outline-none focus-visible:outline-2 focus-visible:outline-ring", active !== null && active !== i && "opacity-50")}
            >
              <span aria-hidden="true" className="size-2.5 shrink-0 rounded-[3px]" style={{ background: seriesColor(i, d.color) }} />
              <span className="min-w-0 flex-1 truncate text-fg-muted">{d.label}</span>
              <span className="tabular-nums font-medium text-fg">{formatValue(d.value)}</span>
              <span className="w-10 text-end tabular-nums text-xs text-fg-muted">{realTotal ? Math.round((d.value / realTotal) * 100) : 0}%</span>
            </li>
          ))}
        </ul>
      )}
      <DataTable caption={rest["aria-label"]} columns={["Part", "Value", "Share"]} rows={data.map((d) => [d.label, formatValue(d.value), `${realTotal ? Math.round((d.value / realTotal) * 100) : 0}%`])} />
    </div>
  );
}

/* ---------- Gauge ---------- */

export interface GaugeProps {
  value: number;
  max: number;
  min?: number;
  /** A marker on the arc, e.g. the target. */
  target?: number;
  label?: string;
  formatValue?: (value: number) => string;
  /** Color bands by how far along it is: e.g. [{ upTo: 0.5, color: "var(--color-danger)" }, …]. Default: primary. */
  bands?: Array<{ upTo: number; color: string }>;
  /** Width in px. Default 220. */
  size?: number;
  /** Sweep up from zero on first load. Default true (inside a DashboardGrid, follows its animate setting). */
  animate?: boolean;
  "aria-label"?: string;
  className?: string;
}

/** A half-circle meter for attainment against a goal. */
export function Gauge({ value, max, min = 0, target, label, formatValue = formatCompact, bands, size = 220, animate, className, ...rest }: GaugeProps) {
  const anim = useAnimate(animate);
  // Sweeps up on first load and glides when the value changes.
  const [tv] = useTweenedNumbers([value], { from: anim ? min : undefined, duration: 900 });
  const t = Math.min(1, Math.max(0, (tv - min) / (max - min || 1)));
  const stroke = Math.round(size * 0.1);
  const r = size / 2 - stroke / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;
  const arc = (from: number, to: number) => {
    const a0 = Math.PI * (1 - from);
    const a1 = Math.PI * (1 - to);
    const p = (a: number) => [cx + r * Math.cos(a), cy - r * Math.sin(a)];
    const [x0, y0] = p(a0);
    const [x1, y1] = p(a1);
    // A half-circle never needs the "large arc" flag; setting it past 50% sent the arc the long way round.
    return `M${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1}`;
  };
  const color = bands?.find((b) => t <= b.upTo)?.color ?? bands?.[bands.length - 1]?.color ?? "var(--color-primary)";
  const tt = target !== undefined ? Math.min(1, Math.max(0, (target - min) / (max - min || 1))) : null;
  const pct = Math.round(Math.min(1, Math.max(0, (value - min) / (max - min || 1))) * 100);

  return (
    <div className={cn("grid justify-items-center gap-1", className)}>
      <div className="relative">
      <svg
        width={size}
        height={size / 2 + stroke / 2 + 4}
        viewBox={`0 0 ${size} ${size / 2 + stroke / 2 + 4}`}
        role="meter"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${formatValue(value)} of ${formatValue(max)} (${pct}%)`}
        aria-label={rest["aria-label"] ?? label}
      >
        <path d={arc(0, 1)} fill="none" stroke="var(--color-secondary-hover)" strokeWidth={stroke} strokeLinecap="round" />
        <path
          d={arc(0, Math.max(0.001, t))}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {tt !== null && (() => {
          const a = Math.PI * (1 - tt);
          const inner = r - stroke / 2 - 3;
          const outer = r + stroke / 2 + 3;
          return <line x1={cx + inner * Math.cos(a)} y1={cy - inner * Math.sin(a)} x2={cx + outer * Math.cos(a)} y2={cy - outer * Math.sin(a)} stroke="var(--color-fg)" strokeWidth={2.5} strokeLinecap="round" />;
        })()}
      </svg>
      {/* The number sits inside the arc; the caption goes underneath so it never touches the ends. */}
      <span className="absolute inset-x-0 bottom-1 text-center text-2xl font-semibold tabular-nums tracking-[-0.02em] text-fg" aria-hidden="true">
        {formatValue(Math.round(tv))}
      </span>
      </div>
      <div className="grid justify-items-center text-center" aria-hidden="true">
        <span className="text-xs text-fg-muted">
          {label ? `${label} · ` : ""}
          {pct}% of {formatValue(max)}
          {target !== undefined && ` · target ${formatValue(target)}`}
        </span>
      </div>
    </div>
  );
}

/* ---------- BarList ---------- */

export interface BarListItem {
  label: string;
  value: number;
  icon?: IconInput;
  href?: string;
  /** Secondary text on the right, e.g. "12 invoices". */
  meta?: React.ReactNode;
}

export interface BarListProps {
  items: BarListItem[];
  formatValue?: (value: number) => string;
  /** Sort from highest. Default true. */
  sort?: boolean;
  /** Show at most this many (a "Show all" button reveals the rest). */
  limit?: number;
  color?: string;
  /** Grow the bars in on first load. Default true (inside a DashboardGrid, follows its animate setting). */
  animate?: boolean;
  "aria-label"?: string;
  className?: string;
}

/** A ranked list with bars behind the labels — top clients, pages, products. Rows slide when the order changes. */
export function BarList({ items, formatValue = formatCompact, sort = true, limit, color = "var(--ui-chart-1)", animate, className, ...rest }: BarListProps) {
  const anim = useAnimate(animate);
  const prefersReduced = useReducedMotion();
  const [all, setAll] = React.useState(false);
  const [grown, setGrown] = React.useState(!anim);
  React.useEffect(() => {
    if (grown) return;
    const r = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(r);
  }, [grown]);

  // FLIP: remember where each row was, and slide it from there to its new place.
  const listRef = React.useRef<HTMLOListElement>(null);
  const tops = React.useRef(new Map<string, number>());
  React.useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    // Positions relative to the list (not the screen), so scrolling the page isn't mistaken for movement.
    const origin = list.getBoundingClientRect().top;
    const rows = [...list.querySelectorAll<HTMLElement>("[data-row]")];
    rows.forEach((el) => {
      const key = el.dataset.row!;
      const now = el.getBoundingClientRect().top - origin;
      const before = tops.current.get(key);
      if (before !== undefined && before !== now && !prefersReduced) {
        el.animate([{ transform: `translateY(${before - now}px)` }, { transform: "translateY(0)" }], { duration: 450, easing: "cubic-bezier(0.2,0.9,0.3,1)" });
      }
      tops.current.set(key, now);
    });
  });
  const list = sort ? [...items].sort((a, b) => b.value - a.value) : items;
  const shown = limit && !all ? list.slice(0, limit) : list;
  const max = Math.max(1, ...list.map((i) => i.value));
  return (
    <div className={cn("grid gap-2", className)}>
      <ol ref={listRef} className="grid gap-1.5" aria-label={rest["aria-label"]}>
        {shown.map((it) => {
          const Row = it.href ? "a" : "div";
          return (
            <li key={it.label} data-row={it.label}>
              <Row
                {...(it.href ? { href: it.href } : {})}
                className={cn("relative flex h-8 items-center gap-2 overflow-hidden rounded-control-sm px-2.5 text-sm", it.href && "outline-none hover:bg-secondary-hover focus-visible:outline-2 focus-visible:outline-ring")}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 start-0 rounded-control-sm transition-[width] duration-500 ease-out"
                  style={{ width: grown ? `${(it.value / max) * 100}%` : "0%", background: `color-mix(in srgb, ${color} 16%, transparent)` }}
                />
                {it.icon && <span className="relative text-fg-muted [&_svg]:size-4">{renderIcon(it.icon)}</span>}
                <span className="relative min-w-0 flex-1 truncate text-fg">{it.label}</span>
                {it.meta && <span className="relative shrink-0 text-xs text-fg-muted">{it.meta}</span>}
                <span className="relative shrink-0 font-medium tabular-nums text-fg">{formatValue(it.value)}</span>
              </Row>
            </li>
          );
        })}
      </ol>
      {limit && list.length > limit && (
        <button type="button" onClick={() => setAll((a) => !a)} className="justify-self-start cursor-pointer rounded-control-sm px-2.5 py-1 text-xs font-medium text-primary hover:bg-secondary-hover">
          {all ? "Show fewer" : `Show all ${list.length}`}
        </button>
      )}
    </div>
  );
}

/* ---------- CalendarHeatmap ---------- */

export interface CalendarHeatmapProps {
  /** One entry per day with activity: { date: "2026-09-21", value: 4 }. */
  data: Array<{ date: string; value: number }>;
  /** Last day shown. Default today. */
  end?: Date;
  /** How many weeks back. Default 26. */
  weeks?: number;
  color?: string;
  formatValue?: (value: number) => string;
  "aria-label": string;
  className?: string;
}

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Daily activity as a grid of squares — darker means more. */
export function CalendarHeatmap({ data, end = new Date(), weeks = 26, color = "var(--ui-chart-1)", formatValue = String, className, ...rest }: CalendarHeatmapProps) {
  const map = new Map(data.map((d) => [d.date, d.value]));
  const max = Math.max(1, ...data.map((d) => d.value));
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const start = new Date(last);
  start.setDate(last.getDate() - last.getDay() - (weeks - 1) * 7); // a Sunday
  const [hover, setHover] = React.useState<{ date: Date; value: number } | null>(null);
  const cols: Date[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: Date[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(start);
      day.setDate(start.getDate() + w * 7 + d);
      col.push(day);
    }
    cols.push(col);
  }
  const level = (v: number) => (v <= 0 ? 0 : Math.min(4, Math.ceil((v / max) * 4)));
  const mix = [0, 22, 45, 70, 100];

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="overflow-x-auto pb-1">
        <div className="inline-grid gap-1" role="img" aria-label={rest["aria-label"]}>
          <div className="flex gap-[3px] ps-7 text-[10px] text-fg-muted" aria-hidden="true">
            {cols.map((c, i) => (
              <span key={i} className="w-3 overflow-visible whitespace-nowrap">
                {c[0].getDate() <= 7 ? c[0].toLocaleDateString(undefined, { month: "short" }) : ""}
              </span>
            ))}
          </div>
          <div className="flex gap-[3px]">
            <div className="grid w-6 grid-rows-7 gap-[3px] text-[10px] leading-3 text-fg-muted" aria-hidden="true">
              {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => <span key={i}>{d}</span>)}
            </div>
            {cols.map((col, i) => (
              <div key={i} className="grid grid-rows-7 gap-[3px]">
                {col.map((day) => {
                  const v = map.get(iso(day)) ?? 0;
                  const future = day > last;
                  return (
                    <span
                      key={iso(day)}
                      onPointerEnter={() => !future && setHover({ date: day, value: v })}
                      onPointerLeave={() => setHover(null)}
                      className={cn("size-3 rounded-[3px]", future && "opacity-0")}
                      style={{
                        background: level(v) === 0 ? "var(--color-secondary-hover)" : `color-mix(in srgb, ${color} ${mix[level(v)]}%, var(--color-secondary-hover))`,
                        outline: hover && iso(hover.date) === iso(day) ? "1.5px solid var(--color-fg)" : undefined,
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-fg-muted">
        <span aria-live="polite" className="tabular-nums">
          {hover ? `${hover.date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}: ${formatValue(hover.value)}` : "\u00a0"}
        </span>
        <span className="flex items-center gap-1" aria-hidden="true">
          Less
          {mix.map((m, i) => (
            <span key={i} className="size-3 rounded-[3px]" style={{ background: i === 0 ? "var(--color-secondary-hover)" : `color-mix(in srgb, ${color} ${m}%, var(--color-secondary-hover))` }} />
          ))}
          More
        </span>
      </div>
      <DataTable caption={rest["aria-label"]} columns={["Date", "Value"]} rows={data.map((d) => [d.date, formatValue(d.value)])} />
    </div>
  );
}

/* ---------- Sparkline ---------- */

export interface SparklineProps {
  data: number[];
  /** "line" (default), "area" or "bar". */
  type?: "line" | "area" | "bar";
  color?: string;
  /** Height in px. Default 36. Width fills the container. */
  height?: number;
  /** Mark the last point. Default true for line/area. */
  showLast?: boolean;
  "aria-label"?: string;
  className?: string;
}

/** A tiny chart for trends inside cards and tables. */
export function Sparkline({ data: target, type = "line", color = "var(--ui-chart-1)", height = 36, showLast = true, className, ...rest }: SparklineProps) {
  const [ref, w] = useWidth<HTMLDivElement>();
  const data = useTweenedNumbers(target, { duration: 500 });
  const gid = React.useId().replace(/:/g, "");
  // Bars start from zero so their heights stay honest; lines use the data's own range.
  const min = type === "bar" ? Math.min(0, ...data) : Math.min(...data);
  const max = Math.max(...data);
  const pad = 3;
  const x = (i: number) => pad + (data.length <= 1 ? 0 : (i / (data.length - 1)) * (w - pad * 2));
  const y = (v: number) => pad + (1 - (v - min) / (max - min || 1)) * (height - pad * 2);
  const pts = data.map((v, i) => [x(i), y(v)] as [number, number]);
  return (
    <div ref={ref} className={cn("w-full", className)} style={{ height }} role={rest["aria-label"] ? "img" : undefined} aria-label={rest["aria-label"]} aria-hidden={rest["aria-label"] ? undefined : true}>
      {w > 0 && data.length > 0 && (
        <svg width={w} height={height} className="block overflow-visible">
          {type === "bar" ? (
            data.map((v, i) => {
              const bw = Math.max(2, (w - pad * 2) / data.length - 2);
              const bx = pad + i * ((w - pad * 2) / data.length) + 1;
              const top = y(Math.max(v, min));
              return <rect key={i} x={bx} y={top} width={bw} height={Math.max(1.5, height - pad - top)} rx={1.5} fill={color} fillOpacity={i === data.length - 1 ? 1 : 0.45} />;
            })
          ) : (
            <>
              {type === "area" && (
                <>
                  <defs>
                    <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <path d={`${monotonePath(pts)}L${x(data.length - 1)},${height}L${x(0)},${height}Z`} fill={`url(#${gid})`} />
                </>
              )}
              <path d={data.length > 2 ? monotonePath(pts) : linearPath(pts)} fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
              {showLast && <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={2.75} fill={color} stroke="var(--color-surface)" strokeWidth={1.5} />}
            </>
          )}
        </svg>
      )}
    </div>
  );
}
