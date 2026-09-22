import * as React from "react";
import { cn } from "../../lib/cn";
import { useField, useFieldControlProps } from "../input/Field";

/*
 * Checkbox, CheckboxGroup, RadioGroup + Radio, and Switch.
 * All are real <input>s underneath (styled with appearance: none), so keyboard use,
 * screen readers and form posts work exactly like native controls. Unchecked boxes sit
 * slightly sunken like the text fields; checked ones are filled like a primary button.
 */

type Size = "sm" | "md";

/** Label + description beside a control. */
function LabelText({ label, description, size, disabled }: { label?: React.ReactNode; description?: React.ReactNode; size: Size; disabled?: boolean }) {
  if (!label && !description) return null;
  return (
    <span className={cn("grid min-w-0 gap-0.5", disabled && "opacity-55")}>
      {label && <span className={cn("font-medium leading-snug text-fg", size === "sm" ? "text-[0.8125rem]" : "text-sm")}>{label}</span>}
      {description && <span className={cn("leading-relaxed text-fg-muted", size === "sm" ? "text-xs" : "text-[0.8125rem]")}>{description}</span>}
    </span>
  );
}

const boxBase = [
  "peer absolute inset-0 m-0 size-full p-0 cursor-pointer appearance-none border bg-surface outline-none transition-[background-color,border-color,box-shadow] duration-100",
  "border-border-strong shadow-[inset_0_1px_2px_rgb(var(--ui-shadow-color)/0.08)]",
  "hover:border-fg-muted/70",
  "focus-visible:ring-3 focus-visible:ring-ring/35 focus-visible:ring-offset-1 focus-visible:ring-offset-bg",
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border-strong",
  "aria-invalid:border-danger",
].join(" ");

const filled =
  "checked:border-primary checked:bg-primary checked:shadow-[inset_0_-1.5px_0_var(--color-primary-edge)] checked:hover:border-primary";

/* ---------- Checkbox ---------- */

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "onChange"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** A "some are selected" state, e.g. for a select-all box. */
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  invalid?: boolean;
  size?: Size;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, indeterminate = false, onCheckedChange, onChange, invalid, size = "md", className, id, disabled, required, "aria-describedby": describedBy, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const autoId = React.useId();
    const field = useField();
    // Inside a Field with its own label, the checkbox is the Field's control.
    const control = useFieldControlProps({ id: id ?? (field && !label ? undefined : autoId), invalid, disabled, required, "aria-describedby": describedBy });
    React.useEffect(() => {
      if (inputRef.current) inputRef.current.indeterminate = indeterminate;
    }, [indeterminate]);
    const box = size === "sm" ? "size-4" : "size-[1.125rem]";

    return (
      <label className={cn("group/check inline-flex cursor-pointer items-start gap-2.5", control.disabled && "cursor-not-allowed", className)}>
        <span className={cn("relative grid shrink-0 place-items-center", box, size === "sm" ? "mt-px" : "mt-[0.0625rem]")}>
          <input
            ref={(node) => {
              inputRef.current = node;
              if (typeof ref === "function") ref(node);
              else if (ref) ref.current = node;
            }}
            type="checkbox"
            aria-checked={indeterminate ? "mixed" : undefined}
            className={cn(boxBase, filled, "rounded-[0.3rem] indeterminate:border-primary indeterminate:bg-primary")}
            onChange={(e) => {
              onChange?.(e);
              onCheckedChange?.(e.target.checked);
            }}
            {...control}
            {...props}
          />
          {/* check */}
          <svg
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            // Whole-pixel size, and lifted by half the checked box's darker bottom edge so it
            // sits in the middle of the visible face rather than the whole box.
            width={size === "sm" ? 12 : 14}
            height={size === "sm" ? 12 : 14}
            className="pointer-events-none relative col-start-1 row-start-1 -translate-y-[0.75px] text-primary-fg opacity-0 peer-checked:opacity-100 peer-indeterminate:opacity-0 peer-checked:[&>path]:animate-[ui-check-draw_180ms_ease-out_both] motion-reduce:peer-checked:[&>path]:animate-none"
          >
            <path d="M3.5 8.25l3 3 6-7" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" />
          </svg>
          {/* dash for indeterminate */}
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none relative col-start-1 row-start-1 h-[2px] -translate-y-[0.75px] rounded-full bg-primary-fg opacity-0 peer-indeterminate:opacity-100",
              size === "sm" ? "w-2" : "w-2.5"
            )}
          />
        </span>
        <LabelText label={label} description={description} size={size} disabled={!!control.disabled} />
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

/* ---------- CheckboxGroup ---------- */

