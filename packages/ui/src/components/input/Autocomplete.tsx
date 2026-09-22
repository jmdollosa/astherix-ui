import * as React from "react";
import { cn } from "../../lib/cn";
import { renderIcon, type IconInput } from "../button/Button";
import { Input, type InputProps } from "./Input";

/*
 * Autocomplete — a text field that suggests as you type. The value is whatever the person
 * types; suggestions are shortcuts, not rules (use Select when the answer must come from a list).
 *
 * Extras: inline completion (the rest of the best match appears faintly — Tab or → accepts it),
 * recent searches remembered per browser, server suggestions with debouncing, and full
 * keyboard/screen-reader support (the ARIA combobox pattern with an editable field).
 */

export type AutocompleteItem =
  | string
  | {
      /** What goes into the field when picked. */
      value: string;
      /** Shown in the list (defaults to value). */
      label?: string;
      description?: React.ReactNode;
      icon?: IconInput;
      /** Show under this heading. */
      group?: string;
    };

type Item = { value: string; label: string; description?: React.ReactNode; icon?: IconInput; group?: string; recent?: boolean };

export interface AutocompleteProps
  extends Omit<InputProps, "value" | "defaultValue" | "onChange" | "onSubmit" | "overlay" | "type"> {
  value?: string;
  defaultValue?: string;
  /** Called with the text on every change (typing, picking, completing, clearing). */
  onChange?: (value: string) => void;
  /** A fixed list, or a function that returns suggestions for what's typed. */
  suggestions?: AutocompleteItem[] | ((query: string) => AutocompleteItem[]);
  /** Fetch suggestions from a server. Debounced; slow earlier replies never overwrite newer ones. */
  loadSuggestions?: (query: string, context: { signal: AbortSignal }) => Promise<AutocompleteItem[]>;
  /** Characters needed before suggesting. Default 1. */
  minLength?: number;
  /** Wait this long (ms) after typing before calling loadSuggestions. Default 200. */
  debounce?: number;
  /** Most suggestions shown. Default 8. */
  maxSuggestions?: number;
  /** Show the rest of the best match faintly in the field; Tab or → accepts it. Default true. */
  inlineComplete?: boolean;
  /** Called when a suggestion is picked (from the list or by completing it). */
  onSelectSuggestion?: (item: Item) => void;
  /** Called when Enter is pressed without a suggestion highlighted — e.g. to run a search. (With type="search", Escape also clears the field.) */
  onSubmit?: (value: string) => void;
  /** Remember submitted and picked values in this browser under this key, and offer them when the field is empty. */
  recentKey?: string;
  /** How many recent values to keep. Default 5. */
  maxRecent?: number;
  /** Shown when nothing matches. Default: the list simply closes. */
  emptyMessage?: React.ReactNode;
  /** Custom matching for fixed suggestions. Default: every word appears (case and accents ignored). */
  filter?: (item: Item, query: string) => boolean;
  type?: "text" | "search" | "email" | "url" | "tel";
}

/* ---------- helpers ---------- */

const norm = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const toItem = (x: AutocompleteItem): Item => (typeof x === "string" ? { value: x, label: x } : { ...x, label: x.label ?? x.value });

function defaultFilter(item: Item, q: string) {
  const hay = norm(`${item.label} ${item.value}`);
  return norm(q).split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
}

/** Rank: starts with the query → a word starts with it → contains it. */
function rank(item: Item, q: string) {
  const l = norm(item.label);
  const n = norm(q.trim());
  if (l.startsWith(n)) return 0;
  if (l.split(/[\s\-_.@/]+/).some((w) => w.startsWith(n))) return 1;
  return 2;
}

