import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/cn";

/*
 * Tooltip — a short hint for an element: the name of an icon-only button, the full text
 * of something truncated, a keyboard shortcut. Not for anything people need to act on
 * or select (use a popover or plain text for that), and not for touch-only information:
 * phones never show it.
 *
 *   <Tooltip content="Archive"><Button iconOnly icon="bi bi-archive" aria-label="Archive" /></Tooltip>
 *
 * Shows on hover (after `delay`) and on keyboard focus; hides on Escape, blur and when the
 * pointer leaves (the tooltip itself can be hovered, so it can be read at high zoom).
 * Moving from one tooltip to the next shows the next one at once.
 *
 * It's shown with the Popover API, so it sits in the top layer: above modals, drawers and
 * anything with overflow: hidden, without z-index juggling. No provider is needed.
 */

export type TooltipSide = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  /** The hint. Keep it short — a few words, or a name and a shortcut. */
  content: React.ReactNode;
  /** The element it describes. It must accept a ref and focus/pointer handlers (a button, a link…). */
  children: React.ReactElement;
  /** Preferred side; it flips when there's no room. Default "top". */
  side?: TooltipSide;
  /** Line it up with the element's start, center (default) or end. */
  align?: "start" | "center" | "end";
  /** Milliseconds of hovering before it shows. Default 400. Keyboard focus shows it at once. */
  delay?: number;
  /** Don't show it (e.g. when the full text is already visible). */
  disabled?: boolean;
  /**
   * How screen readers use the text.
   * - "description" (default): read after the element's own name, e.g. "Archive, Ctrl+E".
   * - "label": the tooltip *is* the name — for an icon-only control with no aria-label.
   */
  as?: "description" | "label";
  className?: string;
}

// Shared across tooltips: while one is showing, or if one closed a moment ago, the next
// opens without waiting — so moving along a toolbar reads each button at once.
let openCount = 0;
let lastHiddenAt = 0;
// Only one tooltip shows at a time: opening one closes the last.
let closeCurrent: (() => void) | null = null;
const WARM_MS = 500;
const GAP = 6;

const supportsPopover = () => typeof HTMLElement !== "undefined" && "showPopover" in HTMLElement.prototype;

