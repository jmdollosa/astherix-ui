import * as React from "react";
import { cn } from "../../lib/cn";

/*
 * Activity indicators — ways to show that something is happening:
 *   ActivityIndicator  spinner, dots, bars, pulse or orbit, for "working on it"
 *   ProgressBar        linear progress, with a known value or indeterminate
 *   ProgressRing       circular progress with the value in the middle
 *   Skeleton           placeholder shapes while content loads
 *   ActivitySteps      a multi-step job (upload → process → publish) and where it's at
 *   LoadingOverlay     covers a region while it refreshes
 * All respect reduced motion and announce themselves to screen readers.
 */

export type ActivityTone = "primary" | "neutral" | "current" | "success" | "warning" | "danger" | "info";

const toneVar: Record<ActivityTone, string> = {
  primary: "[--ai:var(--color-primary)]",
  neutral: "[--ai:var(--color-fg-muted)]",
  current: "[--ai:currentColor]",
  success: "[--ai:var(--color-success)]",
  warning: "[--ai:var(--color-warning)]",
  danger: "[--ai:var(--color-danger)]",
  info: "[--ai:var(--color-info)]",
};

const sizePx = { xs: 12, sm: 16, md: 24, lg: 40, xl: 56 } as const;
export type ActivitySize = keyof typeof sizePx;

/* ---------- ActivityIndicator ---------- */

export interface ActivityIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * - "spinner": a spinning arc (general loading)
   * - "dots": three bouncing dots (someone is typing, a reply is coming)
   * - "bars": an equalizer (listening, processing audio or data)
   * - "pulse": a beacon (live, connected, recording)
   * - "orbit": a light with a fading tail circling a ring
   */
  variant?: "spinner" | "dots" | "bars" | "pulse" | "orbit";
  size?: ActivitySize;
  tone?: ActivityTone;
  /** What's happening, e.g. "Loading invoices". Read by screen readers; shown with showLabel. */
  label?: string;
  showLabel?: boolean;
  /** Put the label beside ("inline") or under ("stacked") the indicator. */
  labelPosition?: "inline" | "stacked";
}

export function ActivityIndicator({
  variant = "spinner",
  size = "md",
  tone = "primary",
  label = "Loading",
  showLabel = false,
  labelPosition = "inline",
  className,
  ...props
}: ActivityIndicatorProps) {
  const px = sizePx[size];
  return (
    <span
      role="status"
      className={cn(
        toneVar[tone],
        "inline-flex items-center",
        labelPosition === "stacked" && showLabel ? "flex-col gap-2.5" : "gap-2.5",
        className
      )}
      {...props}
    >
      <span aria-hidden="true" className="relative inline-grid shrink-0 place-items-center" style={{ width: px, height: px }}>
        <Figure variant={variant} px={px} />
      </span>
      {showLabel ? (
        <span className={cn("text-sm text-fg-muted", size === "xs" || size === "sm" ? "text-[0.8125rem]" : "")}>{label}</span>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </span>
  );
}

function Figure({ variant, px }: { variant: NonNullable<ActivityIndicatorProps["variant"]>; px: number }) {
  const stroke = Math.max(1.5, px / 10);
  switch (variant) {
    case "spinner": {
      const r = (px - stroke) / 2;
      const c = 2 * Math.PI * r;
      return (
        <svg width={px} height={px} viewBox={`0 0 ${px} ${px}`} fill="none" className="animate-spin [animation-duration:0.8s] motion-reduce:[animation-duration:2.4s]">
          <circle cx={px / 2} cy={px / 2} r={r} stroke="var(--ai)" strokeOpacity={0.18} strokeWidth={stroke} />
          <circle cx={px / 2} cy={px / 2} r={r} stroke="var(--ai)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${c * 0.28} ${c}`} />
        </svg>
      );
    }
    case "dots": {
      const d = Math.max(3, px / 4.5);
      return (
        <span className="flex items-center" style={{ gap: d * 0.55 }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="rounded-full bg-[color:var(--ai)] animate-[ui-dot_1.2s_ease-in-out_infinite] motion-reduce:animate-[ui-breathe_1.6s_ease-in-out_infinite]"
              style={{ width: d, height: d, animationDelay: `${i * 0.16}s` }}
            />
          ))}
        </span>
      );
    }
    case "bars": {
      const w = Math.max(2, px / 7);
      return (
        <span className="flex items-center" style={{ height: px * 0.8, gap: w * 0.7 }}>
          {[0.1, 0.35, 0, 0.25].map((delay, i) => (
            <span
              key={i}
              className="h-full origin-center rounded-full bg-[color:var(--ai)] animate-[ui-eq_0.9s_ease-in-out_infinite] motion-reduce:animate-[ui-breathe_1.6s_ease-in-out_infinite]"
              style={{ width: w, animationDelay: `${-delay * 3}s` }}
            />
          ))}
        </span>
      );
    }
    case "pulse":
      return (
        <>
          {[0, 1].map((i) => (
            <span
              key={i}
              className="absolute inset-0 rounded-full bg-[color:var(--ai)] animate-[ui-beacon_1.8s_cubic-bezier(0,0,0.2,1)_infinite] motion-reduce:hidden"
              style={{ animationDelay: `${i * 0.9}s` }}
            />
          ))}
          <span className="relative rounded-full bg-[color:var(--ai)]" style={{ width: px * 0.36, height: px * 0.36 }} />
        </>
      );
    case "orbit":
      return (
        <>
          <span className="absolute inset-0 rounded-full border-[color:color-mix(in_srgb,var(--ai)_16%,transparent)]" style={{ borderWidth: stroke }} />
          <span
            className="ui-orbit-ring absolute inset-0 animate-spin [animation-duration:1s] motion-reduce:[animation-duration:3s]"
            style={{ ["--ai-thickness" as string]: `${stroke}px` }}
          />
        </>
      );
  }
}

