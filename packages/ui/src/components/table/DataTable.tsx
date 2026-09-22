import * as React from "react";
import { cn } from "../../lib/cn";
import { Input } from "../input/Input";
import { Button } from "../button/Button";
import { Select } from "../select/Select";
import { Skeleton, ActivityIndicator } from "../activity/Activity";

/*
 * DataTable — a light take on DataTables: sorting, search, pagination, row selection
 * with bulk actions, row actions, loading and empty states.
 *
 * Responsive: when its container is narrow (not just the screen), each row becomes a
 * card with "Label  value" lines — or set mobile="scroll" to keep a table that scrolls
 * sideways with the first column pinned. Table semantics are kept either way.
 *
 * Data can be sorted/filtered/paged here, or on your server (manual) — e.g. a Laravel
 * paginator — with onQueryChange telling you what to fetch.
 */

export interface DataTableColumn<T> {
  /** Unique key. Also reads row[key] when there's no accessor. */
  key: string;
  header: React.ReactNode;
  /** The raw value, used for sorting and searching. Defaults to row[key]. */
  accessor?: (row: T) => unknown;
  /** How the cell looks. Defaults to the value as text. */
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  /** Custom sort compare (a, b) → number. */
  sortFn?: (a: T, b: T) => number;
  align?: "start" | "center" | "end";
  /** Column width, e.g. "8rem" or "20%". */
  width?: string;
  /** The row's title in the card layout (shown larger, without a label). Use on one column. */
  primary?: boolean;
  /** Leave this column out of the card layout. */
  hideOnMobile?: boolean;
  /** Include in search. Default true. */
  searchable?: boolean;
  className?: string;
}

export type SortState = { key: string; direction: "asc" | "desc" } | null;
export type DataTableStatusState = {
  loading: boolean;
  refreshing: boolean;
  lastUpdated: Date | null;
  error: React.ReactNode;
  total: number;
};

export type DataTableQuery = { page: number; pageSize: number; sort: SortState; search: string };

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  /** A stable id per row: a key of the row, or a function. */
  rowKey: keyof T | ((row: T) => string | number);
  /** Accessible name, e.g. "Invoices". Shown visually only if showCaption. */
  caption: string;
  showCaption?: boolean;

  /** Show a search box. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Rows per page. Set 0 to show everything. Default 10. */
  pageSize?: number;
  pageSizeOptions?: number[];
  defaultSort?: SortState;

  /** Adds a checkbox column. */
  selectable?: boolean;
  selected?: Array<string | number>;
  onSelectedChange?: (keys: Array<string | number>) => void;
  /** Shown in a bar when rows are selected. Gets the selected rows and a way to clear them. */
  bulkActions?: (rows: T[], clear: () => void) => React.ReactNode;

  /** Content at the end of each row, e.g. a DropdownMenu. */
  rowActions?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  /** Extra buttons in the toolbar, e.g. "New invoice". */
  toolbar?: React.ReactNode;

  loading?: boolean;
  /**
   * How a refresh (loading while rows are already showing) is shown:
   * - "border": a light runs around the table's edge (default)
   * - "bar": a thin bar slides along the top
   * - "shimmer": a soft sweep of light passes over the rows
   * - "none": rows just dim
   */
  refreshIndicator?: "border" | "bar" | "shimmer" | "none";
  /** Adds a refresh button to the toolbar. Return a Promise; the indicator runs until it settles. */
  onRefresh?: () => Promise<unknown> | void;
  /**
   * A status line at the top of the table, like a live caption.
   * - true: automatic messages — "Loading rows…", "Fetching the latest rows…",
   *   "Updated 2 minutes ago", or the error
   * - a message (text or content) to show your own, e.g. "Showing cached data"
   * - a function that gets the table's state and returns a message (or null to hide)
   */
  status?: boolean | React.ReactNode | ((state: DataTableStatusState) => React.ReactNode);
  /** Color of a custom status message. Automatic messages pick their own. */
  statusTone?: "neutral" | "info" | "success" | "warning" | "danger";
  /** An error to show in the status line (e.g. the last refresh failed). Offers Retry with onRefresh. */
  error?: React.ReactNode;
  /** When the data was last loaded, if you track it. Otherwise the table notes when a refresh finishes. */
  lastUpdated?: Date | null;
  /** Shown when there are no rows (and when a search finds nothing). */
  emptyState?: React.ReactNode;

  density?: "comfortable" | "compact";
  striped?: boolean;
  /** Narrow containers: rows become cards ("cards", default) or the table scrolls sideways ("scroll"). */
  mobile?: "cards" | "scroll";
  /** Limit the height; the header stays visible while the body scrolls. */
  maxHeight?: string;

  /** Server mode: you sort, search and page; the table only shows `data`. */
  manual?: boolean;
  /** Server mode: total number of rows across all pages. */
  total?: number;
  /** Called when page, page size, sort or search change (search is debounced). */
  onQueryChange?: (query: DataTableQuery) => void;
  className?: string;
}

