import * as React from "react";
import { cn } from "../../lib/cn";

/*
 * Field wraps a form control with its label, description and error message, and wires
 * up the ids and ARIA attributes. Input and Textarea read this context automatically;
 * custom controls can use useField().
 */

export type FieldContextValue = {
  id: string;
  descriptionId?: string;
  errorId?: string;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
};

const FieldContext = React.createContext<FieldContextValue | null>(null);

/** Read the surrounding Field's ids and state (returns null outside a Field). */
export function useField() {
  return React.useContext(FieldContext);
}

/** Props a control inside a Field should receive. Used by Input and Textarea. */
export function useFieldControlProps(props: {
  id?: string;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
  "aria-describedby"?: string;
}) {
  const field = useField();
  const describedBy =
    [props["aria-describedby"], field?.descriptionId, field?.errorId].filter(Boolean).join(" ") || undefined;
  const invalid = props.invalid ?? field?.invalid ?? false;
  return {
    id: props.id ?? field?.id,
    required: props.required ?? field?.required,
    disabled: props.disabled ?? field?.disabled,
    invalid,
    "aria-describedby": describedBy,
    "aria-invalid": invalid || undefined,
  };
}

export interface FieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** The visible label. */
  label: React.ReactNode;
  /** Help text under the label. */
  description?: React.ReactNode;
  /** Error message. When set, the control is marked invalid. */
  error?: React.ReactNode;
  /** Marks the control as required and shows an asterisk. */
  required?: boolean;
  /** Shows "(optional)" after the label. Use it instead of `required` when most fields are required. */
  optional?: boolean;
  disabled?: boolean;
  /** Use your own id for the control. */
  id?: string;
  children: React.ReactNode;
}

export function Field({
  label,
  description,
  error,
  required = false,
  optional = false,
  disabled = false,
  id: idProp,
  className,
  children,
  ...props
}: FieldProps) {
  const autoId = React.useId();
  const id = idProp ?? `${autoId}-control`;
  const hasError = error !== undefined && error !== null && error !== false && error !== "";
  const value: FieldContextValue = {
    id,
    descriptionId: description ? `${id}-description` : undefined,
    errorId: hasError ? `${id}-error` : undefined,
    invalid: hasError,
    required,
    disabled,
  };

  return (
    <FieldContext.Provider value={value}>
      <div className={cn("grid gap-1.5", className)} {...props}>
        <label htmlFor={id} className="w-fit text-sm font-medium leading-snug text-fg">
          {label}
          {required && (
            <span aria-hidden="true" className="ml-0.5 text-danger">
              *
            </span>
          )}
          {optional && <span className="ml-1 font-normal text-fg-muted">(optional)</span>}
        </label>
        {description && (
          <p id={value.descriptionId} className="-mt-0.5 text-[0.8125rem] leading-relaxed text-fg-muted">
            {description}
          </p>
        )}
        {children}
        {hasError && (
          <p id={value.errorId} className="flex items-start gap-1.5 text-[0.8125rem] leading-snug text-danger">
            <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-px size-3.5 shrink-0" fill="currentColor">
              <path d="M8 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Zm0 3a.75.75 0 0 0-.75.75v3a.75.75 0 0 0 1.5 0v-3A.75.75 0 0 0 8 4.5Zm0 6.25a.85.85 0 1 0 0 1.7.85.85 0 0 0 0-1.7Z" />
            </svg>
            <span>{error}</span>
          </p>
        )}
      </div>
    </FieldContext.Provider>
  );
}
