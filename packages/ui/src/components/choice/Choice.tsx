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
  "peer absolute inset-0 m-0 cursor-pointer appearance-none border bg-surface outline-none transition-[background-color,border-color,box-shadow] duration-100",
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

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "onChange"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  /**
   * Called when toggled. Return a Promise (e.g. saving the setting) and the switch shows a
   * spinner until it settles — and flips back if it fails.
   */
  onCheckedChange?: (checked: boolean) => void | Promise<unknown>;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  size?: Size;
  /** Put the label before the switch, spread across the row — common in settings lists. */
  labelPosition?: "end" | "start";
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, description, onCheckedChange, onChange, size = "md", labelPosition = "end", checked: checkedProp, defaultChecked, disabled, className, id, "aria-describedby": describedBy, ...props }, ref) => {
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

    const track = size === "sm" ? "h-5 w-9" : "h-6 w-11";
    const thumb = size === "sm" ? "size-4" : "size-5";
    const shift = size === "sm" ? "peer-checked:translate-x-4" : "peer-checked:translate-x-5";

    return (
      <label
        className={cn(
          "inline-flex cursor-pointer items-start gap-3",
          labelPosition === "start" && "w-full flex-row-reverse justify-between",
          control.disabled && "cursor-not-allowed",
          className
        )}
      >
        <span className={cn("relative inline-flex shrink-0 items-center", track, size === "sm" ? "mt-px" : "-mt-px")}>
          <input
            ref={ref}
            type="checkbox"
            role="switch"
            checked={checked}
            aria-busy={pending !== null || undefined}
            onChange={handle}
            className={cn(
              "peer absolute inset-0 m-0 cursor-pointer appearance-none rounded-full outline-none transition-[background-color,box-shadow] duration-150",
              "bg-border-strong shadow-[inset_0_1px_2px_rgb(var(--ui-shadow-color)/0.15)]",
              "checked:bg-primary checked:shadow-[inset_0_-1.5px_0_var(--color-primary-edge)]",
              "focus-visible:ring-3 focus-visible:ring-ring/35 focus-visible:ring-offset-1 focus-visible:ring-offset-bg",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "aria-busy:pointer-events-none"
            )}
            {...control}
            {...props}
          />
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none relative ms-0.5 grid place-items-center rounded-full bg-white text-primary shadow-[0_1px_2px_rgb(0_0_0/0.25),0_0_0_0.5px_rgb(0_0_0/0.05)] transition-transform duration-200 ease-[cubic-bezier(0.3,1.4,0.5,1)] motion-reduce:transition-none",
              thumb,
              shift,
              "peer-disabled:shadow-none"
            )}
          >
            {pending !== null && (
              <svg viewBox="0 0 16 16" fill="none" className="size-[70%] animate-spin" aria-hidden="true">
                <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
                <path d="M13.5 8A5.5 5.5 0 0 0 8 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </span>
        </span>
        <LabelText label={label} description={description} size={size} disabled={!!control.disabled} />
      </label>
    );
  }
);
Switch.displayName = "Switch";