/* ---------- helpers ---------- */

const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const valueOf = <T,>(col: DataTableColumn<T>, row: T) =>
  col.accessor ? col.accessor(row) : (row as Record<string, unknown>)[col.key];

function compare(a: unknown, b: unknown) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

const alignClass = { start: "text-start", center: "text-center", end: "text-end" } as const;

function Checkbox({ checked, indeterminate, onChange, label }: { checked: boolean; indeterminate?: boolean; onChange: (v: boolean) => void; label: string }) {
  const ref = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      aria-label={label}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      onClick={(e) => e.stopPropagation()}
      className="size-4 cursor-pointer rounded-[4px] accent-[color:var(--color-primary)]"
    />
  );
}

const SortIcon = ({ dir }: { dir: "asc" | "desc" | null }) => (
  <svg viewBox="0 0 12 16" aria-hidden="true" className="h-3.5 w-2.5 shrink-0">
    <path d="M6 2.5l3 3.5H3z" fill="currentColor" opacity={dir === "asc" ? 1 : 0.3} />
    <path d="M6 13.5L3 10h6z" fill="currentColor" opacity={dir === "desc" ? 1 : 0.3} />
  </svg>
);

/* ---------- refresh indicators ---------- */

/**
 * A comet of light running around the table's rounded edge. It's an SVG rectangle drawn
 * on the border with three dashes of different lengths that share one head — a bright
 * point with a fading tail — moving at an even speed along the whole perimeter.
 */
function RunningBorder({ radius }: { radius: number }) {
  const tails: Array<[number, number, number]> = [
    // [dash length, opacity, width]
    [26, 0.18, 2],
    [14, 0.45, 2],
    [5, 1, 2.5],
  ];
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-30 size-full overflow-visible drop-shadow-[0_0_3px_var(--color-primary)] motion-reduce:hidden"
    >
      {tails.map(([len, opacity, width]) => (
        <rect
          key={len}
          x="0"
          y="0"
          width="100%"
          height="100%"
          rx={radius}
          pathLength={100}
          fill="none"
          stroke="var(--color-primary)"
          strokeOpacity={opacity}
          strokeWidth={width}
          strokeLinecap="round"
          strokeDasharray={`${len} ${100 - len}`}
          className="animate-[ui-border-run_2.2s_linear_infinite]"
          // Line up the heads: shorter dashes start further along.
          style={{ ["--o" as string]: `${len - 26}` }}
        />
      ))}
    </svg>
  );
}

function RefreshBar() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-30 h-0.5 overflow-hidden rounded-t-card">
      <div className="h-full w-2/5 rounded-full bg-primary animate-[ui-indeterminate_1.2s_cubic-bezier(0.4,0,0.2,1)_infinite] motion-reduce:w-full motion-reduce:animate-[ui-breathe_1.6s_ease-in-out_infinite]" />
    </div>
  );
}

function RefreshShimmer() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-card motion-reduce:hidden">
      <div className="h-full w-full bg-[linear-gradient(100deg,transparent_20%,color-mix(in_srgb,var(--color-primary)_9%,transparent)_45%,color-mix(in_srgb,var(--color-surface)_55%,transparent)_50%,color-mix(in_srgb,var(--color-primary)_9%,transparent)_55%,transparent_80%)] animate-[ui-sweep_1.4s_ease-in-out_infinite]" />
    </div>
  );
}

/* ---------- status line ---------- */

function timeAgo(date: Date) {
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 45) return "just now";
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return rtf.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours < 24) return rtf.format(-hours, "hour");
  return rtf.format(-Math.round(hours / 24), "day");
}

const statusToneClass = {
  neutral: "text-fg-muted",
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
} as const;

type ResolvedStatus = { message: React.ReactNode; tone: keyof typeof statusToneClass; icon: "error" | "busy" | "done" | null; spinner: boolean };

