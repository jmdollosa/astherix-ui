import * as React from "react";

/* Shared helpers for the dashboard widgets: sizing, scales, ticks, curves, formatting. */

export const seriesColor = (i: number, color?: string) => color ?? `var(--ui-chart-${(i % 6) + 1})`;

/** Width of an element, kept up to date. */
export function useWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = React.useRef<T | null>(null);
  const [w, setW] = React.useState(0);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setW(Math.floor(el.getBoundingClientRect().width));
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, []);
  return [ref, w];
}

/** "Nice" round axis ticks covering [min, max]. */
export function niceTicks(min: number, max: number, count = 4): number[] {
  if (min === max) {
    max = min === 0 ? 1 : min * 1.2;
    if (min > 0) min = 0;
  }
  const span = max - min;
  const raw = span / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= count) ?? 10 * mag;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) ticks.push(+v.toFixed(10));
  return ticks;
}

/** 1200 → 1.2K, 3400000 → 3.4M. */
export function formatCompact(n: number) {
  return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

/** Smooth line through points without overshooting (monotone cubic). */
export function monotonePath(pts: Array<[number, number]>) {
  const n = pts.length;
  if (n === 0) return "";
  if (n === 1) return `M${pts[0][0]},${pts[0][1]}`;
  const dx: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = pts[i + 1][0] - pts[i][0];
    m[i] = (pts[i + 1][1] - pts[i][1]) / (dx[i] || 1);
  }
  const t: number[] = [m[0]];
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (3 * (dx[i - 1] + dx[i])) / ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i]);
  t[n - 1] = m[n - 2];
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += `C${pts[i][0] + h},${pts[i][1] + t[i] * h} ${pts[i + 1][0] - h},${pts[i + 1][1] - t[i + 1] * h} ${pts[i + 1][0]},${pts[i + 1][1]}`;
  }
  return d;
}

export const linearPath = (pts: Array<[number, number]>) => pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join("");

export function useReducedMotion() {
  const [r, setR] = React.useState(false);
  React.useEffect(() => {
    const q = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!q) return;
    setR(q.matches);
    const on = () => setR(q.matches);
    q.addEventListener?.("change", on);
    return () => q.removeEventListener?.("change", on);
  }, []);
  return r;
}

/** A hidden table of the chart's numbers, for screen readers. */
export function DataTable({ caption, columns, rows }: { caption: string; columns: string[]; rows: Array<Array<string | number>> }) {
  // Tables ignore the 1px width of "sr-only", so hide a wrapper instead (otherwise the page widens).
  return (
    <div className="sr-only">
    <table>
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c} scope="col">{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}

/* ---------- animation settings shared by a dashboard ---------- */

/** Set by DashboardGrid: whether widgets should animate on first load. */
export const DashboardAnimationContext = React.createContext<boolean | undefined>(undefined);

/** A widget's own `animate` prop wins; then the surrounding DashboardGrid; then the default. */
export function useAnimate(own: boolean | undefined, fallback = true) {
  const ctx = React.useContext(DashboardAnimationContext);
  return own ?? ctx ?? fallback;
}

const easeOut = (t: number) => 1 - (1 - t) ** 3;

/**
 * Smoothly move a list of numbers to new targets (for live updates). New entries start from the
 * previous last value (so an appended point grows out of the line), or from `from` on first mount.
 */
export function useTweenedNumbers(target: number[], { duration = 600, enabled = true, from }: { duration?: number; enabled?: boolean; from?: number } = {}) {
  const reduced = useReducedMotion();
  const [shown, setShown] = React.useState<number[]>(() => (enabled && from !== undefined ? target.map(() => from) : target));
  const shownRef = React.useRef(shown);
  shownRef.current = shown;
  const key = target.join(",");
  React.useEffect(() => {
    if (!enabled || reduced) {
      setShown(target);
      return;
    }
    const start = shownRef.current;
    const lastKnown = start.length ? start[start.length - 1] : (from ?? 0);
    const begin = target.map((_, i) => (i < start.length ? start[i] : lastKnown));
    if (begin.length === target.length && begin.every((v, i) => v === target[i])) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const e = easeOut(t);
      setShown(target.map((v, i) => begin[i] + (v - begin[i]) * e));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled, reduced, duration]);
  return shown;
}

/** Tween the chosen numeric fields of chart rows. */
export function useTweenedRows<T extends Record<string, unknown>>(rows: T[], keys: string[], opts: { enabled?: boolean; from?: number } = {}) {
  const flat = rows.flatMap((r) => keys.map((k) => Number(r[k] ?? 0)));
  const tw = useTweenedNumbers(flat, opts);
  return rows.map((r, i) => {
    const out: Record<string, unknown> = { ...r };
    keys.forEach((k, j) => (out[k] = tw[i * keys.length + j] ?? Number(r[k] ?? 0)));
    return out as T;
  });
}