export function Tooltip({
  content,
  children,
  side = "top",
  align = "center",
  delay = 400,
  disabled = false,
  as = "description",
  className,
}: TooltipProps) {
  const id = React.useId();
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const tipRef = React.useRef<HTMLDivElement | null>(null);
  const timers = React.useRef({ show: 0, hide: 0 });
  const [open, setOpen] = React.useState(false);
  const [placed, setPlaced] = React.useState<{ side: TooltipSide; style: React.CSSProperties }>({
    side,
    style: { visibility: "hidden" },
  });

  const clear = () => {
    window.clearTimeout(timers.current.show);
    window.clearTimeout(timers.current.hide);
  };
  const show = (wait: number) => {
    if (disabled) return;
    clear();
    const instant = wait === 0 || openCount > 0 || Date.now() - lastHiddenAt < WARM_MS;
    if (instant) setOpen(true);
    else timers.current.show = window.setTimeout(() => setOpen(true), wait);
  };
  const hide = (wait = 0) => {
    clear();
    const done = () => setOpen(false);
    if (wait) timers.current.hide = window.setTimeout(done, wait);
    else done();
  };

  React.useEffect(() => () => clear(), []);
  React.useEffect(() => {
    if (!open) return;
    const close = () => hide();
    if (closeCurrent && closeCurrent !== close) closeCurrent();
    closeCurrent = close;
    openCount++;
    return () => {
      openCount--;
      lastHiddenAt = Date.now();
      if (closeCurrent === close) closeCurrent = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  React.useEffect(() => {
    if (disabled) hide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  const place = React.useCallback(() => {
    const t = triggerRef.current;
    const tip = tipRef.current;
    if (!t || !tip) return;
    const r = t.getBoundingClientRect();
    const w = tip.offsetWidth;
    const h = tip.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const room: Record<TooltipSide, number> = { top: r.top, bottom: vh - r.bottom, left: r.left, right: vw - r.right };
    const need = side === "top" || side === "bottom" ? h + GAP : w + GAP;
    const opposite: Record<TooltipSide, TooltipSide> = { top: "bottom", bottom: "top", left: "right", right: "left" };
    const s = room[side] >= need || room[side] >= room[opposite[side]] ? side : opposite[side];

    let left: number;
    let top: number;
    if (s === "top" || s === "bottom") {
      top = s === "top" ? r.top - h - GAP : r.bottom + GAP;
      left = align === "start" ? r.left : align === "end" ? r.right - w : r.left + r.width / 2 - w / 2;
    } else {
      left = s === "left" ? r.left - w - GAP : r.right + GAP;
      top = align === "start" ? r.top : align === "end" ? r.bottom - h : r.top + r.height / 2 - h / 2;
    }
    // Stay on screen.
    left = Math.max(8, Math.min(left, vw - w - 8));
    top = Math.max(8, Math.min(top, vh - h - 8));
    setPlaced({ side: s, style: { left, top } });
  }, [side, align]);

  React.useLayoutEffect(() => {
    const tip = tipRef.current;
    if (!tip) return;
    if (!open) {
      if (supportsPopover() && tip.matches(":popover-open")) tip.hidePopover();
      setPlaced((p) => ({ ...p, style: { visibility: "hidden" } }));
      return;
    }
    if (supportsPopover() && !tip.matches(":popover-open")) tip.showPopover();
    place();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") hide();
    };
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    document.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("keydown", onKey, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, place]);

  const childProps = children.props as Record<string, unknown>;
  const ariaKey = as === "label" ? "aria-labelledby" : "aria-describedby";
  const ariaValue = [childProps[ariaKey] as string | undefined, `${id}-tip`].filter(Boolean).join(" ");

  const fromBySide: Record<TooltipSide, string> = {
    top: "translateY(3px)",
    bottom: "translateY(-3px)",
    left: "translateX(3px)",
    right: "translateX(-3px)",
  };

  return (
    <>
      <Slot
        ref={triggerRef}
        {...{ [ariaKey]: disabled && as === "description" ? childProps[ariaKey] : ariaValue }}
        onPointerEnter={(e: React.PointerEvent) => {
          if (e.pointerType !== "touch") show(delay);
        }}
        onPointerLeave={(e: React.PointerEvent) => {
          if (e.pointerType !== "touch") hide(100);
        }}
        onPointerDown={() => hide()}
        onFocus={(e: React.FocusEvent<HTMLElement>) => {
          // Keyboard focus only — a mouse click focusing a button shouldn't pop a tooltip.
          if (e.currentTarget.matches(":focus-visible")) show(0);
        }}
        onBlur={() => hide()}
      >
        {children}
      </Slot>
      <div
        ref={tipRef}
        id={`${id}-tip`}
        role="tooltip"
        popover={supportsPopover() ? "manual" : undefined}
        hidden={!supportsPopover() && !open ? true : undefined}
        data-side={placed.side}
        data-state={open ? "open" : "closed"}
        onPointerEnter={() => open && clear()}
        onPointerLeave={() => hide(100)}
        style={{ ...placed.style, ["--ui-tooltip-from" as string]: fromBySide[placed.side] }}
        className={cn(
          // Undo the browser's popover box (centered, bordered) and place it ourselves.
          "fixed inset-auto m-0 overflow-visible border-0 p-0",
          "z-[70] max-w-[min(18rem,calc(100vw-1rem))] rounded-control bg-ash-900 px-2.5 py-1.5 text-[0.8125rem] font-medium leading-snug text-white",
          "shadow-[var(--ui-shadow-md)] dark:bg-ash-50 dark:text-ash-950",
          "data-[state=open]:animate-[ui-tooltip-in_120ms_ease-out] motion-reduce:data-[state=open]:animate-[ui-fade-in_120ms_ease-out]",
          className
        )}
      >
        {content}
      </div>
    </>
  );
}
