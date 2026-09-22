import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { renderIcon, type IconInput } from "../button/Button";

/*
 * Card — a container that groups one topic: a summary, a setting, an item in a grid.
 * Build it from CardHeader / CardContent / CardFooter / CardMedia, make the whole card
 * clickable with CardLink (other buttons inside keep working), or use ChoiceCard for
 * picking between options (a plan, a delivery method) with real radio buttons or checkboxes.
 */

export const cardVariants = cva("relative flex min-w-0 overflow-hidden rounded-card text-fg", {
  variants: {
    variant: {
      /** A border, no shadow — the default, calm on busy pages. */
      outline: "border border-border bg-surface",
      /** A soft shadow, for cards that sit on a tinted page or need to stand out. */
      elevated: "border border-border/70 bg-surface shadow-[var(--ui-shadow-md)]",
      /** A tinted fill, no border — for grouping inside another surface. */
      filled: "bg-secondary-hover",
      /** No box at all; keeps the spacing. */
      ghost: "",
    },
    tone: {
      default: "",
      /** For "danger zone" settings. */
      danger: "border-[color:color-mix(in_srgb,var(--color-danger)_40%,transparent)]",
      /** Draws attention, e.g. a recommended plan. */
      primary: "border-primary",
    },
    orientation: {
      vertical: "flex-col",
      horizontal: "flex-col sm:flex-row",
    },
    /** Hover and press feedback, for cards that act as a single link or button. */
    interactive: {
      true: [
        "transition-[border-color,box-shadow,translate] duration-150 ease-out",
        "hover:border-border-strong hover:shadow-[var(--ui-shadow-md)] active:translate-y-px",
        "has-[[data-card-link]:focus-visible]:outline-2 has-[[data-card-link]:focus-visible]:outline-offset-2 has-[[data-card-link]:focus-visible]:outline-ring",
        "motion-reduce:transition-none motion-reduce:active:translate-y-0",
      ],
      false: "",
    },
  },
  compoundVariants: [{ variant: "elevated", interactive: true, class: "hover:shadow-[var(--ui-shadow-lg)]" }],
  defaultVariants: { variant: "outline", tone: "default", orientation: "vertical", interactive: false },
});

type Padding = "none" | "sm" | "md" | "lg";
const PaddingContext = React.createContext<Padding>("md");
const padX: Record<Padding, string> = { none: "px-0", sm: "px-4", md: "px-5", lg: "px-7" };
const padTop: Record<Padding, string> = { none: "pt-0", sm: "pt-4", md: "pt-5", lg: "pt-7" };
const padBottom: Record<Padding, string> = { none: "pb-0", sm: "pb-4", md: "pb-5", lg: "pb-7" };
const padBottomIfLast: Record<Padding, string> = { none: "", sm: "last:pb-4", md: "last:pb-5", lg: "last:pb-7" };

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  /** Inner spacing for header, content and footer. */
  padding?: Padding;
  /** Render as another element, e.g. <Card asChild><article>…</article></Card>. */
  asChild?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant, tone, orientation, interactive, padding = "md", asChild, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <PaddingContext.Provider value={padding}>
        <Comp
          ref={ref}
          data-orientation={orientation ?? "vertical"}
          className={cn("group/card", cardVariants({ variant, tone, orientation, interactive }), className)}
          {...props}
        />
      </PaddingContext.Provider>
    );
  }
);
Card.displayName = "Card";

/* ---------- parts ---------- */

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Shorthand for <CardTitle>. */
  title?: React.ReactNode;
  /** Shorthand for <CardDescription>. */
  description?: React.ReactNode;
  /** Something at the top right, e.g. a menu button or a Pill. */
  action?: React.ReactNode;
  icon?: IconInput;
  /** Heading level for the title shorthand. Default 3. */
  titleLevel?: 2 | 3 | 4;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, description, action, icon, titleLevel = 3, className, children, ...props }, ref) => {
    const pad = React.useContext(PaddingContext);
    return (
      <div ref={ref} data-card-header="" className={cn("flex items-start gap-3", padX[pad], padTop[pad], "pb-0", padBottomIfLast[pad], className)} {...props}>
        {icon && (
          <span className="grid size-9 shrink-0 place-items-center rounded-control bg-secondary-hover text-fg-muted [&_i]:text-lg [&_svg]:size-[1.15rem]">
            {renderIcon(icon)}
          </span>
        )}
        <div className="grid min-w-0 flex-1 gap-1">
          {title !== undefined && <CardTitle as={`h${titleLevel}` as "h3"}>{title}</CardTitle>}
          {description !== undefined && <CardDescription>{description}</CardDescription>}
          {children}
        </div>
        {action && <div className="relative z-10 -my-1 shrink-0">{action}</div>}
      </div>
    );
  }
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { as?: "h2" | "h3" | "h4" | "p" }
>(({ as: Comp = "h3", className, ...props }, ref) => (
  <Comp ref={ref} className={cn("font-heading text-[1.0625rem] font-semibold leading-snug tracking-[-0.01em] text-balance text-fg", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <p ref={ref} className={cn("text-sm leading-relaxed text-fg-muted text-pretty", className)} {...props} />
);
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const pad = React.useContext(PaddingContext);
    return <div ref={ref} className={cn("flex-1 text-[0.9375rem] leading-relaxed", padX[pad], padTop[pad], padBottom[pad], className)} {...props} />;
  }
);
CardContent.displayName = "CardContent";

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** A line above the footer, with a tinted background — for settings cards with a Save button. */
  divided?: boolean;
  /** Where the content sits. Default "end" (buttons on the right). */
  justify?: "start" | "between" | "end";
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ divided = false, justify = "end", className, ...props }, ref) => {
    const pad = React.useContext(PaddingContext);
    return (
      <div
        ref={ref}
        className={cn(
          "relative z-10 flex flex-wrap items-center gap-2",
          justify === "start" ? "justify-start" : justify === "between" ? "justify-between" : "justify-end",
          padX[pad],
          divided ? "mt-auto border-t border-border bg-secondary-hover/50 py-3" : cn("pt-0", padBottom[pad]),
          // Directly under a header (no content in between), leave some room.
          !divided && "[[data-card-header]+&]:pt-4",
          divided && "[[data-card-header]+&]:mt-5",
          className
        )}
        {...props}
      />
    );
  }
);
CardFooter.displayName = "CardFooter";

