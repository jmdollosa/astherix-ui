import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

/*
 * The button's box-shadow is built from three layers, each set by a CSS variable:
 *   --btn-ring  a 1px outline (secondary variant)
 *   --btn-edge  the darker bottom edge that makes it look raised (`raised`)
 *   --btn-drop  the drop shadow under the button (`shadow`)
 * Keeping them separate lets `raised` and `shadow` be combined freely.
 * ("0_0_#0000" is an empty shadow. Class strings stay literal so Tailwind can find them.)
 */
export const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap select-none",
    "font-medium tracking-[-0.005em] leading-none",
    "[--btn-ring:0_0_#0000] [--btn-edge:0_0_#0000] [--btn-drop:0_0_#0000]",
    "shadow-[var(--btn-ring),var(--btn-edge),var(--btn-drop)]",
    "transition-[background-color,box-shadow,color,translate] duration-100 ease-out",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-45",
    "aria-busy:cursor-progress",
    "motion-reduce:transition-none",
    // SVG icons
    "[&_svg]:pointer-events-none [&_svg]:size-[1.125em] [&_svg]:shrink-0",
    // Icon fonts (Bootstrap Icons, Font Awesome, Glyphicons…) rendered as <i>
    "[&_i]:pointer-events-none [&_i]:shrink-0 [&_i]:text-[1.125em] [&_i]:leading-none [&_i]:not-italic",
  ],
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-fg hover:bg-primary-hover [--btn-edge-color:var(--color-primary-edge)] [--ui-orbit-color:#fff] [--ui-progress-fill:color-mix(in_srgb,var(--color-primary-fg)_22%,transparent)] [--ui-progress-bar:var(--color-primary-fg)]",
        secondary: [
          "bg-secondary text-fg hover:bg-secondary-hover [--btn-edge-color:var(--color-border-strong)] [--ui-orbit-color:var(--color-primary)] [--ui-progress-fill:color-mix(in_srgb,var(--color-primary)_16%,transparent)] [--ui-progress-bar:var(--color-primary)]",
          "[--btn-ring:inset_0_0_0_1px_var(--color-border-strong)]",
        ],
        ghost: "bg-transparent text-fg hover:bg-secondary-hover active:bg-border [--ui-orbit-color:var(--color-primary)] [--ui-progress-fill:color-mix(in_srgb,var(--color-primary)_16%,transparent)] [--ui-progress-bar:var(--color-primary)]",
        danger: "bg-danger text-danger-fg hover:bg-danger-hover [--btn-edge-color:var(--color-danger-edge)] [--ui-orbit-color:#fff] [--ui-progress-fill:color-mix(in_srgb,var(--color-danger-fg)_22%,transparent)] [--ui-progress-bar:var(--color-danger-fg)]",
      },
      // Raised: a 3px darker bottom edge makes the button look lifted. On press it drops
      // 2px and the edge shrinks to 1px, so it reads as pushed in. Flat buttons move 1px.
      raised: {
        true: [
          "pb-[3px] [--btn-edge:inset_0_-3px_0_0_var(--btn-edge-color)]",
          "active:translate-y-[2px] active:[--btn-edge:inset_0_-1px_0_0_var(--btn-edge-color)]",
          "motion-reduce:active:translate-y-0",
        ],
        false: "active:translate-y-px motion-reduce:active:translate-y-0",
      },
      // Drop shadow weight. Values are theme tokens (--ui-shadow-*), tuned for light and dark.
      // Pressing a button with a shadow lowers it to the lightest level.
      shadow: {
        none: "",
        sm: "[--btn-drop:var(--ui-shadow-sm)]",
        md: "[--btn-drop:var(--ui-shadow-md)] active:[--btn-drop:var(--ui-shadow-sm)]",
        lg: "[--btn-drop:var(--ui-shadow-lg)] active:[--btn-drop:var(--ui-shadow-sm)]",
        xl: "[--btn-drop:var(--ui-shadow-xl)] active:[--btn-drop:var(--ui-shadow-sm)]",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-[0.9375rem]",
        lg: "h-12 px-5 text-base",
      },
      // Corner radius. "md" follows --radius-control, so changing that token re-shapes
      // every default button in an app. With iconOnly, "full" makes a perfect circle.
      rounded: {
        none: "rounded-none",
        sm: "rounded-control-sm",
        md: "rounded-control",
        lg: "rounded-control-lg",
        full: "rounded-full",
      },
      iconOnly: {
        true: "px-0",
        false: "",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    compoundVariants: [
      // Ghost buttons are always flat.
      {
        variant: "ghost",
        raised: true,
        class: "pb-0 [--btn-edge:0_0_#0000] active:[--btn-edge:0_0_#0000] active:translate-y-px",
      },
      { iconOnly: true, size: "sm", class: "w-8" },
      { iconOnly: true, size: "md", class: "w-10" },
      { iconOnly: true, size: "lg", class: "w-12" },
      // Pill buttons get a little more side padding so the label doesn't crowd the curve.
      { rounded: "full", iconOnly: false, size: "sm", class: "px-4" },
      { rounded: "full", iconOnly: false, size: "md", class: "px-5" },
      { rounded: "full", iconOnly: false, size: "lg", class: "px-6" },
    ],
    defaultVariants: {
      variant: "primary",
      raised: true,
      shadow: "none",
      size: "md",
      rounded: "md",
      iconOnly: false,
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick">,
    VariantProps<typeof buttonVariants> {
  /**
   * Click handler. Return a Promise (e.g. from fetch or axios) and the button
   * shows its spinner until the Promise settles — no loading state to manage.
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<unknown>;
  /**
   * Render the child element instead of a <button>, keeping the button styles.
   * Use it for links: <Button asChild><Link href="/x">Open</Link></Button>
   */
  asChild?: boolean;
  /**
   * Show the spinner on demand. Use it with state you already have, such as
   * Inertia's `form.processing` or React's `isPending` from useTransition.
   */
  loading?: boolean;
  /**
   * Where the spinner appears while loading.
   * - "center": replaces the label (the button keeps its width)
   * - "start" / "end": appears beside the label; takes the icon's place if there is one
   */
  spinnerPlacement?: "center" | "start" | "end";
  /**
   * How loading is shown.
   * - "spinner": a spinning icon (default)
   * - "orbit": experimental — a light runs around the button's edge and the label stays visible
   * - "progress": experimental — a progress fill or bar; the label stays visible
   */
  loadingIndicator?: "spinner" | "orbit" | "progress";
  /**
   * With loadingIndicator="progress":
   * - "fill": a translucent fill sweeps across the button from left to right (default)
   * - "bar": a thin bar runs along the bottom edge
   */
  progressStyle?: "fill" | "bar";
  /**
   * With loadingIndicator="progress": the real progress, 0–100 (e.g. from an upload).
   * Leave it out and the progress creeps forward on its own until the work finishes.
   */
  progress?: number;
  /** Label shown while loading, e.g. "Saving…". Used with "start"/"end" placement, "orbit" and "progress". */
  loadingLabel?: React.ReactNode;
  /**
   * Keep the spinner visible for at least this many milliseconds, so very fast
   * requests don't cause a flicker. Applies to Promise-based loading. Default 0.
   */
  minLoadingTime?: number;
  /**
   * Icon shown before the label. Pass an element (<DownloadIcon />) or an
   * icon-font class string, e.g. "bi bi-download" or "fa-solid fa-download".
   */
  leadingIcon?: IconInput;
  /** Icon shown after the label. Same options as `leadingIcon`. */
  trailingIcon?: IconInput;
  /**
   * The icon for an icon-only button (use with `iconOnly` and an `aria-label`).
   * Same options as `leadingIcon`; used instead of children.
   */
  icon?: IconInput;
}

/** An icon element, or a class string for an icon font. */
export type IconInput = React.ReactNode | string;

/** Turns an icon-font class string into an <i>; passes elements through. */
export function renderIcon(icon: IconInput) {
  if (typeof icon === "string") {
    return icon.trim() ? <i className={icon} aria-hidden="true" /> : null;
  }
  return icon;
}

function Spinner() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="animate-spin motion-reduce:animate-none"
    >
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" />
      <path d="M14.25 8A6.25 6.25 0 0 0 8 1.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return !!value && typeof (value as PromiseLike<unknown>).then === "function";
}

/** Spinner that sits beside the label; its slot grows from zero width when there's no icon to replace. */
function SideSlot({
  side,
  busy,
  icon,
}: {
  side: "start" | "end";
  busy: boolean;
  icon: React.ReactNode;
}) {
  if (icon) return <>{busy ? <Spinner /> : icon}</>;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex items-center justify-center overflow-hidden",
        "transition-[width,margin] duration-150 ease-out motion-reduce:transition-none",
        busy ? "w-[1.125em]" : cn("w-0", side === "start" ? "-mr-2" : "-ml-2")
      )}
    >
      {busy && <Spinner />}
    </span>
  );
}

