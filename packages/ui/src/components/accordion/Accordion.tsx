import * as React from "react";
import { cn } from "../../lib/cn";
import { renderIcon, type IconInput } from "../button/Button";

/*
 * Accordion — sections that open and close.
 *
 *   <Accordion type="single" collapsible defaultValue="refunds">
 *     <AccordionItem value="refunds" title="How do refunds work?">…</AccordionItem>
 *   </Accordion>
 *
 * Beyond the usual: the browser's find-in-page (Ctrl/⌘+F) searches closed sections and opens the
 * match (Chrome/Edge, via hidden="until-found"); deep links (#refunds) open and scroll to a section;
 * headers can hold their own controls (e.g. a Switch); items can show a step status and a summary
 * while closed — enough to build a one-page checkout.
 */

type AccordionCtx = {
  open: string[];
  toggle: (value: string, force?: boolean) => void;
  variant: "separated" | "outline" | "flush";
  size: "sm" | "md";
  headingLevel: 2 | 3 | 4 | 5 | 6;
  register: (value: string) => void;
  unregister: (value: string) => void;
  values: React.MutableRefObject<string[]>;
  /** Makes element ids unique per accordion (empty when linking to the URL hash, so #value works). */
  idPrefix: string;
};
const Ctx = React.createContext<AccordionCtx | null>(null);

export const useAccordion = () => {
  const c = React.useContext(Ctx);
  if (!c) throw new Error("useAccordion must be used inside <Accordion>.");
  return {
    open: c.open,
    toggle: c.toggle,
    expandAll: () => c.values.current.forEach((v) => c.toggle(v, true)),
    collapseAll: () => c.values.current.forEach((v) => c.toggle(v, false)),
  };
};

type SingleProps = {
  /** One section open at a time. */
  type?: "single";
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  /** Allow closing the open section (so none is open). Default true. */
  collapsible?: boolean;
};
type MultipleProps = {
  /** Any number open at once. */
  type: "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  collapsible?: never;
};

export type AccordionProps = (SingleProps | MultipleProps) &
  Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> & {
    /** "separated" cards (default), "outline" one bordered group, or "flush" with dividers only. */
    variant?: "separated" | "outline" | "flush";
    size?: "sm" | "md";
    /** The heading level of item titles, for a correct document outline. Default 3. */
    headingLevel?: 2 | 3 | 4 | 5 | 6;
    /** Open the section whose value matches the URL hash (#value), and update it when one opens. */
    linkToHash?: boolean;
  };

