import * as React from "react";
import { cn } from "../../lib/cn";
import { ActivityIndicator } from "../activity/Activity";

/*
 * Toasts — short messages about something that just happened.
 *
 *   <Toaster />                          once, near the root of the app
 *   toast("Invoice saved")               from anywhere — components, event handlers, Inertia callbacks
 *   toast.success / error / warning / info / loading
 *   toast.promise(save(), { loading: "Saving…", success: "Saved", error: (e) => e.message })
 *   toast("Invoice deleted", { action: { label: "Undo", onClick: restore } })
 *
 * They stack neatly (and spread out on hover or focus), pause while you're reading them,
 * can be swiped away on touch screens, and are announced to screen readers.
 */

export type ToastType = "default" | "success" | "error" | "warning" | "info" | "loading";

export interface ToastOptions {
  /** Reuse an id to update a toast in place instead of adding another. */
  id?: string | number;
  description?: React.ReactNode;
  /** A button in the toast, e.g. Undo. The toast closes after it's clicked. */
  action?: { label: string; onClick: () => void };
  /** How long it stays, in ms. Default 5000 (errors 8000, loading until updated). Infinity to keep it. */
  duration?: number;
  /** Replace the icon. */
  icon?: React.ReactNode;
  /** Show the × button. Default true. */
  dismissible?: boolean;
  onDismiss?: () => void;
}

export interface ToastData extends ToastOptions {
  id: string | number;
  type: ToastType;
  title: React.ReactNode;
  createdAt: number;
  dismissed?: boolean;
}

/* ---------- the store (works outside React) ---------- */

type Listener = (toasts: ToastData[]) => void;
let toasts: ToastData[] = [];
const listeners = new Set<Listener>();
let counter = 0;
const emit = () => listeners.forEach((l) => l(toasts));

function upsert(type: ToastType, title: React.ReactNode, options: ToastOptions = {}) {
  const id = options.id ?? `t${++counter}`;
  const existing = toasts.find((t) => t.id === id);
  if (existing) {
    toasts = toasts.map((t) =>
      t.id === id ? { ...t, ...options, type, title, id, dismissed: false, createdAt: Date.now() } : t
    );
  } else {
    toasts = [{ ...options, id, type, title, createdAt: Date.now() }, ...toasts];
  }
  emit();
  return id;
}

function dismiss(id?: string | number) {
  toasts = toasts.map((t) => (id === undefined || t.id === id ? { ...t, dismissed: true } : t));
  emit();
}

function removeNow(id: string | number) {
  const t = toasts.find((x) => x.id === id);
  toasts = toasts.filter((x) => x.id !== id);
  emit();
  t?.onDismiss?.();
}

type Message<T> = React.ReactNode | ((value: T) => React.ReactNode);

export const toast = Object.assign((title: React.ReactNode, options?: ToastOptions) => upsert("default", title, options), {
  success: (title: React.ReactNode, options?: ToastOptions) => upsert("success", title, options),
  error: (title: React.ReactNode, options?: ToastOptions) => upsert("error", title, options),
  warning: (title: React.ReactNode, options?: ToastOptions) => upsert("warning", title, options),
  info: (title: React.ReactNode, options?: ToastOptions) => upsert("info", title, options),
  loading: (title: React.ReactNode, options?: ToastOptions) => upsert("loading", title, options),
  /** Show "loading" while a Promise runs, then success or error. Returns the same Promise. */
  promise<T>(
    promise: Promise<T> | (() => Promise<T>),
    messages: { loading: React.ReactNode; success: Message<T>; error: Message<unknown>; description?: React.ReactNode },
    options?: ToastOptions
  ): Promise<T> {
    const p = typeof promise === "function" ? promise() : promise;
    const id = upsert("loading", messages.loading, { ...options, description: messages.description });
    p.then(
      (value) => upsert("success", typeof messages.success === "function" ? (messages.success as (v: T) => React.ReactNode)(value) : messages.success, { ...options, id, description: undefined }),
      (err) => upsert("error", typeof messages.error === "function" ? (messages.error as (e: unknown) => React.ReactNode)(err) : messages.error, { ...options, id, description: undefined })
    );
    return p;
  },
  /** Close one toast, or all of them. */
  dismiss,
});

