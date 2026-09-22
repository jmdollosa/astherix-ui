import { cva } from "class-variance-authority";

/*
 * Shared frame for Input and Textarea. Controls read as slightly sunken (a soft inner
 * shadow at the top) — the counterpart to the raised Button.
 */
export const controlFrame = cva(
  [
    "relative flex w-full border bg-surface text-fg transition-[border-color,box-shadow] duration-100",
    "border-border-strong shadow-[inset_0_1px_2px_rgb(var(--ui-shadow-color)/0.07)]",
    "hover:not-focus-within:border-fg-muted/60",
    "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/25",
    "data-[invalid]:border-danger data-[invalid]:hover:not-focus-within:border-danger data-[invalid]:focus-within:ring-danger/25",
    "data-[disabled]:cursor-not-allowed data-[disabled]:bg-secondary-hover data-[disabled]:opacity-70 data-[disabled]:hover:border-border-strong",
    "data-[readonly]:bg-secondary-hover/60",
    "motion-reduce:transition-none",
  ],
  {
    variants: {
      rounded: {
        none: "rounded-none",
        sm: "rounded-control-sm",
        md: "rounded-control",
        lg: "rounded-control-lg",
        full: "rounded-full",
      },
    },
    defaultVariants: { rounded: "md" },
  }
);

export type ControlRounded = "none" | "sm" | "md" | "lg" | "full";
export type ControlSize = "sm" | "md" | "lg";