/* ---------- ProgressBar ---------- */

export interface ProgressBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** 0–max. Leave out for an indeterminate bar. */
  value?: number;
  max?: number;
  /** Visible label above the bar (also its accessible name). */
  label?: React.ReactNode;
  /** Show the value at the right: true for a percentage, or pass your own text. */
  showValue?: boolean | ((value: number, max: number) => React.ReactNode);
  /** Accessible text for the value, e.g. "3 of 5 files". */
  valueText?: string;
  size?: "sm" | "md" | "lg";
  tone?: Exclude<ActivityTone, "current">;
  /** Moving stripes on the fill, for work that's actively running. */
  striped?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  valueText,
  size = "md",
  tone = "primary",
  striped = false,
  className,
  "aria-label": ariaLabel,
  ...props
}: ProgressBarProps) {
  const labelId = React.useId();
  const determinate = typeof value === "number";
  const pct = determinate ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const valueNode =
    determinate && showValue ? (typeof showValue === "function" ? showValue(value, max) : `${Math.round(pct)}%`) : null;

  return (
    <div className={cn(toneVar[tone], "grid w-full gap-1.5", className)} {...props}>
      {(label || valueNode) && (
        <div className="flex items-baseline justify-between gap-3 text-sm">
          {label && <span id={labelId} className="font-medium text-fg">{label}</span>}
          {valueNode && <span className="tabular-nums text-fg-muted">{valueNode}</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : (ariaLabel ?? "Progress")}
        aria-valuemin={determinate ? 0 : undefined}
        aria-valuemax={determinate ? max : undefined}
        aria-valuenow={determinate ? value : undefined}
        aria-valuetext={valueText}
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-[color:color-mix(in_srgb,var(--ai)_14%,var(--color-secondary-hover))]",
          size === "sm" ? "h-1" : size === "lg" ? "h-3" : "h-2"
        )}
      >
        {determinate ? (
          <div
            className={cn(
              "h-full rounded-full bg-[color:var(--ai)] transition-[width] duration-300 ease-out motion-reduce:transition-none",
              striped &&
                "bg-[linear-gradient(135deg,rgb(255_255_255/0.22)_25%,transparent_25%,transparent_50%,rgb(255_255_255/0.22)_50%,rgb(255_255_255/0.22)_75%,transparent_75%)] bg-[length:14px_14px] animate-[ui-stripes_0.8s_linear_infinite] motion-reduce:animate-none"
            )}
            style={{ width: `${pct}%` }}
          />
        ) : (
          <div className="absolute inset-y-0 w-2/5 rounded-full bg-[color:var(--ai)] animate-[ui-indeterminate_1.4s_cubic-bezier(0.4,0,0.2,1)_infinite] motion-reduce:w-full motion-reduce:animate-[ui-breathe_1.8s_ease-in-out_infinite]" />
        )}
      </div>
    </div>
  );
}

/* ---------- ProgressRing ---------- */

export interface ProgressRingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** 0–max. Leave out for an indeterminate (spinning) ring. */
  value?: number;
  max?: number;
  size?: "sm" | "md" | "lg" | "xl";
  tone?: Exclude<ActivityTone, "current">;
  /** What's in the middle: true for a percentage, or your own content. Default true from "md" up. */
  children?: React.ReactNode;
  showValue?: boolean;
  /** Accessible name, e.g. "Storage used". */
  label?: string;
  valueText?: string;
}

