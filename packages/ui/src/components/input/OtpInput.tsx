import * as React from "react";
import { cn } from "../../lib/cn";
import { useFieldControlProps } from "./Field";
import type { ControlSize } from "./controlStyles";

/*
 * OtpInput — a one-time code in separate boxes ("123 456"), for two-factor sign-in,
 * email and phone verification, or a short PIN.
 *
 * It's one real <input> laid over the boxes, not one input per box. So everything that
 * works on a normal input works here: the phone offering the code from an SMS
 * (autocomplete="one-time-code"), pasting the whole code, password managers, the
 * browser's undo, screen readers reading it as one field, and posting with a form.
 */

export interface OtpInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "value" | "defaultValue" | "onChange" | "pattern" | "maxLength" | "type"
  > {
  /** Number of characters. Default 6. */
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called once every box is filled, e.g. to submit straight away. */
  onComplete?: (value: string) => void;
  /** Which characters are allowed: "digits" (default), "alphanumeric", or your own RegExp for one character. */
  allow?: "digits" | "alphanumeric" | RegExp;
  /** Draw a divider after every n boxes, e.g. 3 → "123–456". */
  groupSize?: number;
  /** Show dots instead of the characters (for PINs). */
  mask?: boolean;
  size?: ControlSize;
  invalid?: boolean;
  /** Class for the row of boxes. `className` goes on the hidden <input>. */
  frameClassName?: string;
}

const boxSize: Record<ControlSize, string> = {
  sm: "h-8 w-7 text-sm",
  md: "h-10 w-9 text-base",
  lg: "h-12 w-11 text-lg",
};

const allowPattern = (allow: OtpInputProps["allow"]) =>
  allow instanceof RegExp ? allow : allow === "alphanumeric" ? /[0-9a-zA-Z]/ : /[0-9]/;

export const OtpInput = React.forwardRef<HTMLInputElement, OtpInputProps>(function OtpInput(
  {
    length = 6,
    value: valueProp,
    defaultValue = "",
    onValueChange,
    onComplete,
    allow = "digits",
    groupSize,
    mask = false,
    size = "md",
    invalid: invalidProp,
    id: idProp,
    required: requiredProp,
    disabled: disabledProp,
    "aria-describedby": describedBy,
    "aria-label": ariaLabel,
    autoComplete = "one-time-code",
    frameClassName,
    className,
    onFocus,
    onBlur,
    onKeyDown,
    ...props
  },
  ref
) {
  const control = useFieldControlProps({
    id: idProp,
    invalid: invalidProp,
    required: requiredProp,
    disabled: disabledProp,
    "aria-describedby": describedBy,
  });
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [inner, setInner] = React.useState(() => defaultValue.slice(0, length));
  const value = (valueProp ?? inner).slice(0, length);
  const [focused, setFocused] = React.useState(false);
  const pattern = allowPattern(allow);

  const commit = (next: string) => {
    if (valueProp === undefined) setInner(next);
    onValueChange?.(next);
    if (next.length === length && value.length !== length) onComplete?.(next);
  };

  // A form reset (including Inertia's resetOnError) clears the boxes too.
  React.useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    const onReset = () => {
      if (valueProp === undefined) setInner(defaultValue.slice(0, length));
      onValueChange?.(defaultValue.slice(0, length));
    };
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  });

  // Keep the caret at the end: the boxes fill left to right, there's no editing mid-code.
  const caretToEnd = () => {
    const el = inputRef.current;
    if (el) requestAnimationFrame(() => el.setSelectionRange(el.value.length, el.value.length));
  };

  const active = focused ? Math.min(value.length, length - 1) : -1;
  const full = value.length === length;

  return (
    <div
      className={cn("relative inline-flex items-center gap-1.5", control.disabled && "opacity-70", frameClassName)}
      onPointerDown={(e) => {
        // A press on any box focuses the input (without moving the caret mid-code).
        if (e.target !== inputRef.current) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }}
    >
      {Array.from({ length }, (_, i) => {
        const char = value[i];
        const isActive = i === active;
        return (
          <React.Fragment key={i}>
            {groupSize && i > 0 && i % groupSize === 0 && (
              <span aria-hidden="true" className="mx-0.5 h-px w-2.5 bg-fg-muted/70" />
            )}
            <div
              aria-hidden="true"
              data-active={isActive || undefined}
              data-filled={char !== undefined || undefined}
              className={cn(
                "relative grid shrink-0 place-items-center rounded-control border border-border-strong bg-surface font-medium tabular-nums text-fg",
                "shadow-[inset_0_1px_2px_rgb(var(--ui-shadow-color)/0.07)] transition-[border-color,box-shadow] duration-100",
                "data-[active]:border-ring data-[active]:ring-3 data-[active]:ring-ring/25",
                control.invalid && "border-danger data-[active]:border-danger data-[active]:ring-danger/25",
                control.disabled && "cursor-not-allowed bg-secondary-hover",
                "motion-reduce:transition-none",
                boxSize[size]
              )}
            >
              {char !== undefined ? (
                mask ? <span className="size-2 rounded-full bg-fg" /> : char
              ) : isActive && !full ? (
                <span className="h-[1.1em] w-px animate-[ui-caret_1s_steps(1)_infinite] bg-fg motion-reduce:animate-none" />
              ) : null}
            </div>
          </React.Fragment>
        );
      })}
      <input
        ref={(node) => {
          inputRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        type="text"
        inputMode={allow === "digits" ? "numeric" : "text"}
        autoComplete={autoComplete}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        maxLength={length}
        value={value}
        aria-label={ariaLabel ?? (control.id ? undefined : `Verification code, ${length} characters`)}
        id={control.id}
        required={control.required}
        disabled={control.disabled}
        aria-invalid={control["aria-invalid"]}
        aria-describedby={control["aria-describedby"]}
        className={cn(
          // Invisible but real: it takes the taps, typing, pastes and autofill.
          "absolute inset-0 h-full w-full cursor-text bg-transparent text-transparent caret-transparent outline-none",
          "selection:bg-transparent [-webkit-text-fill-color:transparent] disabled:cursor-not-allowed",
          className
        )}
        onChange={(e) => {
          const next = Array.from(e.target.value)
            .filter((c) => pattern.test(c))
            .join("")
            .slice(0, length);
          commit(allow === "alphanumeric" ? next.toUpperCase() : next);
        }}
        onFocus={(e) => {
          setFocused(true);
          caretToEnd();
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          // The caret only lives at the end; arrow keys and Home shouldn't move it.
          if (["ArrowLeft", "ArrowRight", "Home", "End", "ArrowUp", "ArrowDown"].includes(e.key)) e.preventDefault();
        }}
        onSelect={caretToEnd}
        {...props}
      />
    </div>
  );
});