export interface CardMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Image URL, or pass your own content (e.g. <img>, <video>, a chart) as children. */
  src?: string;
  alt?: string;
  /** Shape of the media area, e.g. "16/9", "4/3", "1/1". Default "16/9". */
  ratio?: string;
  /** Inset from the card's edges with rounded corners, instead of edge to edge. */
  inset?: boolean;
}

export const CardMedia = React.forwardRef<HTMLDivElement, CardMediaProps>(
  ({ src, alt = "", ratio = "16/9", inset = false, className, children, style, ...props }, ref) => {
    const pad = React.useContext(PaddingContext);
    return (
      <div
        ref={ref}
        data-card-media=""
        className={cn(
          "relative shrink-0 overflow-hidden bg-secondary-hover aspect-[var(--card-ratio)]",
          inset && cn("mx-auto mt-2 w-[calc(100%-1rem)] rounded-[calc(var(--radius-card)-0.25rem)]", pad === "none" && "mt-0 w-full rounded-none"),
          // Beside the content in a horizontal card: a column that fills the height.
          "group-data-[orientation=horizontal]/card:sm:aspect-auto group-data-[orientation=horizontal]/card:sm:w-2/5",
          inset && "group-data-[orientation=horizontal]/card:sm:my-2 group-data-[orientation=horizontal]/card:sm:ms-2",
          className
        )}
        style={{ ["--card-ratio" as string]: ratio.replace("/", " / "), ...style }}
        {...props}
      >
        {src ? <img src={src} alt={alt} loading="lazy" decoding="async" className="size-full object-cover" /> : children}
      </div>
    );
  }
);
CardMedia.displayName = "CardMedia";

/**
 * Makes the whole card clickable while keeping it accessible: put it around the card's
 * title text. Its click area stretches over the card; buttons in the header action and
 * footer stay clickable on top. Works with framework links via asChild.
 */