export interface CheckboxGroupProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "onChange" | "defaultValue"> {
  /** The group's label (a legend). Leave it out inside a Field. */
  label?: React.ReactNode;
  description?: React.ReactNode;
  options: Array<{ value: string; label: React.ReactNode; description?: React.ReactNode; disabled?: boolean }>;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Form field name; each checked option posts as name=value (use "name[]" for Laravel arrays). */
  name?: string;
  orientation?: "vertical" | "horizontal";
  size?: Size;
  disabled?: boolean;
  invalid?: boolean;
}

export function CheckboxGroup({ label, description, options, value, defaultValue = [], onValueChange, name, orientation = "vertical", size = "md", disabled, invalid, className, ...props }: CheckboxGroupProps) {
  const [inner, setInner] = React.useState(defaultValue);
  const current = value ?? inner;
  const field = useField();
  const set = (v: string, on: boolean) => {
    const next = on ? [...current, v] : current.filter((x) => x !== v);
    if (value === undefined) setInner(next);
    onValueChange?.(next);
  };
  return (
    <fieldset
      aria-labelledby={!label ? field?.labelId : undefined}
      aria-describedby={field?.descriptionId || field?.errorId ? [field?.descriptionId, field?.errorId].filter(Boolean).join(" ") : undefined}
      disabled={disabled ?? field?.disabled}
      className={cn("m-0 grid min-w-0 gap-3 border-0 p-0", className)}
      {...props}
    >
      {label && <legend className="mb-1 p-0 text-sm font-medium text-fg">{label}</legend>}
      {description && <p className="-mt-2 text-[0.8125rem] text-fg-muted">{description}</p>}
      <div className={cn(orientation === "horizontal" ? "flex flex-wrap gap-x-6 gap-y-3" : "grid gap-3")}>
        {options.map((o) => (
          <Checkbox
            key={o.value}
            name={name}
            value={o.value}
            label={o.label}
            description={o.description}
            disabled={o.disabled}
            invalid={invalid ?? field?.invalid}
            size={size}
            checked={current.includes(o.value)}
            onCheckedChange={(on) => set(o.value, on)}
            id={undefined}
            aria-describedby={undefined}
          />
        ))}
      </div>
    </fieldset>
  );
}

/* ---------- RadioGroup + Radio ---------- */

type RadioCtx = { name: string; value: string | null; set: (v: string) => void; size: Size; invalid: boolean; disabled: boolean };
const RadioContext = React.createContext<RadioCtx | null>(null);

export interface RadioGroupProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "onChange" | "defaultValue"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  /** Form field name. Generated if you leave it out. */
  name?: string;
  orientation?: "vertical" | "horizontal";
  size?: Size;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
}

export function RadioGroup({ label, description, value, defaultValue = null, onValueChange, name, orientation = "vertical", size = "md", disabled, invalid, required, className, children, ...props }: RadioGroupProps) {
  const [inner, setInner] = React.useState(defaultValue);
  const current = value !== undefined ? value : inner;
  const auto = React.useId();
  const field = useField();
  const set = (v: string) => {
    if (value === undefined) setInner(v);
    onValueChange?.(v);
  };
  return (
    <RadioContext.Provider value={{ name: name ?? `radio-${auto}`, value: current, set, size, invalid: !!(invalid ?? field?.invalid), disabled: !!(disabled ?? field?.disabled) }}>
      <fieldset
        role="radiogroup"
        aria-labelledby={!label ? field?.labelId : undefined}
        aria-required={required || field?.required || undefined}
        aria-describedby={field?.descriptionId || field?.errorId ? [field?.descriptionId, field?.errorId].filter(Boolean).join(" ") : undefined}
        disabled={disabled ?? field?.disabled}
        className={cn("m-0 grid min-w-0 gap-3 border-0 p-0", className)}
        {...props}
      >
        {label && <legend className="mb-1 p-0 text-sm font-medium text-fg">{label}</legend>}
        {description && <p className="-mt-2 text-[0.8125rem] text-fg-muted">{description}</p>}
        <div className={cn(orientation === "horizontal" ? "flex flex-wrap gap-x-6 gap-y-3" : "grid gap-3")}>{children}</div>
      </fieldset>
    </RadioContext.Provider>
  );
}

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "value" | "name"> {
  value: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(({ value, label, description, disabled, className, ...props }, ref) => {
  const g = React.useContext(RadioContext);
  if (!g) throw new Error("<Radio> must be used inside <RadioGroup>.");
  const off = disabled || g.disabled;
  const box = g.size === "sm" ? "size-4" : "size-[1.125rem]";
  return (
    <label className={cn("inline-flex cursor-pointer items-start gap-2.5", off && "cursor-not-allowed", className)}>
      <span className={cn("relative grid shrink-0 place-items-center", box, "mt-px")}>
        <input
          ref={ref}
          type="radio"
          name={g.name}
          value={value}
          checked={g.value === value}
          disabled={off}
          aria-invalid={g.invalid || undefined}
          onChange={() => g.set(value)}
          className={cn(boxBase, filled, "rounded-full")}
          {...props}
        />
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none relative -translate-y-[0.75px] scale-0 rounded-full bg-primary-fg transition-transform duration-150 ease-out peer-checked:scale-100 motion-reduce:transition-none",
            g.size === "sm" ? "size-1.5" : "size-2"
          )}
        />
      </span>
      <LabelText label={label} description={description} size={g.size} disabled={off} />
    </label>
  );
});
Radio.displayName = "Radio";

