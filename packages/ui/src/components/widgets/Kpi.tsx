import * as React from "react";
import { cn } from "../../lib/cn";
import { renderIcon, type IconInput } from "../button/Button";
import { Skeleton } from "../activity/Activity";
import { Sparkline } from "./Shapes";

/* KpiCard, WidgetCard and DashboardGrid. */

/* ---------- KpiCard ---------- */

export interface KpiCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  label: React.ReactNode;
  /** The headline number, already formatted: "₱312,400". */
  value: React.ReactNode;
  /** Change vs the previous period, as a percentage (8.2 or -4.1). */
  change?: number;
  /** Text after the change. Default "vs last period". */
  changeLabel?: string;
  /** For numbers where going down is good (costs, churn, overdue): flips the colors. */
  invertTrend?: boolean;
  icon?: IconInput;
  /** A small trend chart under the number. */
  sparkline?: number[];
  sparklineType?: "line" | "area" | "bar";
  /** Progress toward a goal: 0–1 plus a label like "78% of ₱400K target". */
  progress?: { value: number; label?: React.ReactNode };
  /** Makes the whole card a link. */
  href?: string;
  loading?: boolean;
}

export function KpiCard({
  label,
  value,
  change,
  changeLabel = "vs last period",
  invertTrend = false,
  icon,
  sparkline,
  sparklineType = "area",
  progress,
  href,
  loading = false,
  className,
  ...props
}: KpiCardProps) {
  const up = change !== undefined && change > 0;
  const down = change !== undefined && change < 0;
  const good = invertTrend ? down : up;
  const bad = invertTrend ? up : down;
  const trendColor = good ? "var(--color-success)" : bad ? "var(--color-danger)" : "var(--ui-chart-1)";
  const Root = href ? "a" : "div";

  return (
    <Root
      {...(href ? { href } : {})}
      className={cn(
        "group/kpi relative flex min-w-0 flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-[var(--ui-shadow-sm)]",
        href && "outline-none transition-[box-shadow,border-color] hover:border-border-strong hover:shadow-[var(--ui-shadow-md)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className
      )}
      aria-busy={loading || undefined}
      {...(props as React.HTMLAttributes<HTMLElement>)}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-fg-muted">{label}</p>
        {icon && (
          <span className="grid size-8 shrink-0 place-items-center rounded-control bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-primary [&_svg]:size-4" aria-hidden="true">
            {renderIcon(icon)}
          </span>
        )}
      </div>
      {loading ? (
        <div className="grid gap-2">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ) : (
        <>
          <div className="grid gap-1">
            <p className="text-[1.75rem] font-semibold leading-none tracking-[-0.02em] tabular-nums text-fg">{value}</p>
            {change !== undefined && (
              <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-fg-muted">
                <span
                  className={cn("inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold tabular-nums", good && "bg-[color:color-mix(in_srgb,var(--color-success)_12%,transparent)] text-success", bad && "bg-[color:color-mix(in_srgb,var(--color-danger)_12%,transparent)] text-danger", !good && !bad && "bg-secondary-hover text-fg-muted")}
                >
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={cn("size-3", down && "rotate-180", !up && !down && "hidden")}>
                    <path d="M6 9.5v-7M3 5l3-3 3 3" />
                  </svg>
                  <span className="sr-only">{up ? "Up" : down ? "Down" : "No change"} </span>
                  {Math.abs(change).toLocaleString(undefined, { maximumFractionDigits: 1 })}%
                </span>
                {changeLabel}
              </p>
            )}
          </div>
          {sparkline && sparkline.length > 1 && <Sparkline data={sparkline} type={sparklineType} color={trendColor} height={40} />}
          {progress && (
            <div className="grid gap-1.5">
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(Math.min(1, progress.value) * 100)}
                aria-label="Progress to target"
                className="h-1.5 overflow-hidden rounded-full bg-secondary-hover"
              >
                <div className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out" style={{ width: `${Math.min(1, Math.max(0, progress.value)) * 100}%` }} />
              </div>
              {progress.label && <p className="text-xs text-fg-muted">{progress.label}</p>}
            </div>
          )}
        </>
      )}
    </Root>
  );
}