function useToasts() {
  const [list, setList] = React.useState(toasts);
  React.useEffect(() => {
    listeners.add(setList);
    setList(toasts);
    return () => {
      listeners.delete(setList);
    };
  }, []);
  return list;
}

/* ---------- Toaster ---------- */

export type ToasterPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

export interface ToasterProps {
  /** Where toasts appear on wide screens. On phones they span the width at the top or bottom. */
  position?: ToasterPosition;
  /** Show every toast spread out, instead of a neat stack that opens on hover. */
  expand?: boolean;
  /** How many are visible at once (the rest wait). Default 3. */
  visibleToasts?: number;
  /** Colored backgrounds for success, error, warning and info. */
  richColors?: boolean;
  /** Show a thin line counting down the time left. Default true. */
  showTimer?: boolean;
  /** Keyboard shortcut to jump to the toasts. Default Alt+T. */
  hotkey?: string[];
  className?: string;
}

const GAP = 10;
const icons: Record<Exclude<ToastType, "default" | "loading">, React.ReactNode> = {
  success: <path d="M5 10.5l3.2 3.2L15 7" />,
  error: <><path d="M10 6.5v4.5" /><path d="M10 13.8v.01" /></>,
  warning: <><path d="M10 7v4" /><path d="M10 13.8v.01" /></>,
  info: <><path d="M10 9v5" /><path d="M10 6.2v.01" /></>,
};
const toneBg: Record<Exclude<ToastType, "default" | "loading">, string> = {
  success: "bg-success text-success-fg",
  error: "bg-danger text-danger-fg",
  warning: "bg-warning text-warning-fg",
  info: "bg-info text-info-fg",
};
const richBg: Record<Exclude<ToastType, "default" | "loading">, string> = {
  success: "border-[color:color-mix(in_srgb,var(--color-success)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--color-success)_10%,var(--color-surface))]",
  error: "border-[color:color-mix(in_srgb,var(--color-danger)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--color-danger)_10%,var(--color-surface))]",
  warning: "border-[color:color-mix(in_srgb,var(--color-warning)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--color-warning)_10%,var(--color-surface))]",
  info: "border-[color:color-mix(in_srgb,var(--color-info)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--color-info)_10%,var(--color-surface))]",
};

