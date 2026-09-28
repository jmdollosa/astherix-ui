import * as React from "react";
import { cn } from "../../lib/cn";
import { renderIcon, type IconInput } from "../button/Button";

/*
 * Hero — the top of a landing page.
 *
 *   <Hero background="aurora" size="lg">
 *     <HeroEyebrow href="/changelog">New · Recurring invoices</HeroEyebrow>
 *     <HeroTitle gradient>Get paid without chasing anyone</HeroTitle>
 *     <HeroSubtitle>Send an invoice in thirty seconds…</HeroSubtitle>
 *     <HeroActions><Button size="lg">Start free</Button></HeroActions>
 *     <HeroStats stats={[{ value: "12k", label: "invoices sent" }]} />
 *   </Hero>
 *
 * The pieces are separate so a hero can be as plain or as loud as the page needs. `media` puts a
 * screenshot beside the words from medium screens up; without it everything is one centered column.
 * Every animated background respects prefers-reduced-motion.
 */

export type HeroBackground = "none" | "aurora" | "grid" | "dots" | "gradient" | "image";

export interface HeroProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** What sits behind the words. */
  background?: HeroBackground;
  /** The photo for `background="image"`. */
  image?: string;
  /** How much the image is darkened, 0–1, so text stays readable. */
  overlay?: number;
  /** Force light text — set automatically for image backgrounds. */
  dark?: boolean;
  align?: "center" | "start";
  /** How tall it is. "screen" fills the first screenful. */
  size?: "sm" | "md" | "lg" | "screen";
  /** A screenshot or illustration, placed beside the words from medium screens up. */
  media?: React.ReactNode;
  /** The three colors the aurora and gradient backgrounds are mixed from. */
  colors?: [string, string, string];
  as?: React.ElementType;
}

const padding: Record<NonNullable<HeroProps["size"]>, string> = {
  sm: "py-12 sm:py-16",
  md: "py-16 sm:py-24",
  lg: "py-20 sm:py-32",
  screen: "min-h-[100svh] grid place-content-center py-20",
};

function Aurora({ colors }: { colors: [string, string, string] }) {
  const blobs = [
    { c: colors[0], s: "h-[38rem] w-[38rem] -left-[12%] -top-[28%]", d: "22s", delay: "0s" },
    { c: colors[1], s: "h-[32rem] w-[32rem] right-[-10%] -top-[18%]", d: "28s", delay: "-6s" },
    { c: colors[2], s: "h-[30rem] w-[30rem] left-[28%] bottom-[-34%]", d: "25s", delay: "-13s" },
  ];
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {blobs.map((b, i) => (
        <span
          key={i}
          className={cn("absolute rounded-full opacity-45 blur-[90px] motion-reduce:animate-none dark:opacity-30", b.s)}
          style={{
            background: b.c,
            animation: `ui-aurora ${b.d} ease-in-out ${b.delay} infinite`,
          }}
        />
      ))}
      {/* Fades the clouds into the page below. */}
      <span className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(to_top,var(--color-bg),transparent)]" />
    </div>
  );
}

/** The band at the top of a landing page. */
export const Hero = React.forwardRef<HTMLElement, HeroProps>(function Hero(
  {
    background = "none",
    image,
    overlay = 0.55,
    dark,
    align = "center",
    size = "md",
    media,
    colors = ["#0d6efd", "#7c3aed", "#db2777"],
    as: Tag = "section",
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const light = dark ?? background === "image";
  const centered = align === "center" && !media;

  return (
    <Tag
      ref={ref}
      className={cn(
        "relative isolate w-full overflow-hidden",
        padding[size],
        light && "text-white",
        background === "gradient" && "text-white",
        className,
      )}
      style={{
        ...(background === "gradient"
          ? { backgroundImage: `linear-gradient(135deg, ${colors[0]}, ${colors[1]} 55%, ${colors[2]})` }
          : {}),
        ...style,
      }}
      {...rest}
    >
      {background === "aurora" && <Aurora colors={colors} />}

      {background === "grid" && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)] bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:3rem_3rem]"
        />
      )}

      {background === "dots" && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] bg-[radial-gradient(var(--color-border-strong)_1px,transparent_1px)] bg-[size:1.25rem_1.25rem]"
        />
      )}

      {background === "image" && image && (
        <>
          <img src={image} alt="" aria-hidden="true" className="absolute inset-0 -z-10 size-full object-cover" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black" style={{ opacity: overlay }} />
        </>
      )}

      <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8">
        {media ? (
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12">
            <div className={cn("grid min-w-0 gap-5 justify-items-start text-start")}>{children}</div>
            <div className="min-w-0">{media}</div>
          </div>
        ) : (
          <div
            className={cn(
              "grid min-w-0 gap-5",
              centered ? "justify-items-center text-center" : "justify-items-start text-start",
            )}
          >
            {children}
          </div>
        )}
      </div>
    </Tag>
  );
});