export const CardLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement> & { asChild?: boolean }>(
  ({ asChild, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "a";
    return (
      <Comp
        ref={ref}
        data-card-link=""
        className={cn("outline-none after:absolute after:inset-0 after:content-[''] hover:text-primary", className)}
        {...props}
      />
    );
  }
);
CardLink.displayName = "CardLink";

/* ---------- ChoiceCard ---------- */

type ChoiceContextValue = {
  type: "single" | "multiple";
  name: string;
  isChecked: (value: string) => boolean;
  toggle: (value: string, checked: boolean) => void;
  disabled: boolean;
  invalid: boolean;
};
const ChoiceContext = React.createContext<ChoiceContextValue | null>(null);

type ChoiceGroupBase = Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> & {
  /** Form field name (a radio group needs one). Generated if you leave it out. */
  name?: string;
  /** Columns from the small breakpoint up; stacks on phones. */
  columns?: 1 | 2 | 3 | 4;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
};

export type ChoiceCardGroupProps =
  | (ChoiceGroupBase & {
      type?: "single";
      value?: string | null;
      defaultValue?: string | null;
      onValueChange?: (value: string) => void;
    })
  | (ChoiceGroupBase & {
      type: "multiple";
      value?: string[];
      defaultValue?: string[];
      onValueChange?: (value: string[]) => void;
    });

/** A set of ChoiceCards backed by real radio buttons (single) or checkboxes (multiple). */
export function ChoiceCardGroup(props: ChoiceCardGroupProps) {
  const {
    type = "single",
    name: nameProp,
    columns = 3,
    disabled = false,
    invalid = false,
    required,
    value: valueProp,
    defaultValue,
    onValueChange,
    className,
    ...rest
  } = props as ChoiceGroupBase & {
    type?: "single" | "multiple";
    value?: string | string[] | null;
    defaultValue?: string | string[] | null;
    onValueChange?: (v: never) => void;
  };
  const auto = React.useId();
  const name = nameProp ?? `choice-${auto}`;
  const toArray = (v: string | string[] | null | undefined) => (v == null ? [] : Array.isArray(v) ? v : [v]);
  const [uncontrolled, setUncontrolled] = React.useState<string[]>(() => toArray(defaultValue));
  const controlled = valueProp !== undefined;
  const selected = controlled ? toArray(valueProp) : uncontrolled;

  const toggle = (v: string, checked: boolean) => {
    const next = type === "multiple" ? (checked ? [...selected, v] : selected.filter((x) => x !== v)) : [v];
    if (!controlled) setUncontrolled(next);
    (onValueChange as ((x: unknown) => void) | undefined)?.(type === "multiple" ? next : v);
  };

  return (
    <ChoiceContext.Provider value={{ type, name, isChecked: (v) => selected.includes(v), toggle, disabled, invalid }}>
      <div
        role={type === "single" ? "radiogroup" : "group"}
        aria-required={type === "single" ? required : undefined}
        aria-invalid={invalid || undefined}
        className={cn(
          "grid gap-3",
          columns === 2 && "sm:grid-cols-2",
          columns === 3 && "sm:grid-cols-3",
          columns === 4 && "sm:grid-cols-2 lg:grid-cols-4",
          className
        )}
        {...rest}
      />
    </ChoiceContext.Provider>
  );
}

export interface ChoiceCardProps extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, "title"> {
  value: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: IconInput;
  /** Extra detail, e.g. a price. */
  meta?: React.ReactNode;
  /** A small tag like "Recommended". */
  badge?: React.ReactNode;
  disabled?: boolean;
}

export function ChoiceCard({ value, title, description, icon, meta, badge, disabled, className, children, ...props }: ChoiceCardProps) {
  const ctx = React.useContext(ChoiceContext);
  if (!ctx) throw new Error("<ChoiceCard> must be used inside <ChoiceCardGroup>.");
  const checked = ctx.isChecked(value);
  const off = disabled || ctx.disabled;
  const single = ctx.type === "single";
  const descId = React.useId();

  return (
    <label
      className={cn(
        "relative flex cursor-pointer gap-3 rounded-card border bg-surface p-4 text-fg transition-[border-color,background-color,box-shadow] duration-100",
        "border-border hover:border-border-strong",
        "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-ring",
        checked && "border-primary bg-[color:color-mix(in_srgb,var(--color-primary)_5%,var(--color-surface))] shadow-[inset_0_0_0_1px_var(--color-primary)] hover:border-primary",
        ctx.invalid && !checked && "border-[color:color-mix(in_srgb,var(--color-danger)_55%,transparent)]",
        off && "cursor-not-allowed opacity-50 hover:border-border",
        className
      )}
      {...props}
    >
      <input
        type={single ? "radio" : "checkbox"}
        name={ctx.name}
        value={value}
        checked={checked}
        disabled={off}
        aria-describedby={description ? descId : undefined}
        onChange={(e) => ctx.toggle(value, e.target.checked)}
        className="peer sr-only"
      />
      {icon && (
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-control [&_i]:text-lg [&_svg]:size-[1.15rem]", checked ? "bg-primary/12 text-primary" : "bg-secondary-hover text-fg-muted")}>
          {renderIcon(icon)}
        </span>
      )}
      <span className="grid min-w-0 flex-1 content-start gap-1 pe-6">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[0.9375rem] font-semibold leading-snug">{title}</span>
          {badge}
        </span>
        {description && (
          <span id={descId} className="text-[0.8125rem] leading-relaxed text-fg-muted">
            {description}
          </span>
        )}
        {meta && <span className="mt-1 text-sm font-medium tabular-nums text-fg">{meta}</span>}
        {children}
      </span>
      {/* The visible radio / checkbox mark */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute end-4 top-4 grid size-[1.125rem] place-items-center border transition-colors duration-100",
          single ? "rounded-full" : "rounded-[5px]",
          checked ? "border-primary bg-primary text-primary-fg" : "border-border-strong bg-surface"
        )}
      >
        {checked &&
          (single ? (
            <span className="size-[0.4rem] rounded-full bg-primary-fg" />
          ) : (
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" className="size-3">
              <path d="M4.5 10.5l3.5 3.5 7.5-8" />
            </svg>
          ))}
      </span>
    </label>
  );
}

/** Groups header, content and footer — needed beside CardMedia in a horizontal card. */
export const CardBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex min-w-0 flex-1 flex-col", className)} {...props} />
));
CardBody.displayName = "CardBody";
