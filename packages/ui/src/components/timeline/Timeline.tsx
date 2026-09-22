import * as React from "react";
import { cn } from "../../lib/cn";
import { renderIcon, type IconInput } from "../button/Button";

/*
 * Timeline — "a thread with beads".
 *   Timeline / TimelineGroup / TimelineItem / TimelineCollapse — a vertical history or process
 *   Roadmap — a horizontal, scrollable track of milestones
 *
 * The thread draws itself as it scrolls into view (scroll-driven animation where the browser
 * supports it; otherwise it's simply drawn). In a "progress" timeline the traveled part is
 * solid and the future dashed; the current step is a pulsing bead. On wide containers the
 * "alternate" layout puts items on both sides of a centered thread.
 */

export type TimelineTone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";
export type TimelineStatus = "past" | "current" | "upcoming";

type TimelineContextValue = { layout: "left" | "alternate"; variant: "feed" | "progress"; size: "sm" | "md"; animated: boolean };
const TimelineContext = React.createContext<TimelineContextValue>({ layout: "left", variant: "feed", size: "md", animated: true });

const toneBead: Record<TimelineTone, string> = {
  neutral: "border-border-strong bg-surface text-fg-muted",
  primary: "border-transparent bg-primary text-primary-fg",
  success: "border-transparent bg-success text-success-fg",
  warning: "border-transparent bg-warning text-warning-fg",
  danger: "border-transparent bg-danger text-danger-fg",
  info: "border-transparent bg-info text-info-fg",
};
const toneDot: Record<TimelineTone, string> = {
  neutral: "bg-fg-muted",
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

/* ---------- time formatting ---------- */

function toDate(t: Date | string | number) {
  return t instanceof Date ? t : new Date(t);
}

/** "2 hours ago" for recent times, "12 Sep" / "12 Sep 2025" otherwise. */
export function formatTimelineTime(t: Date | string | number, now = new Date()) {
  const d = toDate(t);
  const diff = (d.getTime() - now.getTime()) / 1000;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (abs < 45) return "just now";
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 86400 * 6) return rtf.format(Math.round(diff / 86400), "day");
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    ...(d.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
  });
}

/** "Today", "Yesterday", "Tomorrow", or "Friday, 12 September". */
export function formatTimelineDay(t: Date | string | number, now = new Date()) {
  const d = toDate(t);
  const day = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const delta = Math.round((day(d) - day(now)) / 86400000);
  if (delta === 0) return "Today";
  if (delta === -1) return "Yesterday";
  if (delta === 1) return "Tomorrow";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    ...(d.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
  });
}

/* ---------- Timeline ---------- */

export interface TimelineProps extends React.OlHTMLAttributes<HTMLOListElement> {
  /**
   * "left" (default): the thread on the left, items to the right.
   * "alternate": on wide containers, items alternate around a centered thread with times opposite.
   */
  layout?: "left" | "alternate";
  /**
   * "feed" (default): a neutral thread, for activity and history.
   * "progress": the traveled thread is solid, the future dashed — for processes and plans.
   */
  variant?: "feed" | "progress";
  size?: "sm" | "md";
  /** Draw the thread as it scrolls into view. Default true (skipped with reduced motion). */
  animated?: boolean;
}

export function Timeline({ layout = "left", variant = "feed", size = "md", animated = true, className, children, ...props }: TimelineProps) {
  return (
    <TimelineContext.Provider value={{ layout, variant, size, animated }}>
      <div className="@container w-full">
        <ol className={cn("relative grid", className)} {...props}>
          {children}
        </ol>
      </div>
    </TimelineContext.Provider>
  );
}

/* ---------- TimelineGroup ---------- */

export interface TimelineGroupProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "title"> {
  /** The heading, e.g. "Today". Or pass `date` to have it written for you. */
  label?: React.ReactNode;
  /** A date for the heading: "Today", "Yesterday", or "Friday, 12 September". */
  date?: Date | string | number;
}

/** A chapter of the timeline, e.g. a day. Its heading sticks while you scroll through it. */
export function TimelineGroup({ label, date, className, children, ...props }: TimelineGroupProps) {
  const { layout } = React.useContext(TimelineContext);
  const heading = label ?? (date !== undefined ? formatTimelineDay(date) : null);
  return (
    <li className={cn("grid", className)} {...props}>
      {heading && (
        <div
          className={cn(
            "sticky top-0 z-10 flex py-2",
            layout === "alternate" ? "justify-start @min-[48rem]:justify-center" : "justify-start"
          )}
        >
          <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-fg shadow-[var(--ui-shadow-sm)]">
            {heading}
          </span>
        </div>
      )}
      <ol className="grid">{children}</ol>
    </li>
  );
}

