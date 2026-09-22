import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { renderIcon, type IconInput } from "../button/Button";

/*
 * Pill — small rounded labels for statuses, tags and counts (Pill), and selectable
 * pills for filters and quick choices (PillGroup + PillOption).
 * For pill-style navigation between views, use <Tabs variant="pills">.
 */

export type PillTone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";
export type PillAppearance = "soft" | "solid" | "outline";

// Each tone sets two variables; the appearance decides how they're used.
const toneVars: Record<PillTone, string> = {
  neutral: "[--pill:var(--color-fg-muted)] [--pill-fg:var(--color-bg)]",
  primary: "[--pill:var(--color-primary)] [--pill-fg:var(--color-primary-fg)]",
  success: "[--pill:var(--color-success)] [--pill-fg:var(--color-success-fg)]",
  warning: "[--pill:var(--color-warning)] [--pill-fg:var(--color-warning-fg)]",
  danger: "[--pill:var(--color-danger)] [--pill-fg:var(--color-danger-fg)]",
  info: "[--pill:var(--color-info)] [--pill-fg:var(--color-info-fg)]",
};

export const pillVariants = cva(
  [
    "inline-flex max-w-full shrink-0 items-center whitespace-nowrap rounded-full font-medium leading-none",
    "[&_svg]:size-[1.1em] [&_svg]:shrink-0 [&_i]:text-[1.1em] [&_i]:leading-none",
  ],
  {
    variants: {
      appearance: {
        soft: "bg-[color:color-mix(in_srgb,var(--pill)_14%,transparent)] text-[color:color-mix(in_srgb,var(--pill)_88%,var(--color-fg))]",
        solid: "bg-[color:var(--pill)] text-[color:var(--pill-fg)]",
        outline: "border border-[color:color-mix(in_srgb,var(--pill)_45%,transparent)] text-[color:color-mix(in_srgb,var(--pill)_88%,var(--color-fg))]",
      },
      size: {
        sm: "h-5 gap-1 px-2 text-[0.6875rem]",
        md: "h-6 gap-1.5 px-2.5 text-xs",
        lg: "h-7 gap-1.5 px-3 text-[0.8125rem]",
      },
      tone: {
        neutral: "",
        primary: "",
        success: "",
        warning: "",
        danger: "",
        info: "",
      },
    },
    compoundVariants: [
      // Neutral reads better with the page's own text colors.
      { tone: "neutral", appearance: "soft", class: "bg-secondary-hover text-fg" },
      { tone: "neutral", appearance: "outline", class: "border-border-strong text-fg" },
      { tone: "neutral", appearance: "solid", class: "bg-fg text-bg" },
    ],
    defaultVariants: { appearance: "soft", size: "md", tone: "neutral" },
  }
);

export interface PillProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  children?: React.ReactNode;
  tone?: PillTone;
  appearance?: PillAppearance;
  size?: "sm" | "md" | "lg";
  icon?: IconInput;
  /** A small status dot before the label. "pulse" adds a gentle pulse, e.g. for "Live". */
  dot?: boolean | "pulse";
  /** A number after the label. */
  count?: number;
  /** Shows a × button that calls this. */
  onRemove?: () => void;
  /** Label for the × button. Defaults to "Remove {label}". */
  removeLabel?: string;
  /** Render your own element, e.g. a link: <Pill asChild><a href="…">Design</a></Pill>. */
  asChild?: boolean;
}

function textOf(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

function Dot({ pulse }: { pulse?: boolean }) {
  return (
    <span aria-hidden="true" className="relative grid size-1.5 shrink-0 place-items-center">
      {pulse && (
        <span className="absolute inset-0 animate-ping rounded-full bg-[color:var(--pill)] opacity-60 motion-reduce:hidden" />
      )}
      <span className="relative size-1.5 rounded-full bg-[color:var(--pill)]" />
    </span>
  );
}

export const Pill = React.forwardRef<HTMLSpanElement, PillProps>(
  (
    { tone = "neutral", appearance = "soft", size = "md", icon, dot, count, onRemove, removeLabel, asChild, className, children, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "span";
    const label = textOf(children);
    const interactive = asChild || !!props.onClick;
    return (
      <Comp
        ref={ref}
        className={cn(
          toneVars[tone],
          pillVariants({ tone, appearance, size }),
          interactive && "cursor-pointer transition-[filter] hover:brightness-[0.96] dark:hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          onRemove && (size === "sm" ? "pe-0.5" : "pe-1"),
          className
        )}
        {...props}
      >
        {dot && <Dot pulse={dot === "pulse"} />}
        {renderIcon(icon)}
        {asChild ? <Slottable>{children}</Slottable> : <span className="truncate">{children}</span>}
        {count !== undefined && (
          <span className="rounded-full bg-[color:color-mix(in_srgb,currentColor_14%,transparent)] px-1.5 py-px text-[0.9em] tabular-nums leading-tight">
            {count}
          </span>
        )}
        {onRemove && (
          <button
            type="button"
            aria-label={removeLabel ?? `Remove ${label}`}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onRemove();
            }}
            className={cn(
              "grid shrink-0 cursor-pointer place-items-center rounded-full opacity-70 hover:bg-[color:color-mix(in_srgb,currentColor_16%,transparent)] hover:opacity-100",
              "focus-visible:outline-2 focus-visible:outline-ring",
              size === "sm" ? "size-4" : size === "lg" ? "size-5.5" : "size-4.5"
            )}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true" className="size-[0.85em]">
              <path d="M6 6l8 8M14 6l-8 8" />
            </svg>
          </button>
        )}
      </Comp>
    );
  }
);
Pill.displayName = "Pill";

