import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { renderIcon, type IconInput } from "../button/Button";
import { useFieldControlProps } from "./Field";
import { controlFrame, type ControlRounded, type ControlSize } from "./controlStyles";

const inputFrame = cva("items-center", {
  variants: {
    size: {
      sm: "h-8 gap-1.5 px-2.5 text-sm",
      md: "h-10 gap-2 px-3 text-[0.9375rem]",
      lg: "h-12 gap-2.5 px-3.5 text-base",
    },
  },
  defaultVariants: { size: "md" },
});

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  /** Height matches Button sizes, so inputs and buttons line up in a row. */
  size?: ControlSize;
  rounded?: ControlRounded;
  /** Icon before the text: an element or an icon-font class string. */
  leadingIcon?: IconInput;
  /** Icon after the text: an element or an icon-font class string. */
  trailingIcon?: IconInput;
  /** Fixed text before the value, e.g. "https://" or "$". */
  prefix?: React.ReactNode;
  /** Fixed text after the value, e.g. "kg" or "@example.com". */
  suffix?: React.ReactNode;
  /** Marks the input as invalid. Inside a Field with an error this is set for you. */
  invalid?: boolean;
  /** Show a clear (×) button when the input has a value. */
  clearable?: boolean;
  /** Called after the clear button empties the input. */
  onClear?: () => void;
  /** For type="password": show a button that reveals the password. Default true. */
  revealable?: boolean;
  /** Class for the outer frame. `className` goes on the <input> itself. */
  frameClassName?: string;
}

const EyeIcon = ({ off }: { off?: boolean }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10Z" />
    <circle cx="10" cy="10" r="2.5" />
    {off && <path d="M3.5 3.5l13 13" />}
  </svg>
);

const ClearIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l8 8M14 6l-8 8" />
  </svg>
);

/** Small icon button inside a control (clear, reveal). */
export function ControlButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "-mr-1 grid size-7 shrink-0 cursor-pointer place-items-center rounded-control-sm text-fg-muted",
        "hover:bg-secondary-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-ring",
        "[&_svg]:size-[1.05em]",
        className
      )}
      {...props}
    />
  );
}

/** Set an input's value the way a person typing would, so React's onChange fires. */
function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

export { setNativeValue };

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = "md",
      rounded = "md",
      leadingIcon,
      trailingIcon,
      prefix,
      suffix,
      invalid: invalidProp,
      clearable = false,
      onClear,
      revealable = true,
      frameClassName,
      className,
      type = "text",
      id: idProp,
      required: requiredProp,
      disabled: disabledProp,
      readOnly,
      value,
      defaultValue,
      onChange,
      "aria-describedby": describedByProp,
      ...props
    },
    ref
  ) => {
    const { invalid, ...control } = useFieldControlProps({
      id: idProp,
      invalid: invalidProp,
      required: requiredProp,
      disabled: disabledProp,
      "aria-describedby": describedByProp,
    });

    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const setRefs = (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    // Track whether there's a value, for the clear button (works controlled or not).
    const [hasValue, setHasValue] = React.useState(() => String(value ?? defaultValue ?? "") !== "");
    React.useEffect(() => {
      if (value !== undefined) setHasValue(String(value) !== "");
    }, [value]);

    const [revealed, setRevealed] = React.useState(false);
    const isPassword = type === "password";
    const effectiveType = isPassword && revealed ? "text" : type;

    const lead = renderIcon(leadingIcon);
    const trail = renderIcon(trailingIcon);
    const showClear = clearable && hasValue && !control.disabled && !readOnly;

    return (
      <div
        data-invalid={invalid ? "" : undefined}
        data-disabled={control.disabled ? "" : undefined}
        data-readonly={readOnly ? "" : undefined}
        className={cn(
          controlFrame({ rounded }),
          inputFrame({ size }),
          rounded === "full" && (size === "sm" ? "px-3.5" : size === "lg" ? "px-5" : "px-4"),
          "[&>svg]:size-[1.125em] [&>svg]:shrink-0 [&>svg]:text-fg-muted [&>i]:shrink-0 [&>i]:text-[1.125em] [&>i]:leading-none [&>i]:text-fg-muted",
          frameClassName
        )}
        // Clicking the frame's padding, icons or affixes focuses the input.
        onMouseDown={(event) => {
          if (event.target !== inputRef.current && !(event.target as HTMLElement).closest("button")) {
            event.preventDefault();
            inputRef.current?.focus();
          }
        }}
      >
        {lead}
        {prefix !== undefined && <span className="shrink-0 select-none whitespace-nowrap text-fg-muted">{prefix}</span>}
        <input
          ref={setRefs}
          type={effectiveType}
          readOnly={readOnly}
          value={value}
          defaultValue={defaultValue}
          onChange={(event) => {
            if (value === undefined) setHasValue(event.target.value !== "");
            onChange?.(event);
          }}
          className={cn(
            "h-full min-w-0 flex-1 bg-transparent text-fg outline-none placeholder:text-fg-muted/70",
            "disabled:cursor-not-allowed [&::-webkit-search-cancel-button]:appearance-none",
            className
          )}
          {...control}
          {...props}
        />
        {suffix !== undefined && <span className="shrink-0 select-none whitespace-nowrap text-fg-muted">{suffix}</span>}
        {showClear && (
          <ControlButton
            aria-label="Clear"
            onClick={() => {
              const el = inputRef.current;
              if (!el) return;
              setNativeValue(el, "");
              el.focus();
              onClear?.();
            }}
          >
            <ClearIcon />
          </ControlButton>
        )}
        {isPassword && revealable && !control.disabled && (
          <ControlButton
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
            onClick={() => setRevealed((r) => !r)}
          >
            <EyeIcon off={revealed} />
          </ControlButton>
        )}
        {trail}
      </div>
    );
  }
);
Input.displayName = "Input";