const ringPx = { sm: 32, md: 48, lg: 72, xl: 112 } as const;

export function ProgressRing({
  value,
  max = 100,
  size = "md",
  tone = "primary",
  showValue,
  label = "Progress",
  valueText,
  children,
  className,
  ...props
}: ProgressRingProps) {
  const px = ringPx[size];
  const stroke = size === "sm" ? 3.5 : size === "md" ? 4.5 : size === "lg" ? 6 : 8;
  const r = (px - stroke) / 2;
  const c = 2 * Math.PI * r;
  const determinate = typeof value === "number";
  const pct = determinate ? Math.min(100, Math.max(0, (value / max) * 100)) : 25;
  const center = children ?? ((showValue ?? size !== "sm") && determinate ? `${Math.round(pct)}%` : null);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={determinate ? 0 : undefined}
      aria-valuemax={determinate ? max : undefined}
      aria-valuenow={determinate ? value : undefined}
      aria-valuetext={valueText}
      className={cn(toneVar[tone], "relative inline-grid shrink-0 place-items-center", className)}
      style={{ width: px, height: px }}
      {...props}
    >
      <svg
        width={px}
        height={px}
        viewBox={`0 0 ${px} ${px}`}
        fill="none"
        aria-hidden="true"
        className={cn("-rotate-90", !determinate && "animate-spin [animation-duration:1s] motion-reduce:[animation-duration:3s]")}
      >
        <circle cx={px / 2} cy={px / 2} r={r} stroke="color-mix(in srgb, var(--ai) 14%, var(--color-secondary-hover))" strokeWidth={stroke} />
        <circle
          cx={px / 2}
          cy={px / 2}
          r={r}
          stroke="var(--ai)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
          className="transition-[stroke-dashoffset] duration-500 ease-out motion-reduce:transition-none"
        />
      </svg>
      {center !== null && (
        <span
          className={cn(
            "absolute inset-0 grid place-items-center font-semibold tabular-nums text-fg",
            size === "md" ? "text-xs" : size === "lg" ? "text-base" : size === "xl" ? "text-2xl" : "text-[0.625rem]"
          )}
        >
          {center}
        </span>
      )}
    </div>
  );
}

/* ---------- Skeleton ---------- */

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "rect" (default), "circle", or "text" lines. */
  shape?: "rect" | "circle" | "text";
  /** Number of lines for shape="text". The last line is shorter. */
  lines?: number;
}

/** Placeholder shapes while content loads. Size it with classes, e.g. className="h-24 w-full". */
export function Skeleton({ shape = "rect", lines = 3, className, ...props }: SkeletonProps) {
  if (shape === "text") {
    return (
      <div aria-hidden="true" className={cn("grid w-full gap-2", className)} {...props}>
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className="ui-skeleton h-3 rounded-full" style={{ width: i === lines - 1 && lines > 1 ? "62%" : "100%" }} />
        ))}
      </div>
    );
  }
  return (
    <div
      aria-hidden="true"
      className={cn("ui-skeleton", shape === "circle" ? "aspect-square rounded-full" : "rounded-control", className)}
      {...props}
    />
  );
}

/* ---------- ActivitySteps ---------- */

export type StepStatus = "done" | "active" | "pending" | "error" | "skipped";

export interface ActivityStep {
  label: React.ReactNode;
  description?: React.ReactNode;
  status: StepStatus;
  /** Extra detail at the right, e.g. a duration ("12s"). */
  meta?: React.ReactNode;
}

export interface ActivityStepsProps extends React.HTMLAttributes<HTMLOListElement> {
  steps: ActivityStep[];
  orientation?: "vertical" | "horizontal";
  size?: "sm" | "md";
}

const statusText: Record<StepStatus, string> = {
  done: "Done",
  active: "In progress",
  pending: "Not started",
  error: "Failed",
  skipped: "Skipped",
};

