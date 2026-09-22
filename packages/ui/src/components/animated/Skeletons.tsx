import * as React from "react";
import { cn } from "../../lib/cn";
import { Skeleton, type SkeletonProps } from "../activity/Activity";

/*
 * Skeleton pieces and whole-block presets, plus SkeletonSwap — which shows the skeleton only when
 * loading actually takes a moment, and keeps it up long enough to be read, so nothing flashes.
 *
 *   <SkeletonSwap loading={isLoading} skeleton={<SkeletonCard />}><Invoice … /></SkeletonSwap>
 */

type Anim = SkeletonProps["animation"];
type Common = { animation?: Anim; className?: string };

/* ---------- pieces ---------- */

export interface SkeletonTextProps extends Common {
  /** How many lines. Default 3. */
  lines?: number;
  /** Width of the last line. Default "62%". */
  lastLineWidth?: string;
  /** Line thickness, e.g. "0.75rem" for bigger text. */
  lineHeight?: string;
  width?: string | number;
}

/** Lines of text, with a shorter last line and a gentle ripple down the stack. */
export function SkeletonText({ lines = 3, lastLineWidth = "62%", lineHeight, width, animation, className }: SkeletonTextProps) {
  return (
    <div aria-hidden="true" className={cn("grid w-full gap-2", className)} style={width !== undefined ? { width } : undefined}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          shape="line"
          animation={animation}
          delay={i * 90}
          style={{ width: i === lines - 1 && lines > 1 ? lastLineWidth : "100%", ...(lineHeight ? { height: lineHeight } : {}) }}
        />
      ))}
    </div>
  );
}

export interface SkeletonAvatarProps extends Common {
  /** Matches the Avatar sizes. */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  shape?: "circle" | "square";
}
const avatarPx = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64, "2xl": 80 } as const;

/** A round (or square) placeholder for a profile picture. */
export function SkeletonAvatar({ size = "md", shape = "circle", animation, className }: SkeletonAvatarProps) {
  const px = avatarPx[size];
  return <Skeleton shape={shape === "circle" ? "circle" : "rect"} animation={animation} width={px} height={px} className={className} />;
}

export interface SkeletonButtonProps extends Common {
  size?: "sm" | "md" | "lg";
  width?: number | string;
}
/** A button-shaped placeholder. */
export function SkeletonButton({ size = "md", width = 104, animation, className }: SkeletonButtonProps) {
  const h = size === "sm" ? 32 : size === "lg" ? 48 : 40;
  return <Skeleton animation={animation} width={width} height={h} radius="var(--radius-control)" className={className} />;
}

export interface SkeletonImageProps extends Common {
  /** e.g. "16/9" (default), "1/1", "4/3". */
  ratio?: string;
  radius?: string;
}
/** A picture-shaped placeholder that keeps its aspect ratio. */
export function SkeletonImage({ ratio = "16/9", radius = "var(--radius-card)", animation, className }: SkeletonImageProps) {
  return <Skeleton animation={animation} radius={radius} className={cn("w-full", className)} style={{ aspectRatio: ratio }} />;
}

/* ---------- block presets ---------- */

export interface SkeletonCardProps extends Common {
  /** Show a picture at the top. */
  media?: boolean;
  /** Show an avatar and two short lines in the header. */
  header?: boolean;
  lines?: number;
  /** Show buttons at the bottom. */
  footer?: boolean;
}

/** A card-shaped placeholder: optional picture, header, lines of text and buttons. */
export function SkeletonCard({ media = false, header = true, lines = 3, footer = false, animation, className }: SkeletonCardProps) {
  return (
    <div aria-hidden="true" className={cn("grid gap-4 rounded-card border border-border bg-surface p-4", className)}>
      {media && <SkeletonImage animation={animation} />}
      {header && (
        <div className="flex items-center gap-3">
          <SkeletonAvatar size="md" animation={animation} />
          <div className="grid flex-1 gap-2">
            <Skeleton shape="line" animation={animation} style={{ width: "45%" }} />
            <Skeleton shape="line" animation={animation} delay={90} style={{ width: "28%", height: "0.625rem" }} />
          </div>
        </div>
      )}
      {lines > 0 && <SkeletonText lines={lines} animation={animation} />}
      {footer && (
        <div className="flex gap-2">
          <SkeletonButton size="sm" animation={animation} />
          <SkeletonButton size="sm" width={84} animation={animation} />
        </div>
      )}
    </div>
  );
}

export interface SkeletonListProps extends Common {
  /** How many rows. Default 5. */
  rows?: number;
  /** An avatar at the start of each row. Default true. */
  avatar?: boolean;
  /** A value at the end of each row (amount, date). Default true. */
  trailing?: boolean;
  /** Put a border and dividers around it. Default true. */
  bordered?: boolean;
}

/** Rows of a list: avatar, two lines, and a value on the right. */
export function SkeletonList({ rows = 5, avatar = true, trailing = true, bordered = true, animation, className }: SkeletonListProps) {
  return (
    <div aria-hidden="true" className={cn("grid", bordered && "divide-y divide-border rounded-card border border-border bg-surface", className)}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          {avatar && <SkeletonAvatar size="sm" animation={animation} />}
          <div className="grid flex-1 gap-2">
            <Skeleton shape="line" animation={animation} delay={i * 70} style={{ width: `${55 + ((i * 13) % 30)}%` }} />
            <Skeleton shape="line" animation={animation} delay={i * 70 + 90} style={{ width: `${28 + ((i * 17) % 22)}%`, height: "0.625rem" }} />
          </div>
          {trailing && <Skeleton shape="line" animation={animation} delay={i * 70} style={{ width: 64 }} />}
        </div>
      ))}
    </div>
  );
}

