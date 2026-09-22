import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { useFieldControlProps } from "./Field";
import { controlFrame, type ControlRounded, type ControlSize } from "./controlStyles";

const textareaSize = cva("", {
  variants: {
    size: {
      sm: "px-2.5 py-1.5 text-sm",
      md: "px-3 py-2 text-[0.9375rem]",
      lg: "px-3.5 py-2.5 text-base",
    },
  },
  defaultVariants: { size: "md" },
});

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: ControlSize;
  /** Corner radius. "full" isn't offered — it doesn't suit multi-line text. */
  rounded?: Exclude<ControlRounded, "full">;
  /** Marks the textarea as invalid. Inside a Field with an error this is set for you. */
  invalid?: boolean;
  /** Grow and shrink with the text, between minRows and maxRows. */
  autoResize?: boolean;
  /** Smallest height in rows (with autoResize, or as the default `rows`). Default 3. */
  minRows?: number;
  /** Largest height in rows with autoResize; it scrolls after that. */
  maxRows?: number;
  /** Show a character count. With maxLength it shows "12 / 280". */
  showCount?: boolean;
  /** Whether people can drag to resize. Ignored with autoResize. Default "vertical". */
  resize?: "none" | "vertical";
  /** Class for the outer frame. `className` goes on the <textarea> itself. */
  frameClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      size = "md",
      rounded = "md",
      invalid: invalidProp,
      autoResize = false,
      minRows = 3,
      maxRows,
      showCount = false,
      resize = "vertical",
      frameClassName,
      className,
      rows,
      id: idProp,
      required: requiredProp,
      disabled: disabledProp,
      readOnly,
      value,
      defaultValue,
      onChange,
      maxLength,
      "aria-describedby": describedByProp,
      ...props
    },
    ref
  ) => {
    const countId = React.useId();
    const { invalid, ...control } = useFieldControlProps({
      id: idProp,
      invalid: invalidProp,
      required: requiredProp,
      disabled: disabledProp,
      "aria-describedby": [describedByProp, showCount ? countId : undefined].filter(Boolean).join(" ") || undefined,
    });

    const areaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const setRefs = (node: HTMLTextAreaElement | null) => {
      areaRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    const [length, setLength] = React.useState(() => String(value ?? defaultValue ?? "").length);
    React.useEffect(() => {
      if (value !== undefined) setLength(String(value).length);
    }, [value]);

    // Auto-resize: measure the content and set the height, clamped to min/max rows.
    const fit = React.useCallback(() => {
      const el = areaRef.current;
      if (!el || !autoResize) return;
      const style = getComputedStyle(el);
      const line = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.5;
      const chrome = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      el.style.height = "auto";
      const min = minRows * line + chrome;
      const max = maxRows ? maxRows * line + chrome : Infinity;
      const next = Math.min(max, Math.max(min, el.scrollHeight));
      el.style.height = `${next}px`;
      el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
    }, [autoResize, minRows, maxRows]);

    React.useLayoutEffect(() => {
      fit();
    }, [fit, value]);

    React.useEffect(() => {
      if (!autoResize) return;
      const el = areaRef.current;
      if (!el || typeof ResizeObserver === "undefined") return;
      // Refit when the width changes (text rewraps).
      let width = el.clientWidth;
      const ro = new ResizeObserver(() => {
        if (el.clientWidth !== width) {
          width = el.clientWidth;
          fit();
        }
      });
      ro.observe(el);
      return () => ro.disconnect();
    }, [autoResize, fit]);

    const over = maxLength !== undefined && length > maxLength;
    const near = maxLength !== undefined && length >= maxLength * 0.9;

    return (
      <div className="grid w-full gap-1">
        <div
          data-invalid={invalid ? "" : undefined}
          data-disabled={control.disabled ? "" : undefined}
          data-readonly={readOnly ? "" : undefined}
          className={cn(controlFrame({ rounded }), frameClassName)}
        >
          <textarea
            ref={setRefs}
            rows={rows ?? minRows}
            readOnly={readOnly}
            value={value}
            defaultValue={defaultValue}
            maxLength={maxLength}
            onChange={(event) => {
              if (value === undefined) setLength(event.target.value.length);
              fit();
              onChange?.(event);
            }}
            className={cn(
              textareaSize({ size }),
              "block min-h-0 w-full bg-transparent leading-relaxed text-fg outline-none placeholder:text-fg-muted/70",
              "disabled:cursor-not-allowed rounded-[inherit]",
              autoResize || resize === "none" ? "resize-none" : "resize-y",
              className
            )}
            {...control}
            {...props}
          />
        </div>
        {showCount && (
          <p
            id={countId}
            className={cn(
              "justify-self-end text-xs tabular-nums text-fg-muted",
              near && "text-fg",
              over && "text-danger"
            )}
          >
            {maxLength !== undefined ? `${length} / ${maxLength}` : `${length} characters`}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