export function Accordion(props: AccordionProps) {
  const {
    type = "single",
    value: valueProp,
    defaultValue,
    onValueChange,
    collapsible = true,
    variant = "separated",
    size = "md",
    headingLevel = 3,
    linkToHash = false,
    className,
    children,
    ...rest
  } = props as AccordionProps & { collapsible?: boolean };
  const multiple = type === "multiple";
  const toArr = (v: unknown): string[] => (Array.isArray(v) ? v : v ? [v as string] : []);
  const [inner, setInner] = React.useState<string[]>(toArr(defaultValue));
  const open = valueProp !== undefined ? toArr(valueProp) : inner;
  const values = React.useRef<string[]>([]);
  const uid = React.useId().replace(/:/g, "");
  const idPrefix = linkToHash ? "" : `${uid}-`;
  const openRef = React.useRef(open);
  openRef.current = open;

  const commit = React.useCallback(
    (next: string[]) => {
      if (valueProp === undefined) setInner(next);
      (onValueChange as ((v: unknown) => void) | undefined)?.(multiple ? next : next[0] ?? null);
    },
    [valueProp, onValueChange, multiple]
  );

  const toggle = React.useCallback(
    (v: string, force?: boolean) => {
      const cur = openRef.current;
      const isOpen = cur.includes(v);
      const want = force ?? !isOpen;
      if (want === isOpen) return;
      if (!want && !multiple && !collapsible) return;
      const next = multiple ? (want ? [...cur, v] : cur.filter((x) => x !== v)) : want ? [v] : [];
      openRef.current = next;
      commit(next);
      if (linkToHash && want && typeof window !== "undefined") history.replaceState(null, "", `#${v}`);
    },
    [multiple, collapsible, commit, linkToHash]
  );

  // Deep links: #value opens that section and scrolls it into view.
  React.useEffect(() => {
    if (!linkToHash) return;
    const openFromHash = () => {
      const h = decodeURIComponent(window.location.hash.slice(1));
      if (h && values.current.includes(h)) {
        toggle(h, true);
        requestAnimationFrame(() => document.getElementById(h)?.scrollIntoView({ behavior: "smooth", block: "start" }));
      }
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [linkToHash, toggle]);

  const ctx = React.useMemo<AccordionCtx>(
    () => ({
      open,
      toggle,
      variant,
      size,
      headingLevel,
      values,
      idPrefix,
      register: (v) => {
        if (!values.current.includes(v)) values.current.push(v);
      },
      unregister: (v) => {
        values.current = values.current.filter((x) => x !== v);
      },
    }),
    [open, toggle, variant, size, headingLevel, idPrefix]
  );

  // Arrow keys move between headers (Home/End to the first/last).
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const t = e.target as HTMLElement;
    if (!t.matches("[data-accordion-trigger]")) return;
    const triggers = [...e.currentTarget.querySelectorAll<HTMLElement>("[data-accordion-trigger]:not([disabled])")].filter(
      (b) => b.closest("[data-accordion]") === e.currentTarget
    );
    const i = triggers.indexOf(t);
    let n = -1;
    if (e.key === "ArrowDown") n = (i + 1) % triggers.length;
    else if (e.key === "ArrowUp") n = (i - 1 + triggers.length) % triggers.length;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = triggers.length - 1;
    if (n >= 0) {
      e.preventDefault();
      triggers[n].focus();
    }
  };

  return (
    <Ctx.Provider value={ctx}>
      <div
        data-accordion=""
        onKeyDown={onKeyDown}
        className={cn(
          variant === "separated" && "grid gap-2",
          variant === "outline" && "divide-y divide-border overflow-hidden rounded-card border border-border bg-surface",
          variant === "flush" && "divide-y divide-border border-y border-border",
          className
        )}
        {...rest}
      >
        {children}
      </div>
    </Ctx.Provider>
  );
}

/* ---------- item ---------- */

export type AccordionStatus = "complete" | "current" | "error" | "locked";

export interface AccordionItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  value: string;
  title: React.ReactNode;
  /** Smaller text under the title (always visible). */
  description?: React.ReactNode;
  /** Shown under the title only while closed — e.g. what was entered in a finished step. */
  summary?: React.ReactNode;
  icon?: IconInput;
  /** Something on the right of the header (not part of the button): a count, a Pill, a Switch. */
  meta?: React.ReactNode;
  /** Controls in the header that shouldn't toggle the section, e.g. <Switch />. */
  action?: React.ReactNode;
  /** Step status icon: complete (✓), current, error (!), locked. Locked items can't open. */
  status?: AccordionStatus;
  disabled?: boolean;
  /** Keep the content in the page while closed (default true, so find-in-page and forms work). */
  keepMounted?: boolean;
}

const statusBadge: Record<AccordionStatus, React.ReactNode> = {
  complete: (
    <span className="grid size-6 place-items-center rounded-full bg-success text-success-fg">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-3.5">
        <path d="M3.5 8.5l3 3 6-7" />
      </svg>
    </span>
  ),
  current: <span className="grid size-6 place-items-center rounded-full border-2 border-primary"><span className="size-2 rounded-full bg-primary" /></span>,
  error: <span className="grid size-6 place-items-center rounded-full bg-danger text-sm font-bold text-danger-fg">!</span>,
  locked: (
    <span className="grid size-6 place-items-center rounded-full border-2 border-dashed border-border-strong text-fg-muted">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true" className="size-3">
        <rect x="3.5" y="7" width="9" height="6.5" rx="1.5" />
        <path d="M5.5 7V5a2.5 2.5 0 015 0v2" />
      </svg>
    </span>
  ),
};
const statusText: Record<AccordionStatus, string> = { complete: "Done", current: "In progress", error: "Needs attention", locked: "Locked" };