/* ---------- selectable pills ---------- */

type GroupContextValue = {
  isSelected: (value: string) => boolean;
  toggle: (value: string) => void;
  size: "sm" | "md" | "lg";
  tone: PillTone;
  showCheck: boolean;
  disabled: boolean;
};
const GroupContext = React.createContext<GroupContextValue | null>(null);

type GroupBase = Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> & {
  size?: "sm" | "md" | "lg";
  /** Color of selected pills. Default "primary". */
  tone?: PillTone;
  /** Show a check mark on selected pills. Default true for multiple. */
  showCheck?: boolean;
  disabled?: boolean;
  /** Required for screen readers when there's no visible label. */
  "aria-label"?: string;
};

export type PillGroupProps =
  | (GroupBase & {
      type?: "single";
      value?: string | null;
      defaultValue?: string | null;
      onValueChange?: (value: string | null) => void;
      /** Let people unselect the current pill. Default false. */
      allowDeselect?: boolean;
    })
  | (GroupBase & {
      type: "multiple";
      value?: string[];
      defaultValue?: string[];
      onValueChange?: (value: string[]) => void;
      allowDeselect?: never;
    });

export function PillGroup(props: PillGroupProps) {
  const {
    type = "single",
    size = "md",
    tone = "primary",
    showCheck,
    disabled = false,
    allowDeselect = false,
    className,
    children,
    value: valueProp,
    defaultValue,
    onValueChange,
    ...rest
  } = props as GroupBase & {
    type?: "single" | "multiple";
    value?: string | string[] | null;
    defaultValue?: string | string[] | null;
    onValueChange?: (v: never) => void;
    allowDeselect?: boolean;
  };
  const multiple = type === "multiple";
  const toArray = (v: string | string[] | null | undefined) => (v == null ? [] : Array.isArray(v) ? v : [v]);
  const [uncontrolled, setUncontrolled] = React.useState<string[]>(() => toArray(defaultValue));
  const controlled = valueProp !== undefined;
  const selected = controlled ? toArray(valueProp) : uncontrolled;

  const toggle = (v: string) => {
    let next: string[];
    if (multiple) next = selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v];
    else if (selected.includes(v)) {
      if (!allowDeselect) return;
      next = [];
    } else next = [v];
    if (!controlled) setUncontrolled(next);
    (onValueChange as ((v: unknown) => void) | undefined)?.(multiple ? next : (next[0] ?? null));
  };

  return (
    <GroupContext.Provider
      value={{ isSelected: (v) => selected.includes(v), toggle, size, tone, showCheck: showCheck ?? multiple, disabled }}
    >
      <div role="group" className={cn("flex flex-wrap gap-2", className)} {...rest}>
        {children}
      </div>
    </GroupContext.Provider>
  );
}

export interface PillOptionProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  value: string;
  icon?: IconInput;
  count?: number;
}

export const PillOption = React.forwardRef<HTMLButtonElement, PillOptionProps>(
  ({ value, icon, count, disabled, className, children, ...props }, ref) => {
    const group = React.useContext(GroupContext);
    if (!group) throw new Error("<PillOption> must be used inside <PillGroup>.");
    const selected = group.isSelected(value);
    const off = disabled || group.disabled;
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={selected}
        disabled={off}
        onClick={() => group.toggle(value)}
        className={cn(
          toneVars[group.tone],
          "inline-flex shrink-0 cursor-pointer select-none items-center whitespace-nowrap rounded-full border font-medium",
          "transition-[background-color,border-color,color] duration-100",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "disabled:cursor-not-allowed disabled:opacity-45",
          "[&_svg]:size-[1.1em] [&_svg]:shrink-0 [&_i]:text-[1.1em] [&_i]:leading-none",
          group.size === "sm" ? "h-7 gap-1.5 px-3 text-xs" : group.size === "lg" ? "h-10 gap-2 px-4.5 text-[0.9375rem]" : "h-8 gap-1.5 px-3.5 text-sm",
          selected
            ? "border-[color:color-mix(in_srgb,var(--pill)_55%,transparent)] bg-[color:color-mix(in_srgb,var(--pill)_13%,transparent)] text-[color:color-mix(in_srgb,var(--pill)_88%,var(--color-fg))]"
            : "border-border-strong bg-surface text-fg hover:border-fg-muted/60 hover:bg-secondary-hover",
          className
        )}
        {...props}
      >
        {group.showCheck && (
          <span
            aria-hidden="true"
            className={cn(
              "grid shrink-0 place-items-center overflow-hidden transition-[width,margin] duration-150 motion-reduce:transition-none",
              selected ? "w-[1em]" : "-me-1.5 w-0"
            )}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="size-[1em]">
              <path d="M4.5 10.5l3.5 3.5 7.5-8" />
            </svg>
          </span>
        )}
        {renderIcon(icon)}
        <span className="truncate">{children}</span>
        {count !== undefined && (
          <span className={cn("tabular-nums", selected ? "opacity-80" : "text-fg-muted")}>{count}</span>
        )}
      </button>
    );
  }
);
PillOption.displayName = "PillOption";