/* ---------- Switch ---------- */

export type SwitchVariant = "labelled" | "mark" | "liquid";

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "onChange"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  /**
   * - "labelled" (default): a pill with the word inside — "On" in white on blue, "Off" in gray
   * - "mark": the knob shows × when off and bends into a blue ✓ when on
   * - "liquid": an outlined pill that floods blue from the knob when turned on
   */
  variant?: SwitchVariant;
  /**
   * Called when flipped. Return a Promise (e.g. saving the setting) and the knob shows a
   * spinner until it settles — and flips back if it fails.
   */
  onCheckedChange?: (checked: boolean) => void | Promise<unknown>;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  size?: Size;
  /** Put the label before the switch, spread across the row — common in settings lists. */
  labelPosition?: "end" | "start";
  /** Words for the "labelled" variant. Default "On" / "Off". */
  onLabel?: string;
  offLabel?: string;
}

// Track width, knob size and inset for each variant and size. Knob travel = width − knob − 2 × inset.
const switchGeometry: Record<SwitchVariant, Record<Size, { w: number; h: number; k: number; pad: number }>> = {
  labelled: { md: { w: 68, h: 32, k: 26, pad: 3 }, sm: { w: 54, h: 24, k: 18, pad: 3 } },
  mark: { md: { w: 52, h: 32, k: 26, pad: 3 }, sm: { w: 40, h: 24, k: 18, pad: 3 } },
  liquid: { md: { w: 56, h: 32, k: 24, pad: 4 }, sm: { w: 44, h: 24, k: 16, pad: 4 } },
};

const knobShadow = "shadow-[0_2px_4px_rgb(0_0_0/0.18),0_0_0_0.5px_rgb(0_0_0/0.06)]";
const spring = "ease-[cubic-bezier(0.3,1.35,0.5,1)]";

