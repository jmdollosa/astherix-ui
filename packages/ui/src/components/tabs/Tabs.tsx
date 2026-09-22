import * as React from "react";
import { cn } from "../../lib/cn";
import { renderIcon, type IconInput } from "../button/Button";

/*
 * Tabs — horizontal or vertical, with optional reordering (drag, or Alt + arrow keys),
 * renaming (double-click or F2), adding and closing tabs, and disabled tabs.
 * Follows the WAI-ARIA tabs pattern: one Tab stop for the list, arrow keys between tabs.
 */

type Orientation = "horizontal" | "vertical";
type Variant = "line" | "enclosed" | "pills";

type TabsContextValue = {
  value: string | null;
  select: (value: string | null) => void;
  orientation: Orientation;
  variant: Variant;
  size: "sm" | "md";
  activation: "automatic" | "manual";
  tabId: (value: string) => string;
  panelId: (value: string) => string;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);
function useTabs(component: string) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Tabs>.`);
  return ctx;
}

const safeId = (value: string) => value.replace(/[^A-Za-z0-9_-]/g, (c) => `_${c.charCodeAt(0).toString(36)}`);

/* ---------- Tabs (root) ---------- */

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  orientation?: Orientation;
  /** "line": underline under the active tab. "enclosed": folder-style tabs. "pills": a segmented control. */
  variant?: Variant;
  size?: "sm" | "md";
  /** "automatic" selects a tab as soon as it gets focus; "manual" waits for Enter or Space. */
  activation?: "automatic" | "manual";
}

export function Tabs({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  orientation = "horizontal",
  variant = "line",
  size = "md",
  activation = "automatic",
  className,
  children,
  ...props
}: TabsProps) {
  const [uncontrolled, setUncontrolled] = React.useState<string | null>(defaultValue);
  const controlled = valueProp !== undefined;
  const value = controlled ? valueProp : uncontrolled;
  const onChangeRef = React.useRef(onValueChange);
  onChangeRef.current = onValueChange;
  const base = React.useId();

  const select = React.useCallback(
    (next: string | null) => {
      if (!controlled) setUncontrolled(next);
      onChangeRef.current?.(next);
    },
    [controlled]
  );

  const ctx = React.useMemo<TabsContextValue>(
    () => ({
      value,
      select,
      orientation,
      variant,
      size,
      activation,
      tabId: (v) => `${base}-tab-${safeId(v)}`,
      panelId: (v) => `${base}-panel-${safeId(v)}`,
    }),
    [value, select, orientation, variant, size, activation, base]
  );

  return (
    <TabsContext.Provider value={ctx}>
      <div
        data-orientation={orientation}
        className={cn(orientation === "vertical" ? "flex items-start gap-6" : "grid gap-4", className)}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

/* ---------- TabList ---------- */

type ListContextValue = {
  editing: string | null;
  startEditing: (value: string) => void;
  finishEditing: (value: string, label: string | null) => void;
  renamable: boolean;
  closable: boolean;
  reorderable: boolean;
  onTabKeyDown: (event: React.KeyboardEvent, value: string) => void;
  onTabPointerDown: (event: React.PointerEvent, value: string) => void;
  close: (value: string) => void;
  closeLabel: (label: string) => string;
  register: (value: string, wrapper: HTMLElement | null, button: HTMLElement | null) => void;
  dragging: string | null;
};
const ListContext = React.createContext<ListContextValue | null>(null);

export interface TabListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Makes tabs draggable (and movable with Alt + arrow keys). Called with the new order of values. */
  onReorder?: (values: string[]) => void;
  /** Makes tabs renamable by double-click or F2. Called with the tab's value and new label. */
  onRename?: (value: string, label: string) => void;
  /**
   * Shows a + button. Return the new tab's value (or a Promise of it) to select and focus
   * it — and start renaming it with renameOnAdd.
   */
  onAdd?: () => string | void | Promise<string | void>;
  /** Label for the + button. */
  addLabel?: string;
  /** Start renaming a tab right after it's added. */
  renameOnAdd?: boolean;
  /** Shows a × on tabs. If the active tab closes, a neighbor is selected first. */
  onClose?: (value: string) => void;
  closeLabel?: (label: string) => string;
}

type TabInfo = { value: string; label: string; disabled: boolean };

function textOf(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

export function TabList({
  onReorder,
  onRename,
  onAdd,
  addLabel = "New tab",
  renameOnAdd = false,
  onClose,
  closeLabel = (label) => `Close ${label}`,
  className,
  children,
  ...props
}: TabListProps) {
  const tabs = useTabs("TabList");
  const { orientation, variant, size, value: selected, select } = tabs;
  const vertical = orientation === "vertical";

  // The tabs, in order, read from the children.
  const infos: TabInfo[] = React.Children.toArray(children)
    .filter((c): c is React.ReactElement<TabProps> => React.isValidElement(c) && typeof (c.props as TabProps).value === "string")
    .map((c) => ({
      value: c.props.value,
      label: c.props.label ?? textOf(c.props.children),
      disabled: !!c.props.disabled,
    }));
  const order = infos.map((t) => t.value);
  const orderKey = order.join("\u0000");

  const wrappers = React.useRef(new Map<string, HTMLElement>());
  const buttons = React.useRef(new Map<string, HTMLElement>());
  const register = React.useCallback((value: string, wrapper: HTMLElement | null, button: HTMLElement | null) => {
    if (wrapper) wrappers.current.set(value, wrapper);
    else wrappers.current.delete(value);
    if (button) buttons.current.set(value, button);
    else buttons.current.delete(value);
  }, []);

  const [announcement, setAnnouncement] = React.useState("");
  const [editing, setEditing] = React.useState<string | null>(null);
  const [pendingFocus, setPendingFocus] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState<string | null>(null);

  const focusTab = (value: string) => buttons.current.get(value)?.focus();
  const labelOf = (value: string) => infos.find((t) => t.value === value)?.label ?? value;

  // Focus a tab that appears after an update (added, or after closing a neighbor).
  React.useEffect(() => {
    if (pendingFocus && buttons.current.has(pendingFocus)) {
      focusTab(pendingFocus);
      setPendingFocus(null);
    }
  });

  // If nothing is selected yet, select the first enabled tab.
  React.useEffect(() => {
    if (selected === null || !order.includes(selected)) {
      const first = infos.find((t) => !t.disabled);
      if (first && selected === null) select(first.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderKey, selected]);

  const orderRef = React.useRef(order);
  orderRef.current = order;

  /* ----- moving ----- */
  const move = (value: string, to: number) => {
    if (!onReorder) return;
    // Read the latest order: during a drag this runs many times before React re-renders us.
    const current = orderRef.current;
    const from = current.indexOf(value);
    const target = Math.max(0, Math.min(current.length - 1, to));
    if (from < 0 || from === target) return;
    const next = current.filter((v) => v !== value);
    next.splice(target, 0, value);
    orderRef.current = next;
    onReorder(next);
    setAnnouncement(`Moved ${labelOf(value)} to position ${target + 1} of ${current.length}.`);
  };

  // Siblings glide into their new places (FLIP), except the tab being dragged.
  const lastPositions = React.useRef(new Map<string, number>());
  React.useLayoutEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const next = new Map<string, number>();
    for (const [value, el] of wrappers.current) {
      const pos = vertical ? el.offsetTop : el.offsetLeft;
      next.set(value, pos);
      const prev = lastPositions.current.get(value);
      if (reduce || prev === undefined || prev === pos || value === dragging) continue;
      el.style.transition = "none";
      el.style.transform = vertical ? `translateY(${prev - pos}px)` : `translateX(${prev - pos}px)`;
      void el.offsetWidth;
      el.style.transition = "transform 160ms cubic-bezier(0.2, 0.8, 0.2, 1)";
      el.style.transform = "";
    }
    lastPositions.current = next;
  }, [orderKey, vertical, dragging]);

  /* ----- keyboard ----- */
  const enabled = infos.filter((t) => !t.disabled).map((t) => t.value);
  const neighbor = (value: string, step: number) => {
    const i = enabled.indexOf(value);
    if (!enabled.length) return value;
    return enabled[(i + step + enabled.length) % enabled.length];
  };

  const onTabKeyDown = (event: React.KeyboardEvent, value: string) => {
    const prevKey = vertical ? "ArrowUp" : "ArrowLeft";
    const nextKey = vertical ? "ArrowDown" : "ArrowRight";
    const go = (target: string) => {
      event.preventDefault();
      focusTab(target);
      if (tabs.activation === "automatic") select(target);
    };

    if ((event.key === prevKey || event.key === nextKey) && event.altKey && onReorder) {
      event.preventDefault();
      move(value, order.indexOf(value) + (event.key === nextKey ? 1 : -1));
      requestAnimationFrame(() => focusTab(value));
      return;
    }
    switch (event.key) {
      case nextKey:
        return go(neighbor(value, 1));
      case prevKey:
        return go(neighbor(value, -1));
      case "Home":
        return enabled[0] && go(enabled[0]);
      case "End":
        return enabled.length && go(enabled[enabled.length - 1]);
      case "Enter":
      case " ":
        event.preventDefault();
        select(value);
        return;
      case "F2":
        if (onRename) {
          event.preventDefault();
          setEditing(value);
        }
        return;
      case "Delete":
        if (onClose) {
          event.preventDefault();
          close(value);
        }
        return;
    }
  };

  /* ----- dragging (mouse, pen, and touch after a short press) ----- */
  const onTabPointerDown = (event: React.PointerEvent, value: string) => {
    if (event.button !== 0 || editing) return;
    if ((event.target as HTMLElement).closest("[data-tab-close]")) return;
    const info = infos.find((t) => t.value === value);
    if (!info || info.disabled) return;
    select(value);
    if (!onReorder) return;

    const wrapper = wrappers.current.get(value);
    if (!wrapper) return;
    const start = vertical ? event.clientY : event.clientX;
    const cross = vertical ? event.clientX : event.clientY;
    const origin = vertical ? wrapper.offsetTop : wrapper.offsetLeft;
    const touch = event.pointerType === "touch";
    let active = false;
    let pressed = !touch; // touch needs a short press before dragging, so scrolling still works
    const pressTimer = touch ? window.setTimeout(() => (pressed = true), 350) : 0;

    const begin = () => {
      active = true;
      setDragging(value);
      document.body.style.cursor = "grabbing";
      wrapper.style.transition = "none";
      wrapper.style.zIndex = "10";
    };
    const onMove = (e: PointerEvent) => {
      const pos = vertical ? e.clientY : e.clientX;
      if (!active) {
        const moved = Math.abs(pos - start) > 4 || Math.abs((vertical ? e.clientX : e.clientY) - cross) > 8;
        if (!moved) return;
        if (!pressed) return cleanup(); // a swipe on touch: let the list scroll instead
        begin();
      }
      e.preventDefault();
      // Where would the tab land? Count the other tabs whose middle is before the pointer.
      const currentOrder = orderRef.current;
      let index = 0;
      for (const v of currentOrder) {
        if (v === value) continue;
        const el = wrappers.current.get(v);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const mid = vertical ? r.top + r.height / 2 : r.left + r.width / 2;
        if (pos > mid) index++;
      }
      if (index !== currentOrder.indexOf(value)) move(value, index);
      const now = vertical ? wrapper.offsetTop : wrapper.offsetLeft;
      const offset = pos - start - (now - origin);
      wrapper.style.transform = vertical ? `translateY(${offset}px)` : `translateX(${offset}px)`;
    };
    const preventTouchScroll = (e: TouchEvent) => {
      if (active) e.preventDefault();
    };
    const cleanup = () => {
      window.clearTimeout(pressTimer);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("touchmove", preventTouchScroll);
    };
    const onUp = () => {
      cleanup();
      if (!active) return;
      document.body.style.cursor = "";
      wrapper.style.transition = "transform 160ms cubic-bezier(0.2, 0.8, 0.2, 1)";
      wrapper.style.transform = "";
      wrapper.style.zIndex = "";
      setDragging(null);
      lastPositions.current.set(value, vertical ? wrapper.offsetTop : wrapper.offsetLeft);
    };
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("touchmove", preventTouchScroll, { passive: false });
  };
  /* ----- close, rename, add ----- */
  const close = (value: string) => {
    if (!onClose) return;
    if (value === selected) {
      const i = enabled.indexOf(value);
      const next = enabled[i + 1] ?? enabled[i - 1] ?? null;
      select(next);
      if (next) setPendingFocus(next);
    }
    onClose(value);
    setAnnouncement(`Closed ${labelOf(value)}.`);
  };

  const finishEditing = (value: string, label: string | null) => {
    setEditing(null);
    const trimmed = label?.trim();
    if (trimmed && trimmed !== labelOf(value)) {
      onRename?.(value, trimmed);
      setAnnouncement(`Renamed to ${trimmed}.`);
    }
    setPendingFocus(value);
  };

  const add = async () => {
    if (!onAdd) return;
    const value = await onAdd();
    if (typeof value === "string") {
      select(value);
      if (renameOnAdd && onRename) setEditing(value);
      else setPendingFocus(value);
    }
  };

  /* ----- active indicator for the line style ----- */
  const listRef = React.useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = React.useState<{ start: number; size: number } | null>(null);
  const measured = React.useRef(false);
  React.useLayoutEffect(() => {
    if (variant !== "line") return;
    const measure = () => {
      const el = selected ? wrappers.current.get(selected) : undefined;
      setIndicator(el ? { start: vertical ? el.offsetTop : el.offsetLeft, size: vertical ? el.offsetHeight : el.offsetWidth } : null);
    };
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (ro && listRef.current) ro.observe(listRef.current);
    return () => ro?.disconnect();
  }, [selected, orderKey, variant, vertical, editing]);
  React.useEffect(() => {
    if (indicator) measured.current = true;
  }, [indicator]);

  // Keep the selected tab visible when the list scrolls.
  React.useEffect(() => {
    if (selected) wrappers.current.get(selected)?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }, [selected]);

  const listCtx: ListContextValue = {
    editing,
    startEditing: (v) => onRename && setEditing(v),
    finishEditing,
    renamable: !!onRename,
    closable: !!onClose,
    reorderable: !!onReorder,
    onTabKeyDown,
    onTabPointerDown,
    close,
    closeLabel,
    register,
    dragging,
  };

  return (
    <ListContext.Provider value={listCtx}>
      <div
        className={cn(
          "relative flex",
          vertical ? "w-52 shrink-0 flex-col" : "items-end",
          // The baseline is an inset shadow (not a border) so the active tab can cover it.
          variant !== "pills" && (vertical ? "shadow-[inset_-1px_0_0_var(--color-border)]" : "shadow-[inset_0_-1px_0_var(--color-border)]"),
          variant === "pills" && cn("gap-1 rounded-control-lg bg-secondary-hover p-1", vertical ? "" : "w-fit max-w-full items-center"),
          className
        )}
      >
        <div
          ref={listRef}
          role="tablist"
          aria-orientation={orientation}
          className={cn(
            "relative flex min-w-0",
            vertical ? "flex-col" : "overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            variant === "pills" ? "gap-1" : variant === "enclosed" ? (vertical ? "gap-0.5" : "gap-0.5 px-1 pt-1") : vertical ? "" : "gap-1",
            !vertical && "flex-1"
          )}
          {...props}
        >
          {children}
          {variant === "line" && indicator && (
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute bg-primary",
                vertical ? "end-0 w-0.5" : "bottom-0 h-0.5",
                measured.current && "transition-[left,top,width,height] duration-200 ease-out motion-reduce:transition-none"
              )}
              style={vertical ? { top: indicator.start, height: indicator.size } : { left: indicator.start, width: indicator.size }}
            />
          )}
        </div>

        {onAdd && (
          <button
            type="button"
            aria-label={addLabel}
            title={addLabel}
            onClick={() => void add()}
            className={cn(
              "flex shrink-0 cursor-pointer items-center gap-2 rounded-control-sm text-fg-muted hover:bg-secondary-hover hover:text-fg",
              "focus-visible:outline-2 focus-visible:outline-ring [&_svg]:size-4",
              vertical ? cn("mt-1 px-3 text-sm", size === "sm" ? "h-8" : "h-9") : cn("mx-1 mb-1 justify-center", size === "sm" ? "size-7" : "size-8"),
              variant === "pills" && !vertical && "mb-0",
              variant === "pills" && "hover:bg-surface"
            )}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" aria-hidden="true">
              <path d="M10 4.5v11M4.5 10h11" />
            </svg>
            {vertical && <span>{addLabel}</span>}
          </button>
        )}

        <span className="sr-only" aria-live="polite">
          {announcement}
        </span>
      </div>
    </ListContext.Provider>
  );
}

/* ---------- Tab ---------- */

export interface TabProps {
  value: string;
  /** Plain-text label (used for renaming and announcements). Defaults to the children's text. */
  label?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  icon?: IconInput;
  /** Extra content after the label, e.g. a count badge. */
  badge?: React.ReactNode;
  /** Opt this tab out of renaming. */
  renamable?: boolean;
  /** Opt this tab out of closing. */
  closable?: boolean;
  className?: string;
}

export function Tab({ value, label, children, disabled = false, icon, badge, renamable = true, closable = true, className }: TabProps) {
  const tabs = useTabs("Tab");
  const list = React.useContext(ListContext);
  if (!list) throw new Error("<Tab> must be used inside <TabList>.");
  const { variant, size, orientation } = tabs;
  const vertical = orientation === "vertical";
  const selected = tabs.value === value;
  const editing = list.editing === value;
  const text = label ?? textOf(children);

  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  React.useLayoutEffect(() => {
    list.register(value, wrapperRef.current, buttonRef.current);
    return () => list.register(value, null, null);
  });

  const canClose = list.closable && closable && !disabled;

  const tabClass = cn(
    "relative flex min-w-0 cursor-pointer select-none items-center gap-2 whitespace-nowrap text-fg-muted outline-none",
    "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
    "[&_svg]:size-[1.05em] [&_svg]:shrink-0 [&_i]:text-[1.05em] [&_i]:leading-none",
    size === "sm" ? "h-8 px-2.5 text-[0.8125rem]" : "h-10 px-3 text-sm",
    vertical && "w-full",
    variant === "line" && cn("rounded-control-sm hover:text-fg", vertical ? "hover:bg-secondary-hover" : "hover:bg-secondary-hover/60", selected && "font-medium text-fg"),
    variant === "enclosed" && cn(
      vertical ? "rounded-s-control" : "rounded-t-control",
      "border border-transparent hover:text-fg",
      selected && cn("border-border bg-surface font-medium text-fg", vertical ? "border-e-surface" : "border-b-surface")
    ),
    variant === "pills" && cn("rounded-control hover:text-fg", selected && "bg-surface font-medium text-fg shadow-[var(--ui-shadow-sm)]"),
    disabled && "cursor-not-allowed opacity-45 hover:bg-transparent hover:text-fg-muted",
    canClose && "pe-8",
    className
  );

  return (
    <div
      ref={wrapperRef}
      role="presentation"
      className={cn("relative flex shrink-0", vertical && "w-full", list.dragging === value && "cursor-grabbing drop-shadow-md")}
    >
      {editing ? (
        <input
          autoFocus
          aria-label="Tab name"
          defaultValue={text}
          onFocus={(e) => e.currentTarget.select()}
          onBlur={(e) => list.finishEditing(value, e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              list.finishEditing(value, e.currentTarget.value);
            } else if (e.key === "Escape") {
              e.preventDefault();
              e.stopPropagation();
              list.finishEditing(value, null);
            }
          }}
          className={cn(
            "rounded-control-sm border border-ring bg-surface text-fg outline-none ring-3 ring-ring/25",
            size === "sm" ? "h-8 px-2 text-[0.8125rem]" : "h-10 px-2.5 text-sm",
            vertical ? "w-full" : "w-40"
          )}
        />
      ) : (
        <button
          ref={buttonRef}
          type="button"
          role="tab"
          id={tabs.tabId(value)}
          aria-selected={selected}
          aria-controls={tabs.panelId(value)}
          aria-disabled={disabled || undefined}
          tabIndex={selected ? 0 : -1}
          onPointerDown={(e) => list.onTabPointerDown(e, value)}
          onClick={() => !disabled && tabs.select(value)}
          onDoubleClick={() => !disabled && list.renamable && renamable && list.startEditing(value)}
          onKeyDown={(e) => {
            if (e.key === "F2" && !renamable) return;
            if (e.key === "Delete" && !canClose) return;
            list.onTabKeyDown(e, value);
          }}
          className={tabClass}
          title={list.renamable && renamable && !disabled ? `${text} — double-click to rename` : undefined}
        >
          {renderIcon(icon)}
          <span className="truncate">{children ?? text}</span>
          {badge}
        </button>
      )}
      {canClose && !editing && (
        <button
          type="button"
          tabIndex={-1}
          data-tab-close=""
          aria-label={list.closeLabel(text)}
          onClick={() => list.close(value)}
          className={cn(
            "absolute end-1.5 top-1/2 grid size-5 -translate-y-1/2 cursor-pointer place-items-center rounded-[4px] text-fg-muted",
            "hover:bg-border hover:text-fg",
          )}
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true" className="size-3">
            <path d="M6 6l8 8M14 6l-8 8" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ---------- TabPanel ---------- */

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  /** Keep the panel in the page while hidden, so its state (scroll, form input) is kept. */
  keepMounted?: boolean;
}

export function TabPanel({ value, keepMounted = false, className, children, ...props }: TabPanelProps) {
  const tabs = useTabs("TabPanel");
  const selected = tabs.value === value;
  if (!selected && !keepMounted) return null;
  return (
    <div
      role="tabpanel"
      id={tabs.panelId(value)}
      aria-labelledby={tabs.tabId(value)}
      tabIndex={0}
      hidden={!selected}
      className={cn("min-w-0 flex-1 rounded-control outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring", className)}
      {...props}
    >
      {children}
    </div>
  );
}
