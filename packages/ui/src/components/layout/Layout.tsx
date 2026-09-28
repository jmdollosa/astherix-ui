import * as React from "react";
import { cn } from "../../lib/cn";

/*
 * Layout — small pieces for arranging things on the screen.
 *
 *   <Stack direction={{ base: "column", md: "row" }} gap={3} justify="between">…</Stack>
 *   <Grid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>…</Grid>
 *   <Grid minChildWidth="16rem" gap={4}>…</Grid>
 *   <Container size="xl">…</Container>
 *
 * Every size prop can be a plain value or an object keyed by breakpoint. Those turn into CSS
 * custom properties that theme.css reads inside media queries, so nothing depends on class names
 * generated at runtime and everything survives a packaged build.
 *
 * gap and padding count in spacing steps (4 = 1rem by default), so they follow the theme's density.
 */

/** A value that can change by screen size: `4` or `{ base: 2, md: 4 }`. */
export type Responsive<T> = T | { base?: T; sm?: T; md?: T; lg?: T };

const BREAKPOINTS = ["sm", "md", "lg"] as const;

/** Spreads a responsive value into --name / --name-sm / --name-md / --name-lg. */
function vars<T>(name: string, value: Responsive<T> | undefined, format: (v: T) => string | number = (v) => v as never) {
  if (value === undefined) return {};
  const out: Record<string, string | number> = {};
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const o = value as { base?: T; sm?: T; md?: T; lg?: T };
    if (o.base !== undefined) out[`--${name}`] = format(o.base);
    BREAKPOINTS.forEach((bp) => {
      const v = o[bp];
      if (v !== undefined) out[`--${name}-${bp}`] = format(v);
    });
  } else {
    out[`--${name}`] = format(value as T);
  }
  return out;
}

const alignMap = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
  baseline: "baseline",
} as const;

const justifyMap = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
} as const;

export type StackAlign = keyof typeof alignMap;
export type StackJustify = keyof typeof justifyMap;
export type StackDirection = "row" | "column" | "row-reverse" | "column-reverse";

export interface StackProps extends React.HTMLAttributes<HTMLElement> {
  /** "row" or "column" (the default), per screen size if you like. */
  direction?: Responsive<StackDirection>;
  /** Space between children, in spacing steps. */
  gap?: Responsive<number>;
  align?: Responsive<StackAlign>;
  justify?: Responsive<StackJustify>;
  /** Let a row fold onto a second line instead of overflowing. */
  wrap?: boolean;
  /** Draw a line between children. */
  divider?: boolean;
  /** Render as another element — "section", "ul", "nav"… */
  as?: React.ElementType;
}

/** Children in a row or a column with even spacing. */
export const Stack = React.forwardRef<HTMLElement, StackProps>(function Stack(
  { direction = "column", gap = 4, align, justify, wrap = false, divider = false, as: Tag = "div", className, style, ...rest },
  ref,
) {
  const isRow =
    typeof direction === "string"
      ? direction.startsWith("row")
      : (direction.lg ?? direction.md ?? direction.sm ?? direction.base ?? "column").startsWith("row");

  return (
    <Tag
      ref={ref}
      data-ui-stack=""
      className={cn(
        "min-w-0",
        divider &&
          (isRow
            ? "[&>*+*]:border-s [&>*+*]:border-border [&>*+*]:ps-[inherit]"
            : "[&>*+*]:border-t [&>*+*]:border-border"),
        className,
      )}
      style={{
        ...vars("ui-dir", direction),
        ...vars("ui-gap", gap),
        ...vars("ui-align", align, (v) => alignMap[v]),
        ...vars("ui-justify", justify, (v) => justifyMap[v]),
        ...(wrap ? { ["--ui-wrap"]: "wrap" } : {}),
        ...style,
      }}
      {...rest}
    />
  );
});

export interface GridProps extends React.HTMLAttributes<HTMLElement> {
  /** How many equal columns. */
  columns?: Responsive<number>;
  /**
   * Instead of a column count: fit as many columns as will hold this width and reflow.
   * Reacts to the grid's own width, so it works inside panels of unknown size.
   */
  minChildWidth?: string;
  gap?: Responsive<number>;
  align?: Responsive<StackAlign>;
  as?: React.ElementType;
}

/** A grid of equal columns. */
export const Grid = React.forwardRef<HTMLElement, GridProps>(function Grid(
  { columns = 1, minChildWidth, gap = 4, align, as: Tag = "div", className, style, ...rest },
  ref,
) {
  const cols = minChildWidth
    ? { ["--ui-cols"]: `repeat(auto-fit, minmax(min(${minChildWidth}, 100%), 1fr))` }
    : vars("ui-cols", columns, (n) => `repeat(${n}, minmax(0, 1fr))`);
  const widest = typeof columns === "number" ? columns : (columns.lg ?? columns.md ?? columns.sm ?? columns.base ?? 1);

  return (
    <Tag
      ref={ref}
      data-ui-grid=""
      className={cn("min-w-0", className)}
      style={{
        ...cols,
        ["--ui-cols-count"]: widest,
        ...vars("ui-gap", gap),
        ...vars("ui-align", align, (v) => alignMap[v]),
        ...style,
      }}
      {...rest}
    />
  );
});

