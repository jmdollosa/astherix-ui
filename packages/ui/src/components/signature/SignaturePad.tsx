import * as React from "react";
import { cn } from "../../lib/cn";
import { Button } from "../button/Button";
import { useField, useFieldControlProps } from "../input/Field";

/*
 * SignaturePad — draw a signature with a finger, stylus or mouse.
 *
 * The ink thickens and thins with speed (and with stylus pressure where the device reports it),
 * and strokes are smoothed through their midpoints, so it looks like a pen rather than a polyline.
 * Strokes are kept as points, so the drawing is redrawn crisply on resize and on high-resolution
 * screens, undo works stroke by stroke, and it can be exported as PNG or as vector SVG for print.
 */

type Point = { x: number; y: number; t: number; p: number };
type Stroke = { points: Point[]; color: string; widths: number[] };

export interface SignaturePadHandle {
  /** Wipe it. */
  clear: () => void;
  /** Remove the last stroke. */
  undo: () => void;
  isEmpty: () => boolean;
  /**
   * PNG (or another type) as a data URL. trim crops the empty space around the signature;
   * ink forces a color (store dark ink even when someone signs in dark mode).
   */
  toDataURL: (options?: { type?: string; quality?: number; trim?: boolean; background?: string; scale?: number; ink?: string }) => string;
  /** Vector SVG — sharp at any size, ideal for PDFs and print. */
  toSVG: (options?: { trim?: boolean; background?: string; ink?: string }) => string;
  /** Load a saved PNG back in (for viewing; undo won't know its strokes). */
  fromDataURL: (dataUrl: string) => Promise<void>;
  canvas: HTMLCanvasElement | null;
}

export interface SignaturePadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Called whenever the drawing changes: a PNG data URL, or null when empty. */
  onChange?: (dataUrl: string | null) => void;
  onBegin?: () => void;
  onEnd?: () => void;
  /** Ink color. Default: the text color. */
  penColor?: string;
  /** Thinnest and thickest the ink gets, in px. Default [0.9, 2.6]. */
  penWidth?: [number, number];
  /** Height of the pad in px. Default 200. */
  height?: number;
  /** Background behind the ink. Default transparent (the card's own background shows through). */
  background?: string;
  /** The signing line and hint inside the pad. Default true. */
  guide?: boolean;
  /** Text next to the ✗ on the line. Default "Sign here". */
  guideLabel?: string;
  /** Clear and Undo buttons under the pad. Default true. */
  toolbar?: boolean;
  /** Extra buttons beside Clear and Undo. */
  actions?: React.ReactNode;
  /** Show a saved signature and don't allow drawing. */
  readOnly?: boolean;
  disabled?: boolean;
  /** A saved PNG to start from. */
  defaultValue?: string;
  /** Posts the signature (a PNG data URL) with the form. */
  name?: string;
  /**
   * Offer a "Type" tab that renders a typed name in a handwriting font — the accessible
   * alternative for people who can't draw with a mouse or finger.
   */
  allowTyped?: boolean;
  /** Font for typed signatures. */
  typedFont?: string;
}

const dist = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);