export function AccordionItem({
  value,
  title,
  description,
  summary,
  icon,
  meta,
  action,
  status,
  disabled: disabledProp,
  keepMounted = true,
  className,
  children,
  ...props
}: AccordionItemProps) {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("<AccordionItem> must be used inside <Accordion>.");
  const { open: openList, toggle, variant, size, headingLevel, register, unregister, idPrefix } = ctx;
  const open = openList.includes(value);
  const disabled = disabledProp || status === "locked";
  const headerId = `${idPrefix}${value}-header`;
  const panelId = `${idPrefix}${value}-panel`;
  const Heading = `h${headingLevel}` as const;
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [everOpened, setEverOpened] = React.useState(open);

  React.useEffect(() => {
    register(value);
    return () => unregister(value);
  }, [value, register, unregister]);
  React.useEffect(() => {
    if (open) setEverOpened(true);
  }, [open]);

  // Closed sections stay searchable: hidden="until-found" lets Ctrl/⌘+F find text inside, and the
  // browser fires "beforematch" so we can open the section. Browsers without it treat it as hidden.
  React.useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    if (open) {
      el.removeAttribute("hidden");
      return;
    }
    // Wait for the closing animation before hiding.
    const t = window.setTimeout(() => el.setAttribute("hidden", "until-found"), 260);
    const onMatch = () => toggle(value, true);
    el.addEventListener("beforematch", onMatch);
    return () => {
      window.clearTimeout(t);
      el.removeEventListener("beforematch", onMatch);
    };
  }, [open, toggle, value]);

  const pad = size === "sm" ? "px-3.5 py-2.5" : "px-4 py-3.5";

  return (
    <div
      id={idPrefix ? undefined : value}
      data-state={open ? "open" : "closed"}
      className={cn(
        "group/acc min-w-0 scroll-mt-20",
        variant === "separated" &&
          cn(
            "rounded-card border bg-surface transition-[border-color,box-shadow] duration-200",
            open ? "border-border-strong shadow-[var(--ui-shadow-md)]" : "border-border shadow-[var(--ui-shadow-sm)]",
            status === "error" && "border-[color:color-mix(in_srgb,var(--color-danger)_50%,transparent)]"
          ),
        className
      )}
      {...props}
    >
      <Heading className="m-0 flex items-stretch">
        <button
          type="button"
          id={headerId}
          data-accordion-trigger=""
          aria-expanded={open}
          aria-controls={panelId}
          aria-disabled={disabled || undefined}
          disabled={disabled}
          onClick={() => toggle(value)}
          className={cn(
            "group/trigger flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-start outline-none",
            "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
            variant === "separated" ? "rounded-card" : "",
            variant === "flush" ? "py-3.5" : pad,
            disabled && "cursor-not-allowed opacity-55"
          )}
        >
          {status && <span className="shrink-0" aria-hidden="true">{statusBadge[status]}</span>}
          {icon && !status && (
            <span className="grid size-8 shrink-0 place-items-center rounded-control bg-secondary-hover text-fg-muted [&_svg]:size-4" aria-hidden="true">
              {renderIcon(icon)}
            </span>
          )}
          <span className="grid min-w-0 flex-1 gap-0.5">
            <span className={cn("font-medium text-fg", size === "sm" ? "text-sm" : "text-[0.9375rem]")}>
              {title}
              {status && <span className="sr-only"> — {statusText[status]}</span>}
            </span>
            {description && <span className="text-[0.8125rem] text-fg-muted">{description}</span>}
            {summary && !open && <span className="truncate text-[0.8125rem] text-fg-muted">{summary}</span>}
          </span>
          {meta && <span className="shrink-0 text-sm text-fg-muted">{meta}</span>}
          {!action && <Chevron />}
        </button>
        {action && (
          // Outside the button, so its controls work on their own.
          <span className={cn("flex shrink-0 items-center gap-2", variant === "flush" ? "ps-3" : "pe-4")}>
            {action}
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              onClick={() => !disabled && toggle(value)}
              className="grid cursor-pointer place-items-center rounded-control-sm p-1 hover:bg-secondary-hover"
            >
              <Chevron open={open} />
            </button>
          </span>
        )}
      </Heading>

      {/* The panel: animates height by growing its grid row from 0fr to 1fr. */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-250 ease-[cubic-bezier(0.2,0.8,0.3,1)] motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div
          ref={panelRef}
          id={panelId}
          role="region"
          aria-labelledby={headerId}
          className="min-h-0 overflow-hidden"
          {...(!open && !keepMounted ? { hidden: true } : {})}
        >
          <div
            className={cn(
              "text-sm leading-relaxed text-fg-muted transition-[opacity,translate] duration-250 motion-reduce:transition-none",
              open ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
              variant === "flush" ? "pb-4" : size === "sm" ? "px-3.5 pb-3.5" : "px-4 pb-4",
              status || icon ? (variant === "flush" ? "ps-9" : size === "sm" ? "ps-[3.25rem]" : "ps-[3.75rem]") : ""
            )}
          >
            {keepMounted || open || everOpened ? children : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Chevron({ open }: { open?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn(
        "size-4 shrink-0 text-fg-muted transition-transform duration-250 motion-reduce:transition-none",
        open === undefined ? "group-data-[state=open]/acc:rotate-180" : open && "rotate-180"
      )}
    >
      <path d="M5 7.5l5 5 5-5" />
    </svg>
  );
}

/* ---------- expand / collapse all ---------- */

/** Buttons to open or close every section (for type="multiple"). Place inside <Accordion> or pass a ref-less wrapper. */
export function AccordionToggleAll({ expandLabel = "Expand all", collapseLabel = "Collapse all", className }: { expandLabel?: string; collapseLabel?: string; className?: string }) {
  const { open, expandAll, collapseAll } = useAccordion();
  const any = open.length > 0;
  return (
    <button
      type="button"
      onClick={any ? collapseAll : expandAll}
      className={cn("cursor-pointer justify-self-end rounded-control-sm px-2 py-1 text-xs font-medium text-primary hover:bg-secondary-hover", className)}
    >
      {any ? collapseLabel : expandLabel}
    </button>
  );
}