/* ---------- TimelineItem ---------- */

export interface TimelineItemProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "title"> {
  title: React.ReactNode;
  /** When it happened. Shown as "2 hours ago" (exact time on hover), unless you pass timeLabel. */
  time?: Date | string | number;
  /** Your own time text, e.g. "Q3 2026" or "Step 2". */
  timeLabel?: React.ReactNode;
  /** The bead: an icon, or an avatar (e.g. <Avatar size="sm" … />). Without either, a small dot. */
  icon?: IconInput;
  avatar?: React.ReactNode;
  tone?: TimelineTone;
  /** past (default), current (a pulsing bead), or upcoming (muted, dashed thread). */
  status?: TimelineStatus;
  /** Something at the right of the title, e.g. a Pill. */
  meta?: React.ReactNode;
  /** Render the body as a card, for longer content like comments. */
  card?: boolean;
  /** Hide the thread after this item (the last item does this automatically only in its group). */
  last?: boolean;
}

export function TimelineItem({
  title,
  time,
  timeLabel,
  icon,
  avatar,
  tone,
  status = "past",
  meta,
  card = false,
  last = false,
  className,
  children,
  ...props
}: TimelineItemProps) {
  const { layout, variant, size, animated } = React.useContext(TimelineContext);
  const alt = layout === "alternate";
  const bead = size === "sm" ? 24 : 30;
  const effectiveTone: TimelineTone = tone ?? (variant === "progress" ? (status === "upcoming" ? "neutral" : "primary") : "neutral");
  const date = time !== undefined ? toDate(time) : null;

  const timeNode =
    timeLabel ??
    (date && (
      <time dateTime={date.toISOString()} title={date.toLocaleString()} className="tabular-nums">
        {formatTimelineTime(date)}
      </time>
    ));

  // The thread segment below this bead, down to the next one.
  const future = status !== "past";
  const solid = variant === "progress" ? !future : true;
  const threadColor =
    variant === "progress" && !future ? "bg-primary" : "bg-border";

  const beadNode = avatar ? (
    <span className="relative z-[1] grid place-items-center rounded-full ring-4 ring-[color:var(--av-ring,var(--color-bg))]" style={{ width: bead, height: bead }}>
      {avatar}
    </span>
  ) : icon ? (
    <span
      className={cn(
        "relative z-[1] grid place-items-center rounded-full border ring-4 ring-[color:var(--color-bg)] [&_i]:text-[0.95em] [&_svg]:size-[55%]",
        toneBead[effectiveTone],
        status === "upcoming" && "border-dashed bg-surface text-fg-muted"
      )}
      style={{ width: bead, height: bead, fontSize: bead * 0.5 }}
    >
      {renderIcon(icon)}
    </span>
  ) : (
    <span className="relative z-[1] grid place-items-center" style={{ width: bead, height: bead }}>
      <span
        className={cn(
          "size-2.5 rounded-full ring-4 ring-[color:var(--color-bg)]",
          status === "upcoming" ? "border-2 border-dashed border-border-strong bg-bg" : toneDot[effectiveTone]
        )}
      />
    </span>
  );

  const currentHalo =
    status === "current" ? (
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center">
        <span className="absolute size-full animate-[ui-beacon_2s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full bg-primary/40 motion-reduce:hidden" />
      </span>
    ) : null;

  const body = (
    <div className={cn("min-w-0", card && "rounded-card border border-border bg-surface px-4 py-3")}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <div
          className={cn(
            "min-w-0 flex-1 font-medium leading-snug text-pretty",
            size === "sm" ? "text-[0.8125rem]" : "text-sm",
            status === "upcoming" ? "text-fg-muted" : "text-fg"
          )}
        >
          {title}
          {status === "current" && <span className="sr-only"> (current)</span>}
          {status === "upcoming" && <span className="sr-only"> (upcoming)</span>}
        </div>
        {meta}
        {timeNode && (
          <span className={cn("shrink-0 text-xs text-fg-muted", alt && "@min-[48rem]:hidden")}>{timeNode}</span>
        )}
      </div>
      {children && (
        <div className={cn("mt-1 text-[0.8125rem] leading-relaxed text-fg-muted", card && "text-sm text-fg")}>{children}</div>
      )}
    </div>
  );

  const thread = !last && (
    <span
      aria-hidden="true"
      className={cn(
        "absolute bottom-0 w-0.5 -translate-x-1/2",
        solid ? threadColor : "bg-[repeating-linear-gradient(to_bottom,var(--color-border-strong)_0_5px,transparent_5px_10px)]",
        animated && "ui-thread-draw"
      )}
      style={{ top: bead + 2, left: "50%" }}
    />
  );

  const rail = (
    <div className="relative flex justify-center" style={{ width: bead }}>
      <div className="relative" style={{ width: bead, height: bead }}>
        {currentHalo}
        {beadNode}
      </div>
      {thread}
    </div>
  );

  if (alt) {
    // Wide: [time | bead | card] on odd items, [card | bead | time] on even items. Narrow: like "left".
    return (
      <li
        aria-current={status === "current" ? "step" : undefined}
        className={cn(
          "group/item relative grid grid-cols-[auto_1fr] gap-x-4 pb-6 last:pb-2",
          "@min-[48rem]:grid-cols-[1fr_auto_1fr] @min-[48rem]:gap-x-6",
          className
        )}
        {...props}
      >
        <div className="hidden pt-[0.3rem] text-end text-xs text-fg-muted @min-[48rem]:block group-even/item:@min-[48rem]:order-3 group-even/item:@min-[48rem]:text-start">
          {timeNode}
        </div>
        <div className="@min-[48rem]:order-2">{rail}</div>
        <div className="min-w-0 @min-[48rem]:order-3 group-even/item:@min-[48rem]:order-1 group-even/item:@min-[48rem]:text-end [&_.flex-wrap]:group-even/item:@min-[48rem]:flex-row-reverse" style={{ paddingTop: card ? 0 : (bead - 20) / 2 }}>
          {body}
        </div>
      </li>
    );
  }

  return (
    <li
      aria-current={status === "current" ? "step" : undefined}
      className={cn("relative grid grid-cols-[auto_1fr] gap-x-3.5 pb-6 last:pb-2", className)}
      {...props}
    >
      {rail}
      <div className="min-w-0" style={{ paddingTop: card ? 0 : (bead - 20) / 2 }}>
        {body}
      </div>
    </li>
  );
}

