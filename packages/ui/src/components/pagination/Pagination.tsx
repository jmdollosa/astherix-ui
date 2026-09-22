import * as React from "react";
import { cn } from "../../lib/cn";
import { Button } from "../button/Button";
import { Select } from "../select/Select";
import { ActivityIndicator } from "../activity/Activity";

/*
 * Pagination — move between pages of results.
 *
 *   <Pagination page={page} pageCount={12} onPageChange={setPage} />
 *   <Pagination page={page} total={470} pageSize={25} getHref={(p) => `/invoices?page=${p}`} linkComponent={Link} />
 *
 * Numbers with gaps (1 … 4 5 6 … 12), where a gap jumps five pages; the highlight slides between
 * pages. It adapts to its own width: fewer numbers when narrow, and "Page 3 of 12" with arrows
 * when very narrow. Optional summary ("21–30 of 470"), page-size picker and "Go to page" box.
 * LoadMore is the alternative for feeds: a button with "Showing 20 of 47".
 */

type PageItem = number | "start-gap" | "end-gap";

/** The list of page numbers and gaps to show. */
export function getPageItems(page: number, pageCount: number, siblings = 1, boundaries = 1): PageItem[] {
  if (pageCount <= 0) return [];
  const total = boundaries * 2 + siblings * 2 + 3; // numbers + 2 gaps + current
  if (pageCount <= total) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const range = (a: number, b: number) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i);
  const start = range(1, boundaries);
  const end = range(pageCount - boundaries + 1, pageCount);
  const lo = Math.max(Math.min(page - siblings, pageCount - boundaries - siblings * 2 - 1), boundaries + 2);
  const hi = Math.min(Math.max(page + siblings, boundaries + siblings * 2 + 2), pageCount - boundaries - 1);
  return [
    ...start,
    ...(lo > boundaries + 2 ? (["start-gap"] as const) : lo === boundaries + 2 ? [boundaries + 1] : []),
    ...range(lo, hi),
    ...(hi < pageCount - boundaries - 1 ? (["end-gap"] as const) : hi === pageCount - boundaries - 1 ? [pageCount - boundaries] : []),
    ...end,
  ];
}

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  /** Current page (1-based). */
  page: number;
  /** Number of pages. Or give total + pageSize. */
  pageCount?: number;
  total?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  /**
   * Make pages real links (good for search engines and opening in new tabs).
   * Pair with linkComponent for Next.js/Inertia links.
   */
  getHref?: (page: number) => string;
  linkComponent?: React.ElementType;
  /** Pages shown on each side of the current one. Default 1 (fewer when narrow). */
  siblingCount?: number;
  /** Pages always shown at the start and end. Default 1. */
  boundaryCount?: number;
  /** First/last page buttons. Default false. */
  showFirstLast?: boolean;
  /** "numbers" (default) or "simple": ‹ Page 3 of 12 ›. With responsive, narrow widths switch to simple. */
  variant?: "numbers" | "simple";
  /** Adapt to the available width. Default true. */
  responsive?: boolean;
  /** Show "21–30 of 470" (needs total and pageSize). */
  showSummary?: boolean;
  /** Offer a page-size picker with these options. */
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  /** Show a "Go to page" box. */
  showJump?: boolean;
  size?: "sm" | "md";
  /** Words, for other languages. */
  labels?: Partial<{ previous: string; next: string; first: string; last: string; page: string; of: string; goTo: string; perPage: string; nav: string }>;
}

const defaultLabels = {
  previous: "Previous",
  next: "Next",
  first: "First page",
  last: "Last page",
  page: "Page",
  of: "of",
  goTo: "Go to page",
  perPage: "per page",
  nav: "Pagination",
};

const Arrow = ({ dir, double }: { dir: "left" | "right"; double?: boolean }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="rtl:-scale-x-100">
    {dir === "left" ? <path d="M12 5l-5 5 5 5" /> : <path d="M8 5l5 5-5 5" />}
    {double && (dir === "left" ? <path d="M16 5l-5 5 5 5" /> : <path d="M4 5l5 5-5 5" />)}
  </svg>
);