export function Toaster({
  position = "bottom-right",
  expand = false,
  visibleToasts = 3,
  richColors = false,
  showTimer = true,
  hotkey = ["altKey", "KeyT"],
  className,
}: ToasterProps) {
  const list = useToasts();
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const [heights, setHeights] = React.useState<Record<string, number>>({});
  const listRef = React.useRef<HTMLOListElement>(null);
  const top = position.startsWith("top");
  const open = expand || hovered || focused;
  const paused = hovered || focused || hidden;

  React.useEffect(() => {
    const onVis = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Hotkey (Alt+T) to move focus to the newest toast.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (hotkey.every((k) => (k.endsWith("Key") ? (e as unknown as Record<string, boolean>)[k] : e.code === k))) {
        e.preventDefault();
        listRef.current?.querySelector<HTMLElement>("[data-toast]")?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [hotkey]);

  const shown = list.filter((t) => !t.dismissed).slice(0, visibleToasts);
  const leaving = list.filter((t) => t.dismissed);
  const visible = [...list.filter((t) => shown.includes(t) || t.dismissed)];
  React.useEffect(() => {
    if (!list.length) {
      setHovered(false);
      setFocused(false);
    }
  }, [list.length]);

  const setHeight = React.useCallback((id: string | number, h: number) => {
    setHeights((prev) => (prev[String(id)] === h ? prev : { ...prev, [String(id)]: h }));
  }, []);

  const frontHeight = shown[0] ? heights[String(shown[0].id)] ?? 64 : 64;

  const horizontal = position.endsWith("left") ? "sm:start-4 sm:items-start" : position.endsWith("center") ? "sm:start-1/2 sm:-translate-x-1/2 sm:items-center" : "sm:end-4 sm:items-end";

  return (
    <section
      aria-label="Notifications (Alt+T)"
      tabIndex={-1}
      className={cn("pointer-events-none fixed inset-x-0 z-[100] flex flex-col px-3 sm:inset-x-auto sm:w-[22rem] sm:px-0", top ? "top-3 sm:top-4" : "bottom-3 sm:bottom-4", horizontal, className)}
      style={top ? { paddingTop: "env(safe-area-inset-top, 0px)" } : { paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ol
        ref={listRef}
        className="pointer-events-auto relative w-full"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false);
        }}
        style={{ height: shown.length ? (open ? shown.reduce((s, t) => s + (heights[String(t.id)] ?? 64) + GAP, -GAP) : frontHeight + Math.min(shown.length - 1, 2) * 12) : 0 }}
      >
        {visible.map((t) => {
          const index = shown.indexOf(t);
          const before = shown.slice(0, Math.max(0, index)).reduce((s, x) => s + (heights[String(x.id)] ?? 64) + GAP, 0);
          return (
            <ToastItem
              key={t.id}
              toast={t}
              index={index}
              offset={open ? before : index * 12}
              collapsedScale={open ? 1 : 1 - Math.max(0, index) * 0.05}
              front={index === 0}
              top={top}
              frontHeight={frontHeight}
              open={open}
              paused={paused}
              richColors={richColors}
              showTimer={showTimer}
              onHeight={setHeight}
              leaving={!!t.dismissed || leaving.includes(t)}
            />
          );
        })}
      </ol>
    </section>
  );
}

/* ---------- one toast ---------- */

function ToastItem({
  toast: t,
  index,
  offset,
  collapsedScale,
  front,
  top,
  frontHeight,
  open,
  paused,
  richColors,
  showTimer,
  onHeight,
  leaving,
}: {
  toast: ToastData;
  index: number;
  offset: number;
  collapsedScale: number;
  front: boolean;
  top: boolean;
  frontHeight: number;
  open: boolean;
  paused: boolean;
  richColors: boolean;
  showTimer: boolean;
  onHeight: (id: string | number, h: number) => void;
  leaving: boolean;
}) {
  const ref = React.useRef<HTMLLIElement>(null);
  const duration = t.duration ?? (t.type === "loading" ? Infinity : t.type === "error" ? 8000 : 5000);
  const remaining = React.useRef(duration);
  const startedAt = React.useRef(Date.now());
  const [swipe, setSwipe] = React.useState(0);
  const drag = React.useRef<{ x: number; id: number } | null>(null);

  // Report our height for stacking.
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => onHeight(t.id, el.offsetHeight);
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [t.id, onHeight]);

  // Restart the clock when the toast is updated (e.g. loading → success).
  React.useEffect(() => {
    remaining.current = duration;
  }, [t.createdAt, duration]);

  // Auto-dismiss, pausing while hovered, focused or the page is hidden. Only the visible ones count down.
  React.useEffect(() => {
    if (leaving || duration === Infinity || paused || index < 0) return;
    startedAt.current = Date.now();
    const timer = window.setTimeout(() => dismiss(t.id), remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current -= Date.now() - startedAt.current;
    };
  }, [paused, leaving, duration, t.id, t.createdAt, index]);

  // After the exit animation, remove it from the store.
  React.useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => removeNow(t.id), 200);
    return () => window.clearTimeout(timer);
  }, [leaving, t.id]);

  const type = t.type;
  const role = type === "error" ? "alert" : "status";
  const hiddenBehind = index >= 3 || index < 0;

  const style: React.CSSProperties = {
    // Stacked toasts sit behind the front one; spread out when open.
    transform: leaving
      ? `translateY(${(top ? offset : -offset) + (top ? -14 : 14)}px) scale(0.96)`
      : `translateY(${top ? offset : -offset}px) translateX(${swipe}px) scale(${collapsedScale})`,
    opacity: leaving ? 0 : hiddenBehind && !open ? 0 : Math.max(0, 1 - Math.abs(swipe) / 180),
    zIndex: 100 - Math.max(index, 0),
    ...(open || front ? {} : { height: frontHeight, overflow: "hidden" }),
  };

  return (
    <li
      ref={ref}
      data-toast=""
      tabIndex={0}
      role={role}
      aria-live={type === "error" ? "assertive" : "polite"}
      aria-atomic="true"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          dismiss(t.id);
        }
      }}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        drag.current = { x: e.clientX, id: e.pointerId };
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (drag.current && drag.current.id === e.pointerId) setSwipe(e.clientX - drag.current.x);
      }}
      onPointerUp={() => {
        if (!drag.current) return;
        drag.current = null;
        if (Math.abs(swipe) > 90) dismiss(t.id);
        else setSwipe(0);
      }}
      className={cn(
        "absolute inset-x-0 flex touch-pan-y select-none items-start gap-3 rounded-control-lg border p-3.5 pe-3 text-sm outline-none",
        "shadow-[var(--ui-shadow-lg)] focus-visible:ring-3 focus-visible:ring-ring/35",
        top ? "top-0 origin-bottom" : "bottom-0 origin-top",
        drag.current ? "" : "transition-[transform,opacity,height] duration-300 ease-[cubic-bezier(0.2,0.9,0.3,1)] motion-reduce:transition-none",
        top ? "animate-[ui-toast-in-top_320ms_cubic-bezier(0.2,0.9,0.3,1)]" : "animate-[ui-toast-in-bottom_320ms_cubic-bezier(0.2,0.9,0.3,1)]",
        "motion-reduce:animate-[ui-fade-in_150ms_ease-out]",
        richColors && type !== "default" && type !== "loading" ? richBg[type] : "border-border bg-surface",
        "text-fg"
      )}
      style={style}
    >
      {/* icon */}
      {t.icon ? (
        <span className="mt-px shrink-0">{t.icon}</span>
      ) : type === "loading" ? (
        <span className="mt-px grid size-5 shrink-0 place-items-center">
          <ActivityIndicator size="sm" label="" aria-hidden="true" role={undefined} />
        </span>
      ) : type !== "default" ? (
        <span className={cn("mt-px grid size-5 shrink-0 place-items-center rounded-full", toneBg[type])}>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-3.5">
            {icons[type]}
          </svg>
        </span>
      ) : null}

      <div className="grid min-w-0 flex-1 gap-0.5 pt-px">
        <div className="font-medium leading-snug">{t.title}</div>
        {t.description && <div className="text-[0.8125rem] leading-relaxed text-fg-muted">{t.description}</div>}
      </div>

      {t.action && (
        <button
          type="button"
          onClick={() => {
            t.action!.onClick();
            dismiss(t.id);
          }}
          className="-my-0.5 shrink-0 cursor-pointer rounded-control-sm bg-fg px-2.5 py-1 text-[0.8125rem] font-medium text-bg hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {t.action.label}
        </button>
      )}
      {t.dismissible !== false && (
        <button
          type="button"
          aria-label="Close notification"
          onClick={() => dismiss(t.id)}
          className="-me-1 -mt-0.5 grid size-6 shrink-0 cursor-pointer place-items-center rounded-control-sm text-fg-muted hover:bg-secondary-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-ring"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true" className="size-3.5">
            <path d="M6 6l8 8M14 6l-8 8" />
          </svg>
        </button>
      )}

      {/* time left */}
      {showTimer && duration !== Infinity && front && !leaving && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-3 bottom-0 h-[2px] overflow-hidden rounded-full">
          <span
            key={`${t.createdAt}`}
            className="block h-full origin-left bg-[color:color-mix(in_srgb,var(--color-fg-muted)_45%,transparent)] motion-reduce:hidden"
            style={{ animation: `ui-toast-timer ${duration}ms linear forwards`, animationPlayState: paused ? "paused" : "running" }}
          />
        </span>
      )}
    </li>
  );
}