/** Work out what the status line should say (or null to hide it). */
function resolveStatus(
  status: DataTableProps<unknown>["status"],
  tone: keyof typeof statusToneClass | undefined,
  state: DataTableStatusState,
  justRefreshed: boolean
): ResolvedStatus | null {
  if (!status) return null;
  const hasError = state.error !== undefined && state.error !== null && state.error !== false && state.error !== "";
  const busy = state.loading || state.refreshing;

  let auto: React.ReactNode = null;
  let autoTone: keyof typeof statusToneClass = "neutral";
  if (hasError) {
    auto = state.error;
    autoTone = "danger";
  } else if (state.loading) auto = "Loading rows…";
  else if (state.refreshing) auto = "Fetching the latest rows…";
  else if (state.lastUpdated) {
    auto = `Updated ${timeAgo(state.lastUpdated)}`;
    autoTone = justRefreshed ? "success" : "neutral";
  }

  const custom = typeof status === "function" ? status(state) : status === true ? undefined : status;
  const message = custom !== undefined ? custom : auto;
  if (message === null || message === undefined || message === false || message === "") return null;
  return {
    message,
    tone: custom !== undefined ? (tone ?? (hasError ? "danger" : "neutral")) : autoTone,
    icon: hasError ? "error" : busy ? "busy" : state.lastUpdated && custom === undefined ? "done" : null,
    spinner: state.loading,
  };
}

function StatusLine({ resolved, onRetry, cards }: { resolved: ResolvedStatus; onRetry?: () => void; cards: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-9 items-center gap-2 rounded-t-card border border-border bg-secondary-hover/45 px-4 py-1.5 text-[0.8125rem]",
        cards && "@max-[40rem]:mb-3 @max-[40rem]:rounded-card",
        statusToneClass[resolved.tone]
      )}
    >
      {resolved.icon === "error" ? (
        <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 shrink-0" fill="currentColor">
          <path d="M8 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Zm0 3a.75.75 0 0 0-.75.75v3a.75.75 0 0 0 1.5 0v-3A.75.75 0 0 0 8 4.5Zm0 6.25a.85.85 0 1 0 0 1.7.85.85 0 0 0 0-1.7Z" />
        </svg>
      ) : resolved.icon === "busy" ? (
        <ActivityIndicator variant={resolved.spinner ? "spinner" : "dots"} size="xs" tone="current" label="" aria-hidden="true" role={undefined} />
      ) : resolved.icon === "done" ? (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-3.5 shrink-0">
          <path d="M3.5 8.5l3 3 6-7" />
        </svg>
      ) : null}
      <span className="min-w-0 flex-1 truncate">{resolved.message}</span>
      {resolved.icon === "error" && onRetry && (
        <button type="button" onClick={onRetry} className="shrink-0 cursor-pointer font-medium underline underline-offset-2 hover:no-underline">
          Retry
        </button>
      )}
    </div>
  );
}

/* ---------- component ---------- */