type ControlCtx = {
  getHref?: (page: number) => string;
  linkComponent: React.ElementType;
  onPageChange?: (page: number) => void;
  go: (page: number) => void;
  h: string;
};

/** A page control: a link when getHref is given, otherwise a button. (Outside Pagination so it keeps focus.) */
function PageControl({
ctx,
  target,
  label,
  children,
  isCurrent,
  disabled,
  className: cls,
  title,
}: {
  ctx: ControlCtx;
  target: number;
  label?: string;
  children: React.ReactNode;
  isCurrent?: boolean;
  disabled?: boolean;
  className?: string;
  title?: string;
}) {
  const { getHref, linkComponent, onPageChange, go, h } = ctx;
  const common = cn(
    "relative z-[1] inline-grid shrink-0 cursor-pointer select-none place-items-center rounded-control px-2 font-medium tabular-nums outline-none transition-colors duration-150",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "[&_svg]:size-4",
    h,
    isCurrent ? "text-primary-fg" : "text-fg hover:bg-secondary-hover",
    disabled && "pointer-events-none opacity-40",
    cls
  );
  if (getHref && !disabled) {
    const LinkC = linkComponent;
    return (
      <LinkC
        href={getHref(target)}
        aria-label={label}
        aria-current={isCurrent ? "page" : undefined}
        title={title}
        className={common}
        onClick={(e: React.MouseEvent) => {
          if (onPageChange && !e.metaKey && !e.ctrlKey && !e.shiftKey && linkComponent === "a") {
            // Plain <a> with a handler: let the app handle navigation.
            e.preventDefault();
            go(target);
          } else onPageChange && go(target);
        }}
      >
        {children}
      </LinkC>
    );
  }
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={isCurrent ? "page" : undefined}
      aria-disabled={disabled || undefined}
      title={title}
      disabled={disabled}
      onClick={() => go(target)}
      className={common}
    >
      {children}
    </button>
  );
}