export const SignaturePad = React.forwardRef<SignaturePadHandle, SignaturePadProps>(function SignaturePad(
  {
    onChange,
    onBegin,
    onEnd,
    penColor,
    penWidth = [0.9, 2.6],
    height = 200,
    background,
    guide = true,
    guideLabel = "Sign here",
    toolbar = true,
    actions,
    readOnly = false,
    disabled: disabledProp,
    defaultValue,
    name,
    allowTyped = false,
    typedFont = '"Segoe Script", "Bradley Hand", "Snell Roundhand", "Apple Chancery", cursive',
    className,
    ...props
  },
  ref
) {
  const field = useField();
  const control = useFieldControlProps({ disabled: disabledProp });
  const disabled = !!control.disabled || readOnly;
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const strokes = React.useRef<Stroke[]>([]);
  const current = React.useRef<Stroke | null>(null);
  const image = React.useRef<HTMLImageElement | null>(null); // a loaded PNG (from defaultValue / fromDataURL)
  const [empty, setEmpty] = React.useState(true);
  const [size, setSize] = React.useState({ w: 0, h: height });
  const [mode, setMode] = React.useState<"draw" | "type">("draw");
  const [typed, setTyped] = React.useState("");
  const [dataUrl, setDataUrl] = React.useState<string>("");
  const inkColor = penColor ?? "var(--color-fg)";

  // The canvas needs a real color, not "var(…)": take its own computed text color, which the
  // browser has already resolved (and which follows dark mode and any theme).
  const resolvedInk = () => {
    const el = canvasRef.current;
    return el ? getComputedStyle(el).color || "#111" : "#111";
  };

  /* ----- drawing ----- */
  const ctx = () => canvasRef.current?.getContext("2d") ?? null;

  const redraw = React.useCallback(() => {
    const c = canvasRef.current;
    const g = ctx();
    if (!c || !g) return;
    const dpr = window.devicePixelRatio || 1;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, c.width / dpr, c.height / dpr);
    if (background) {
      g.fillStyle = background;
      g.fillRect(0, 0, c.width / dpr, c.height / dpr);
    }
    if (image.current) g.drawImage(image.current, 0, 0, c.width / dpr, c.height / dpr);
    g.lineCap = "round";
    g.lineJoin = "round";
    for (const s of strokes.current) drawStroke(g, s);
  }, [background]);

  function drawStroke(g: CanvasRenderingContext2D, s: Stroke) {
    const pts = s.points;
    g.strokeStyle = s.color;
    if (pts.length === 1) {
      g.beginPath();
      g.arc(pts[0].x, pts[0].y, s.widths[0] / 2, 0, Math.PI * 2);
      g.fillStyle = s.color;
      g.fill();
      return;
    }
    // Curve through the midpoints, with the width easing between samples.
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const prevMid = i === 1 ? a : { x: (pts[i - 2].x + a.x) / 2, y: (pts[i - 2].y + a.y) / 2 };
      g.beginPath();
      g.lineWidth = (s.widths[i - 1] + s.widths[i]) / 2;
      g.moveTo(prevMid.x, prevMid.y);
      g.quadraticCurveTo(a.x, a.y, mid.x, mid.y);
      g.stroke();
    }
  }

  const widthFor = (prev: Point | undefined, p: Point, lastWidth: number) => {
    const [min, max] = penWidth;
    if (p.p > 0 && p.p !== 0.5) return min + (max - min) * Math.min(1, p.p * 1.4); // stylus pressure
    if (!prev) return (min + max) / 2;
    const dt = Math.max(1, p.t - prev.t);
    const v = dist(prev, p) / dt; // px per ms
    const target = Math.max(min, max - v * 1.6);
    return lastWidth + (target - lastWidth) * 0.45; // ease, so the line doesn't jitter
  };

  /* ----- sizing (keeps the drawing crisp) ----- */
  React.useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const w = Math.round(el.getBoundingClientRect().width);
      setSize((s) => (s.w === w ? s : { w, h: height }));
    };
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [height]);

  React.useEffect(() => {
    const c = canvasRef.current;
    if (!c || !size.w) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = Math.round(size.w * dpr);
    c.height = Math.round(size.h * dpr);
    c.style.width = `${size.w}px`;
    c.style.height = `${size.h}px`;
    redraw();
  }, [size, redraw]);

  /* ----- value ----- */
  const emit = React.useCallback(() => {
    const c = canvasRef.current;
    const isEmpty = strokes.current.length === 0 && !image.current;
    setEmpty(isEmpty);
    const url = isEmpty || !c ? "" : c.toDataURL("image/png");
    setDataUrl(url);
    onChange?.(url || null);
  }, [onChange]);

  const pointFrom = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now(), p: e.pressure ?? 0 };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled || e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = pointFrom(e);
    const w = widthFor(undefined, p, (penWidth[0] + penWidth[1]) / 2);
    current.current = { points: [p], color: resolvedInk(), widths: [w] };
    strokes.current.push(current.current);
    onBegin?.();
    redraw();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = current.current;
    if (!s || disabled) return;
    const p = pointFrom(e);
    const prev = s.points[s.points.length - 1];
    if (dist(prev, p) < 1.1) return; // ignore tiny jitters
    s.widths.push(widthFor(prev, p, s.widths[s.widths.length - 1]));
    s.points.push(p);
    const g = ctx();
    if (!g) return;
    // Draw just the new bit, so long signatures stay smooth.
    const i = s.points.length - 1;
    const a = s.points[i - 1];
    const b = s.points[i];
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const prevMid = i === 1 ? a : { x: (s.points[i - 2].x + a.x) / 2, y: (s.points[i - 2].y + a.y) / 2 };
    g.strokeStyle = s.color;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.lineWidth = (s.widths[i - 1] + s.widths[i]) / 2;
    g.beginPath();
    g.moveTo(prevMid.x, prevMid.y);
    g.quadraticCurveTo(a.x, a.y, mid.x, mid.y);
    g.stroke();
  };

  const endStroke = () => {
    if (!current.current) return;
    current.current = null;
    onEnd?.();
    emit();
  };

  /* ----- export ----- */
  const bounds = (pad: number) => {
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    strokes.current.forEach((s) =>
      s.points.forEach((p) => {
        x0 = Math.min(x0, p.x);
        y0 = Math.min(y0, p.y);
        x1 = Math.max(x1, p.x);
        y1 = Math.max(y1, p.y);
      })
    );
    if (!isFinite(x0)) return { x: 0, y: 0, w: size.w, h: size.h };
    return { x: Math.max(0, x0 - pad), y: Math.max(0, y0 - pad), w: Math.min(size.w, x1 - x0 + pad * 2), h: Math.min(size.h, y1 - y0 + pad * 2) };
  };

  const api: SignaturePadHandle = {
    clear: () => {
      strokes.current = [];
      image.current = null;
      setTyped("");
      redraw();
      emit();
    },
    undo: () => {
      strokes.current.pop();
      redraw();
      emit();
    },
    isEmpty: () => strokes.current.length === 0 && !image.current,
    toDataURL: ({ type = "image/png", quality, trim = false, background: bg, scale = 1, ink } = {}) => {
      const c = canvasRef.current;
      if (!c) return "";
      if (!trim && !bg && scale === 1 && !ink) return c.toDataURL(type, quality);
      const b = trim ? bounds(penWidth[1] * 2) : { x: 0, y: 0, w: size.w, h: size.h };
      const out = document.createElement("canvas");
      const dpr = (window.devicePixelRatio || 1) * scale;
      out.width = Math.max(1, Math.round(b.w * dpr));
      out.height = Math.max(1, Math.round(b.h * dpr));
      const g = out.getContext("2d")!;
      if (bg) {
        g.fillStyle = bg;
        g.fillRect(0, 0, out.width, out.height);
      }
      g.scale(dpr, dpr);
      g.translate(-b.x, -b.y);
      g.lineCap = "round";
      g.lineJoin = "round";
      if (image.current) g.drawImage(image.current, 0, 0, size.w, size.h);
      strokes.current.forEach((s) => drawStroke(g, ink ? { ...s, color: ink } : s));
      return out.toDataURL(type, quality);
    },
    toSVG: ({ trim = false, background: bg, ink } = {}) => {
      const b = trim ? bounds(penWidth[1] * 2) : { x: 0, y: 0, w: size.w, h: size.h };
      const n = (v: number) => +v.toFixed(1);
      const parts: string[] = [];
      strokes.current.forEach((s) => {
        // Each curve carries on from the last, so runs of the same width join into one path
        // instead of one path per segment — a much smaller file.
        let d = "";
        let runWidth = 0;
        const color = ink ?? s.color;
        const flush = () => {
          if (d) parts.push(`<path d="${d}" stroke="${color}" stroke-width="${runWidth}"/>`);
          d = "";
        };
        for (let i = 1; i < s.points.length; i++) {
          const a = s.points[i - 1];
          const p = s.points[i];
          const mid = { x: (a.x + p.x) / 2, y: (a.y + p.y) / 2 };
          const prevMid = i === 1 ? a : { x: (s.points[i - 2].x + a.x) / 2, y: (s.points[i - 2].y + a.y) / 2 };
          const w = Math.round((((s.widths[i - 1] + s.widths[i]) / 2) * 4)) / 4; // to the nearest 0.25px
          if (w !== runWidth) {
            flush();
            runWidth = w;
            d = `M${n(prevMid.x - b.x)} ${n(prevMid.y - b.y)}`;
          }
          d += `Q${n(a.x - b.x)} ${n(a.y - b.y)} ${n(mid.x - b.x)} ${n(mid.y - b.y)}`;
        }
        flush();
      });
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(b.w)}" height="${Math.round(b.h)}" viewBox="0 0 ${Math.round(b.w)} ${Math.round(b.h)}">${bg ? `<rect width="100%" height="100%" fill="${bg}"/>` : ""}<g fill="none" stroke-linecap="round" stroke-linejoin="round">${parts.join("")}</g></svg>`;
    },
    fromDataURL: (url: string) =>
      new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          image.current = img;
          strokes.current = [];
          redraw();
          emit();
          resolve();
        };
        img.onerror = () => reject(new Error("Couldn't load that signature."));
        img.src = url;
      }),
    canvas: canvasRef.current,
  };
  React.useImperativeHandle(ref, () => api);

  React.useEffect(() => {
    if (defaultValue) void api.fromDataURL(defaultValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue, size.w]);

  /* ----- typed signature ----- */
  React.useEffect(() => {
    if (mode !== "type" || !size.w) return;
    const c = canvasRef.current;
    const g = ctx();
    if (!c || !g) return;
    strokes.current = [];
    image.current = null;
    redraw();
    if (typed.trim()) {
      const dpr = window.devicePixelRatio || 1;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = resolvedInk();
      let fontSize = Math.min(size.h * 0.42, 44);
      g.font = `${fontSize}px ${typedFont}`;
      while (g.measureText(typed).width > size.w - 40 && fontSize > 12) {
        fontSize -= 2;
        g.font = `${fontSize}px ${typedFont}`;
      }
      g.textBaseline = "alphabetic";
      g.fillText(typed, 24, size.h * 0.62);
    }
    const url = typed.trim() ? c.toDataURL("image/png") : "";
    setDataUrl(url);
    setEmpty(!url);
    onChange?.(url || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typed, mode, size, typedFont]);

  const canUndo = strokes.current.length > 0 && mode === "draw";

  return (
    <div className={cn("grid gap-2", className)} {...props}>
      {allowTyped && !readOnly && (
        <div className="flex gap-1 justify-self-start rounded-control bg-secondary-hover p-0.5 text-sm" role="tablist" aria-label="How to sign">
          {(["draw", "type"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => {
                api.clear();
                setMode(m);
              }}
              className={cn("cursor-pointer rounded-control-sm px-3 py-1 font-medium outline-none focus-visible:outline-2 focus-visible:outline-ring", mode === m ? "bg-surface text-fg shadow-[var(--ui-shadow-sm)]" : "text-fg-muted hover:text-fg")}
            >
              {m === "draw" ? "Draw" : "Type"}
            </button>
          ))}
        </div>
      )}

      <div
        ref={wrapRef}
        className={cn(
          "relative overflow-hidden rounded-card border bg-surface [--sig-ink:var(--color-fg)]",
          control["aria-invalid"] ? "border-danger" : "border-border-strong",
          disabled && "opacity-80",
          !disabled && mode === "draw" && "cursor-crosshair"
        )}
        style={{ height: size.h, ...(penColor ? { ["--sig-ink" as string]: penColor } : {}) }}
      >
        {/* The signing line and hint, under the ink. */}
        {guide && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 bottom-[22%] flex items-center gap-2 border-t border-dashed border-border-strong pt-1.5 text-xs text-fg-muted">
            <span className="-mt-6 text-base">✗</span>
            <span className="-mt-6">{empty ? guideLabel : ""}</span>
          </div>
        )}
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={empty ? "Signature area, empty" : "Your signature"}
          style={{ color: inkColor }}
          className={cn("relative block touch-none select-none text-fg", disabled && "pointer-events-none")}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endStroke}
          onPointerLeave={endStroke}
          onPointerCancel={endStroke}
        />
        {mode === "type" && (
          <div className="absolute inset-x-4 bottom-3">
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Type your full name"
              aria-label="Type your full name as your signature"
              className="h-9 w-full rounded-control border border-border-strong bg-bg px-3 text-sm text-fg outline-none focus:border-ring focus:ring-3 focus:ring-ring/25"
            />
          </div>
        )}
      </div>

      {toolbar && !readOnly && (
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => api.undo()} disabled={!canUndo} leadingIcon="bi bi-arrow-counterclockwise">
            Undo
          </Button>
          <Button size="sm" variant="ghost" onClick={() => api.clear()} disabled={empty} leadingIcon="bi bi-eraser">
            Clear
          </Button>
          {actions}
          <span className="ms-auto text-xs text-fg-muted" aria-live="polite">
            {empty ? (mode === "type" ? "Type your name" : "Draw your signature above") : "Signed"}
          </span>
        </div>
      )}

      {name && <input type="hidden" name={name} value={dataUrl} />}
      {field?.id && <span className="sr-only">{empty ? "No signature yet" : "Signature captured"}</span>}
    </div>
  );
});