export function DataTable<T>({
  data,
  columns,
  rowKey,
  caption,
  showCaption = false,
  searchable = false,
  searchPlaceholder = "Search…",
  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  defaultSort = null,
  selectable = false,
  selected: selectedProp,
  onSelectedChange,
  bulkActions,
  rowActions,
  onRowClick,
  toolbar,
  loading = false,
  refreshIndicator = "border",
  onRefresh,
  status,
  statusTone,
  error,
  lastUpdated: lastUpdatedProp,
  emptyState,
  density = "comfortable",
  striped = false,
  mobile = "cards",
  maxHeight,
  manual = false,
  total,
  onQueryChange,
  className,
}: DataTableProps<T>) {
  const keyOf = React.useCallback(
    (row: T) => (typeof rowKey === "function" ? rowKey(row) : (row[rowKey] as unknown as string | number)),
    [rowKey]
  );

  const [refreshingByButton, setRefreshingByButton] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [sort, setSort] = React.useState<SortState>(defaultSort);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(initialPageSize);
  const [uncontrolledSel, setUncontrolledSel] = React.useState<Array<string | number>>([]);
  const selected = selectedProp ?? uncontrolledSel;
  const setSelected = (keys: Array<string | number>) => {
    if (selectedProp === undefined) setUncontrolledSel(keys);
    onSelectedChange?.(keys);
  };

  // Search (debounced in server mode). Any change of search, sort or page size goes back to page 1,
  // set in the same update so onQueryChange fires once.
  React.useEffect(() => {
    const t = window.setTimeout(() => {
      if (search !== debounced) {
        setDebounced(search);
        setPage(1);
      }
    }, manual ? 300 : 0);
    return () => window.clearTimeout(t);
  }, [search, manual, debounced]);

  const queryRef = React.useRef(onQueryChange);
  queryRef.current = onQueryChange;
  React.useEffect(() => {
    queryRef.current?.({ page, pageSize, sort, search: debounced });
  }, [page, pageSize, sort, debounced]);

  /* ----- client-side processing ----- */
  const processed = React.useMemo(() => {
    if (manual) return data;
    let rows = data;
    const q = normalize(debounced.trim());
    if (q) {
      const cols = columns.filter((c) => c.searchable !== false);
      rows = rows.filter((r) => cols.some((c) => normalize(String(valueOf(c, r) ?? "")).includes(q)));
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col) {
        const dir = sort.direction === "asc" ? 1 : -1;
        rows = [...rows].sort((a, b) => dir * (col.sortFn ? col.sortFn(a, b) : compare(valueOf(col, a), valueOf(col, b))));
      }
    }
    return rows;
  }, [data, columns, debounced, sort, manual]);

  const totalRows = manual ? (total ?? data.length) : processed.length;
  const paged = pageSize > 0 && !manual ? processed.slice((page - 1) * pageSize, page * pageSize) : processed;
  const pageCount = pageSize > 0 ? Math.max(1, Math.ceil(totalRows / pageSize)) : 1;
  const from = totalRows === 0 ? 0 : pageSize > 0 ? (page - 1) * pageSize + 1 : 1;
  const to = pageSize > 0 ? Math.min(page * pageSize, totalRows) : totalRows;

  React.useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const toggleSort = (key: string) => {
    setSort((s) => (!s || s.key !== key ? { key, direction: "asc" } : s.direction === "asc" ? { key, direction: "desc" } : null));
    setPage(1);
  };

  /* ----- selection ----- */
  const pageKeys = paged.map(keyOf);
  const selectedOnPage = pageKeys.filter((k) => selected.includes(k));
  const allOnPage = pageKeys.length > 0 && selectedOnPage.length === pageKeys.length;
  const selectedRows = data.filter((r) => selected.includes(keyOf(r)));

  // A refresh = loading while rows are already showing (or the refresh button's Promise is running).
  const refreshing = (loading && paged.length > 0) || refreshingByButton;
  const [justRefreshed, setJustRefreshed] = React.useState(false);
  const wasRefreshing = React.useRef(false);
  React.useEffect(() => {
    if (wasRefreshing.current && !refreshing) {
      setJustRefreshed(true);
      const t = window.setTimeout(() => setJustRefreshed(false), 750);
      wasRefreshing.current = false;
      return () => window.clearTimeout(t);
    }
    wasRefreshing.current = refreshing;
  }, [refreshing]);

  // When the rows were last (re)loaded — from the prop, or noted when a refresh or load ends.
  const [trackedUpdated, setTrackedUpdated] = React.useState<Date | null>(null);
  const wasBusy = React.useRef(loading);
  React.useEffect(() => {
    const busy = loading || refreshingByButton;
    if (wasBusy.current && !busy) setTrackedUpdated(new Date());
    wasBusy.current = busy;
  }, [loading, refreshingByButton]);
  const lastUpdated = lastUpdatedProp !== undefined ? lastUpdatedProp : trackedUpdated;

  // Re-render every 30s so "Updated 2 minutes ago" stays true.
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    if (!status || !lastUpdated) return;
    const t = window.setInterval(() => setTick((n) => n + 1), 30000);
    return () => window.clearInterval(t);
  }, [status, lastUpdated]);

  const frameRef = React.useRef<HTMLDivElement>(null);
  const [radius, setRadius] = React.useState(12);
  React.useLayoutEffect(() => {
    if (!refreshing || !frameRef.current) return;
    setRadius(parseFloat(getComputedStyle(frameRef.current).borderTopLeftRadius) || 12);
  }, [refreshing]);

  const runRefresh = async () => {
    if (!onRefresh || refreshingByButton) return;
    setRefreshingByButton(true);
    try {
      await onRefresh();
    } finally {
      setRefreshingByButton(false);
    }
  };

  const cards = mobile === "cards";
  const resolvedStatus = resolveStatus(
    status as DataTableProps<unknown>["status"],
    statusTone,
    { loading: loading && paged.length === 0, refreshing, lastUpdated, error, total: totalRows },
    justRefreshed
  );
  const pad = density === "compact" ? "px-3 py-2" : "px-4 py-3";
  const primaryCol = columns.find((c) => c.primary) ?? columns[0];
  const colCount = columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);

  // Class helpers for the card layout (applied when the container is narrower than 40rem).
  const cardTable = cards && "@max-[40rem]:block";
  const cardHead = cards && "@max-[40rem]:sr-only";
  const cardBody = cards && "@max-[40rem]:grid @max-[40rem]:gap-3 @max-[40rem]:p-3";
  const cardRow =
    cards &&
    "@max-[40rem]:relative @max-[40rem]:grid @max-[40rem]:gap-1.5 @max-[40rem]:rounded-card @max-[40rem]:border @max-[40rem]:border-border @max-[40rem]:bg-surface @max-[40rem]:p-4 @max-[40rem]:shadow-none";
  const cardCell =
    cards &&
    "@max-[40rem]:flex @max-[40rem]:items-baseline @max-[40rem]:justify-between @max-[40rem]:gap-4 @max-[40rem]:border-0 @max-[40rem]:p-0 @max-[40rem]:text-end @max-[40rem]:before:shrink-0 @max-[40rem]:before:text-start @max-[40rem]:before:text-[0.8125rem] @max-[40rem]:before:text-fg-muted @max-[40rem]:before:content-[attr(data-label)]";

  const emptyContent = emptyState ?? (
    <div className="grid justify-items-center gap-1 py-10 text-center">
      <p className="font-medium text-fg">{debounced ? `No results for “${debounced}”` : "Nothing here yet"}</p>
      <p className="text-sm text-fg-muted">{debounced ? "Check the spelling or try fewer words." : "Rows will appear here once they're added."}</p>
    </div>
  );

  const headerLabel = (c: DataTableColumn<T>) => (typeof c.header === "string" ? c.header : c.key);

  return (
    <div className={cn("@container grid w-full gap-3", className)}>
      {(searchable || toolbar || onRefresh) && (
        <div className="flex flex-wrap items-center gap-2">
          {searchable && (
            <Input
              type="search"
              aria-label={`Search ${caption.toLowerCase()}`}
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              clearable
              size="sm"
              leadingIcon={
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true">
                  <circle cx="9" cy="9" r="5.5" />
                  <path d="M13 13l3.5 3.5" />
                </svg>
              }
              frameClassName="w-full sm:w-72"
            />
          )}
          {(toolbar || onRefresh) && (
            <div className="ms-auto flex flex-wrap items-center gap-2">
              {onRefresh && (
                <Button
                  size="sm"
                  variant="secondary"
                  iconOnly
                  aria-label={refreshing ? `Refreshing ${caption.toLowerCase()}` : `Refresh ${caption.toLowerCase()}`}
                  title="Refresh"
                  onClick={() => void runRefresh()}
                  className={cn(refreshing && "[&_svg]:animate-spin [&_svg]:[animation-duration:0.9s]")}
                >
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M16 10a6 6 0 1 1-1.8-4.3" />
                    <path d="M16 3.5v3.3h-3.3" />
                  </svg>
                </Button>
              )}
              {toolbar}
            </div>
          )}
        </div>
      )}

      {selectable && selected.length > 0 && bulkActions && (
        <div className="flex flex-wrap items-center gap-2 rounded-control-lg border border-[color:color-mix(in_srgb,var(--color-primary)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--color-primary)_6%,var(--color-surface))] px-3 py-2 text-sm animate-[ui-fade-in_120ms_ease-out]">
          <span className="font-medium">{selected.length} selected</span>
          <Button size="sm" variant="ghost" onClick={() => setSelected([])}>Clear</Button>
          <div className="ms-auto flex flex-wrap items-center gap-2">{bulkActions(selectedRows, () => setSelected([]))}</div>
        </div>
      )}

      <div className="relative">
      {refreshing && refreshIndicator === "border" && <RunningBorder radius={radius} />}
      {refreshing && refreshIndicator === "bar" && <RefreshBar />}
      {refreshing && refreshIndicator === "shimmer" && <RefreshShimmer />}
      {!resolvedStatus && (
        <span className="sr-only" aria-live="polite">
          {refreshing ? `Refreshing ${caption.toLowerCase()}…` : justRefreshed ? `${caption} updated.` : ""}
        </span>
      )}
      {resolvedStatus && <StatusLine resolved={resolvedStatus} cards={cards} onRetry={onRefresh ? () => void runRefresh() : undefined} />}
      <div
        ref={frameRef}
        className={cn(
          "relative overflow-auto rounded-card border border-border bg-surface",
          resolvedStatus && "rounded-t-none border-t-0",
          cards && "@max-[40rem]:overflow-visible @max-[40rem]:border-0 @max-[40rem]:bg-transparent",
          justRefreshed && refreshIndicator !== "none" && "animate-[ui-refresh-done_750ms_ease-out] motion-reduce:animate-none"
        )}
        style={{ maxHeight }}
        aria-busy={loading || refreshing || undefined}
      >
        <table role="table" className={cn("w-full border-separate border-spacing-0 text-sm", cardTable)}>
          <caption className={showCaption ? "px-4 pt-3 text-start font-medium text-fg" : "sr-only"}>
            {caption}
            {sort && <span className="sr-only">, sorted by {headerLabel(columns.find((c) => c.key === sort.key)!)} {sort.direction === "asc" ? "ascending" : "descending"}</span>}
          </caption>
          <thead role="rowgroup" className={cn(cardHead)}>
            <tr role="row">
              {selectable && (
                <th role="columnheader" scope="col" className={cn("sticky top-0 z-10 w-10 border-b border-border bg-surface", pad, "pe-0")}>
                  <Checkbox
                    label={allOnPage ? "Unselect all rows on this page" : "Select all rows on this page"}
                    checked={allOnPage}
                    indeterminate={selectedOnPage.length > 0 && !allOnPage}
                    onChange={(v) =>
                      setSelected(v ? Array.from(new Set([...selected, ...pageKeys])) : selected.filter((k) => !pageKeys.includes(k)))
                    }
                  />
                </th>
              )}
              {columns.map((c, i) => {
                const dir = sort?.key === c.key ? sort.direction : null;
                return (
                  <th
                    key={c.key}
                    role="columnheader"
                    scope="col"
                    aria-sort={c.sortable ? (dir === "asc" ? "ascending" : dir === "desc" ? "descending" : "none") : undefined}
                    className={cn(
                      "sticky top-0 z-10 whitespace-nowrap border-b border-border bg-surface text-[0.8125rem] font-medium text-fg-muted",
                      pad,
                      alignClass[c.align ?? "start"],
                      !cards && i === 0 && "start-0 z-20",
                      c.className
                    )}
                    style={{ width: c.width }}
                  >
                    {c.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(c.key)}
                        className={cn(
                          "-mx-1.5 inline-flex cursor-pointer items-center gap-1 rounded-control-sm px-1.5 py-0.5 hover:bg-secondary-hover hover:text-fg",
                          "focus-visible:outline-2 focus-visible:outline-ring",
                          dir && "text-fg",
                          c.align === "end" && "flex-row-reverse"
                        )}
                      >
                        {c.header}
                        <SortIcon dir={dir} />
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
              {rowActions && (
                <th role="columnheader" scope="col" className={cn("sticky top-0 z-10 w-12 border-b border-border bg-surface", pad)}>
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody role="rowgroup" className={cn(cardBody)}>
            {loading && paged.length === 0
              ? Array.from({ length: Math.min(pageSize || 5, 5) }, (_, i) => (
                  <tr role="row" key={`sk-${i}`} className={cn(cardRow)}>
                    {Array.from({ length: colCount }, (_, j) => (
                      <td role="cell" key={j} className={cn("border-b border-border", pad, cards && "@max-[40rem]:border-0 @max-[40rem]:p-0")}>
                        <Skeleton className="h-3.5 w-full max-w-32 rounded-full" />
                      </td>
                    ))}
                  </tr>
                ))
              : paged.map((row, ri) => {
                  const k = keyOf(row);
                  const isSel = selected.includes(k);
                  return (
                    <tr
                      role="row"
                      key={k}
                      aria-selected={selectable ? isSel : undefined}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      className={cn(
                        "group/row transition-colors",
                        onRowClick && "cursor-pointer",
                        "hover:[&>td]:bg-secondary-hover/50",
                        striped && ri % 2 === 1 && "[&>td]:bg-secondary-hover/35",
                        isSel && "[&>td]:bg-[color:color-mix(in_srgb,var(--color-primary)_6%,var(--color-surface))]",
                        refreshing && "opacity-70 transition-opacity duration-200",
                        cardRow,
                        cards && isSel && "@max-[40rem]:border-primary"
                      )}
                    >
                      {selectable && (
                        <td role="cell" className={cn("border-b border-border", pad, "pe-0", cards && "@max-[40rem]:absolute @max-[40rem]:start-4 @max-[40rem]:top-4 @max-[40rem]:border-0 @max-[40rem]:p-0")}>
                          <Checkbox
                            label={`Select ${String(valueOf(primaryCol, row) ?? k)}`}
                            checked={isSel}
                            onChange={(v) => setSelected(v ? [...selected, k] : selected.filter((x) => x !== k))}
                          />
                        </td>
                      )}
                      {columns.map((c, i) => {
                        const isPrimary = c === primaryCol;
                        const content = c.cell ? c.cell(row) : String(valueOf(c, row) ?? "");
                        return (
                          <td
                            key={c.key}
                            role="cell"
                            data-label={typeof c.header === "string" ? c.header : ""}
                            className={cn(
                              "border-b border-border align-middle text-fg",
                              ri === paged.length - 1 && "border-b-0",
                              pad,
                              alignClass[c.align ?? "start"],
                              !cards && i === 0 && "sticky start-0 z-[1] bg-surface",
                              cardCell,
                              cards && isPrimary && "@max-[40rem]:order-first @max-[40rem]:mb-1 @max-[40rem]:block @max-[40rem]:text-start @max-[40rem]:text-[0.9375rem] @max-[40rem]:font-semibold @max-[40rem]:before:hidden",
                              cards && isPrimary && selectable && "@max-[40rem]:ps-7",
                              cards && isPrimary && rowActions && "@max-[40rem]:pe-10",
                              cards && c.hideOnMobile && "@max-[40rem]:hidden",
                              c.className
                            )}
                          >
                            {content}
                          </td>
                        );
                      })}
                      {rowActions && (
                        <td
                          role="cell"
                          onClick={(e) => e.stopPropagation()}
                          className={cn(
                            "border-b border-border text-end",
                            ri === paged.length - 1 && "border-b-0",
                            density === "compact" ? "px-2 py-1" : "px-2 py-1.5",
                            cards && "@max-[40rem]:absolute @max-[40rem]:end-2.5 @max-[40rem]:top-2.5 @max-[40rem]:border-0 @max-[40rem]:p-0"
                          )}
                        >
                          {rowActions(row)}
                        </td>
                      )}
                    </tr>
                  );
                })}
            {!loading && paged.length === 0 && (
              <tr role="row" className={cn(cards && "@max-[40rem]:block @max-[40rem]:rounded-card @max-[40rem]:border @max-[40rem]:border-border @max-[40rem]:bg-surface")}>
                <td role="cell" colSpan={colCount} className={cn("px-4", cards && "@max-[40rem]:block")}>
                  {emptyContent}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>

      {/* Footer: count, page size, pages */}
      {(pageSize > 0 || totalRows > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm text-fg-muted">
          <p aria-live="polite" className="tabular-nums">
            {totalRows === 0 ? "No rows" : pageSize > 0 ? `${from}–${to} of ${totalRows}` : `${totalRows} rows`}
          </p>
          {pageSize > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline">Rows per page</span>
                <Select
                  size="sm"
                  searchable={false}
                  aria-label="Rows per page"
                  value={String(pageSize)}
                  onChange={(v) => {
                    if (!v) return;
                    setPageSize(Number(v));
                    setPage(1);
                  }}
                  options={pageSizeOptions.map((n) => ({ value: String(n), label: String(n) }))}
                  className="w-20"
                />
              </div>
              <nav aria-label={`${caption} pages`} className="flex items-center gap-1">
                <Button size="sm" variant="ghost" iconOnly aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 5l-5 5 5 5" />
                  </svg>
                </Button>
                <span className="min-w-16 text-center tabular-nums text-fg" aria-current="page">
                  {page} / {pageCount}
                </span>
                <Button size="sm" variant="ghost" iconOnly aria-label="Next page" disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)}>
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M8 5l5 5-5 5" />
                  </svg>
                </Button>
              </nav>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