/* ---------- WidgetCard ---------- */

export interface WidgetCardProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Controls at the top right, e.g. a period picker. */
  action?: React.ReactNode;
  /** A big number under the title (e.g. the total the chart shows). */
  value?: React.ReactNode;
  loading?: boolean;
  /** Shown instead of the content when there's nothing to show. */
  empty?: React.ReactNode;
  /** Shown instead of the content when loading failed. */
  error?: React.ReactNode;
  onRetry?: () => void;
  footer?: React.ReactNode;
}

/** The frame for a dashboard widget: title, controls, and loading / empty / error states. */
export function WidgetCard({ title, description, action, value, loading, empty, error, onRetry, footer, className, children, ...props }: WidgetCardProps) {
  const id = React.useId();
  return (
    <section
      aria-labelledby={id}
      aria-busy={loading || undefined}
      className={cn("flex min-w-0 flex-col gap-4 rounded-card border border-border bg-surface p-4 shadow-[var(--ui-shadow-sm)] sm:p-5", className)}
      {...props}
    >
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="grid min-w-0 gap-0.5">
          <h3 id={id} className="text-sm font-semibold text-fg">{title}</h3>
          {description && <p className="text-xs text-fg-muted">{description}</p>}
          {value !== undefined && !loading && <p className="mt-1 text-2xl font-semibold tracking-[-0.02em] tabular-nums text-fg">{value}</p>}
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </header>
      <div className="relative min-w-0 flex-1">
        {loading ? (
          <div className="grid h-full min-h-40 content-end gap-2" aria-label="Loading">
            <div className="flex h-32 items-end gap-2">
              {[40, 65, 50, 80, 60, 90, 70].map((h, i) => (
                <Skeleton key={i} className="flex-1 rounded-b-none" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        ) : error ? (
          <div role="alert" className="grid min-h-40 place-content-center justify-items-center gap-2 text-center text-sm text-fg-muted">
            <span className="grid size-9 place-items-center rounded-full bg-[color:color-mix(in_srgb,var(--color-danger)_12%,transparent)] text-danger" aria-hidden="true">!</span>
            <p>{error}</p>
            {onRetry && (
              <button type="button" onClick={onRetry} className="cursor-pointer rounded-control-sm px-2 py-1 text-xs font-medium text-primary hover:bg-secondary-hover">
                Try again
              </button>
            )}
          </div>
        ) : empty ? (
          <div className="grid min-h-40 place-content-center text-center text-sm text-fg-muted">{empty}</div>
        ) : (
          children
        )}
      </div>
      {footer && <footer className="border-t border-border pt-3 text-xs text-fg-muted">{footer}</footer>}
    </section>
  );
}

/* ---------- DashboardGrid ---------- */

export interface DashboardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Columns on wide screens. Default 4. It steps down to 2 and then 1 as space shrinks. */
  columns?: 2 | 3 | 4 | 6 | 12;
}

/** A responsive grid for widgets. Give a child `data-span="2"` (or use DashboardGrid.Item) to make it wider. */
export function DashboardGrid({ columns = 4, className, style, ...props }: DashboardGridProps) {
  return (
    <div className="@container w-full">
      <div
        className={cn(
          "grid grid-cols-1 gap-4 @[36rem]:grid-cols-2 @[64rem]:grid-cols-[repeat(var(--dg-cols),minmax(0,1fr))]",
          "[&>[data-span='2']]:@[36rem]:col-span-2 [&>[data-span='3']]:@[36rem]:col-span-2 [&>[data-span='3']]:@[64rem]:col-span-3 [&>[data-span='4']]:@[36rem]:col-span-2 [&>[data-span='4']]:@[64rem]:col-span-4 [&>[data-span='full']]:col-span-full",
          className
        )}
        style={{ ["--dg-cols" as string]: columns, ...style }}
        {...props}
      />
    </div>
  );
}
