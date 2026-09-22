import * as React from "react";
import { cn } from "../../lib/cn";

/*
 * Carousel — slides you swipe, drag or step through.
 *
 * Built on native scroll snapping, so swiping on phones has real momentum and snap, trackpads
 * and mouse wheels just work, and there's no scroll-jacking. Adds: slides per view that adapt to
 * the available width, peeking, a coverflow effect, autoplay with a pause control, and four kinds
 * of indicators — dots, a counter, story bars and thumbnails.
 */

export type PerView = number | { base?: number; sm?: number; md?: number; lg?: number };

export interface CarouselHandle {
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  index: number;
}

export interface CarouselProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  /** Name for the carousel, e.g. "Product photos". */
  "aria-label": string;
  /** Slides shown at once: a number, or by width { base: 1, sm: 2, md: 3 } (container ≥480 / 768 / 1024px). */
  slidesPerView?: PerView;
  /** Space between slides in px. Default 16. */
  gap?: number;
  /** Let the next slide peek in by this many px (or true for 48). */
  peek?: boolean | number;
  /** "start" (default) or "center" — the active slide sits in the middle. */
  align?: "start" | "center";
  /** "coverflow": slides shrink and fade as they move away from the center. */
  effect?: "none" | "coverflow";
  /** After the last slide, next goes back to the first (and prev from the first to the last). */
  loop?: boolean;
  /** Move on by itself every N ms. Pauses on hover, touch, focus and hidden tabs; off with reduced motion. */
  autoplay?: number | false;
  /** "dots" (default), "counter" (3 / 8), "stories" (bars at the top), "thumbnails", or "none". */
  indicators?: "dots" | "counter" | "stories" | "thumbnails" | "none";
  /** Previous/next buttons: over the slides (default), below them, or none. */
  controls?: "overlay" | "below" | "none";
  defaultIndex?: number;
  onSlideChange?: (index: number) => void;
}

export interface CarouselSlideProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Small preview shown when indicators="thumbnails". */
  thumbnail?: React.ReactNode;
  /** Accessible name for the slide (default "3 of 8"). */
  label?: string;
}

/** One slide. Put anything inside: an image, text, a card, a form. */
export const CarouselSlide = React.forwardRef<HTMLDivElement, CarouselSlideProps>(({ className, children, thumbnail: _t, label: _l, ...props }, ref) => (
  <div ref={ref} className={cn("h-full min-w-0", className)} {...props}>
    {children}
  </div>
));
CarouselSlide.displayName = "CarouselSlide";

const resolvePerView = (p: PerView, width: number) => {
  if (typeof p === "number") return p;
  if (width >= 1024 && p.lg) return p.lg;
  if (width >= 768 && (p.md ?? p.sm)) return (p.md ?? p.sm)!;
  if (width >= 480 && p.sm) return p.sm;
  return p.base ?? 1;
};

const Arrow = ({ dir }: { dir: "prev" | "next" }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-4 rtl:-scale-x-100">
    <path d={dir === "prev" ? "M12 5l-5 5 5 5" : "M8 5l5 5-5 5"} />
  </svg>
);