export interface HeroEyebrowProps extends React.HTMLAttributes<HTMLElement> {
  /** Makes it a link and adds a chevron. */
  href?: string;
  icon?: IconInput;
}

/** The small pill above the headline — an announcement, a version, a category. */
export function HeroEyebrow({ href, icon, className, children, ...rest }: HeroEyebrowProps) {
  const inner = (
    <>
      {icon && <span className="grid place-items-center [&_i]:text-[0.9rem] [&_svg]:size-4">{renderIcon(icon)}</span>}
      <span className="min-w-0 truncate">{children}</span>
      {href && (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-3.5 shrink-0 transition-transform duration-200 group-hover/eyebrow:translate-x-0.5">
          <path d="M7.5 4.5L13 10l-5.5 5.5" />
        </svg>
      )}
    </>
  );

  const classes = cn(
    "group/eyebrow inline-flex max-w-full items-center gap-2 rounded-full border border-current/20 bg-current/[0.07] px-3 py-1 text-[0.8125rem] font-medium backdrop-blur-sm",
    href && "transition-colors hover:bg-current/[0.13] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current",
    className,
  );

  if (href) {
    return (
      <a href={href} className={classes} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {inner}
      </a>
    );
  }
  return (
    <span className={classes} {...(rest as React.HTMLAttributes<HTMLSpanElement>)}>
      {inner}
    </span>
  );
}

export interface HeroTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2";
  /** Fades the headline through the hero's colors. */
  gradient?: boolean;
  size?: "md" | "lg" | "xl";
  colors?: [string, string, string];
}

const titleSize = {
  md: "text-[2.25rem] sm:text-[2.75rem] lg:text-[3.25rem]",
  lg: "text-[2.5rem] sm:text-[3.5rem] lg:text-[4.25rem]",
  xl: "text-[2.75rem] sm:text-[4rem] lg:text-[5rem]",
};