/* ---------- TimelineCollapse ---------- */

export interface TimelineCollapseProps {
  /** e.g. (n) => `Show ${n} more updates`. */
  label?: (count: number) => React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

/** Folds several quiet items into one "Show 4 more" line on the thread. */
export function TimelineCollapse({ label = (n) => `Show ${n} more update${n === 1 ? "" : "s"}`, children, defaultOpen = false }: TimelineCollapseProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const { layout, size } = React.useContext(TimelineContext);
  const count = React.Children.count(children);
  const bead = size === "sm" ? 24 : 30;
  if (open) return <>{children}</>;
  return (
    <li
      className={cn(
        "relative grid grid-cols-[auto_1fr] items-center gap-x-3.5 pb-6",
        layout === "alternate" && "@min-[48rem]:grid-cols-[1fr_auto_1fr] @min-[48rem]:gap-x-6"
      )}
    >
      {layout === "alternate" && <span className="hidden @min-[48rem]:block" />}
      <div className="relative flex justify-center self-stretch" style={{ width: bead }}>
        <span aria-hidden="true" className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-[repeating-linear-gradient(to_bottom,var(--color-border)_0_2px,transparent_2px_6px)]" />
      </div>
      <div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="cursor-pointer rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-fg-muted hover:border-border-strong hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {label(count)}
        </button>
      </div>
    </li>
  );
}

/* ---------- Roadmap (horizontal) ---------- */

export interface RoadmapItem {
  /** Short time label on the track, e.g. "Q3 2026" or "Oct". */
  label: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  status?: "done" | "current" | "upcoming";
  /** Extra content under the description, e.g. Pills. */
  footer?: React.ReactNode;
}

export interface RoadmapProps extends React.HTMLAttributes<HTMLDivElement> {
  items: RoadmapItem[];
  /** Accessible name, e.g. "Product roadmap". */
  "aria-label": string;
  /** Width of each milestone column. Default "16rem". */
  itemWidth?: string;
}

/** A horizontal track of milestones that scrolls sideways, with snap points and edge fades. */
export function Roadmap({ items, itemWidth = "16rem", className, ...props }: RoadmapProps) {
  const scroller = React.useRef<HTMLOListElement>(null);
  const [edges, setEdges] = React.useState({ start: false, end: false });

  const update = React.useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft > 4, end: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, []);