function Highlight({ text, query }: { text: string; query: string }) {
  const q = norm(query.trim());
  const i = q ? norm(text).indexOf(q) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-transparent font-semibold text-inherit">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

function readRecent(key?: string): string[] {
  if (!key || typeof window === "undefined") return [];
  try {
    const v = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/* ---------- component ---------- */

export const Autocomplete = React.forwardRef<HTMLInputElement, AutocompleteProps>(function Autocomplete(
  {
    value: valueProp,
    defaultValue = "",
    onChange,
    suggestions,
    loadSuggestions,
    minLength = 1,
    debounce = 200,
    maxSuggestions = 8,
    inlineComplete = true,
    onSelectSuggestion,
    onSubmit,
    recentKey,
    maxRecent = 5,
    emptyMessage,
    filter = defaultFilter,
    type = "text",
    onKeyDown,
    onFocus,
    onBlur,
    frameClassName,
    ...inputProps
  },
  ref
) {
  const [inner, setInner] = React.useState(defaultValue);
  const value = valueProp ?? inner;
  const setValue = (v: string) => {
    if (valueProp === undefined) setInner(v);
    onChange?.(v);
  };

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const listId = React.useId();
  const optionId = (i: number) => `${listId}-o${i}`;
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const [focused, setFocused] = React.useState(false);
  const [caretAtEnd, setCaretAtEnd] = React.useState(true);
  const [recent, setRecent] = React.useState<string[]>(() => readRecent(recentKey));

  /* ----- suggestions: fixed, computed, or from a server ----- */
  const [remote, setRemote] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const request = React.useRef(0);
  const query = value;
  const long = query.trim().length >= minLength;

  React.useEffect(() => {
    if (!loadSuggestions || !focused || !long) {
      setRemote([]);
      setLoading(false);
      return;
    }
    const id = ++request.current;
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    const t = window.setTimeout(() => {
      loadSuggestions(query.trim(), { signal: controller.signal }).then(
        (res) => {
          if (id !== request.current) return; // a newer search replaced this one
          setRemote(res.map(toItem));
          setLoading(false);
        },
        () => {
          if (id !== request.current || controller.signal.aborted) return;
          setError(true);
          setLoading(false);
        }
      );
    }, debounce);
    return () => {
      window.clearTimeout(t);
      controller.abort();
    };
  }, [query, focused, long, loadSuggestions, debounce]);

  const items: Item[] = React.useMemo(() => {
    const q = query.trim();
    if (!q) {
      // Empty field: offer recent values.
      return recent.slice(0, maxRecent).map((r) => ({ value: r, label: r, recent: true, group: "Recent" }));
    }
    if (!long) return [];
    let list: Item[];
    if (loadSuggestions) list = remote;
    else if (typeof suggestions === "function") list = suggestions(q).map(toItem);
    else list = (suggestions ?? []).map(toItem).filter((it) => filter(it, q));
    if (!loadSuggestions && typeof suggestions !== "function") list = [...list].sort((a, b) => rank(a, q) - rank(b, q));
    // Don't suggest exactly what's already typed.
    return list.filter((it) => norm(it.value) !== norm(q)).slice(0, maxSuggestions);
  }, [query, long, suggestions, loadSuggestions, remote, filter, maxSuggestions, recent, maxRecent]);

  const showList = open && focused && (items.length > 0 || loading || (long && !!emptyMessage) || error);

  React.useEffect(() => setActive(-1), [query]);

  /* ----- inline completion: the rest of the top match, if it starts with what's typed ----- */
  const top = items.find((it) => !it.recent);
  const completion =
    inlineComplete && focused && caretAtEnd && query && top && norm(top.value).startsWith(norm(query)) && active < 0
      ? top.value.slice(query.length)
      : "";

  /* ----- positioning (fixed, so it works inside modals and scrolling areas) ----- */
  const [pos, setPos] = React.useState<React.CSSProperties>({});
  const place = React.useCallback(() => {
    const frame = inputRef.current?.closest<HTMLElement>("[data-control-frame]") ?? inputRef.current;
    if (!frame) return;
    const r = frame.getBoundingClientRect();
    const below = window.innerHeight - r.bottom - 8;
    const up = below < 220 && r.top > below;
    setPos({
      position: "fixed",
      left: r.left,
      width: r.width,
      ...(up ? { bottom: window.innerHeight - r.top + 4 } : { top: r.bottom + 4 }),
      maxHeight: Math.min(320, (up ? r.top : below) - 8),
    });
  }, []);
  React.useLayoutEffect(() => {
    if (!showList) return;
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [showList, place]);

  React.useEffect(() => {
    if (active >= 0) document.getElementById(optionId(active))?.scrollIntoView?.({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  /* ----- actions ----- */
  const remember = (v: string) => {
    if (!recentKey || !v.trim()) return;
    const next = [v, ...recent.filter((r) => norm(r) !== norm(v))].slice(0, maxRecent);
    setRecent(next);
    try {
      window.localStorage.setItem(recentKey, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  };
  const forget = (v: string) => {
    const next = recent.filter((r) => r !== v);
    setRecent(next);
    try {
      if (recentKey) window.localStorage.setItem(recentKey, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const pick = (it: Item) => {
    setValue(it.value);
    onSelectSuggestion?.(it);
    remember(it.value);
    setOpen(false);
    setActive(-1);
    requestAnimationFrame(() => {
      const el = inputRef.current;
      try {
        if (el) el.setSelectionRange(el.value.length, el.value.length);
      } catch {
        /* email fields don't support selection ranges */
      }
    });
  };

  const acceptCompletion = () => {
    if (!completion || !top) return false;
    pick(top);
    return true;
  };

  // Email fields don't report the cursor position (selectionStart is null); treat that as "at the end".
  const atEnd = (el: HTMLInputElement) => el.selectionStart === null || (el.selectionStart === el.value.length && el.selectionEnd === el.value.length);
  const updateCaret = () => {
    const el = inputRef.current;
    if (el) setCaretAtEnd(atEnd(el));
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) setOpen(true);
        setActive((a) => (items.length ? (a + 1) % items.length : -1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) setOpen(true);
        setActive((a) => (items.length ? (a <= 0 ? items.length - 1 : a - 1) : -1));
        break;
      case "ArrowRight":
      case "End":
        if (completion && caretAtEnd) {
          e.preventDefault();
          acceptCompletion();
        }
        break;
      case "Tab":
        if (completion && !e.shiftKey) {
          e.preventDefault();
          acceptCompletion();
        } else setOpen(false);
        break;
      case "Enter":
        if (showList && active >= 0 && items[active]) {
          e.preventDefault();
          pick(items[active]);
        } else {
          if (onSubmit) {
            e.preventDefault();
            onSubmit(value);
          }
          remember(value);
          setOpen(false);
        }
        break;
      case "Escape":
        if (showList) {
          e.preventDefault();
          e.stopPropagation(); // don't also close a surrounding Modal
          setOpen(false);
          setActive(-1);
        } else if (value && type === "search") {
          // Like a native search box: Escape with no list open clears it.
          e.preventDefault();
          setValue("");
        }
        break;
      case "Delete":
        // Shift+Delete removes a highlighted recent value.
        if (e.shiftKey && active >= 0 && items[active]?.recent) {
          e.preventDefault();
          forget(items[active].value);
        }
        break;
    }
  };

  const setRefs = (node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  // Group headings (e.g. "Recent", or your own groups).
  let lastGroup: string | undefined;

  return (
    <div className="relative w-full">
      <Input
        ref={setRefs}
        type={type}
        role="combobox"
        aria-autocomplete={inlineComplete ? "both" : "list"}
        aria-expanded={!!showList}
        aria-controls={listId}
        aria-activedescendant={showList && active >= 0 ? optionId(active) : undefined}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
          setCaretAtEnd(atEnd(e.target));
        }}
        onKeyDown={onKey}
        onKeyUp={updateCaret}
        onClick={() => {
          updateCaret();
          setOpen(true);
        }}
        onSelect={updateCaret}
        onFocus={(e) => {
          setFocused(true);
          setOpen(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          setOpen(false);
          onBlur?.(e);
        }}
        frameClassName={frameClassName}
        overlay={
          inlineComplete ? (
            // Mirrors the typed text invisibly, then shows the completion faintly after it.
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-pre">
              <span className="invisible">{value}</span>
              <span className="text-fg-muted/55">{completion}</span>
            </span>
          ) : undefined
        }
        {...inputProps}
      />
      <span className="sr-only" aria-live="polite">
        {showList && !loading && long ? `${items.length} suggestion${items.length === 1 ? "" : "s"}` : ""}
      </span>

      {showList && (
        <div
          id={listId}
          role="listbox"
          aria-label="Suggestions"
          style={pos}
          onMouseDown={(e) => e.preventDefault() /* keep focus in the field */}
          className="z-[60] overflow-y-auto overscroll-contain rounded-control-lg border border-border bg-surface p-1 text-fg shadow-[var(--ui-shadow-lg)] animate-[ui-fade-in_100ms_ease-out]"
        >
          {items.map((it, i) => {
            const heading = it.group && it.group !== lastGroup ? it.group : null;
            lastGroup = it.group;
            return (
              <React.Fragment key={`${it.group ?? ""}:${it.value}`}>
                {heading && (
                  <div role="presentation" className="flex items-center justify-between px-2.5 pb-1 pt-2 text-xs font-medium text-fg-muted first:pt-1">
                    {heading}
                    {it.recent && (
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => {
                          setRecent([]);
                          try {
                            if (recentKey) window.localStorage.removeItem(recentKey);
                          } catch {
                            /* ignore */
                          }
                        }}
                        className="cursor-pointer rounded-control-sm px-1 font-normal hover:text-fg"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                )}
                <div
                  id={optionId(i)}
                  role="option"
                  aria-selected={i === active}
                  onMouseMove={() => setActive(i)}
                  onClick={() => pick(it)}
                  className={cn(
                    "group/opt flex cursor-pointer items-center gap-2.5 rounded-control-sm px-2.5 py-2 text-[0.9375rem]",
                    i === active && "bg-secondary-hover",
                    "[&>i]:text-[1.05em] [&>i]:text-fg-muted [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-fg-muted"
                  )}
                >
                  {it.recent ? (
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="10" cy="10" r="6.5" />
                      <path d="M10 6.5V10l2.5 1.5" />
                    </svg>
                  ) : (
                    renderIcon(it.icon)
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">
                      <Highlight text={it.label} query={it.recent ? "" : query} />
                    </span>
                    {it.description && <span className="block truncate text-[0.8125rem] text-fg-muted">{it.description}</span>}
                  </span>
                  {it.recent && (
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={`Remove ${it.value} from recent`}
                      onClick={(e) => {
                        e.stopPropagation();
                        forget(it.value);
                      }}
                      className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-control-sm text-fg-muted opacity-0 hover:bg-border hover:text-fg group-hover/opt:opacity-100 group-aria-selected/opt:opacity-100"
                    >
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true" className="size-3">
                        <path d="M6 6l8 8M14 6l-8 8" />
                      </svg>
                    </button>
                  )}
                </div>
              </React.Fragment>
            );
          })}
          {items.length === 0 && (
            <div role="presentation" className="px-2.5 py-2.5 text-sm text-fg-muted">
              {error ? "Couldn't load suggestions." : loading ? "Looking…" : emptyMessage}
            </div>
          )}
          {items.length > 0 && loading && (
            <div role="presentation" className="px-2.5 pb-1 pt-0.5 text-xs text-fg-muted">Updating…</div>
          )}
        </div>
      )}
    </div>
  );
});

