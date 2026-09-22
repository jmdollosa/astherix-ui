import * as React from "react";
import { cn } from "../../lib/cn";

/*
 * SpotlightText — text lit by a moving spotlight.
 *
 * The text is drawn twice: a dim base layer (the real, readable text) and a bright copy on top that
 * is masked to a soft circle — the spotlight. The circle's position is driven by a small animation
 * loop that eases toward its target: the pointer ("follow"), a passing beam ("sweep"), or the
 * pointer over nearly-invisible text ("reveal"). Pauses off-screen; reduced motion shows it fully lit.
 */

export interface SpotlightTextProps extends React.HTMLAttributes<HTMLElement> {
  /** "follow" (default): follows the pointer, drifts on its own when idle. "sweep": a beam passes every few seconds. "reveal": dark until lit. */
  mode?: "follow" | "sweep" | "reveal";
  /** The element to render. Default "span"; use "h1", "h2", "p"… for real headings and paragraphs. */
  as?: React.ElementType;
  /** Spotlight radius in px. Default: about the text's size (at least 60px). */
  radius?: number;
  /** Color of the lit text: any CSS color, or a gradient like "linear-gradient(90deg, #0d6efd, #db2777)". Default: the text's own color. */
  tint?: string;
  /** How visible the unlit text is, 0–1. Default 0.4 (0.08 for reveal). */
  dim?: number;
  /** A soft glow around the lit letters. Default true. */
  glow?: boolean;
  /** For sweep: ms for one pass. Default 2200. */
  duration?: number;
  /** For sweep: pause between passes in ms. Default 1400. */
  pause?: number;
  /** How closely it follows the pointer, 0–1 (1 = instantly). Default 0.14 — a smooth trail. */
  smoothing?: number;
}

export function SpotlightText({
  mode = "follow",
  as: Tag = "span",
  radius,
  tint,
  dim,
  glow = true,
  duration = 2200,
  pause = 1400,
  smoothing = 0.14,
  className,
  style,
  children,
  ...props
}: SpotlightTextProps) {
  const ref = React.useRef<HTMLElement>(null);
  const [reduced, setReduced] = React.useState(false);
  const target = React.useRef<{ x: number; y: number } | null>(null);
  const reveal = mode === "reveal";

  React.useEffect(() => {
    const q = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!q) return;
    setReduced(q.matches);
    const on = () => setReduced(q.matches);
    q.addEventListener?.("change", on);
    return () => q.removeEventListener?.("change", on);
  }, []);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    let raf = 0;
    let visible = true;
    const cur = { x: -9999, y: 0, r: 0 };
    const start = performance.now();

    const io = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    }) : null;
    io?.observe(el);

    function tick(now: number) {
      raf = 0;
      if (!el || !visible) return;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const fontSize = parseFloat(getComputedStyle(el).fontSize) || 16;
      const r = radius ?? Math.max(60, fontSize * 2.2);
      let tx: number;
      let ty: number;
      let tr = r;
      const p = target.current;
      if (p && mode !== "sweep") {
        tx = p.x;
        ty = p.y;
      } else if (mode === "sweep" || mode === "follow") {
        // A beam passing left to right (follow: a slower, gentler drift while idle).
        const pass = mode === "sweep" ? duration : duration * 2.2;
        const rest = mode === "sweep" ? pause : 300;
        const t = ((now - start) % (pass + rest)) / pass;
        tx = t <= 1 ? -r + t * (w + r * 2) : w + r * 2;
        ty = h / 2 + (mode === "follow" ? Math.sin((now - start) / 900) * h * 0.15 : 0);
        if (t > 1) tr = r; // resting off to the right
      } else {
        // reveal, idle: a small glimmer drifting slowly so there's a hint of what's hidden
        tx = w / 2 + Math.sin((now - start) / 1700) * w * 0.4;
        ty = h / 2 + Math.cos((now - start) / 1300) * h * 0.2;
        tr = r * 0.55;
      }
      // Jump straight to the first position; ease after that.
      const k = cur.x < -9000 ? 1 : mode === "sweep" && !p ? 1 : smoothing;
      cur.x += (tx - cur.x) * k;
      cur.y += (ty - cur.y) * k;
      cur.r += (tr - cur.r) * Math.min(1, k * 1.5);
      el.style.setProperty("--spot-x", `${cur.x.toFixed(1)}px`);
      el.style.setProperty("--spot-y", `${cur.y.toFixed(1)}px`);
      el.style.setProperty("--spot-r", `${cur.r.toFixed(1)}px`);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, [mode, radius, duration, pause, smoothing, reduced]);

  const aim = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    target.current = { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // Default to the text's own color (currentColor), so it works on any background — even a dark
  // section inside a light page.
  const lit = tint ?? "currentColor";
  const isGradient = /gradient\(/.test(lit);
  const dimLevel = dim ?? (reveal ? 0.08 : 0.4);
  const mask = "radial-gradient(circle var(--spot-r, 0px) at var(--spot-x, -999px) var(--spot-y, 50%), #000 0%, #000 35%, transparent 100%)";

  if (reduced) {
    // No motion: simply show the text fully lit.
    return (
      <Tag className={cn(className)} style={{ ...(isGradient ? { backgroundImage: lit, backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" } : { color: lit }), ...style }} {...props}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref}
      className={cn("relative inline-block", className)}
      style={style}
      onPointerMove={mode !== "sweep" ? aim : undefined}
      onPointerDown={mode !== "sweep" ? aim : undefined}
      onPointerLeave={() => (target.current = null)}
      {...props}
    >
      {/* The real text, dim (in reveal mode it's visible only faintly). */}
      <span style={{ opacity: dimLevel }}>{children}</span>
      {/* The lit copy, masked to the spotlight. Decorative, so screen readers skip it. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 select-none"
        style={{
          WebkitMaskImage: mask,
          maskImage: mask,
          ...(isGradient
            ? { backgroundImage: lit, backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent", backgroundSize: "100% 100%" }
            : { color: lit }),
          filter: glow
            ? `drop-shadow(0 0 ${reveal ? 14 : 10}px color-mix(in srgb, ${isGradient ? "var(--ui-primary)" : lit} 55%, transparent))`
            : undefined,
        }}
      >
        {children}
      </span>
    </Tag>
  );
}
