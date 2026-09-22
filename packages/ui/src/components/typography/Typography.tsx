import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/cn";

/*
 * Typography — a consistent type scale and the small pieces of text every app needs:
 * Heading, Text, Lead, Link, Code, Kbd, Mark, Blockquote, List, Prose and Stat.
 * Headings use --font-heading (the body font unless you set another).
 */

export type TextTone = "default" | "muted" | "subtle" | "primary" | "success" | "warning" | "danger" | "info" | "inherit";

const toneClass: Record<TextTone, string> = {
  default: "text-fg",
  muted: "text-fg-muted",
  subtle: "text-fg-muted/75",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
  inherit: "text-inherit",
};

const weightClass = { normal: "font-normal", medium: "font-medium", semibold: "font-semibold", bold: "font-bold" } as const;
type Weight = keyof typeof weightClass;
const alignClass = { start: "text-start", center: "text-center", end: "text-end" } as const;

/** Shared props for truncating text. */
type Clamp = {
  /** Cut off with "…" after one line. */
  truncate?: boolean;
  /** Cut off with "…" after this many lines. */
  lineClamp?: number;
};
function clampProps(truncate?: boolean, lineClamp?: number) {
  if (truncate) return { className: "truncate", style: undefined };
  if (lineClamp)
    return {
      className: "overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical]",
      style: { WebkitLineClamp: lineClamp } as React.CSSProperties,
    };
  return { className: "", style: undefined };
}

/* ---------- Heading ---------- */

export const headingSizes = cva("font-heading text-balance", {
  variants: {
    size: {
      display: "text-[clamp(2.25rem,5vw+1rem,3.5rem)] font-semibold leading-[1.02] tracking-[-0.035em]",
      h1: "text-[clamp(1.875rem,2.5vw+1rem,2.375rem)] font-semibold leading-[1.1] tracking-[-0.025em]",
      h2: "text-[1.625rem] font-semibold leading-[1.2] tracking-[-0.02em]",
      h3: "text-[1.3125rem] font-semibold leading-[1.3] tracking-[-0.012em]",
      h4: "text-[1.0625rem] font-semibold leading-[1.4] tracking-[-0.005em]",
      h5: "text-[0.9375rem] font-semibold leading-[1.45]",
      h6: "text-[0.8125rem] font-semibold leading-[1.5]",
    },
  },
  defaultVariants: { size: "h2" },
});

export type HeadingSize = "display" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement>, Clamp {
  /** The heading level (h1–h6). Pick it for the page outline, not for looks. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** The look. Defaults to match the level; "display" is for hero titles. */
  size?: HeadingSize;
  tone?: TextTone;
  weight?: Weight;
  align?: keyof typeof alignClass;
  asChild?: boolean;
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level = 2, size, tone = "default", weight, align, truncate, lineClamp, asChild, className, style, ...props }, ref) => {
    const Comp: React.ElementType = asChild ? Slot : (`h${level}` as const);
    const clamp = clampProps(truncate, lineClamp);
    return (
      <Comp
        ref={ref}
        className={cn(
          headingSizes({ size: size ?? (`h${level}` as HeadingSize) }),
          toneClass[tone],
          weight && weightClass[weight],
          align && alignClass[align],
          clamp.className,
          className
        )}
        style={{ ...clamp.style, ...style }}
        {...props}
      />
    );
  }
);
Heading.displayName = "Heading";

/* ---------- Text ---------- */

export const textSizes = cva("", {
  variants: {
    size: {
      xl: "text-[1.1875rem] leading-[1.6]",
      lg: "text-[1.0625rem] leading-[1.65]",
      md: "text-[0.9375rem] leading-[1.65]",
      sm: "text-[0.8125rem] leading-[1.55]",
      xs: "text-xs leading-[1.5]",
    },
  },
  defaultVariants: { size: "md" },
});

export interface TextProps extends React.HTMLAttributes<HTMLElement>, Clamp {
  as?: "p" | "span" | "div" | "label" | "small" | "strong" | "em" | "time" | "figcaption";
  size?: "xl" | "lg" | "md" | "sm" | "xs";
  tone?: TextTone;
  weight?: Weight;
  align?: keyof typeof alignClass;
  /** Tabular (equal-width) numbers, for amounts and times that line up. */
  numeric?: boolean;
  asChild?: boolean;
}