export interface SkeletonTableProps extends Common {
  rows?: number;
  columns?: number;
  /** Show a header row. Default true. */
  header?: boolean;
}

/** A table-shaped placeholder that matches DataTable's rhythm. */
export function SkeletonTable({ rows = 5, columns = 4, header = true, animation, className }: SkeletonTableProps) {
  const cols = `repeat(${columns}, minmax(0, 1fr))`;
  return (
    <div aria-hidden="true" className={cn("overflow-hidden rounded-card border border-border bg-surface", className)}>
      {header && (
        <div className="grid gap-4 border-b border-border bg-secondary-hover/40 px-4 py-3" style={{ gridTemplateColumns: cols }}>
          {Array.from({ length: columns }, (_, i) => (
            <Skeleton key={i} shape="line" animation={animation} style={{ width: i === 0 ? "60%" : "45%", height: "0.625rem" }} />
          ))}
        </div>
      )}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="grid gap-4 px-4 py-3.5" style={{ gridTemplateColumns: cols }}>
            {Array.from({ length: columns }, (_, c) => (
              <Skeleton key={c} shape="line" animation={animation} delay={r * 70 + c * 30} style={{ width: c === 0 ? "80%" : `${45 + ((r * 11 + c * 7) % 35)}%` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export interface SkeletonChartProps extends Common {
  /** "bars" (default) or "line". */
  variant?: "bars" | "line";
  height?: number;
  bars?: number;
}

/** A chart-shaped placeholder for dashboard widgets. */
export function SkeletonChart({ variant = "bars", height = 180, bars = 8, animation, className }: SkeletonChartProps) {
  const heights = [52, 74, 61, 88, 70, 95, 66, 80, 58, 90, 72, 84];
  return (
    <div aria-hidden="true" className={cn("grid gap-3", className)} style={{ height }}>
      {variant === "bars" ? (
        <div className="flex items-end gap-2">
          {Array.from({ length: bars }, (_, i) => (
            <Skeleton key={i} animation={animation} delay={i * 60} radius="0.375rem 0.375rem 0 0" className="flex-1" style={{ height: `${heights[i % heights.length]}%` }} />
          ))}
        </div>
      ) : (
        <div className="relative w-full overflow-hidden rounded-card">
          <Skeleton animation={animation} className="size-full" radius="var(--radius-card)" />
        </div>
      )}
      <div className="flex justify-between">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} shape="line" animation={animation} delay={i * 60} style={{ width: 36, height: "0.5rem" }} />
        ))}
      </div>
    </div>
  );
}

/* ---------- SkeletonSwap ---------- */

export interface UseDelayedLoadingOptions {
  /** Wait this long before showing the skeleton, so quick loads never flash one. Default 180ms. */
  delay?: number;
  /** Once shown, keep it at least this long, so it isn't a blink. Default 500ms. */
  minDuration?: number;
}

/**
 * Turns a raw loading flag into one that's pleasant to look at: nothing for quick loads,
 * and no half-frame flicker for slow ones.
 */
export function useDelayedLoading(loading: boolean, { delay = 180, minDuration = 500 }: UseDelayedLoadingOptions = {}) {
  const [show, setShow] = React.useState(false);
  const shownAt = React.useRef(0);
  React.useEffect(() => {
    let t: number;
    if (loading) {
      t = window.setTimeout(() => {
        shownAt.current = Date.now();
        setShow(true);
      }, delay);
    } else if (show) {
      const left = Math.max(0, minDuration - (Date.now() - shownAt.current));
      t = window.setTimeout(() => setShow(false), left);
    }
    return () => window.clearTimeout(t);
  }, [loading, delay, minDuration, show]);
  return show;
}

export interface SkeletonSwapProps extends UseDelayedLoadingOptions, React.HTMLAttributes<HTMLDivElement> {
  loading: boolean;
  /** What to show while loading, e.g. <SkeletonCard />. */
  skeleton: React.ReactNode;
  /** What's being loaded, for screen readers: "Loading invoices". */
  label?: string;
  /** Cross-fade in ms. Default 250. */
  fade?: number;
}

/** Shows a skeleton while loading, then cross-fades to the real content. */
export function SkeletonSwap({ loading, skeleton, label = "Loading", fade = 250, delay, minDuration, className, children, ...props }: SkeletonSwapProps) {
  const show = useDelayedLoading(loading, { delay, minDuration });
  return (
    <div className={cn("relative min-w-0", className)} aria-busy={show || undefined} {...props}>
      {show ? (
        <div role="status" className="motion-safe:animate-[ui-fade-in_200ms_ease-out]" style={{ transitionDuration: `${fade}ms` }}>
          {skeleton}
          <span className="sr-only">{label}…</span>
        </div>
      ) : (
        <div className="motion-safe:animate-[ui-fade-in_var(--swap-fade)_ease-out]" style={{ ["--swap-fade" as string]: `${fade}ms` }}>
          {children}
        </div>
      )}
    </div>
  );
}
