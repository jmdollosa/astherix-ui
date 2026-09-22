import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { renderIcon, type IconInput } from "../button/Button";
import { useField, useFieldControlProps } from "../input/Field";
import { controlFrame, type ControlRounded, type ControlSize } from "../input/controlStyles";

/*
 * Select — a searchable dropdown in the spirit of Select2: search, single or multiple
 * selection with removable chips, option groups, descriptions and icons, remote
 * (async) options, creating new options, and full keyboard support.
 *
 * Accessibility: the trigger is a combobox; the search box inside the dropdown drives
 * a listbox with aria-activedescendant, so screen readers follow the highlighted option.
 *
 * The dropdown is positioned with `position: fixed` but stays inside the component's
 * DOM (no portal), so it also works inside Modal, which lives in the browser's top layer.
 */

export interface SelectOption {
  value: string;
  label: string;
  /** Smaller second line. Also searched. */
  description?: string;
  /** Icon before the label: an element or an icon-font class string. */
  icon?: IconInput;
  /** Options with the same group are listed together under that heading. */
  group?: string;
  disabled?: boolean;
  /** Extra words to match when searching (e.g. country codes). */
  keywords?: string[];
}

type BaseProps = {
  /** The options to choose from. Leave empty when using loadOptions. */
  options?: SelectOption[];
  placeholder?: string;
  /** Show a search box in the dropdown. Default true. */
  searchable?: boolean;
  /** Placeholder for the search box. */
  searchPlaceholder?: string;
  /** Show a × to clear the selection. */
  clearable?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  size?: ControlSize;
  rounded?: ControlRounded;
  /** Adds hidden inputs with this name, so the value is sent with a normal form submit. */
  name?: string;
  id?: string;
  /** Fetch options from a server as the person types (debounced). */
  loadOptions?: (query: string) => Promise<SelectOption[]>;
  /** Wait for this many characters before searching (with loadOptions). Default 0. */
  minSearchLength?: number;
  /** Debounce for loadOptions, in ms. Default 250. */
  searchDelay?: number;
  /** Let people add an option that isn't in the list by typing it. */
  creatable?: boolean;
  /**
   * Called when a new option is created. Return the option to add (or a Promise of it),
   * e.g. after saving it on the server. By default the typed text becomes the option.
   */
  onCreateOption?: (input: string) => SelectOption | Promise<SelectOption>;
  /** Custom rendering for an option row. */
  renderOption?: (option: SelectOption, state: { selected: boolean; active: boolean }) => React.ReactNode;
  /** Text when nothing matches. */
  noOptionsMessage?: (query: string) => React.ReactNode;
  /** Close the dropdown after picking. Default: true for single, false for multiple. */
  closeOnSelect?: boolean;
  /** Called when the dropdown opens or closes. */
  onOpenChange?: (open: boolean) => void;
  className?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
};

type SingleProps = BaseProps & {
  multiple?: false;
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null, option: SelectOption | null) => void;
  maxSelected?: never;
};

type MultipleProps = BaseProps & {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[], options: SelectOption[]) => void;
  /** Most options that can be chosen. */
  maxSelected?: number;
};

export type SelectProps = SingleProps | MultipleProps;

/* ---------- helpers ---------- */

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

function matches(option: SelectOption, query: string) {
  if (!query) return true;
  const q = normalize(query.trim());
  return [option.label, option.description ?? "", ...(option.keywords ?? [])].some((t) => normalize(t).includes(q));
}

/** Bold the part of the label that matches the search. */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = normalize(query.trim());
  if (!q) return <>{text}</>;
  const i = normalize(text).indexOf(q);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-[2px] bg-primary/15 font-semibold text-inherit">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

const Spinner = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none">
    <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" />
    <path d="M14.25 8A6.25 6.25 0 0 0 8 1.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const Chevron = ({ open }: { open: boolean }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={cn("size-[1.1em] shrink-0 text-fg-muted transition-transform duration-150", open && "rotate-180")}
  >
    <path d="M5.5 8l4.5 4.5L14.5 8" />
  </svg>
);
const Check = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-4 shrink-0 text-primary">
    <path d="M4.5 10.5l3.5 3.5 7.5-8" />
  </svg>
);
const X = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true" className={className}>
    <path d="M6 6l8 8M14 6l-8 8" />
  </svg>
);