export const Text = React.forwardRef<HTMLElement, TextProps>(
  (
    { as = "p", size = "md", tone = "default", weight, align, numeric, truncate, lineClamp, asChild, className, style, ...props },
    ref
  ) => {
    const Comp: React.ElementType = asChild ? Slot : as;
    const clamp = clampProps(truncate, lineClamp);
    return (
      <Comp
        ref={ref}
        className={cn(
          textSizes({ size }),
          toneClass[tone],
          weight && weightClass[weight],
          align && alignClass[align],
          numeric && "tabular-nums",
          as === "p" && "text-pretty",
          clamp.className,
          className
        )}
        style={{ ...clamp.style, ...style }}
        {...props}
      />
    );
  }
);
Text.displayName = "Text";

/** The opening paragraph of a page or section: larger and softer than body text. */
export const Lead = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("max-w-[60ch] text-pretty text-[1.125rem] leading-[1.6] text-fg-muted", className)} {...props} />
  )
);
Lead.displayName = "Lead";

/* ---------- Link ---------- */

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * - "inline": underlined, in the primary color — for links inside sentences (default)
   * - "subtle": body color, underline on hover — for dense lists and footers
   * - "standalone": medium weight, no underline until hover — for links on their own line
   */
  variant?: "inline" | "subtle" | "standalone";
  /** Opens in a new tab with an ↗ icon and a note for screen readers. Default: true for other sites. */
  external?: boolean;
  /** Render your framework's link: <Link asChild><NextLink href="/x">…</NextLink></Link> */
  asChild?: boolean;
}

function isExternal(href?: string) {
  if (!href || !/^https?:\/\//i.test(href)) return false;
  if (typeof window === "undefined") return true;
  try {
    return new URL(href).host !== window.location.host;
  } catch {
    return false;
  }
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ variant = "inline", external, asChild, className, children, href, target, rel, ...props }, ref) => {
    const ext = external ?? isExternal(href);
    const Comp: React.ElementType = asChild ? Slot : "a";
    return (
      <Comp
        ref={ref}
        href={href}
        target={ext ? (target ?? "_blank") : target}
        rel={ext ? (rel ?? "noopener noreferrer") : rel}
        className={cn(
          "rounded-[2px] underline-offset-[0.2em] transition-colors duration-100",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          variant === "inline" && "text-primary underline decoration-[color:color-mix(in_srgb,var(--color-primary)_40%,transparent)] decoration-1 hover:decoration-current",
          variant === "subtle" && "text-inherit no-underline hover:text-primary hover:underline",
          variant === "standalone" && "font-medium text-primary no-underline hover:underline",
          className
        )}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {children}
            {ext && (
              <>
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="ms-[0.2em] inline-block size-[0.7em] align-[0.05em]"
                >
                  <path d="M4 2.5h5.5V8M9.5 2.5L3 9" />
                </svg>
                <span className="sr-only"> (opens in a new tab)</span>
              </>
            )}
          </>
        )}
      </Comp>
    );
  }
);
Link.displayName = "Link";

/* ---------- inline pieces ---------- */

/** Inline code: file names, commands, values. */
export const Code = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(({ className, ...props }, ref) => (
  <code
    ref={ref}
    className={cn("rounded-[0.3em] bg-secondary-hover px-[0.35em] py-[0.1em] font-mono text-[0.875em] text-fg", className)}
    {...props}
  />
));
Code.displayName = "Code";

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  /** A shortcut as separate keys, e.g. ["⌘", "K"] — shown as key caps joined together. */
  keys?: string[];
}

