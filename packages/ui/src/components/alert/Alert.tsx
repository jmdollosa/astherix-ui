import * as React from "react";
import { cn } from "../../lib/cn";
import { renderIcon, type IconInput } from "../button/Button";

/*
 * Alert — a message that stays on the page.
 *
 *   <Alert tone="success" title="Invoice sent" />
 *   <Alert tone="danger" title="We couldn't save this" items={Object.values(errors)} />
 *   <Alert banner tone="warning" dismissible title="Your trial ends in 3 days" />
 *
 * Five tones, four looks, optional actions and a list of problems. Dismissal fades and collapses
 * the space so the page settles instead of snapping upwards. Errors and warnings announce
 * themselves straight away; calmer tones wait for a pause.
 *
 * For a message that appears and leaves on its own, use Toast instead.
 */

export type AlertTone = "info" | "success" | "warning" | "danger" | "neutral";
export type AlertVariant = "soft" | "outline" | "accent" | "solid";

const toneIcon: Record<AlertTone, React.ReactNode> = {
  info: (
    <>
      <circle cx="10" cy="10" r="7.25" />
      <path d="M10 9.25v4.25M10 6.6v.01" />
    </>
  ),
  success: (
    <>
      <circle cx="10" cy="10" r="7.25" />
      <path d="M6.75 10.25l2.4 2.4 4.3-5" />
    </>
  ),
  warning: (
    <>
      <path d="M10 2.9l7.4 12.8H2.6z" />
      <path d="M10 8v3.2M10 13.6v.01" />
    </>
  ),
  danger: (
    <>
      <circle cx="10" cy="10" r="7.25" />
      <path d="M10 6.4v4.2M10 13.4v.01" />
    </>
  ),
  neutral: (
    <>
      <circle cx="10" cy="10" r="7.25" />
      <path d="M8.2 8.1a1.9 1.9 0 113 1.6c-.7.45-1.2.8-1.2 1.6M10 13.6v.01" />
    </>
  ),
};

const toneColor: Record<AlertTone, string> = {
  info: "var(--color-info)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
  neutral: "var(--color-fg-muted)",
};