export interface GridItemProps extends React.HTMLAttributes<HTMLElement> {
  /** How many columns to take. Never exceeds the grid's column count, so nothing overflows. */
  span?: Responsive<number>;
  rowSpan?: number;
  as?: React.ElementType;
}

/** A grid child that spans several columns or rows. */
export const GridItem = React.forwardRef<HTMLElement, GridItemProps>(function GridItem(
  { span = 1, rowSpan, as: Tag = "div", className, style, ...rest },
  ref,
) {
  return (
    <Tag
      ref={ref}
      data-ui-span=""
      className={cn("min-w-0", className)}
      style={{ ...vars("ui-span", span), ...(rowSpan ? { ["--ui-row-span"]: rowSpan } : {}), ...style }}
      {...rest}
    />
  );
});

const containerSizes: Record<string, string> = {
  sm: "40rem",
  md: "48rem",
  lg: "64rem",
  xl: "80rem",
  "2xl": "96rem",
  prose: "65ch",
  full: "100%",
};

export interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  /** A preset width, or any CSS length. */
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "prose" | "full" | (string & {});
  /** Side padding, in spacing steps. */
  padding?: Responsive<number>;
  align?: "center" | "start";
  as?: React.ElementType;
}

/** Keeps content from getting too wide, and centers it. */
export const Container = React.forwardRef<HTMLElement, ContainerProps>(function Container(
  { size = "xl", padding = 5, align = "center", as: Tag = "div", className, style, ...rest },
  ref,
) {
  return (
    <Tag
      ref={ref}
      className={cn("w-full", align === "center" && "mx-auto", className)}
      style={{
        maxWidth: containerSizes[size] ?? size,
        paddingInline: "calc(var(--spacing) * var(--ui-pad, 5))",
        ...vars("ui-pad", padding),
        ...style,
      }}
      {...rest}
    />
  );
});

export interface CenterProps extends React.HTMLAttributes<HTMLDivElement> {
  minHeight?: number | string;
  axis?: "both" | "horizontal" | "vertical";
}

/** Puts its children in the middle. */
export const Center = React.forwardRef<HTMLDivElement, CenterProps>(function Center(
  { minHeight, axis = "both", className, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "grid",
        axis === "both" && "place-items-center",
        axis === "horizontal" && "justify-items-center",
        axis === "vertical" && "content-center",
        className,
      )}
      style={{ minHeight, ...style }}
      {...rest}
    />
  );
});

/** Eats the free space in a row, pushing what follows to the end. */
export function Spacer({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn("flex-1 self-stretch", className)} {...rest} />;
}

export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "16/9", "1/1", "4/3"… */
  ratio?: string;
}

/** Keeps a box at a fixed shape; the child fills it and is cropped to fit. */
export const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(function AspectRatio(
  { ratio = "16/9", className, style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn("relative w-full overflow-hidden", className)} style={{ aspectRatio: ratio, ...style }} {...rest}>
      <div className="absolute inset-0 [&>*]:size-full [&>*]:object-cover">{children}</div>
    </div>
  );
});

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  dashed?: boolean;
  /** Space above and below (or either side), in spacing steps. */
  spacing?: number;
}

const dashH = "bg-[repeating-linear-gradient(to_right,var(--color-border)_0_4px,transparent_4px_8px)]";
const dashV = "bg-[repeating-linear-gradient(to_bottom,var(--color-border)_0_4px,transparent_4px_8px)]";

/** A line between things, optionally with a word in the middle. */
export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(function Divider(
  { orientation = "horizontal", dashed = false, spacing, className, style, children, ...rest },
  ref,
) {
  const margin =
    spacing !== undefined
      ? { [orientation === "horizontal" ? "marginBlock" : "marginInline"]: `calc(var(--spacing) * ${spacing})` }
      : {};

  if (orientation === "vertical") {
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation="vertical"
        className={cn("w-px self-stretch bg-border", dashed && dashV, className)}
        style={{ ...margin, ...style }}
        {...rest}
      />
    );
  }

  if (children) {
    return (
      <div
        ref={ref}
        role="separator"
        className={cn("flex items-center gap-3 text-xs text-fg-muted", className)}
        style={{ ...margin, ...style }}
        {...rest}
      >
        <span className={cn("h-px flex-1 bg-border", dashed && dashH)} />
        {children}
        <span className={cn("h-px flex-1 bg-border", dashed && dashH)} />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      role="separator"
      className={cn("h-px w-full bg-border", dashed && dashH, className)}
      style={{ ...margin, ...style }}
      {...rest}
    />
  );
});
