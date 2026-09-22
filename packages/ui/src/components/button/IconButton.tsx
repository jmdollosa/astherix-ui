import * as React from "react";
import { cn } from "../../lib/cn";
import { renderIcon, type IconInput } from "./Button";

/*
 * IconButton — the icon itself is the button (heart, bookmark, bell, trash…).
 *
 * Press feedback: the icon squishes while held and a ripple spreads out from it (keyboard presses
 * too). As a toggle it swaps to a filled icon, pops, and throws a small burst of particles when
 * turned on. Small sizes get a finger-sized invisible tap area on touch screens.
 */

export type IconButtonTone = "neutral" | "primary" | "secondary" | "tertiary" | "success" | "warning" | "danger" | "info" | (string & {});

export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "color"> {
  /** The icon: an element (<svg>) or an icon-font class like "bi bi-heart". */
  icon: IconInput;
  /** What it does, e.g. "Like" or "Delete invoice". Required: it's the only text a screen reader gets. Also shown as a tooltip. */
  label: string;
  /** "plain" (just the icon; a soft halo on hover — default), "soft" (tinted circle) or "solid". */
  variant?: "plain" | "soft" | "solid";
  tone?: IconButtonTone;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square";
  /** Make it a toggle (like, bookmark, star): aria-pressed, and pressedIcon while on. */
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  /** Icon while pressed, e.g. the filled version: "bi bi-heart-fill". */
  pressedIcon?: IconInput;
  /** A burst of particles when turned on. Default true for toggles. */
  burst?: boolean;
  /** A count or dot in the corner: a number (99+ above 99) or true for a dot. */
  badge?: number | boolean;
  /** Show a spinner instead of the icon. Return a Promise from onClick to get this automatically. */
  loading?: boolean;
  /** Render as a link. */
  href?: string;
  /** Show the label as a tooltip on hover (the browser's own). Default true. */
  tooltip?: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement>) => unknown;
}

const tones: Record<string, [string, string]> = {
  neutral: ["var(--color-fg)", "var(--color-bg)"],
  primary: ["var(--color-primary)", "var(--color-primary-fg)"],
  secondary: ["var(--color-tone-secondary)", "var(--color-tone-secondary-fg)"],
  tertiary: ["var(--color-tone-tertiary)", "var(--color-tone-tertiary-fg)"],
  success: ["var(--color-success)", "var(--color-success-fg)"],
  warning: ["var(--color-warning)", "var(--color-warning-fg)"],
  danger: ["var(--color-danger)", "var(--color-danger-fg)"],
  info: ["var(--color-info)", "var(--color-info-fg)"],
};

const sizes = {
  xs: { box: 28, icon: 14, badge: "min-w-3.5 h-3.5 text-[0.5625rem]" },
  sm: { box: 32, icon: 16, badge: "min-w-4 h-4 text-[0.625rem]" },
  md: { box: 40, icon: 20, badge: "min-w-[1.125rem] h-[1.125rem] text-[0.625rem]" },
  lg: { box: 48, icon: 24, badge: "min-w-5 h-5 text-[0.6875rem]" },
  xl: { box: 56, icon: 28, badge: "min-w-5 h-5 text-xs" },
} as const;

const isPromise = (v: unknown): v is Promise<unknown> => !!v && typeof (v as Promise<unknown>).then === "function";