const triggerSize = cva("", {
  variants: {
    size: { sm: "min-h-8 text-sm", md: "min-h-10 text-[0.9375rem]", lg: "min-h-12 text-base" },
    multiple: { true: "py-1 pl-1.5 pr-2.5", false: "" },
  },
  compoundVariants: [
    { multiple: false, size: "sm", class: "px-2.5" },
    { multiple: false, size: "md", class: "px-3" },
    { multiple: false, size: "lg", class: "px-3.5" },
  ],
});

type Item =
  | { kind: "group"; label: string; key: string }
  | { kind: "option"; option: SelectOption; index: number; key: string }
  | { kind: "create"; input: string; index: number; key: string };

/* ---------- component ---------- */

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(function Select(props, ref) {
  const {
    options: optionsProp = [],
    placeholder = "Choose…",
    searchable = true,
    searchPlaceholder = "Search…",
    clearable = false,
    size = "md",
    rounded = "md",
    name,
    loadOptions,
    minSearchLength = 0,
    searchDelay = 250,
    creatable = false,
    onCreateOption,
    renderOption,
    noOptionsMessage = (q) => (q ? `No matches for “${q}”` : "No options"),
    onOpenChange,
    className,
    "aria-label": ariaLabel,
  } = props;
  const multiple = props.multiple === true;
  const maxSelected = multiple ? (props as MultipleProps).maxSelected : undefined;
  const closeOnSelect = props.closeOnSelect ?? !multiple;

  const field = useField();
  const { invalid, ...control } = useFieldControlProps({
    id: props.id,
    invalid: props.invalid,
    required: props.required,
    disabled: props.disabled,
    "aria-describedby": props["aria-describedby"],
  });
  const disabled = !!control.disabled;

  const uid = React.useId();
  const listId = `${uid}-list`;
  const optionId = (i: number) => `${uid}-opt-${i}`;

  /* ----- value (controlled or not), always handled as an array internally ----- */
  const toArray = (v: string | string[] | null | undefined) => (v == null ? [] : Array.isArray(v) ? v : [v]);
  const controlled = props.value !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState<string[]>(() => toArray(props.defaultValue));
  const selected = controlled ? toArray(props.value as string | string[] | null) : uncontrolled;

  /* ----- options we know about: given, created, and ones loaded from the server ----- */
  const [created, setCreated] = React.useState<SelectOption[]>([]);
  const known = React.useRef(new Map<string, SelectOption>());
  for (const o of optionsProp) known.current.set(o.value, o);
  for (const o of created) known.current.set(o.value, o);
  const optionFor = (value: string): SelectOption => known.current.get(value) ?? { value, label: value };

  const commit = (next: string[]) => {
    if (!controlled) setUncontrolled(next);
    const opts = next.map(optionFor);
    if (multiple) (props as MultipleProps).onChange?.(next, opts);
    else (props as SingleProps).onChange?.(next[0] ?? null, opts[0] ?? null);
  };

  /* ----- open state, search and remote loading ----- */
  const [open, setOpenState] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [remote, setRemote] = React.useState<SelectOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const requestId = React.useRef(0);

  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
    if (!next) setQuery("");
  };

  const tooShort = !!loadOptions && query.trim().length < minSearchLength;

  React.useEffect(() => {
    if (!open || !loadOptions) return;
    if (tooShort) {
      setRemote([]);
      setLoading(false);
      return;
    }
    const id = ++requestId.current;
    setLoading(true);
    setLoadError(false);
    const timer = window.setTimeout(
      () => {
        loadOptions(query.trim()).then(
          (result) => {
            if (id !== requestId.current) return; // a newer search replaced this one
            for (const o of result) known.current.set(o.value, o);
            setRemote(result);
            setLoading(false);
          },
          () => {
            if (id !== requestId.current) return;
            setLoadError(true);
            setLoading(false);
          }
        );
      },
      query ? searchDelay : 0
    );
    return () => window.clearTimeout(timer);
  }, [open, query, loadOptions, tooShort, searchDelay]);

  /* ----- the visible list ----- */
  const source = loadOptions ? remote : [...optionsProp, ...created];
  const filtered = loadOptions ? source : source.filter((o) => matches(o, query));
  const limitReached = multiple && maxSelected !== undefined && selected.length >= maxSelected;
  const isDisabled = (o: SelectOption) => !!o.disabled || (limitReached && !selected.includes(o.value));

  const trimmed = query.trim();
  const canCreate =
    creatable &&
    trimmed !== "" &&
    !limitReached &&
    ![...source, ...selected.map(optionFor)].some((o) => normalize(o.label) === normalize(trimmed));

  const { items, navigable } = React.useMemo(() => {
    const out: Item[] = [];
    const nav: Array<{ option?: SelectOption; create?: string }> = [];
    const order: string[] = [];
    const byGroup = new Map<string, SelectOption[]>();
    for (const o of filtered) {
      const g = o.group ?? "";
      if (!byGroup.has(g)) {
        byGroup.set(g, []);
        order.push(g);
      }
      byGroup.get(g)!.push(o);
    }
    for (const g of order) {
      if (g) out.push({ kind: "group", label: g, key: `g:${g}` });
      for (const o of byGroup.get(g)!) {
        out.push({ kind: "option", option: o, index: nav.length, key: `o:${o.value}` });
        nav.push({ option: o });
      }
    }
    if (canCreate) {
      out.push({ kind: "create", input: trimmed, index: nav.length, key: "create" });
      nav.push({ create: trimmed });
    }
    return { items: out, navigable: nav };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered.map((o) => o.value).join("\u0000"), canCreate, trimmed]);

  const [active, setActive] = React.useState(-1);
  const enabledAt = (i: number) => {
    const n = navigable[i];
    return !!n && (n.create !== undefined || (n.option && !isDisabled(n.option)));
  };
  const move = (from: number, step: 1 | -1) => {
    if (!navigable.length) return -1;
    let i = from;
    for (let tries = 0; tries < navigable.length; tries++) {
      i = (i + step + navigable.length) % navigable.length;
      if (enabledAt(i)) return i;
    }
    return -1;
  };

  // When the list changes, highlight the selected option or the first available one.
  React.useEffect(() => {
    if (!open) return;
    const sel = navigable.findIndex((n) => n.option && selected.includes(n.option.value) && enabledAt(navigable.indexOf(n)));
    setActive(query === "" && sel >= 0 ? sel : move(-1, 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, navigable]);

  /* ----- positioning ----- */
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLDivElement | null>(null);
  const searchRef = React.useRef<HTMLInputElement | null>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = React.useState<React.CSSProperties>({});

  const place = React.useCallback(() => {
    const t = triggerRef.current;
    if (!t) return;
    const r = t.getBoundingClientRect();
    const below = window.innerHeight - r.bottom - 8;
    const above = r.top - 8;
    const up = below < 260 && above > below;
    const room = Math.max(160, (up ? above : below) - 4);
    setPos({
      position: "fixed",
      left: r.left,
      width: r.width,
      ...(up ? { bottom: window.innerHeight - r.top + 4 } : { top: r.bottom + 4 }),
      maxHeight: Math.min(360, room),
    });
  }, []);

  React.useLayoutEffect(() => {
    if (!open) return;
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  // Focus the search box (or the list) when opening.
  React.useEffect(() => {
    if (!open) return;
    (searchable ? searchRef.current : listRef.current)?.focus({ preventScroll: true });
  }, [open, searchable]);

  // Close when clicking outside.
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  });

  // Keep the highlighted option in view.
  React.useEffect(() => {
    if (!open || active < 0) return;
    document.getElementById(optionId(active))?.scrollIntoView?.({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, open]);

  /* ----- actions ----- */
  const focusTrigger = () => triggerRef.current?.focus();

  const choose = async (i: number) => {
    const n = navigable[i];
    if (!n || !enabledAt(i)) return;
    let value: string;
    if (n.create !== undefined) {
      setCreating(true);
      try {
        const made = (await onCreateOption?.(n.create)) ?? { value: n.create, label: n.create };
        known.current.set(made.value, made);
        if (!loadOptions) setCreated((c) => [...c, made]);
        value = made.value;
      } finally {
        setCreating(false);
      }
    } else {
      value = n.option!.value;
    }
    if (multiple) {
      commit(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
      setQuery("");
    } else {
      commit([value]);
    }
    if (closeOnSelect) {
      setOpen(false);
      focusTrigger();
    }
  };

  const removeValue = (value: string) => commit(selected.filter((v) => v !== value));

  const onListKey = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((a) => move(a, 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((a) => move(a < 0 ? 0 : a, -1));
        break;
      case "Home":
        if (!searchable || !query) {
          e.preventDefault();
          setActive(move(-1, 1));
        }
        break;
      case "End":
        if (!searchable || !query) {
          e.preventDefault();
          setActive(move(0, -1));
        }
        break;
      case "Enter":
        e.preventDefault();
        if (active >= 0) void choose(active);
        break;
      case "Escape":
        e.preventDefault();
        e.stopPropagation(); // don't also close a surrounding Modal
        setOpen(false);
        focusTrigger();
        break;
      case "Tab":
        setOpen(false);
        break;
      case "Backspace":
        if (multiple && query === "" && selected.length) removeValue(selected[selected.length - 1]);
        break;
      default:
        // Without a search box: jump to the next option starting with the typed letter.
        if (!searchable && e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
          const k = normalize(e.key);
          const start = active < 0 ? 0 : active + 1;
          for (let t = 0; t < navigable.length; t++) {
            const i = (start + t) % navigable.length;
            const o = navigable[i].option;
            if (o && enabledAt(i) && normalize(o.label).startsWith(k)) {
              setActive(i);
              break;
            }
          }
        }
    }
  };

  const onTriggerKey = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      setOpen(true);
    } else if (e.key === "Backspace" && multiple && selected.length) {
      removeValue(selected[selected.length - 1]);
    } else if (searchable && e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      // Start typing to open and search.
      e.preventDefault();
      setOpen(true);
      setQuery(e.key);
    }
  };

  /* ----- render ----- */
  const selectedOptions = selected.map(optionFor);
  const hasValue = selected.length > 0;
  const labelledBy = ariaLabel ? undefined : field?.labelId;
  const activeId = open && active >= 0 ? optionId(active) : undefined;

  const setWrapperRef = (node: HTMLDivElement | null) => {
    wrapperRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  return (
    <div ref={setWrapperRef} className={cn("relative w-full", className)}>
      <div
        ref={triggerRef}
        id={control.id}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        aria-describedby={control["aria-describedby"]}
        aria-invalid={control["aria-invalid"]}
        aria-required={control.required || undefined}
        aria-disabled={disabled || undefined}
        data-invalid={invalid ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        className={cn(
          controlFrame({ rounded }),
          triggerSize({ size, multiple }),
          "cursor-pointer select-none items-center gap-2 text-left outline-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25",
          open && "border-ring ring-3 ring-ring/25",
          disabled && "cursor-not-allowed"
        )}
        onMouseDown={(e) => {
          if (disabled || (e.target as HTMLElement).closest("[data-chip-remove],[data-clear]")) return;
          e.preventDefault();
          if (open) {
            setOpen(false);
            focusTrigger();
          } else {
            setOpen(true);
          }
        }}
        onKeyDown={onTriggerKey}
      >
        <div className={cn("flex min-w-0 flex-1 flex-wrap items-center", multiple ? "gap-1" : "gap-2")}>
          {multiple ? (
            selectedOptions.length ? (
              selectedOptions.map((o) => (
                <span
                  key={o.value}
                  className="inline-flex max-w-full items-center gap-1 rounded-control-sm bg-secondary-hover py-0.5 pl-2 pr-0.5 text-[0.8125rem] leading-5 text-fg [&_i]:text-[1em] [&_svg]:size-[1em]"
                >
                  {renderIcon(o.icon)}
                  <span className="truncate">{o.label}</span>
                  {!disabled && (
                    <button
                      type="button"
                      tabIndex={-1}
                      data-chip-remove=""
                      aria-label={`Remove ${o.label}`}
                      className="grid size-5 cursor-pointer place-items-center rounded-[3px] text-fg-muted hover:bg-border hover:text-fg"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeValue(o.value);
                        focusTrigger();
                      }}
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </span>
              ))
            ) : (
              <span className="truncate px-1.5 text-fg-muted/80">{placeholder}</span>
            )
          ) : selectedOptions[0] ? (
            <span className="flex min-w-0 items-center gap-2 [&_i]:text-[1.125em] [&_i]:text-fg-muted [&_svg]:size-[1.125em] [&_svg]:text-fg-muted">
              {renderIcon(selectedOptions[0].icon)}
              <span className="truncate">{selectedOptions[0].label}</span>
            </span>
          ) : (
            <span className="truncate text-fg-muted/80">{placeholder}</span>
          )}
        </div>

        {clearable && hasValue && !disabled && (
          <button
            type="button"
            tabIndex={-1}
            data-clear=""
            aria-label="Clear selection"
            className="-mr-1 grid size-6 shrink-0 cursor-pointer place-items-center rounded-control-sm text-fg-muted hover:bg-secondary-hover hover:text-fg"
            onClick={(e) => {
              e.stopPropagation();
              commit([]);
              focusTrigger();
            }}
          >
            <X className="size-[0.95em]" />
          </button>
        )}
        <Chevron open={open} />
      </div>

      {name &&
        (multiple ? selected : selected.slice(0, 1)).map((v) => <input key={v} type="hidden" name={name} value={v} />)}
      {name && !hasValue && !multiple && <input type="hidden" name={name} value="" />}

      {open && (
        <div
          style={pos}
          className={cn(
            "z-[60] flex flex-col overflow-hidden rounded-control-lg border border-border bg-surface text-fg",
            "shadow-[var(--ui-shadow-lg)] animate-[ui-fade-in_120ms_ease-out]"
          )}
        >
          {searchable && (
            <div className="border-b border-border p-1.5">
              <div className="flex h-9 items-center gap-2 rounded-control bg-secondary-hover/70 px-2.5 text-[0.9375rem]">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true" className="size-4 shrink-0 text-fg-muted">
                  <circle cx="9" cy="9" r="5.5" />
                  <path d="M13 13l3.5 3.5" />
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  role="searchbox"
                  aria-label={searchPlaceholder.replace(/…$/, "")}
                  aria-controls={listId}
                  aria-activedescendant={activeId}
                  aria-autocomplete="list"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={searchPlaceholder}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onListKey}
                  className="h-full min-w-0 flex-1 bg-transparent text-fg outline-none placeholder:text-fg-muted/70"
                />
                {(loading || creating) && <span className="text-fg-muted"><Spinner /></span>}
              </div>
            </div>
          )}

          <div
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={searchable ? undefined : -1}
            aria-multiselectable={multiple || undefined}
            aria-activedescendant={searchable ? undefined : activeId}
            aria-label={ariaLabel}
            aria-labelledby={labelledBy}
            onKeyDown={searchable ? undefined : onListKey}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1 outline-none"
          >
            {items.map((item) => {
              if (item.kind === "group") {
                return (
                  <div key={item.key} role="presentation" className="px-2.5 pb-1 pt-2.5 text-xs font-medium text-fg-muted first:pt-1">
                    {item.label}
                  </div>
                );
              }
              const isActive = item.index === active;
              if (item.kind === "create") {
                return (
                  <div
                    key={item.key}
                    id={optionId(item.index)}
                    role="option"
                    aria-selected={false}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-control-sm px-2.5 py-2 text-[0.9375rem]",
                      isActive && "bg-secondary-hover"
                    )}
                    onMouseMove={() => setActive(item.index)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => void choose(item.index)}
                  >
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" aria-hidden="true" className="size-4 shrink-0 text-primary">
                      <path d="M10 4.5v11M4.5 10h11" />
                    </svg>
                    <span>
                      Add <span className="font-medium">“{item.input}”</span>
                    </span>
                  </div>
                );
              }
              const o = item.option;
              const isSelected = selected.includes(o.value);
              const off = isDisabled(o);
              return (
                <div
                  key={item.key}
                  id={optionId(item.index)}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={off || undefined}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-control-sm px-2.5 py-2 text-[0.9375rem]",
                    isActive && !off && "bg-secondary-hover",
                    off && "cursor-not-allowed opacity-45",
                    "[&>i]:text-[1.125em] [&>i]:text-fg-muted [&>svg:first-child]:size-[1.125em] [&>svg:first-child]:text-fg-muted"
                  )}
                  onMouseMove={() => !off && setActive(item.index)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => void choose(item.index)}
                >
                  {renderOption ? (
                    renderOption(o, { selected: isSelected, active: isActive })
                  ) : (
                    <>
                      {renderIcon(o.icon)}
                      <span className="min-w-0 flex-1">
                        <span className={cn("block truncate", isSelected && "font-medium")}>
                          <Highlight text={o.label} query={loadOptions ? "" : query} />
                        </span>
                        {o.description && (
                          <span className="block truncate text-[0.8125rem] text-fg-muted">
                            <Highlight text={o.description} query={loadOptions ? "" : query} />
                          </span>
                        )}
                      </span>
                    </>
                  )}
                  {isSelected && <Check />}
                </div>
              );
            })}

            {!items.length && (
              <div role="presentation" className="px-2.5 py-3 text-sm text-fg-muted">
                {loadError
                  ? "Couldn't load options. Check your connection and try again."
                  : tooShort
                    ? `Type ${minSearchLength - trimmed.length} more character${minSearchLength - trimmed.length === 1 ? "" : "s"} to search`
                    : loading
                      ? "Searching…"
                      : noOptionsMessage(trimmed)}
              </div>
            )}
          </div>

          {limitReached && (
            <p className="border-t border-border px-3 py-2 text-[0.8125rem] text-fg-muted">
              You can choose up to {maxSelected}. Remove one to pick another.
            </p>
          )}
        </div>
      )}
    </div>
  );
});