/** A switch for settings that take effect right away. Three looks: labelled, mark and liquid. */
export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      label,
      description,
      variant = "labelled",
      onCheckedChange,
      onChange,
      size = "md",
      labelPosition = "end",
      onLabel = "On",
      offLabel = "Off",
      checked: checkedProp,
      defaultChecked,
      disabled,
      className,
      id,
      "aria-describedby": describedBy,
      ...props
    },
    ref
  ) => {
    const autoId = React.useId();
    const field = useField();
    const control = useFieldControlProps({ id: id ?? (field && !label ? undefined : autoId), disabled, "aria-describedby": describedBy });
    const [inner, setInner] = React.useState(!!defaultChecked);
    const [pending, setPending] = React.useState<boolean | null>(null); // optimistic value while saving
    const controlled = checkedProp !== undefined;
    const checked = pending ?? (controlled ? !!checkedProp : inner);

    const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (pending !== null) return; // still saving the last change
      onChange?.(e);
      const next = e.target.checked;
      const result = onCheckedChange?.(next);
      if (result && typeof (result as Promise<unknown>).then === "function") {
        setPending(next);
        (result as Promise<unknown>).then(
          () => {
            if (!controlled) setInner(next);
            setPending(null);
          },
          () => setPending(null) // failed: go back to the previous value
        );
      } else if (!controlled) setInner(next);
    };

    const g = switchGeometry[variant][size];
    const liquid = variant === "liquid";
    const vars = {
      "--sw-w": `${g.w}px`,
      "--sw-h": `${g.h}px`,
      "--sw-k": `${g.k}px`,
      "--sw-pad": `${g.pad}px`,
      "--sw-travel": `${g.w - g.k - 2 * g.pad}px`,
    } as React.CSSProperties;
    const textSize = size === "sm" ? "text-[0.625rem]" : "text-[0.72rem]";

    const spinner = (
      <svg viewBox="0 0 16 16" fill="none" className={cn("animate-spin text-primary", size === "sm" ? "size-2.5" : "size-3.5")} aria-hidden="true">
        <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.2" />
        <path d="M13.5 8A5.5 5.5 0 0 0 8 2.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );

    return (
      <label
        className={cn(
          "inline-flex cursor-pointer items-start gap-3",
          labelPosition === "start" && "w-full flex-row-reverse justify-between",
          control.disabled && "cursor-not-allowed",
          className
        )}
      >
        <span
          className={cn("relative inline-block shrink-0 has-[:disabled]:opacity-50", size === "sm" ? "mt-0" : "-mt-1")}
          style={{ ...vars, width: g.w, height: g.h }}
        >
          {/* The real checkbox is the track (styled with appearance: none). */}
          <input
            ref={ref}
            type="checkbox"
            role="switch"
            checked={checked}
            aria-busy={pending !== null || undefined}
            onChange={handle}
            className={cn(
              "peer absolute inset-0 m-0 size-full p-0 cursor-pointer appearance-none rounded-full outline-none transition-[background-color,box-shadow] duration-250 ease-out",
              "focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
              "disabled:cursor-not-allowed aria-busy:cursor-progress",
              liquid
                ? "bg-surface shadow-[inset_0_0_0_1.5px_var(--color-border-strong),inset_0_1px_2px_rgb(var(--ui-shadow-color)/0.12)] checked:shadow-[inset_0_0_0_1.5px_var(--color-primary)]"
                : "bg-border-strong shadow-[inset_0_1px_2px_rgb(var(--ui-shadow-color)/0.2)] checked:bg-primary"
            )}
            {...control}
            {...props}
          />

          {/* liquid: blue floods out from the knob */}
          {liquid && (
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-0 rounded-full bg-primary transition-[clip-path] duration-[450ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none",
                "[clip-path:circle(0%_at_calc(var(--sw-pad)+var(--sw-k)/2)_50%)] peer-checked:[clip-path:circle(125%_at_calc(var(--sw-w)-var(--sw-pad)-var(--sw-k)/2)_50%)]"
              )}
            />
          )}

          {/* labelled: the words live in the track */}
          {variant === "labelled" && (
            <>
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute inset-y-0 start-0 grid place-items-center font-bold text-primary-fg opacity-0 transition-opacity duration-200 peer-checked:opacity-100",
                  textSize
                )}
                style={{ width: g.w - g.k - g.pad }}
              >
                {onLabel}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute inset-y-0 end-0 grid place-items-center font-bold text-fg-muted transition-opacity duration-200 peer-checked:opacity-0",
                  textSize
                )}
                style={{ width: g.w - g.k - g.pad }}
              >
                {offLabel}
              </span>
            </>
          )}

          {/* the knob: stretches a little while pressed, springs into place */}
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute start-[var(--sw-pad)] top-[var(--sw-pad)] grid h-[var(--sw-k)] w-[var(--sw-k)] place-items-center rounded-full",
              `transition-[translate,width,background-color] duration-300 ${spring} motion-reduce:transition-none`,
              "peer-checked:translate-x-[var(--sw-travel)] rtl:peer-checked:-translate-x-[var(--sw-travel)]",
              !liquid && "peer-active:w-[calc(var(--sw-k)+4px)] peer-checked:peer-active:translate-x-[calc(var(--sw-travel)-4px)]",
              liquid ? cn("bg-border-strong shadow-[0_1px_2px_rgb(0_0_0/0.15)] peer-checked:bg-white") : cn("bg-white", knobShadow)
            )}
          >
            {pending !== null
              ? spinner
              : variant === "mark" && (
                  <>
                    <svg
                      viewBox="0 0 14 14"
                      aria-hidden="true"
                      className={cn(
                        "col-start-1 row-start-1 fill-none stroke-[#8a929e] [stroke-linecap:round] [stroke-width:2.4]",
                        size === "sm" ? "size-2.5" : "size-3.5",
                        `transition-[opacity,scale,rotate] duration-300 ${spring} [.peer:checked~*_&]:scale-[0.4] [.peer:checked~*_&]:rotate-45 [.peer:checked~*_&]:opacity-0`
                      )}
                    >
                      <path d="M4 4L10 10M10 4L4 10" />
                    </svg>
                    <svg
                      viewBox="0 0 14 14"
                      aria-hidden="true"
                      className={cn(
                        "col-start-1 row-start-1 scale-[0.4] -rotate-45 fill-none stroke-primary opacity-0 [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:2.4]",
                        size === "sm" ? "size-2.5" : "size-3.5",
                        `transition-[opacity,scale,rotate] duration-300 ${spring} [.peer:checked~*_&]:scale-100 [.peer:checked~*_&]:rotate-0 [.peer:checked~*_&]:opacity-100`
                      )}
                    >
                      <path d="M2.5 7.5L5.5 10.5L11.5 3.5" />
                    </svg>
                  </>
                )}
          </span>
        </span>
        <LabelText label={label} description={description} size={size} disabled={!!control.disabled} />
      </label>
    );
  }
);
Switch.displayName = "Switch";