export const IconButton = React.forwardRef<HTMLElement, IconButtonProps>(function IconButton(
  {
    icon,
    label,
    variant = "plain",
    tone = "neutral",
    size = "md",
    shape = "circle",
    pressed: pressedProp,
    defaultPressed,
    onPressedChange,
    pressedIcon,
    burst,
    badge,
    loading: loadingProp = false,
    href,
    tooltip = true,
    disabled,
    onClick,
    onPointerDown,
    onKeyDown,
    className,
    style,
    type = "button",
    ...props
  },
  ref
) {
  const isToggle = pressedProp !== undefined || defaultPressed !== undefined || onPressedChange !== undefined;
  const [innerPressed, setInnerPressed] = React.useState(!!defaultPressed);
  const pressed = pressedProp ?? innerPressed;
  const [busy, setBusy] = React.useState(false);
  const loading = loadingProp || busy;
  const [ripple, setRipple] = React.useState(0);
  const [pop, setPop] = React.useState(0);
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const q = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (q) setReduced(q.matches);
  }, []);

  const [color, onColor] = tones[tone] ?? [tone, "#ffffff"];
  const s = sizes[size];
  const showBurst = (burst ?? isToggle) && !reduced;
  const off = disabled || loading;

  const feedback = () => {
    if (!reduced) setRipple((r) => r + 1);
  };

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (off) {
      e.preventDefault();
      return;
    }
    if (isToggle) {
      const next = !pressed;
      if (pressedProp === undefined) setInnerPressed(next);
      onPressedChange?.(next);
      if (next) setPop((p) => p + 1);
    }
    const r = onClick?.(e);
    if (isPromise(r)) {
      setBusy(true);
      r.finally(() => setBusy(false));
    }
  };

  const currentIcon = pressed && pressedIcon ? pressedIcon : icon;
  const active = isToggle && pressed;

  const classes = cn(
    "group/ib relative inline-grid shrink-0 cursor-pointer select-none place-items-center outline-none",
    "transition-[background-color,color,box-shadow] duration-150",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    shape === "circle" ? "rounded-full" : "rounded-control",
    // Small buttons: an invisible finger-sized tap area on touch screens.
    s.box < 44 && "[@media(pointer:coarse)]:before:absolute [@media(pointer:coarse)]:before:-inset-[calc((44px-100%)/2)] [@media(pointer:coarse)]:before:content-['']",
    variant === "plain" && cn(
      active ? "text-[color:var(--ib)]" : tone === "neutral" ? "text-fg-muted hover:text-fg" : "text-[color:var(--ib)]",
      "hover:bg-[color:color-mix(in_srgb,var(--ib)_10%,transparent)]"
    ),
    variant === "soft" && cn(
      "text-[color:var(--ib)] bg-[color:color-mix(in_srgb,var(--ib)_12%,transparent)] hover:bg-[color:color-mix(in_srgb,var(--ib)_18%,transparent)]",
      active && "bg-[color:color-mix(in_srgb,var(--ib)_22%,transparent)]"
    ),
    variant === "solid" && cn(
      "bg-[color:var(--ib)] text-[color:var(--ib-fg)] shadow-[inset_0_-2px_0_rgb(0_0_0/0.18)] hover:brightness-110",
      "active:shadow-[inset_0_-1px_0_rgb(0_0_0/0.18)]"
    ),
    off && "cursor-not-allowed opacity-50 hover:bg-transparent",
    className
  );

  const inner = (
    <>
      {/* The ripple: a soft circle that spreads from the icon on each press. */}
      {ripple > 0 && (
        <span
          key={ripple}
          aria-hidden="true"
          className={cn("pointer-events-none absolute inset-0", shape === "circle" ? "rounded-full" : "rounded-control")}
          style={{ background: variant === "solid" ? "rgb(255 255 255 / 0.5)" : "var(--ib)", animation: "ui-icon-ripple 450ms cubic-bezier(0.2,0.8,0.3,1) forwards" }}
        />
      )}
      {/* The burst: little dots flying out when a toggle turns on. */}
      {showBurst && pop > 0 && (
        <span key={`b${pop}`} aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center">
          {Array.from({ length: 8 }, (_, i) => (
            <span
              key={i}
              className="absolute size-[3px] rounded-full"
              style={{
                background: i % 2 ? "var(--ib)" : "color-mix(in srgb, var(--ib) 55%, #ffffff)",
                ["--a" as string]: `${i * 45 + 22}deg`,
                ["--d" as string]: `${s.box * 0.62}px`,
                animation: `ui-icon-burst 520ms cubic-bezier(0.2,0.8,0.3,1) ${i % 2 ? 40 : 0}ms forwards`,
              }}
            />
          ))}
        </span>
      )}
      {/* The icon: squishes while held, pops when a toggle turns on. */}
      <span
        key={`i${pop}`}
        aria-hidden="true"
        className={cn(
          "relative grid place-items-center transition-transform duration-150 ease-out [&_svg]:size-full [&_i]:leading-none",
          !off && "group-active/ib:scale-[0.82] group-active/ib:duration-75 motion-reduce:group-active/ib:scale-100"
        )}
        style={{ width: s.icon, height: s.icon, fontSize: s.icon, ...(pop && !reduced ? { animation: "ui-icon-pop 420ms cubic-bezier(0.3,1.2,0.5,1)" } : {}) }}
      >
        {loading ? (
          <svg viewBox="0 0 16 16" fill="none" className="animate-spin" aria-hidden="true">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
            <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          renderIcon(currentIcon)
        )}
      </span>
      {badge !== undefined && badge !== false && badge !== 0 && (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute -end-0.5 -top-0.5 grid place-items-center rounded-full bg-danger font-semibold tabular-nums leading-none text-danger-fg ring-2 ring-[color:var(--color-bg)]",
            badge === true ? "size-2.5" : cn("px-1", s.badge)
          )}
        >
          {badge === true ? null : badge > 99 ? "99+" : badge}
        </span>
      )}
    </>
  );

  const badgeText = typeof badge === "number" && badge > 0 ? `, ${badge > 99 ? "more than 99" : badge} new` : badge === true ? ", new" : "";
  const common = {
    "aria-label": label + badgeText,
    title: tooltip ? label : undefined,
    className: classes,
    style: { width: s.box, height: s.box, ["--ib" as string]: color, ["--ib-fg" as string]: onColor, ...style },
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      (onPointerDown as React.PointerEventHandler<HTMLElement> | undefined)?.(e as React.PointerEvent<HTMLButtonElement>);
      if (!off) feedback();
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      (onKeyDown as React.KeyboardEventHandler<HTMLElement> | undefined)?.(e as React.KeyboardEvent<HTMLButtonElement>);
      // Keyboard presses get the same ripple as a tap.
      if (!off && !e.repeat && (e.key === "Enter" || e.key === " ")) feedback();
    },
    onClick: handleClick,
  };

  if (href) {
    return (
      <a ref={ref as React.Ref<HTMLAnchorElement>} href={off ? undefined : href} aria-disabled={off || undefined} {...common} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {inner}
      </a>
    );
  }
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      disabled={disabled}
      aria-pressed={isToggle ? pressed : undefined}
      aria-busy={loading || undefined}
      {...common}
      {...props}
    >
      {inner}
    </button>
  );
});