  React.useEffect(() => {
    update();
    const el = scroller.current;
    if (!el) return;
    // Start with the current milestone in view.
    const current = el.querySelector<HTMLElement>('[aria-current="step"]');
    if (current) el.scrollLeft = Math.max(0, current.offsetLeft - el.clientWidth / 3);
    update();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [update, items.length]);

  const scrollBy = (dir: 1 | -1) => scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.8, behavior: "smooth" });

  const arrow = (dir: 1 | -1) => (
    <button
      type="button"
      aria-label={dir === 1 ? "Scroll to later milestones" : "Scroll to earlier milestones"}
      onClick={() => scrollBy(dir)}
      disabled={dir === 1 ? !edges.end : !edges.start}
      className="grid size-8 cursor-pointer place-items-center rounded-full border border-border bg-surface text-fg-muted shadow-[var(--ui-shadow-sm)] hover:text-fg disabled:cursor-default disabled:opacity-0 focus-visible:outline-2 focus-visible:outline-ring"
    >
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-4">
        <path d={dir === 1 ? "M8 5l5 5-5 5" : "M12 5l-5 5 5 5"} />
      </svg>
    </button>
  );

  return (
    <div className={cn("relative w-full", className)} {...props} role="region">
      <div className="pointer-events-none absolute inset-x-0 top-[1.9rem] z-10 flex justify-between px-1 [&>*]:pointer-events-auto">
        {arrow(-1)}
        {arrow(1)}
      </div>
      <ol
        ref={scroller}
        onScroll={update}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden motion-reduce:scroll-auto"
        style={{
          // Fade the edges that have more content beyond them.
          maskImage: `linear-gradient(to right, ${edges.start ? "transparent" : "#000"} 0, #000 3rem, #000 calc(100% - 3rem), ${edges.end ? "transparent" : "#000"} 100%)`,
          WebkitMaskImage: `linear-gradient(to right, ${edges.start ? "transparent" : "#000"} 0, #000 3rem, #000 calc(100% - 3rem), ${edges.end ? "transparent" : "#000"} 100%)`,
        }}
      >
        {items.map((item, i) => {
          const status = item.status ?? "upcoming";
          const next = items[i + 1]?.status ?? "upcoming";
          const lineAfter = status === "done" && next !== "upcoming" ? "solid" : status === "done" || status === "current" ? "half" : "dashed";
          return (
            <li
              key={i}
              aria-current={status === "current" ? "step" : undefined}
              className="grid shrink-0 snap-start content-start gap-3 pe-4"
              style={{ width: itemWidth }}
            >
              <span className={cn("text-xs font-medium tabular-nums", status === "upcoming" ? "text-fg-muted" : "text-primary")}>{item.label}</span>
              {/* the track: bead + line to the next milestone */}
              <div className="relative flex h-4 items-center">
                {i < items.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute start-4 -end-0 h-0.5",
                      lineAfter === "solid" && "bg-primary",
                      lineAfter === "half" && "bg-[linear-gradient(to_right,var(--color-primary)_0_50%,transparent_50%),repeating-linear-gradient(to_right,var(--color-border-strong)_0_6px,transparent_6px_11px)]",
                      lineAfter === "dashed" && "bg-[repeating-linear-gradient(to_right,var(--color-border-strong)_0_6px,transparent_6px_11px)]"
                    )}
                  />
                )}
                <span className="relative grid size-4 place-items-center">
                  {status === "current" && (
                    <span aria-hidden="true" className="absolute size-full animate-[ui-beacon_2s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full bg-primary/40 motion-reduce:hidden" />
                  )}
                  <span
                    className={cn(
                      "relative grid size-4 place-items-center rounded-full",
                      status === "done" && "bg-primary text-primary-fg",
                      status === "current" && "border-[3px] border-primary bg-surface",
                      status === "upcoming" && "border-2 border-dashed border-border-strong bg-surface"
                    )}
                  >
                    {status === "done" && (
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-2.5">
                        <path d="M4.5 10.5l3.5 3.5 7.5-8" />
                      </svg>
                    )}
                  </span>
                </span>
              </div>
              <div
                className={cn(
                  "grid gap-1 rounded-card border p-3.5",
                  status === "current" ? "border-primary bg-[color:color-mix(in_srgb,var(--color-primary)_5%,var(--color-surface))]" : "border-border bg-surface",
                  status === "upcoming" && "border-dashed"
                )}
              >
                <p className={cn("text-sm font-semibold leading-snug", status === "upcoming" ? "text-fg-muted" : "text-fg")}>
                  {item.title}
                  <span className="sr-only"> — {status === "done" ? "done" : status === "current" ? "in progress" : "planned"}</span>
                </p>
                {item.description && <p className="text-[0.8125rem] leading-relaxed text-fg-muted">{item.description}</p>}
                {item.footer && <div className="mt-1.5 flex flex-wrap gap-1.5">{item.footer}</div>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