/** How long the finish (jump to 100%, then fade) takes. */
const PROGRESS_FINISH_MS = 420;

/**
 * Experimental progress indicator. Determinate when `value` is given; otherwise it
 * creeps toward ~92% (fast at first, then slower) until the work finishes. On finish
 * it runs to 100% and fades out.
 */
function ProgressIndicator({
  kind,
  value,
  finishing,
}: {
  kind: "fill" | "bar";
  value?: number;
  finishing: boolean;
}) {
  const barRef = React.useRef<HTMLSpanElement>(null);
  const determinate = typeof value === "number" && Number.isFinite(value);

  React.useLayoutEffect(() => {
    const el = barRef.current;
    if (!el) return;
    if (!finishing) {
      // Loading started again before the finish ended: start fresh.
      el.style.animation = el.style.transition = el.style.opacity = "";
      if (!determinate) el.style.width = "";
      return;
    }
    // Freeze the current (possibly animated) width, then transition from there to 100%.
    const current = getComputedStyle(el).width;
    el.style.animation = "none";
    el.style.width = current;
    void el.getBoundingClientRect();
    el.style.transition = "width 180ms ease-out, opacity 220ms ease 180ms";
    el.style.width = "100%";
    el.style.opacity = "0";
  }, [finishing]);

  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <span
        ref={barRef}
        className={cn(
          "absolute left-0",
          kind === "fill"
            ? "inset-y-0 bg-[var(--ui-progress-fill)]"
            : "bottom-0 h-[var(--ui-progress-height,3px)] bg-[var(--ui-progress-bar)]",
          !determinate && "animate-[ui-progress-creep_var(--ui-progress-duration,8s)_cubic-bezier(0.1,0.6,0.3,1)_forwards]"
        )}
        style={
          determinate && !finishing
            ? { width: `${Math.min(100, Math.max(0, value))}%`, transition: "width 200ms ease-out" }
            : determinate
              ? { width: `${Math.min(100, Math.max(0, value))}%` }
              : undefined
        }
      />
    </span>
  );
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      rounded,
      raised,
      shadow,
      iconOnly,
      fullWidth,
      asChild = false,
      loading = false,
      spinnerPlacement = "center",
      loadingIndicator = "spinner",
      progressStyle = "fill",
      progress,
      loadingLabel,
      minLoadingTime = 0,
      leadingIcon,
      trailingIcon,
      icon,
      disabled,
      type,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const [pending, setPending] = React.useState(false);
    const mounted = React.useRef(true);
    React.useEffect(() => {
      mounted.current = true;
      return () => {
        mounted.current = false;
      };
    }, []);

    const busy = loading || pending;

    // Progress indicator: when loading ends, keep it briefly so it can finish to 100%.
    const usesProgress = loadingIndicator === "progress";
    const [finishing, setFinishing] = React.useState(false);
    const wasBusy = React.useRef(busy);
    React.useEffect(() => {
      const ended = wasBusy.current && !busy;
      wasBusy.current = busy;
      if (busy) setFinishing(false);
      if (!ended || !usesProgress) return;
      setFinishing(true);
      const timer = window.setTimeout(() => setFinishing(false), PROGRESS_FINISH_MS);
      return () => window.clearTimeout(timer);
    }, [busy, usesProgress]);
    const classes = cn(buttonVariants({ variant, raised, shadow, size, rounded, iconOnly, fullWidth }), className);
    const lead = renderIcon(leadingIcon);
    const trail = renderIcon(trailingIcon);
    const content = icon !== undefined ? renderIcon(icon) : children;

    if (asChild) {
      return (
        <Slot ref={ref} className={classes} onClick={onClick as React.MouseEventHandler} {...props}>
          {lead}
          <Slottable>{children}</Slottable>
          {trail}
        </Slot>
      );
    }

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      // Ignore clicks while busy (this also stops a second form submit).
      if (busy) {
        event.preventDefault();
        return;
      }
      const result = onClick?.(event);
      if (!isPromiseLike(result)) return;

      setPending(true);
      const startedAt = Date.now();
      const stop = () => {
        const remaining = Math.max(0, minLoadingTime - (Date.now() - startedAt));
        setTimeout(() => {
          if (mounted.current) setPending(false);
        }, remaining);
      };
      // Stop on success or failure. Handle errors inside your onClick.
      Promise.resolve(result).then(stop, stop);
    };

    const orbit = loadingIndicator === "orbit";
    // Orbit and progress replace the spinner and keep the label visible.
    const keepsLabel = orbit || usesProgress;
    const centered = spinnerPlacement === "center" || iconOnly;
    const showSpinner = busy && !keepsLabel;
    const useLoadingLabel = busy && !iconOnly && loadingLabel !== undefined && (keepsLabel || !centered);
    const label = useLoadingLabel ? loadingLabel : content;

    return (
      <button
        ref={ref}
        // Default to "button" so a Button inside a form never submits by accident.
        type={type ?? "button"}
        className={classes}
        disabled={disabled}
        // While busy the button stays focusable (so keyboard focus isn't lost) but ignores clicks.
        aria-disabled={busy || undefined}
        aria-busy={busy || undefined}
        data-loading={busy ? "" : undefined}
        onClick={handleClick}
        {...props}
      >
        {orbit && busy && (
          // Experimental: a light running around the edge. The outer span adds the glow,
          // the inner span draws the light (see .ui-btn-orbit in theme.css).
          <span aria-hidden="true" className="ui-btn-orbit-glow">
            <span className="ui-btn-orbit" />
          </span>
        )}
        {usesProgress && (busy || finishing) && (
          <ProgressIndicator
            kind={progressStyle}
            value={progress}
            finishing={!busy && finishing}
          />
        )}
        {centered && showSpinner && (
          <span className="absolute inset-0 flex items-center justify-center pb-[inherit]">
            <Spinner />
          </span>
        )}
        <span className={cn("relative inline-flex items-center gap-2", centered && showSpinner && "opacity-0")}>
          {centered || keepsLabel ? (
            <>
              {lead}
              {label}
              {trail}
            </>
          ) : (
            <>
              {spinnerPlacement === "start" ? <SideSlot side="start" busy={showSpinner} icon={lead} /> : lead}
              {label}
              {spinnerPlacement === "end" ? <SideSlot side="end" busy={showSpinner} icon={trail} /> : trail}
            </>
          )}
        </span>
      </button>
    );
  }
);

Button.displayName = "Button";
