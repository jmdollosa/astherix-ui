import * as React from "react";
import { cn } from "../../lib/cn";

/*
 * Placeholder — a patterned box that holds a slot in a layout before its content
 * exists: a wireframe, a dashboard's empty widgets, "chart goes here". Not a loading
 * state (that's Skeleton) and not an empty state for real data.
 *
 *   <Placeholder ratio="16/9" label="Revenue chart" />
 *
 * The pattern is drawn with CSS gradients in the current text color, so it follows the
 * theme and needs no SVG ids.
 */

export interface PlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "stripes" (diagonal lines, default), "dots", "grid" or "none" (just the dashed outline). */
  pattern?: "stripes" | "dots" | "grid" | "none";
  /** A short note in the middle, e.g. what will go here. */
  label?: React.ReactNode;
  /** Keep a shape, e.g. "16/9" or 1. Leave it out to fill the height you give it. */
  ratio?: number | string;
  /** Outline: "dashed" (default), "solid" or "none". */
  border?: "dashed" | "solid" | "none";
}

const patterns: Record<Exclude<PlaceholderProps["pattern"], undefined>, React.CSSProperties> = {
  stripes: {
    backgroundImage:
      "repeating-linear-gradient(-45deg, color-mix(in srgb, currentColor 14%, transparent) 0 1px, transparent 1px 9px)",
  },
  dots: {
    backgroundImage: "radial-gradient(color-mix(in srgb, currentColor 22%, transparent) 1px, transparent 1.5px)",
    backgroundSize: "12px 12px",
  },
  grid: {
    backgroundImage:
      "linear-gradient(color-mix(in srgb, currentColor 11%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, currentColor 11%, transparent) 1px, transparent 1px)",
    backgroundSize: "16px 16px",
    backgroundPosition: "-1px -1px",
  },
  none: {},
};

export const Placeholder = React.forwardRef<HTMLDivElement, PlaceholderProps>(function Placeholder(
  { pattern = "stripes", label, ratio, border = "dashed", className, style, children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      // Decorative unless it carries a label.
      aria-hidden={label || children ? undefined : true}
      className={cn(
        "relative grid min-h-24 place-items-center overflow-hidden rounded-card text-fg-muted",
        border === "dashed" && "border border-dashed border-border-strong",
        border === "solid" && "border border-border",
        className
      )}
      style={{ ...patterns[pattern], aspectRatio: ratio, ...style }}
      {...props}
    >
      {label && (
        <span className="rounded-control bg-surface px-2.5 py-1 text-[0.8125rem] font-medium text-fg-muted shadow-[0_0_0_6px_var(--color-surface)]">
          {label}
        </span>
      )}
      {children}
    </div>
  );
});