/** The headline. */
export function HeroTitle({
  as: Tag = "h1",
  gradient = false,
  size = "lg",
  colors = ["#0d6efd", "#7c3aed", "#db2777"],
  className,
  style,
  children,
  ...rest
}: HeroTitleProps) {
  return (
    <Tag
      className={cn(
        "max-w-[18ch] font-heading font-semibold leading-[1.03] tracking-[-0.03em] text-balance",
        titleSize[size],
        gradient && "bg-clip-text text-transparent",
        className,
      )}
      style={{
        ...(gradient
          ? { backgroundImage: `linear-gradient(105deg, ${colors[0]}, ${colors[1]} 48%, ${colors[2]})` }
          : {}),
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** The sentence under the headline. Keep it to a line or two. */
export function HeroSubtitle({ className, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("max-w-[52ch] text-[1.0625rem] leading-relaxed opacity-75 sm:text-[1.125rem]", className)} {...rest} />;
}

/** The buttons. Full width and stacked on phones, side by side from small screens up. */
export function HeroActions({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // Buttons go full width on phones; anything else (a sign-up field, say) keeps its own size.
        "mt-1 grid w-full max-w-sm gap-3 sm:flex sm:w-auto sm:max-w-none sm:flex-wrap sm:items-center [&>a]:w-full [&>button]:w-full sm:[&>a]:w-auto sm:[&>button]:w-auto",
        className,
      )}
      {...rest}
    />
  );
}

export interface HeroStat {
  value: React.ReactNode;
  label: React.ReactNode;
}

export interface HeroStatsProps extends React.HTMLAttributes<HTMLDListElement> {
  stats: HeroStat[];
}

/** A short row of proof points under the buttons. */
export function HeroStats({ stats, className, ...rest }: HeroStatsProps) {
  return (
    <dl className={cn("mt-4 flex flex-wrap gap-x-9 gap-y-4", className)} {...rest}>
      {stats.map((s, i) => (
        <div key={i} className="flex flex-col">
          {/* The number reads first, but the label comes first in the markup so <dt> stays before <dd>. */}
          <dt className="order-2 text-[0.8125rem] opacity-65">{s.label}</dt>
          <dd className="text-[1.5rem] font-semibold leading-tight tracking-[-0.02em]">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export interface HeroLogosProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Names, or <img> elements for real logos. */
  logos: React.ReactNode[];
  label?: React.ReactNode;
  /** Scroll them endlessly instead of wrapping. Stops for prefers-reduced-motion. */
  marquee?: boolean;
  /** Seconds for one full pass. */
  speed?: number;
}

/** The "trusted by" strip. */
export function HeroLogos({ logos, label = "Trusted by teams at", marquee = false, speed = 28, className, ...rest }: HeroLogosProps) {
  const row = (
    <>
      {logos.map((l, i) => (
        <li key={i} className="flex shrink-0 items-center text-[0.9375rem] font-medium opacity-60 [&_img]:h-6 [&_img]:w-auto">
          {l}
        </li>
      ))}
    </>
  );

  return (
    <div className={cn("mt-6 w-full min-w-0", className)} {...rest}>
      {label && <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] opacity-55">{label}</p>}
      {marquee ? (
        <div
          className="mt-3 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
          // Pausing on hover lets people actually read a name.
          style={{ ["--ui-marquee-speed" as string]: `${speed}s` }}
        >
          <ul
            className="flex w-max items-center gap-10 motion-reduce:animate-none hover:[animation-play-state:paused]"
            style={{ animation: "ui-marquee var(--ui-marquee-speed) linear infinite" }}
          >
            {row}
            {/* A second copy, hidden from screen readers, makes the loop seamless. */}
            <span className="contents" aria-hidden="true">
              {row}
            </span>
          </ul>
        </div>
      ) : (
        <ul className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-3">{row}</ul>
      )}
    </div>
  );
}

export interface HeroMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Wraps the content in browser chrome. */
  frame?: boolean;
  /** The address shown in the frame's bar. */
  url?: string;
  /** Drifts up and down forever. */
  float?: boolean;
  /** Turns it slightly, as if sitting on a desk. Flat on phones. */
  tilt?: boolean;
}

/** The screenshot beside the words. */
export function HeroMedia({ frame = false, url, float = false, tilt = false, className, children, ...rest }: HeroMediaProps) {
  const inner = frame ? (
    <div className="overflow-hidden rounded-card border border-border bg-surface shadow-[0_24px_60px_-18px_rgb(0_0_0/0.35)]">
      <div className="flex items-center gap-2 border-b border-border bg-bg px-3 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </span>
        {url && (
          <span className="mx-auto max-w-[60%] truncate rounded-full bg-surface px-3 py-0.5 text-[0.6875rem] text-fg-muted">
            {url}
          </span>
        )}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  ) : (
    children
  );

  return (
    <div
      className={cn(
        "min-w-0",
        tilt && "md:[transform:perspective(1200px)_rotateY(-7deg)_rotateX(3deg)]",
        float && "motion-reduce:animate-none",
        className,
      )}
      style={float ? { animation: "ui-float 7s ease-in-out infinite" } : undefined}
      {...rest}
    >
      {inner}
    </div>
  );
}