/** Keyboard keys, drawn as small raised key caps (the same physical feel as Button). */
export const Kbd = React.forwardRef<HTMLElement, KbdProps>(({ keys, className, children, ...props }, ref) => {
  const cap = cn(
    "inline-grid min-w-[1.6em] place-items-center rounded-[0.3em] border border-border-strong bg-surface px-[0.4em]",
    "font-sans text-[0.8em] font-medium leading-[1.55] text-fg shadow-[inset_0_-1.5px_0_var(--color-border-strong)]"
  );
  if (keys?.length) {
    return (
      <kbd ref={ref} className={cn("inline-flex items-center gap-[0.2em] align-[0.05em]", className)} {...props}>
        {keys.map((k, i) => (
          <kbd key={i} className={cap}>
            {k}
          </kbd>
        ))}
      </kbd>
    );
  }
  return (
    <kbd ref={ref} className={cn(cap, "align-[0.05em]", className)} {...props}>
      {children}
    </kbd>
  );
});
Kbd.displayName = "Kbd";

/** Highlighted text, like a highlighter pen — e.g. search matches. */
export const Mark = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(({ className, ...props }, ref) => (
  <mark
    ref={ref}
    className={cn("rounded-[2px] bg-[color:color-mix(in_srgb,var(--color-warning)_28%,transparent)] px-[0.1em] text-inherit", className)}
    {...props}
  />
));
Mark.displayName = "Mark";

/* ---------- Blockquote ---------- */

export interface BlockquoteProps extends React.BlockquoteHTMLAttributes<HTMLQuoteElement> {
  /** Who said it, e.g. "Maria Santos". */
  author?: React.ReactNode;
  /** Their role or the source, e.g. "Product designer, Northwind". */
  source?: React.ReactNode;
  size?: "md" | "lg";
}

export const Blockquote = React.forwardRef<HTMLQuoteElement, BlockquoteProps>(
  ({ author, source, size = "md", className, children, ...props }, ref) => {
    const quote = (
      <blockquote
        ref={ref}
        className={cn(
          "border-s-[3px] border-primary ps-5 text-pretty text-fg",
          size === "lg" ? "font-heading text-[1.3125rem] leading-[1.5] tracking-[-0.01em]" : "text-[1.0625rem] leading-[1.65]",
          className
        )}
        {...props}
      >
        {children}
      </blockquote>
    );
    if (!author && !source) return quote;
    return (
      <figure className="grid gap-3">
        {quote}
        <figcaption className="ps-5 text-sm text-fg-muted">
          {author && <span className="font-medium text-fg">{author}</span>}
          {author && source && <span aria-hidden="true">, </span>}
          {source}
        </figcaption>
      </figure>
    );
  }
);
Blockquote.displayName = "Blockquote";

/* ---------- List ---------- */

type ListVariant = "bullet" | "number" | "check" | "none";
const ListContext = React.createContext<ListVariant>("bullet");

export interface ListProps extends React.HTMLAttributes<HTMLUListElement | HTMLOListElement> {
  /** "bullet" (default), "number", "check" (a check mark per item) or "none". */
  variant?: ListVariant;
  /** Space between items. */
  spacing?: "tight" | "normal" | "loose";
  size?: "md" | "sm";
}

export function List({ variant = "bullet", spacing = "normal", size = "md", className, ...props }: ListProps) {
  const Comp = variant === "number" ? "ol" : "ul";
  return (
    <ListContext.Provider value={variant}>
      <Comp
        className={cn(
          "grid text-fg",
          size === "sm" ? "text-[0.8125rem] leading-[1.55]" : "text-[0.9375rem] leading-[1.6]",
          spacing === "tight" ? "gap-1" : spacing === "loose" ? "gap-3" : "gap-2",
          variant === "bullet" && "list-disc ps-5 marker:text-fg-muted",
          variant === "number" && "list-decimal ps-5 marker:text-fg-muted marker:tabular-nums",
          (variant === "check" || variant === "none") && "list-none",
          className
        )}
        {...(props as React.HTMLAttributes<HTMLUListElement>)}
      />
    </ListContext.Provider>
  );
}