export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(function Pagination(
  {
    page,
    pageCount: pageCountProp,
    total,
    pageSize = 10,
    onPageChange,
    getHref,
    linkComponent = "a",
    siblingCount = 1,
    boundaryCount = 1,
    showFirstLast = false,
    variant = "numbers",
    responsive = true,
    showSummary = false,
    pageSizeOptions,
    onPageSizeChange,
    showJump = false,
    size = "md",
    labels: labelsProp,
    className,
    ...props
  },
  ref
) {
  const L = { ...defaultLabels, ...labelsProp };
  const pageCount = Math.max(1, pageCountProp ?? Math.ceil((total ?? 0) / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);

  // Adapt to the available width.
  const navRef = React.useRef<HTMLElement | null>(null);
  const [width, setWidth] = React.useState(Infinity);
  React.useLayoutEffect(() => {
    if (!responsive || !navRef.current) return;
    const el = navRef.current;
    const measure = () => setWidth(el.getBoundingClientRect().width);
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [responsive]);
  const narrow = responsive && width < 440;
  const tiny = responsive && width < 300;
  const mode = variant === "simple" || tiny ? "simple" : "numbers";
  const siblings = narrow ? 0 : siblingCount;
  const items = getPageItems(current, pageCount, siblings, boundaryCount);

  const go = (p: number) => {
    const n = Math.min(Math.max(1, p), pageCount);
    if (n !== current) onPageChange?.(n);
  };

  // The sliding highlight behind the current page number.
  const listRef = React.useRef<HTMLOListElement>(null);
  const [pill, setPill] = React.useState<{ x: number; w: number } | null>(null);
  const seen = React.useRef(false);
  React.useLayoutEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!el || !listRef.current) return setPill(null);
    setPill({ x: el.offsetLeft, w: el.offsetWidth });
  }, [current, items.join(","), mode, width]);
  React.useEffect(() => {
    if (pill) seen.current = true;
  }, [pill]);

  const h = size === "sm" ? "h-8 min-w-8 text-[0.8125rem]" : "h-9 min-w-9 text-sm";
  const ctx: ControlCtx = { getHref, linkComponent, onPageChange, go, h };

  const from = total !== undefined ? Math.min(total, (current - 1) * pageSize + 1) : 0;
  const to = total !== undefined ? Math.min(total, current * pageSize) : 0;

  const [jump, setJump] = React.useState("");

  return (
    <nav
      ref={(n) => {
        navRef.current = n;
        if (typeof ref === "function") ref(n);
        else if (ref) ref.current = n;
      }}
      aria-label={L.nav}
      className={cn("flex w-full min-w-0 flex-wrap items-center gap-x-4 gap-y-3", className)}
      {...props}
    >
      {showSummary && total !== undefined && (
        <p className="me-auto text-sm tabular-nums text-fg-muted" aria-live="polite">
          {total === 0 ? "No results" : `${from}–${to} ${L.of} ${total.toLocaleString()}`}
        </p>
      )}

      <div className={cn("flex min-w-0 items-center gap-1", !showSummary && "mx-auto", showSummary && "ms-auto")}>
        {showFirstLast && !narrow && mode === "numbers" && (
          <PageControl ctx={ctx} target={1} label={L.first} title={L.first} disabled={current === 1}>
            <Arrow dir="left" double />
          </PageControl>
        )}
        <PageControl ctx={ctx} target={current - 1} label={L.previous} title={L.previous} disabled={current === 1} className={cn(mode === "numbers" && !narrow && "gap-1 px-2.5")}>
          <span className="inline-flex items-center gap-1">
            <Arrow dir="left" />
            {mode === "numbers" && !narrow && <span className="pe-0.5">{L.previous}</span>}
          </span>
        </PageControl>

        {mode === "simple" ? (
          <p className="px-2 text-sm tabular-nums text-fg" aria-live="polite">
            {L.page} <span className="font-semibold">{current}</span> {L.of} {pageCount}
          </p>
        ) : (
          <ol ref={listRef} className="relative flex items-center gap-1">
            {/* The highlight slides from page to page. */}
            {pill && (
              <li
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute top-0 rounded-control bg-primary shadow-[inset_0_-2px_0_var(--color-primary-edge)]",
                  seen.current && "transition-[left,width] duration-250 ease-[cubic-bezier(0.3,1.2,0.5,1)] motion-reduce:transition-none",
                  size === "sm" ? "h-8" : "h-9"
                )}
                style={{ left: pill.x, width: pill.w }}
              />
            )}
            {items.map((it) =>
              typeof it === "number" ? (
                <li key={it}>
                  <PageControl ctx={ctx} target={it} label={`${L.page} ${it}`} isCurrent={it === current}>
                    {it}
                  </PageControl>
                </li>
              ) : (
                <li key={it}>
                  {/* A gap is a shortcut: it jumps five pages. */}
                  <PageControl
                    ctx={ctx}
                    target={it === "start-gap" ? current - 5 : current + 5}
                    label={it === "start-gap" ? "Jump back 5 pages" : "Jump forward 5 pages"}
                    title={it === "start-gap" ? "Back 5 pages" : "Forward 5 pages"}
                    className="group/gap text-fg-muted"
                  >
                    <span className="group-hover/gap:hidden" aria-hidden="true">…</span>
                    <span className="hidden group-hover/gap:inline" aria-hidden="true">
                      <Arrow dir={it === "start-gap" ? "left" : "right"} double />
                    </span>
                  </PageControl>
                </li>
              )
            )}
          </ol>
        )}

        <PageControl ctx={ctx} target={current + 1} label={L.next} title={L.next} disabled={current === pageCount} className={cn(mode === "numbers" && !narrow && "px-2.5")}>
          <span className="inline-flex items-center gap-1">
            {mode === "numbers" && !narrow && <span className="ps-0.5">{L.next}</span>}
            <Arrow dir="right" />
          </span>
        </PageControl>
        {showFirstLast && !narrow && mode === "numbers" && (
          <PageControl ctx={ctx} target={pageCount} label={L.last} title={L.last} disabled={current === pageCount}>
            <Arrow dir="right" double />
          </PageControl>
        )}
      </div>

      {(pageSizeOptions || showJump) && (
        <div className="flex flex-wrap items-center gap-3 text-sm text-fg-muted">
          {pageSizeOptions && (
            <label className="flex items-center gap-2">
              <Select
                size="sm"
                searchable={false}
                aria-label={`Items ${L.perPage}`}
                value={String(pageSize)}
                onChange={(v) => v && onPageSizeChange?.(Number(v))}
                options={pageSizeOptions.map((n) => ({ value: String(n), label: String(n) }))}
                className="w-20"
              />
              <span>{L.perPage}</span>
            </label>
          )}
          {showJump && (
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const n = parseInt(jump, 10);
                if (!Number.isNaN(n)) go(n);
                setJump("");
              }}
            >
              <label htmlFor={`${L.goTo}-jump`}>{L.goTo}</label>
              <input
                id={`${L.goTo}-jump`}
                inputMode="numeric"
                pattern="[0-9]*"
                value={jump}
                onChange={(e) => setJump(e.target.value.replace(/\D/g, ""))}
                placeholder={String(current)}
                aria-describedby={undefined}
                className={cn(
                  "w-14 rounded-control border border-border-strong bg-surface px-2 text-center tabular-nums text-fg outline-none",
                  "shadow-[inset_0_1px_2px_rgb(var(--ui-shadow-color)/0.07)] focus:border-ring focus:ring-3 focus:ring-ring/25",
                  size === "sm" ? "h-8" : "h-9"
                )}
              />
            </form>
          )}
        </div>
      )}
    </nav>
  );
});

