import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/cn";
import { useField, useFieldControlProps } from "../input/Field";

/*
 * Slider — pick a number (or a range) by dragging.
 *
 * At rest the thumb is a raised knob on a sunken track. Press it and it swells into a frosted
 * glass lens that blurs the colored track beneath, while a glass bubble rises above your finger
 * with the value — so the number is never hidden under your thumb on a phone.
 * Drag past either end and it stretches a little, then springs back. On phones that support it,
 * you feel a tiny tick as the value snaps between marks.
 *
 * Accessible: each thumb is role="slider" with the full keyboard set, and values post with forms.
 */

type Value = number | [number, number];

export interface SliderMark {
  value: number;
  label?: React.ReactNode;
}

export interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "color"> {
  /** A number, or [low, high] for a range with two thumbs. */
  value?: Value;
  defaultValue?: Value;
  /** Called continuously while dragging. */
  onChange?: (value: Value) => void;
  /** Called once the person lets go (or finishes with the keyboard) — good for saving. */
  onValueCommit?: (value: Value) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Tick marks: true for one per step, an array of values, or values with labels. */
  marks?: boolean | number[] | SliderMark[];
  /** Turn a value into text, e.g. (v) => `₱${v.toLocaleString()}`. Also read by screen readers. */
  formatValue?: (value: number) => string;
  /** When the value bubble shows: while pressed or focused (default), always, or never. */
  showValue?: "active" | "always" | "never";
  /** Fill color: the Switch palette (primary, secondary, tertiary, success, warning, danger, info) or any CSS color. */
  color?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  /** Smallest gap between the two thumbs of a range. Default one step. */
  minDistance?: number;
  /** A tiny vibration when snapping between marks (phones that support it). Default true. */
  haptics?: boolean;
  /** Adds hidden inputs with this name for normal form posts (name[] for a range in Laravel). */
  name?: string;
  /** Labels for the two thumbs of a range. Default ["Minimum", "Maximum"]. */
  thumbLabels?: [string, string];
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

const palette: Record<string, string> = {
  primary: "var(--color-primary)",
  secondary: "var(--color-tone-secondary)",
  tertiary: "var(--color-tone-tertiary)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
  info: "var(--color-info)",
};

const sizes = {
  sm: { knob: 16, track: 4, lens: 1.55 },
  md: { knob: 20, track: 6, lens: 1.6 },
  lg: { knob: 26, track: 8, lens: 1.5 },
} as const;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const decimals = (n: number) => (String(n).split(".")[1] ?? "").length;

/**
 * The value bubble. It floats above the page (rendered at the end of <body> with a fixed position)
 * so accordions, cards and scroll areas that clip their content can't cut it off.
 */
function ValueBubble({ anchor, visible, text, lift }: { anchor: HTMLElement | null; visible: boolean; text: string; lift: number }) {
  const [pos, setPos] = React.useState<{ left: number; top: number } | null>(null);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const place = React.useCallback(() => {
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    const next = { left: r.left + r.width / 2, top: r.top + r.height / 2 - lift };
    setPos((p) => (p && Math.abs(p.left - next.left) < 0.5 && Math.abs(p.top - next.top) < 0.5 ? p : next));
  }, [anchor, lift]);

  // Follow the thumb while it moves, and when the page scrolls or resizes.
  React.useLayoutEffect(() => {
    if (visible) place();
  });
  React.useEffect(() => {
    if (!visible) return;
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [visible, place]);

  if (!mounted || !pos) return null;
  return createPortal(
    <span
      aria-hidden="true"
      className={cn(
        "ui-glass pointer-events-none fixed z-[70] grid min-w-9 -translate-x-1/2 -translate-y-full place-items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[0.8125rem] font-semibold tabular-nums text-fg",
        "transition-[opacity,scale] duration-200 ease-[cubic-bezier(0.3,1.4,0.5,1)] motion-reduce:transition-none",
        visible ? "scale-100 opacity-100" : "scale-75 opacity-0"
      )}
      style={{ left: pos.left, top: pos.top }}
    >
      {text}
    </span>,
    document.body
  );
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(function Slider(
  {
    value: valueProp,
    defaultValue,
    onChange,
    onValueCommit,
    min = 0,
    max = 100,
    step = 1,
    marks,
    formatValue = (v) => String(v),
    showValue = "active",
    color = "primary",
    size = "md",
    disabled: disabledProp,
    minDistance,
    haptics = true,
    name,
    thumbLabels = ["Minimum", "Maximum"],
    id,
    className,
    style,
    "aria-label": ariaLabel,
    "aria-labelledby": labelledBy,
    ...props
  },
  ref
) {
  const field = useField();
  const control = useFieldControlProps({ id, disabled: disabledProp });
  const disabled = !!control.disabled;
  const isRange = Array.isArray(valueProp ?? defaultValue);
  const [inner, setInner] = React.useState<Value>(defaultValue ?? (isRange ? [min, max] : min));
  const value = valueProp ?? inner;
  const values: number[] = Array.isArray(value) ? value : [value];
  const gap = minDistance ?? step;
  const g = sizes[size];

  const trackRef = React.useRef<HTMLDivElement>(null);
  const thumbRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const [activeThumb, setActiveThumb] = React.useState<number | null>(null); // being dragged
  const [focusThumb, setFocusThumb] = React.useState<number | null>(null);
  const [stretch, setStretch] = React.useState(0); // px past the end (elastic)
  const latest = React.useRef(values);
  latest.current = values;

  const snap = (v: number) => {
    const s = Math.round((v - min) / step) * step + min;
    return +clamp(s, min, max).toFixed(decimals(step));
  };
  // Out-of-range values (e.g. old data) are drawn at the nearest end instead of off the track.
  const pct = (v: number) => clamp(((v - min) / (max - min)) * 100, 0, 100);

  const markList: SliderMark[] = React.useMemo(() => {
    if (!marks) return [];
    if (marks === true) {
      const n = Math.round((max - min) / step);
      return n > 60 ? [] : Array.from({ length: n + 1 }, (_, i) => ({ value: +(min + i * step).toFixed(decimals(step)) }));
    }
    return marks.map((m) => (typeof m === "number" ? { value: m } : m));
  }, [marks, min, max, step]);

  const emit = (next: number[]) => {
    const out: Value = isRange ? [next[0], next[1]] : next[0];
    if (valueProp === undefined) setInner(out);
    onChange?.(out);
  };

  const buzz = (from: number, to: number) => {
    if (!haptics || from === to || typeof navigator === "undefined" || !("vibrate" in navigator)) return;
    // Tick when crossing a mark (or on every step when there are few steps).
    const few = (max - min) / step <= 20;
    if (few || markList.some((m) => (m.value > Math.min(from, to) && m.value <= Math.max(from, to)))) {
      try {
        navigator.vibrate(4);
      } catch {
        /* not allowed */
      }
    }
  };

  const setThumb = (index: number, raw: number) => {
    const cur = latest.current;
    let v = snap(raw);
    if (isRange) v = index === 0 ? Math.min(v, cur[1] - gap) : Math.max(v, cur[0] + gap);
    v = snap(clamp(v, min, max));
    if (v === cur[index]) return;
    buzz(cur[index], v);
    const next = [...cur];
    next[index] = v;
    latest.current = next;
    emit(next);
  };

  /* ----- pointer: tap anywhere on the track, then drag ----- */
  const valueAt = (clientX: number) => {
    const r = trackRef.current!.getBoundingClientRect();
    const rtl = getComputedStyle(trackRef.current!).direction === "rtl";
    const x = rtl ? r.right - clientX : clientX - r.left;
    const over = x < 0 ? x : x > r.width ? x - r.width : 0;
    return { v: min + clamp(x / r.width, 0, 1) * (max - min), over: rtl ? -over : over };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || e.button !== 0) return;
    const { v } = valueAt(e.clientX);
    // Pick the nearest thumb (for a range); if they overlap, pick by direction of travel.
    let index = 0;
    if (isRange) {
      const d0 = Math.abs(v - values[0]);
      const d1 = Math.abs(v - values[1]);
      index = d0 === d1 ? (v > values[0] ? 1 : 0) : d0 < d1 ? 0 : 1;
    }
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setActiveThumb(index);
    thumbRefs.current[index]?.focus({ preventScroll: true });
    setThumb(index, v);

    const move = (ev: PointerEvent) => {
      const r = valueAt(ev.clientX);
      setThumb(index, r.v);
      // Elastic ends: resistance grows the further you pull, capped at 14px.
      setStretch(r.over === 0 ? 0 : Math.sign(r.over) * Math.min(14, Math.abs(r.over) ** 0.62));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      setActiveThumb(null);
      setStretch(0);
      const cur = latest.current;
      onValueCommit?.(isRange ? [cur[0], cur[1]] : cur[0]);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  /* ----- keyboard ----- */
  const onKeyDown = (index: number) => (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const big = Math.max(step, ((max - min) / 10));
    const cur = latest.current[index];
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const map: Record<string, number | undefined> = {
      ArrowRight: rtl ? -step : step,
      ArrowUp: step,
      ArrowLeft: rtl ? step : -step,
      ArrowDown: -step,
      PageUp: big,
      PageDown: -big,
    };
    let next: number | undefined;
    if (e.key in map) next = cur + (map[e.key] as number) * (e.shiftKey && !e.key.startsWith("Page") ? 10 : 1);
    else if (e.key === "Home") next = min;
    else if (e.key === "End") next = max;
    if (next === undefined) return;
    e.preventDefault();
    setThumb(index, next);
  };
  const onKeyUp = () => {
    const cur = latest.current;
    onValueCommit?.(isRange ? [cur[0], cur[1]] : cur[0]);
  };

  const fill = isRange ? { start: pct(values[0]), end: pct(values[1]) } : { start: 0, end: pct(values[0]) };
  const hasLabels = markList.some((m) => m.label !== undefined);

  return (
    <div
      ref={ref}
      className={cn("w-full select-none", disabled && "opacity-50", className)}
      style={{ ["--sl" as string]: palette[color] ?? color, ...style }}
      {...props}
    >
      <div
        className={cn("relative flex touch-pan-y items-center", disabled ? "cursor-not-allowed" : "cursor-pointer", showValue === "always" && "mt-9")}
        style={{ height: Math.max(44, g.knob * g.lens + 8), paddingInline: g.knob / 2 }}
        onPointerDown={onPointerDown}
      >
        {/* The track: sunken, with the colored fill */}
        <div
          ref={trackRef}
          className="relative w-full rounded-full bg-border-strong/80 shadow-[inset_0_1px_2px_rgb(var(--ui-shadow-color)/0.25)]"
          style={{ height: g.track }}
        >
          <div
            className={cn(
              "absolute inset-y-0 rounded-full bg-[color:var(--sl)]",
              activeThumb === null && "transition-[inset-inline-start,width] duration-150 ease-out motion-reduce:transition-none"
            )}
            style={{
              insetInlineStart: `${fill.start}%`,
              width: `calc(${fill.end - fill.start}% + ${Math.abs(stretch)}px)`,
              ...(stretch < 0 ? { transform: `translateX(${stretch}px)` } : {}),
            }}
          />
          {markList.map((m) => {
            const inFill = m.value >= (isRange ? values[0] : min) && m.value <= (isRange ? values[1] : values[0]);
            return (
              <span
                key={m.value}
                aria-hidden="true"
                className={cn("absolute top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full rtl:translate-x-1/2", inFill ? "bg-white/70" : "bg-fg-muted/50")}
                style={{ insetInlineStart: `${pct(m.value)}%` }}
              />
            );
          })}

          {values.map((v, i) => {
            const pressed = activeThumb === i;
            const lifted = pressed || (focusThumb === i && showValue !== "never");
            const bubble = showValue === "always" || (showValue === "active" && lifted);
            const text = formatValue(v);
            const thumbStretch = pressed && ((stretch > 0 && v === max) || (stretch < 0 && v === min)) ? stretch : 0;
            return (
              <div
                key={i}
                ref={(el) => {
                  thumbRefs.current[i] = el;
                }}
                role="slider"
                tabIndex={disabled ? -1 : 0}
                aria-valuemin={isRange && i === 1 ? values[0] + gap : min}
                aria-valuemax={isRange && i === 0 ? values[1] - gap : max}
                aria-valuenow={v}
                aria-valuetext={text}
                aria-disabled={disabled || undefined}
                aria-orientation="horizontal"
                aria-label={isRange ? thumbLabels[i] : ariaLabel}
                aria-labelledby={isRange ? undefined : ariaLabel ? undefined : (labelledBy ?? field?.labelId)}
                aria-describedby={control["aria-describedby"]}
                id={i === 0 ? control.id : undefined}
                onKeyDown={onKeyDown(i)}
                onKeyUp={onKeyUp}
                onFocus={() => setFocusThumb(i)}
                onBlur={() => setFocusThumb(null)}
                className={cn(
                  "group/thumb absolute top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 rounded-full outline-none rtl:translate-x-1/2",
                  activeThumb === null && "transition-[inset-inline-start] duration-150 ease-out motion-reduce:transition-none",
                  pressed && "z-[2]"
                )}
                style={{ insetInlineStart: `${pct(v)}%`, width: g.knob, height: g.knob, marginInlineStart: thumbStretch }}
              >
                {/* The knob. Pressed: it grows into frosted glass. */}
                <span
                  className={cn(
                    "absolute inset-0 rounded-full transition-[transform,background-color,box-shadow] duration-200 ease-[cubic-bezier(0.3,1.4,0.5,1)] motion-reduce:transition-none",
                    pressed
                      ? "ui-glass"
                      : "bg-white shadow-[0_1px_3px_rgb(0_0_0/0.25),0_0_0_1px_rgb(0_0_0/0.06),inset_0_-2px_0_rgb(0_0_0/0.06)]",
                    // Focus ring for keyboard use only — not while a finger or mouse is pressing.
                    !pressed && "group-focus-visible/thumb:ring-3 group-focus-visible/thumb:ring-ring/40"
                  )}
                  style={{ transform: pressed ? `scale(${g.lens})` : focusThumb === i ? "scale(1.08)" : "scale(1)" }}
                />
                {/* A dot of the fill color at the center, visible through the glass. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--sl)] transition-opacity duration-150",
                    pressed ? "opacity-0" : "opacity-100"
                  )}
                />
                {/* The value bubble: glass, floating above the finger (outside any clipping container). */}
                {showValue !== "never" && (
                  <ValueBubble
                    anchor={thumbRefs.current[i]}
                    visible={bubble}
                    text={text}
                    lift={pressed ? (g.knob * g.lens) / 2 + 10 : g.knob / 2 + 8}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {hasLabels && (
        <div className="relative h-5 text-xs text-fg-muted" style={{ marginInline: g.knob / 2 }}>
          {markList
            .filter((m) => m.label !== undefined)
            .map((m) => (
              <span
                key={m.value}
                className="absolute top-0 -translate-x-1/2 whitespace-nowrap tabular-nums rtl:translate-x-1/2"
                style={{ insetInlineStart: `${pct(m.value)}%` }}
              >
                {m.label}
              </span>
            ))}
        </div>
      )}

      {name && values.map((v, i) => <input key={i} type="hidden" name={name} value={v} />)}
    </div>
  );
});