export function ListItem({ className, children, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  const variant = React.useContext(ListContext);
  if (variant === "check") {
    return (
      <li className={cn("flex gap-2.5", className)} {...props}>
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-[0.3em] size-[1em] shrink-0 text-success">
          <path d="M4.5 10.5l3.5 3.5 7.5-8" />
        </svg>
        <span className="min-w-0">{children}</span>
      </li>
    );
  }
  return (
    <li className={cn("ps-0.5", className)} {...props}>
      {children}
    </li>
  );
}

/* ---------- Prose ---------- */

export interface ProseProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Base size of the long-form text. */
  size?: "sm" | "md" | "lg";
  /** Render HTML you trust or have sanitized (e.g. from the Editor, a CMS or Markdown). */
  html?: string;
}

/** Styles long-form content — articles, docs, CMS or Markdown output — with the same scale as the rest. */
export const Prose = React.forwardRef<HTMLDivElement, ProseProps>(({ size = "md", html, className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("ui-prose max-w-[68ch]", size === "sm" ? "text-[0.875rem]" : size === "lg" ? "text-[1.0625rem]" : "", className)}
    {...(html !== undefined ? { dangerouslySetInnerHTML: { __html: html } } : { children })}
    {...props}
  />
));
Prose.displayName = "Prose";

/* ---------- Stat ---------- */

export interface StatProps extends React.HTMLAttributes<HTMLElement> {
  label: React.ReactNode;
  value: React.ReactNode;
  /** The change, e.g. "+12.5%". */
  change?: React.ReactNode;
  /** Direction of the change. Colors it and adds an arrow. */
  trend?: "up" | "down" | "flat";
  /** When "down" is good (costs, errors, response time), swap the colors. */
  invertTrend?: boolean;
  /** Context for the number, e.g. "vs last month". */
  description?: React.ReactNode;
  size?: "md" | "lg";
}

const StatGroupContext = React.createContext(false);

export interface StatGroupProps extends React.HTMLAttributes<HTMLDListElement> {
  /** Columns on wider screens. Stats stack on phones. */
  columns?: 2 | 3 | 4;
  /** Draw dividers between stats. */
  divided?: boolean;
}

/** Lays out several Stats as one description list. */
export function StatGroup({ columns = 3, divided = false, className, ...props }: StatGroupProps) {
  return (
    <StatGroupContext.Provider value={true}>
      <dl
        className={cn(
          "grid gap-6",
          columns === 2 ? "sm:grid-cols-2" : columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3",
          divided && "gap-0 divide-y divide-border sm:divide-x sm:divide-y-0 [&>*]:py-4 sm:[&>*]:px-6 sm:[&>*:first-child]:ps-0",
          className
        )}
        {...props}
      />
    </StatGroupContext.Provider>
  );
}

/** A key number with its label and change — for dashboards and summaries. */
export function Stat({ label, value, change, trend, invertTrend = false, description, size = "md", className, ...props }: StatProps) {
  // Inside a StatGroup this is a group within its <dl>; on its own it is its own <dl>.
  const inGroup = React.useContext(StatGroupContext);
  const Comp: React.ElementType = inGroup ? "div" : "dl";
  const good = trend === "flat" || trend === undefined ? null : (trend === "up") !== invertTrend;
  const trendWord = trend === "up" ? "Up" : trend === "down" ? "Down" : trend === "flat" ? "No change" : "";
  return (
    <Comp className={cn("grid content-start gap-1", className)} {...props}>
      <dt className="text-[0.8125rem] font-medium text-fg-muted">{label}</dt>
      <dd className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span
          className={cn(
            "font-heading font-semibold tabular-nums tracking-[-0.02em] text-fg",
            size === "lg" ? "text-[2.25rem] leading-[1.1]" : "text-[1.625rem] leading-[1.2]"
          )}
        >
          {value}
        </span>
        {change !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[0.8125rem] font-medium tabular-nums",
              good === null ? "text-fg-muted" : good ? "text-success" : "text-danger"
            )}
          >
            {trend && trend !== "flat" && (
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={cn("size-3", trend === "down" && "rotate-180")}>
                <path d="M6 9.5V2.5M3 5.5l3-3 3 3" />
              </svg>
            )}
            {trendWord && <span className="sr-only">{trendWord} </span>}
            {change}
          </span>
        )}
      </dd>
      {description && <dd className="text-[0.8125rem] text-fg-muted">{description}</dd>}
    </Comp>
  );
}