/* ---------- LoadMore ---------- */

export interface LoadMoreProps {
  /** How many are showing now. */
  loaded: number;
  /** How many there are in total (if known). */
  total?: number;
  /** Load the next batch. Return a Promise and the button shows progress until it settles. */
  onLoadMore: () => unknown;
  /** Is there anything left? Default: loaded < total. */
  hasMore?: boolean;
  /** Load automatically when the button scrolls into view (infinite scroll). */
  auto?: boolean;
  /** Words. */
  label?: string;
  className?: string;
}

/** For feeds and lists: "Showing 20 of 47" with a Load more button — or automatic loading as you scroll. */
export function LoadMore({ loaded, total, onLoadMore, hasMore, auto = false, label = "Load more", className }: LoadMoreProps) {
  const more = hasMore ?? (total === undefined ? true : loaded < total);
  const [busy, setBusy] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const run = React.useCallback(async () => {
    if (busy || !more) return;
    setBusy(true);
    try {
      await onLoadMore();
    } finally {
      setBusy(false);
    }
  }, [busy, more, onLoadMore]);

  React.useEffect(() => {
    if (!auto || !more || typeof IntersectionObserver === "undefined" || !ref.current) return;
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && void run(), { rootMargin: "200px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [auto, more, run]);

  const pct = total ? Math.min(100, (loaded / total) * 100) : undefined;

  return (
    <div ref={ref} className={cn("grid justify-items-center gap-3 py-2", className)}>
      {total !== undefined && (
        <div className="grid w-full max-w-56 gap-1.5 text-center">
          <p className="text-sm tabular-nums text-fg-muted" aria-live="polite">
            {more ? `Showing ${loaded.toLocaleString()} of ${total.toLocaleString()}` : `All ${total.toLocaleString()} shown`}
          </p>
          <div aria-hidden="true" className="h-1 overflow-hidden rounded-full bg-secondary-hover">
            <div className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
      {more &&
        (auto && busy ? (
          <ActivityIndicator variant="dots" size="sm" label="Loading more" showLabel />
        ) : (
          <Button variant="secondary" size="sm" onClick={() => void run()} loading={busy} spinnerPlacement="start" loadingLabel="Loading…">
            {label}
          </Button>
        ))}
    </div>
  );
}