const toneForeground: Record<AlertTone, string> = {
  info: "var(--color-info-fg)",
  success: "var(--color-success-fg)",
  warning: "var(--color-warning-fg)",
  danger: "var(--color-danger-fg)",
  neutral: "var(--color-bg)",
};

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Which kind of message this is. Sets the color and the default icon. */
  tone?: AlertTone;
  /** How it looks: a tinted panel, an outline, a colored edge, or filled. */
  variant?: AlertVariant;
  /** The headline, in bold. */
  title?: React.ReactNode;
  /** Your own icon (an icon-font class or an element), or `false` for none. */
  icon?: IconInput | false;
  /** A list of problems, rendered as bullets — e.g. `Object.values(errors)`. */
  items?: React.ReactNode[];
  /** Buttons or links shown under the message. */
  actions?: React.ReactNode;
  /** Adds the close button. */
  dismissible?: boolean;
  /** Called once the alert has finished collapsing. */
  onDismiss?: () => void;
  /** Close after this many milliseconds. Pauses while hovered or focused. */
  autoDismiss?: number;
  size?: "sm" | "md";
  /** Edge to edge with square corners, for the top of a page. */
  banner?: boolean;
  /**
   * How screen readers announce it. "auto" (the default) interrupts for danger and warning,
   * and waits for a pause otherwise. Use "off" for alerts already on the page at load.
   */
  live?: "auto" | "polite" | "assertive" | "off";
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  {
    tone = "info",
    variant = "soft",
    title,
    icon,
    items,
    actions,
    dismissible = false,
    onDismiss,
    autoDismiss,
    size = "md",
    banner = false,
    live = "auto",
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const [closing, setClosing] = React.useState(false);
  const [gone, setGone] = React.useState(false);
  const [paused, setPaused] = React.useState(false);

  const close = React.useCallback(() => {
    setClosing(true);
    window.setTimeout(() => {
      setGone(true);
      onDismiss?.();
    }, 200);
  }, [onDismiss]);

  React.useEffect(() => {
    if (!autoDismiss || paused || closing) return;
    const t = window.setTimeout(close, autoDismiss);
    return () => window.clearTimeout(t);
  }, [autoDismiss, paused, closing, close]);

  if (gone) return null;

  const solid = variant === "solid";
  const announce = live === "auto" ? (tone === "danger" || tone === "warning" ? "assertive" : "polite") : live;

  const body = (
    <div
      ref={ref}
      role={announce === "assertive" ? "alert" : "status"}
      aria-live={announce === "off" ? undefined : announce}
      onPointerEnter={() => autoDismiss && setPaused(true)}
      onPointerLeave={() => autoDismiss && setPaused(false)}
      onFocus={() => autoDismiss && setPaused(true)}
      onBlur={(e) => autoDismiss && !e.currentTarget.contains(e.relatedTarget as Node | null) && setPaused(false)}
      className={cn(
        "flex min-w-0 gap-3 text-start",
        size === "sm" ? "p-3 text-[0.8125rem]" : "p-4 text-sm",
        banner ? "rounded-none border-x-0" : "rounded-card",
        variant === "soft" &&
          "border bg-[color:color-mix(in_srgb,var(--al)_8%,var(--color-surface))] border-[color:color-mix(in_srgb,var(--al)_28%,transparent)] text-fg",
        variant === "outline" && "border border-[color:color-mix(in_srgb,var(--al)_45%,transparent)] bg-surface text-fg",
        variant === "accent" && "border border-border bg-surface text-fg border-s-4 border-s-[color:var(--al)]",
        solid && "bg-[color:var(--al)] text-[color:var(--al-fg)]",
        className,
      )}
      style={{ ["--al" as string]: toneColor[tone], ["--al-fg" as string]: toneForeground[tone], ...style }}
      {...rest}
    >
      {icon !== false && (
        <span
          className={cn(
            "shrink-0",
            solid ? "text-[color:var(--al-fg)]" : "text-[color:var(--al)]",
            size === "sm" ? "mt-px" : "mt-0.5",
          )}
          aria-hidden="true"
        >
          {icon ? (
            <span className="grid size-5 place-items-center [&_i]:text-[1.05rem] [&_svg]:size-5">{renderIcon(icon)}</span>
          ) : (
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5"
            >
              {toneIcon[tone]}
            </svg>
          )}
        </span>
      )}

      <div className="grid min-w-0 flex-1 gap-1.5">
        {title && (
          <p className={cn("font-semibold leading-snug", size === "sm" ? "text-[0.8125rem]" : "text-[0.9375rem]")}>{title}</p>
        )}
        {children && (
          <div className={cn("leading-relaxed", solid ? "text-[color:var(--al-fg)]/90" : "text-fg-muted")}>{children}</div>
        )}
        {items && items.length > 0 && (
          <ul
            className={cn(
              "grid list-disc gap-1 ps-5 leading-relaxed",
              solid ? "text-[color:var(--al-fg)]/90" : "text-fg-muted",
            )}
          >
            {items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
        {actions && <div className="mt-1 flex flex-wrap items-center gap-2">{actions}</div>}
      </div>

      {dismissible && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={close}
          className={cn(
            "-me-1 -mt-1 grid size-7 shrink-0 cursor-pointer place-items-center self-start rounded-control-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-1",
            solid
              ? "text-[color:var(--al-fg)]/80 hover:bg-white/15 hover:text-[color:var(--al-fg)] focus-visible:outline-current"
              : "text-fg-muted hover:bg-secondary-hover hover:text-fg focus-visible:outline-ring",
          )}
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true" className="size-3.5">
            <path d="M6 6l8 8M14 6l-8 8" />
          </svg>
        </button>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows,opacity,margin] duration-200 ease-out motion-reduce:transition-none",
        closing ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
      )}
    >
      <div className={cn("min-h-0", closing && "overflow-hidden")}>{body}</div>
    </div>
  );
});