export const Carousel = React.forwardRef<CarouselHandle, CarouselProps>(function Carousel(
  {
    slidesPerView = 1,
    gap = 16,
    peek = false,
    align = "start",
    effect = "none",
    loop = false,
    autoplay = false,
    indicators = "dots",
    controls = "overlay",
    defaultIndex = 0,
    onSlideChange,
    className,
    children,
    "aria-label": ariaLabel,
    ...props
  },
  ref
) {
  const slides = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<CarouselSlideProps>[];
  const count = slides.length;
  const rootRef = React.useRef<HTMLElement>(null);
  const viewRef = React.useRef<HTMLDivElement>(null);
  const slideRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const [width, setWidth] = React.useState(0);
  const [index, setIndex] = React.useState(defaultIndex);
  const indexRef = React.useRef(index);
  indexRef.current = index;
  const centered = align === "center" || effect === "coverflow";
  const perView = Math.max(1, resolvePerView(slidesPerView, width));
  const peekPx = peek === true ? 48 : peek || 0;
  const lastStart = centered ? count - 1 : Math.max(0, count - Math.floor(perView));
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const q = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!q) return;
    setReduced(q.matches);
    const on = () => setReduced(q.matches);
    q.addEventListener?.("change", on);
    return () => q.removeEventListener?.("change", on);
  }, []);

  React.useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => setWidth(el.getBoundingClientRect().width);
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, []);

  /* ----- moving ----- */
  const scrollToIndex = React.useCallback(
    (i: number, smooth = true) => {
      const view = viewRef.current;
      const slide = slideRefs.current[i];
      if (!view || !slide) return;
      const rtl = getComputedStyle(view).direction === "rtl";
      let left = slide.offsetLeft - view.offsetLeft;
      if (centered) left -= (view.clientWidth - slide.offsetWidth) / 2;
      view.scrollTo({ left: rtl ? -(view.scrollWidth - view.clientWidth - left) : left, behavior: smooth && !reduced ? "smooth" : "auto" });
    },
    [centered, reduced]
  );

  const goTo = React.useCallback(
    (i: number) => {
      const n = loop ? (i + (lastStart + 1)) % (lastStart + 1) : Math.max(0, Math.min(lastStart, i));
      scrollToIndex(n);
    },
    [loop, lastStart, scrollToIndex]
  );
  const next = React.useCallback(() => goTo(indexRef.current + 1), [goTo]);
  const prev = React.useCallback(() => goTo(indexRef.current - 1), [goTo]);

  React.useImperativeHandle(ref, () => ({ next, prev, goTo, index }), [next, prev, goTo, index]);

  // Start at defaultIndex without animation.
  React.useLayoutEffect(() => {
    if (width && defaultIndex) scrollToIndex(defaultIndex, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width > 0]);

  /* ----- which slide is active, and the coverflow effect ----- */
  const onScroll = React.useCallback(() => {
    const view = viewRef.current;
    if (!view) return;
    const vr = view.getBoundingClientRect();
    const anchor = centered ? vr.left + vr.width / 2 : vr.left + 1;
    let best = 0;
    let bestD = Infinity;
    slideRefs.current.forEach((s, i) => {
      if (!s) return;
      const r = s.getBoundingClientRect();
      const point = centered ? r.left + r.width / 2 : r.left;
      const d = Math.abs(point - anchor);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
      if (effect === "coverflow") {
        // Shrink and fade with distance from the center (applied directly, no re-render).
        const t = Math.min(1, Math.abs(r.left + r.width / 2 - (vr.left + vr.width / 2)) / r.width);
        s.style.transform = reduced ? "" : `scale(${1 - t * 0.14})`;
        s.style.opacity = String(1 - t * 0.5);
      }
    });
    // At the very end of the track, the last "page" is active even if its first slide isn't at the edge.
    if (!centered && view.scrollLeft + view.clientWidth >= view.scrollWidth - 2) best = lastStart;
    if (best !== indexRef.current) {
      indexRef.current = best;
      setIndex(best);
      onSlideChange?.(best);
    }
  }, [centered, effect, reduced, lastStart, onSlideChange]);

  React.useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    let raf = 0;
    const handler = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(onScroll);
    };
    view.addEventListener("scroll", handler, { passive: true });
    onScroll();
    return () => {
      view.removeEventListener("scroll", handler);
      cancelAnimationFrame(raf);
    };
  }, [onScroll, width]);

  /* ----- autoplay ----- */
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [held, setHeld] = React.useState(false);
  const [userPaused, setUserPaused] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  React.useEffect(() => {
    const on = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);
  // Don't advance while scrolled out of view — people should see it start from where it was.
  const [inView, setInView] = React.useState(true);
  React.useEffect(() => {
    const el = rootRef.current;
    if (!autoplay || !el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [autoplay]);
  const autoplayOn = !!autoplay && !reduced;
  const playing = autoplayOn && !userPaused && !hovered && !focused && !held && !hidden && inView;
  const [cycle, setCycle] = React.useState(0); // restarts the timer bar
  React.useEffect(() => setCycle((c) => c + 1), [index]);
  React.useEffect(() => {
    if (!playing || !autoplay) return;
    const t = window.setTimeout(() => {
      if (!loop && indexRef.current >= lastStart) goTo(0);
      else next();
    }, autoplay);
    return () => window.clearTimeout(t);
  }, [playing, autoplay, next, goTo, loop, lastStart, index, cycle]);

  /* ----- mouse dragging (touch already swipes natively) ----- */
  const drag = React.useRef<{ x: number; left: number; moved: boolean; t: number } | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const onPointerDown = (e: React.PointerEvent) => {
    setHeld(true);
    if (e.pointerType !== "mouse" || e.button !== 0 || !viewRef.current) return;
    drag.current = { x: e.clientX, left: viewRef.current.scrollLeft, moved: false, t: performance.now() };
  };
  React.useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      const view = viewRef.current;
      if (!d || !view) return;
      const dx = e.clientX - d.x;
      if (!d.moved && Math.abs(dx) > 4) {
        d.moved = true;
        setDragging(true);
      }
      if (d.moved) view.scrollLeft = d.left - dx;
    };
    const up = (e: PointerEvent) => {
      setHeld(false);
      const d = drag.current;
      drag.current = null;
      if (!d?.moved) return;
      setDragging(false);
      // A quick flick moves one slide in its direction; a slow drag settles on the nearest.
      const dx = e.clientX - d.x;
      const fast = Math.abs(dx) / Math.max(1, performance.now() - d.t) > 0.4;
      requestAnimationFrame(() => {
        if (fast) goTo(indexRef.current + (dx < 0 ? 1 : -1) * (Math.abs(dx) > 30 ? 1 : 0));
        else scrollToIndex(indexRef.current);
      });
      // Don't let the drag also count as a click on a link or button inside the slide.
      const stop = (ev: Event) => {
        ev.stopPropagation();
        ev.preventDefault();
      };
      window.addEventListener("click", stop, { capture: true, once: true });
      setTimeout(() => window.removeEventListener("click", stop, { capture: true }), 0);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [goTo, scrollToIndex]);

  /* ----- layout ----- */
  const slideBasis = centered
    ? `calc((100% - ${peekPx * 2}px - ${gap * (Math.ceil(perView) - 1)}px) / ${perView})`
    : `calc((100% - ${peekPx}px - ${gap * (Math.ceil(perView) - 1)}px) / ${perView})`;
  const pages = lastStart + 1;
  const atStart = index <= 0;
  const atEnd = index >= lastStart;
  const stories = indicators === "stories";

  const navButton = (dir: "prev" | "next", overlay: boolean) => (
    <button
      type="button"
      aria-label={dir === "prev" ? "Previous slide" : "Next slide"}
      aria-controls={`${rootId}-view`}
      onClick={dir === "prev" ? prev : next}
      disabled={!loop && (dir === "prev" ? atStart : atEnd)}
      className={cn(
        "grid size-9 cursor-pointer place-items-center rounded-full border border-border bg-surface text-fg shadow-[var(--ui-shadow-md)] outline-none transition-[opacity,transform] duration-150",
        "hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-0",
        overlay && cn("absolute top-1/2 z-10 -translate-y-1/2", dir === "prev" ? "start-2" : "end-2", "opacity-0 group-hover/car:opacity-100 group-focus-within/car:opacity-100 [@media(hover:none)]:hidden")
      )}
    >
      <Arrow dir={dir} />
    </button>
  );
  const rootId = React.useId().replace(/:/g, "");

  const pauseButton = autoplayOn && (
    <button
      type="button"
      onClick={() => setUserPaused((p) => !p)}
      aria-label={userPaused ? "Start automatic slide show" : "Stop automatic slide show"}
      className="grid size-7 cursor-pointer place-items-center rounded-full text-fg-muted outline-none hover:bg-secondary-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-ring"
    >
      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="size-3.5">
        {userPaused ? <path d="M5 3.5v9l7-4.5z" /> : <path d="M4.5 3.5h2.5v9H4.5zM9 3.5h2.5v9H9z" />}
      </svg>
    </button>
  );

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      className={cn("group/car grid min-w-0 gap-3 [contain:inline-size]", className)}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={(e) => e.target !== viewRef.current && setFocused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setFocused(false)}
      {...props}
    >
      <div className="relative min-w-0">
        {stories && (
          <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex gap-1" aria-hidden="true">
            {Array.from({ length: pages }, (_, i) => (
              <span key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/40">
                <span
                  key={i === index ? cycle : undefined}
                  className="block h-full origin-left rounded-full bg-white"
                  style={
                    i < index
                      ? { transform: "scaleX(1)" }
                      : i === index && autoplayOn
                        ? { animation: `ui-toast-timer ${autoplay}ms linear reverse both`, animationPlayState: playing ? "running" : "paused" }
                        : { transform: `scaleX(${i === index ? 1 : 0})` }
                  }
                />
              </span>
            ))}
          </div>
        )}
        <div
          ref={viewRef}
          id={`${rootId}-view`}
          tabIndex={0}
          aria-live={playing ? "off" : "polite"}
          onPointerDown={onPointerDown}
          onKeyDown={(e) => {
            if (e.target !== e.currentTarget) return;
            const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
            if (e.key === (rtl ? "ArrowLeft" : "ArrowRight")) (e.preventDefault(), next());
            if (e.key === (rtl ? "ArrowRight" : "ArrowLeft")) (e.preventDefault(), prev());
            if (e.key === "Home") (e.preventDefault(), goTo(0));
            if (e.key === "End") (e.preventDefault(), goTo(lastStart));
          }}
          onClick={(e) => {
            // Stories: tap the left third to go back, anywhere else to go forward.
            if (!stories || (e.target as HTMLElement).closest("a,button,input,select,textarea,label")) return;
            const r = e.currentTarget.getBoundingClientRect();
            if (e.clientX - r.left < r.width / 3) prev();
            else next();
          }}
          className={cn(
            "flex min-w-0 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            "rounded-card outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            dragging ? "cursor-grabbing select-none snap-none" : "snap-x snap-mandatory",
            !stories && "cursor-grab [@media(hover:none)]:cursor-auto"
          )}
          style={{ gap, scrollPaddingInline: centered ? peekPx : 0, paddingInline: centered ? peekPx : 0 }}
        >
          {slides.map((s, i) => (
            <div
              key={s.key ?? i}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              role="group"
              aria-roledescription="slide"
              aria-label={s.props.label ?? `${i + 1} of ${count}`}
              className={cn(
                "shrink-0 transition-[transform,opacity] duration-100 ease-out",
                centered ? "snap-center" : "snap-start",
                effect === "coverflow" && "will-change-transform"
              )}
              style={{ flexBasis: slideBasis, width: slideBasis }}
              onClick={() => {
                if (centered && i !== indexRef.current && !stories) goTo(i);
              }}
            >
              {s}
            </div>
          ))}
        </div>
        {controls === "overlay" && count > 1 && (
          <>
            {navButton("prev", true)}
            {navButton("next", true)}
          </>
        )}
      </div>

      {/* Indicators and controls under the slides */}
      {(indicators !== "none" && !stories) || controls === "below" || (autoplayOn && !stories) ? (
        <div className="flex min-w-0 items-center justify-center gap-3">
          {controls === "below" && navButton("prev", false)}
          {indicators === "dots" && pages > 1 && (
            <div className="flex items-center gap-1.5" role="group" aria-label="Choose slide">
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index ? "true" : undefined}
                  onClick={() => goTo(i)}
                  className={cn(
                    "relative h-2 cursor-pointer overflow-hidden rounded-full outline-none transition-[width,background-color] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    i === index ? "w-6 bg-border-strong" : "w-2 bg-border-strong/70 hover:bg-fg-muted"
                  )}
                >
                  {i === index && (
                    <span
                      key={cycle}
                      className="absolute inset-0 origin-left rounded-full bg-primary"
                      style={autoplayOn ? { animation: `ui-toast-timer ${autoplay}ms linear reverse both`, animationPlayState: playing ? "running" : "paused" } : undefined}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
          {indicators === "counter" && (
            <p className="min-w-12 text-center text-sm tabular-nums text-fg-muted" aria-live="polite">
              <span className="font-semibold text-fg">{index + 1}</span> / {pages}
            </p>
          )}
          {indicators === "thumbnails" && (
            <div className="flex min-w-0 gap-2 overflow-x-auto p-1 [scrollbar-width:none]" role="group" aria-label="Choose slide">
              {slides.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={s.props.label ? `Show ${s.props.label}` : `Go to slide ${i + 1}`}
                  aria-current={i === index ? "true" : undefined}
                  onClick={() => goTo(i)}
                  className={cn(
                    "size-14 shrink-0 cursor-pointer overflow-hidden rounded-control outline-none ring-offset-2 ring-offset-bg transition-[opacity,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-ring",
                    i === index ? "opacity-100 ring-2 ring-primary" : "opacity-55 hover:opacity-90"
                  )}
                >
                  {s.props.thumbnail ?? <span className="grid size-full place-items-center bg-secondary-hover text-xs">{i + 1}</span>}
                </button>
              ))}
            </div>
          )}
          {controls === "below" && navButton("next", false)}
          {pauseButton}
        </div>
      ) : null}
      {stories && autoplayOn && <div className="flex justify-center">{pauseButton}</div>}
    </section>
  );
});