function StepMarker({ status, px }: { status: StepStatus; px: number }) {
  const base = "relative z-10 grid shrink-0 place-items-center rounded-full";
  const icon = "size-[60%]";
  if (status === "done")
    return (
      <span className={cn(base, "bg-primary text-primary-fg")} style={{ width: px, height: px }}>
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" className={icon}>
          <path d="M4.5 10.5l3.5 3.5 7.5-8" />
        </svg>
      </span>
    );
  if (status === "error")
    return (
      <span className={cn(base, "bg-danger text-danger-fg")} style={{ width: px, height: px }}>
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" className={icon}>
          <path d="M10 5.5v5.5M10 14.5v.01" />
        </svg>
      </span>
    );
  if (status === "active")
    return (
      <span className={cn(base, "bg-surface [--ai:var(--color-primary)]")} style={{ width: px, height: px }}>
        <span className="absolute inset-0 rounded-full border-2 border-[color:color-mix(in_srgb,var(--color-primary)_20%,transparent)]" />
        <span className="ui-orbit-ring absolute inset-0 animate-spin [--ai-thickness:2px] [animation-duration:1s] motion-reduce:[animation-duration:3s]" />
        <span className="size-[30%] rounded-full bg-primary" />
      </span>
    );
  return (
    <span
      className={cn(base, "border-2 border-border-strong bg-surface", status === "skipped" && "border-dashed")}
      style={{ width: px, height: px }}
    />
  );
}

export function ActivitySteps({ steps, orientation = "vertical", size = "md", className, ...props }: ActivityStepsProps) {
  const px = size === "sm" ? 18 : 24;
  const vertical = orientation === "vertical";
  return (
    <ol className={cn(vertical ? "grid" : "flex w-full items-start", className)} {...props}>
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        const lineDone = step.status === "done" || step.status === "skipped";
        return (
          <li
            key={i}
            aria-current={step.status === "active" ? "step" : undefined}
            className={cn("relative", vertical ? "flex gap-3" : "flex flex-1 flex-col items-center text-center", vertical && !last && "pb-5")}
          >
            {/* connector to the next step */}
            {!last && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute",
                  lineDone ? "bg-primary" : "bg-border",
                  vertical ? "w-0.5" : "h-0.5"
                )}
                style={
                  vertical
                    ? { left: px / 2 - 1, top: px + 4, bottom: 4 }
                    : { top: px / 2 - 1, left: `calc(50% + ${px / 2 + 6}px)`, right: `calc(-50% + ${px / 2 + 6}px)` }
                }
              />
            )}
            <StepMarker status={step.status} px={px} />
            <div className={cn("min-w-0", vertical ? "flex-1 pt-0.5" : "mt-2 px-2")}>
              <div className={cn("flex items-baseline gap-3", !vertical && "justify-center")}>
                <span
                  className={cn(
                    "font-medium",
                    size === "sm" ? "text-[0.8125rem]" : "text-sm",
                    step.status === "pending" || step.status === "skipped" ? "text-fg-muted" : "text-fg",
                    step.status === "error" && "text-danger"
                  )}
                >
                  {step.label}
                  <span className="sr-only"> — {statusText[step.status]}</span>
                </span>
                {vertical && step.meta && <span className="ms-auto text-xs tabular-nums text-fg-muted">{step.meta}</span>}
              </div>
              {step.description && (
                <p className={cn("mt-0.5 text-[0.8125rem] leading-relaxed", step.status === "error" ? "text-danger" : "text-fg-muted")}>
                  {step.description}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ---------- LoadingOverlay ---------- */

export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  loading: boolean;
  /** Shown under the indicator and read by screen readers. */
  label?: string;
  variant?: ActivityIndicatorProps["variant"];
  /** Wait this long (ms) before showing, so quick refreshes don't flash. Default 150. */
  delay?: number;
}

/** Covers its children while loading: dims them, blocks clicks, and shows an indicator. */
export function LoadingOverlay({ loading, label = "Loading", variant = "spinner", delay = 150, className, children, ...props }: LoadingOverlayProps) {
  const [visible, setVisible] = React.useState(loading && delay === 0);
  React.useEffect(() => {
    if (!loading) return setVisible(false);
    const t = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(t);
  }, [loading, delay]);

  // inert keeps keyboard focus and clicks out of the covered content (set directly for React 18 and 19).
  const contentRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    if (visible) el.setAttribute("inert", "");
    else el.removeAttribute("inert");
  }, [visible]);

  return (
    <div className={cn("relative", className)} aria-busy={loading || undefined} {...props}>
      <div
        ref={contentRef}
        className={cn("transition-opacity duration-200", visible && "opacity-40")}
      >
        {children}
      </div>
      {visible && (
        <div className="absolute inset-0 z-10 grid place-items-center rounded-[inherit] animate-[ui-fade-in_150ms_ease-out]">
          <div className="rounded-control-lg border border-border bg-surface/90 px-4 py-3 shadow-[var(--ui-shadow-md)] backdrop-blur-sm">
            <ActivityIndicator variant={variant} size="sm" label={label} showLabel />
          </div>
        </div>
      )}
    </div>
  );
}
