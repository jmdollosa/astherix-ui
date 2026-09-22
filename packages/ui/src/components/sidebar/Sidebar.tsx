import * as React from "react";
import { cn } from "../../lib/cn";
import { Button, renderIcon, type IconInput } from "../button/Button";

/*
 * Sidebar — the dashboard navigation panel.
 *
 *   <SidebarProvider side="left">
 *     <Sidebar>
 *       <SidebarHeader>…logo…</SidebarHeader>
 *       <SidebarContent>
 *         <SidebarGroup label="Workspace"><SidebarNav items={nav} activeHref={pathname} /></SidebarGroup>
 *       </SidebarContent>
 *       <SidebarFooter>…account…</SidebarFooter>
 *     </Sidebar>
 *     <SidebarInset>
 *       <header><SidebarTrigger /></header>
 *       …page…
 *     </SidebarInset>
 *   </SidebarProvider>
 *
 * Responsive by the layout's own width: wide → a full sidebar that collapses to an icon rail
 * (submenus open as a flyout); narrow → an off-canvas drawer. Menus nest to any depth.
 */

type Mode = "drawer" | "desktop";

type SidebarContextValue = {
  side: "left" | "right";
  mode: Mode;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
  toggle: () => void;
  contained: boolean;
  sidebarId: string;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  linkComponent: React.ElementType;
  onNavigate?: (href: string) => void;
};
const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used inside <SidebarProvider>.");
  return ctx;
}

/** True when the sidebar is showing as an icon rail. */
const useRail = () => {
  const ctx = React.useContext(SidebarContext);
  return !!ctx && ctx.mode === "desktop" && ctx.collapsed;
};

/* ---------- Provider / layout ---------- */

export interface SidebarProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Which side the sidebar is on. */
  side?: "left" | "right";
  /** Start collapsed to an icon rail (wide screens). */
  defaultCollapsed?: boolean;
  /** Controlled collapsed state. */
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Below this layout width (px) the sidebar becomes a drawer. Default 768. */
  drawerBelow?: number;
  /** Between drawerBelow and this width, start as an icon rail unless the person chose otherwise. Default 1024. */
  railBelow?: number;
  /** Remember collapsed/expanded in this browser under this key. */
  persistKey?: string;
  /** Keyboard shortcut Ctrl/⌘ + this key toggles the sidebar. Default "b"; false to turn off. */
  shortcut?: string | false;
  /**
   * The link component for menu items — e.g. Next.js `Link` or Inertia's `Link`.
   * It receives href, className, children, onClick and aria-current.
   */
  linkComponent?: React.ElementType;
  /** Called when a menu link is followed (after the drawer closes on phones). */
  onNavigate?: (href: string) => void;
  /** Fit inside a box (e.g. a preview) instead of the whole window. */
  contained?: boolean;
}

export function SidebarProvider({
  side = "left",
  defaultCollapsed = false,
  collapsed: collapsedProp,
  onCollapsedChange,
  drawerBelow = 768,
  railBelow = 1024,
  persistKey,
  shortcut = "b",
  linkComponent = "a",
  onNavigate,
  contained = false,
  className,
  children,
  ...props
}: SidebarProviderProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const sidebarId = React.useId();
  const [mode, setMode] = React.useState<Mode>("desktop");
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const chosen = React.useRef(false); // did the person toggle it themselves?

  const [inner, setInner] = React.useState(() => {
    if (persistKey && typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem(persistKey);
        if (saved !== null) {
          chosen.current = true;
          return saved === "collapsed";
        }
      } catch {
        /* storage unavailable */
      }
    }
    return defaultCollapsed;
  });
  const collapsed = collapsedProp ?? inner;
  const setCollapsed = React.useCallback(
    (v: boolean) => {
      if (collapsedProp === undefined) setInner(v);
      onCollapsedChange?.(v);
      if (persistKey) {
        try {
          window.localStorage.setItem(persistKey, v ? "collapsed" : "expanded");
        } catch {
          /* ignore */
        }
      }
    },
    [collapsedProp, onCollapsedChange, persistKey]
  );

  // Pick the layout from the provider's own width.
  React.useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      const next: Mode = w < drawerBelow ? "drawer" : "desktop";
      setMode(next);
      if (next === "desktop") {
        setDrawerOpen(false);
        if (!chosen.current && collapsedProp === undefined) setInner(w < railBelow ? true : defaultCollapsed);
      }
    };
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [drawerBelow, railBelow, defaultCollapsed, collapsedProp]);

  const toggle = React.useCallback(() => {
    if (mode === "drawer") setDrawerOpen((o) => !o);
    else {
      chosen.current = true;
      setCollapsed(!collapsed);
    }
  }, [mode, collapsed, setCollapsed]);

  React.useEffect(() => {
    if (!shortcut) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === shortcut) {
        const t = e.target as HTMLElement;
        if (t.closest("input, textarea, [contenteditable=true]")) return;
        e.preventDefault();
        toggle();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [shortcut, toggle]);

  const value = React.useMemo<SidebarContextValue>(
    () => ({ side, mode, collapsed, setCollapsed, drawerOpen, setDrawerOpen, toggle, contained, sidebarId, triggerRef, linkComponent, onNavigate }),
    [side, mode, collapsed, setCollapsed, drawerOpen, toggle, contained, sidebarId, linkComponent, onNavigate]
  );

  return (
    <SidebarContext.Provider value={value}>
      <div
        ref={rootRef}
        data-sidebar-mode={mode}
        data-sidebar-state={mode === "drawer" ? (drawerOpen ? "open" : "closed") : collapsed ? "rail" : "expanded"}
        className={cn(
          "relative flex w-full bg-bg text-fg",
          side === "right" && "flex-row-reverse",
          contained ? "h-full overflow-hidden" : "min-h-dvh",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

/* ---------- Sidebar (the panel) ---------- */

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** Width when expanded. Default "16rem". */
  width?: string;
  /** Width of the icon rail. Default "4.25rem". */
  railWidth?: string;
  /** Accessible name for the panel. Default "Sidebar". */
  "aria-label"?: string;
}

export function Sidebar({ width = "16rem", railWidth = "4.25rem", className, children, style, "aria-label": ariaLabel = "Sidebar", ...props }: SidebarProps) {
  const ctx = useSidebar();
  const { side, mode, collapsed, drawerOpen, setDrawerOpen, contained, sidebarId, triggerRef } = ctx;
  const panelRef = React.useRef<HTMLElement>(null);
  const drawer = mode === "drawer";
  const rail = !drawer && collapsed;

  // Drawer: keep it out of the tab order while closed; move focus in on open and back on close;
  // Escape closes; the page behind can't be scrolled or clicked.
  React.useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    if (drawer && !drawerOpen) el.setAttribute("inert", "");
    else el.removeAttribute("inert");
  }, [drawer, drawerOpen]);

  React.useEffect(() => {
    if (!drawer || !drawerOpen) return;
    const el = panelRef.current;
    // Start on the current page's item if there is one, otherwise the first item.
    const first = el?.querySelector<HTMLElement>('[aria-current="page"]') ?? el?.querySelector<HTMLElement>("a[href], button:not([disabled])");
    first?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setDrawerOpen(false);
      }
      // Keep Tab inside the drawer while it's open.
      if (e.key === "Tab" && el) {
        const items = [...el.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter((x) => x.offsetParent !== null);
        if (!items.length) return;
        const [a, z] = [items[0], items[items.length - 1]];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    let restoreOverflow: string | undefined;
    if (!contained) {
      restoreOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      if (restoreOverflow !== undefined) document.documentElement.style.overflow = restoreOverflow;
      triggerRef.current?.focus({ preventScroll: true });
    };
  }, [drawer, drawerOpen, setDrawerOpen, contained, triggerRef]);

  const fixed = contained ? "absolute" : "fixed";
  const edge = side === "left" ? "start-0 border-e" : "end-0 border-s";

  return (
    <>
      {drawer && (
        <div
          aria-hidden="true"
          onClick={() => setDrawerOpen(false)}
          className={cn(
            fixed,
            "inset-0 z-40 bg-[var(--ui-backdrop,rgb(18_20_24/0.5))] transition-opacity duration-200",
            drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        />
      )}
      <aside
        ref={panelRef}
        id={sidebarId}
        aria-label={ariaLabel}
        data-state={drawer ? (drawerOpen ? "open" : "closed") : rail ? "rail" : "expanded"}
        className={cn(
          "flex flex-col border-border bg-surface text-fg",
          edge,
          drawer
            ? cn(
                fixed,
                "inset-y-0 z-50 w-[min(18rem,86%)] shadow-[var(--ui-shadow-xl)] transition-transform duration-250 ease-[cubic-bezier(0.2,0.9,0.3,1)] motion-reduce:transition-none",
                drawerOpen ? "translate-x-0" : side === "left" ? "-translate-x-full rtl:translate-x-full" : "translate-x-full rtl:-translate-x-full"
              )
            : cn(
                "sticky top-0 z-20 shrink-0 overflow-hidden transition-[width] duration-200 ease-out motion-reduce:transition-none",
                contained ? "h-full" : "h-dvh"
              ),
          className
        )}
        style={drawer ? style : { width: rail ? railWidth : width, ...style }}
        {...props}
      >
        {children}
      </aside>
    </>
  );
}

export function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const rail = useRail();
  return <div className={cn("flex h-14 shrink-0 items-center gap-2 px-3", rail && "justify-center px-2", className)} {...props} />;
}

export function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const rail = useRail();
  return (
    <div
      className={cn("grid min-h-0 flex-1 content-start gap-4 overflow-y-auto overscroll-contain px-3 py-2 [scrollbar-width:thin]", rail && "px-2", className)}
      {...props}
    />
  );
}

export function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const rail = useRail();
  return <div className={cn("shrink-0 border-t border-border p-3", rail && "grid justify-items-center p-2", className)} {...props} />;
}

export interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** A small heading above the group. Hidden in the icon rail (a divider shows instead). */
  label?: React.ReactNode;
  /** Something at the right of the heading, e.g. an "add" button. */
  action?: React.ReactNode;
}

export function SidebarGroup({ label, action, className, children, ...props }: SidebarGroupProps) {
  const rail = useRail();
  const id = React.useId();
  return (
    <div role="group" aria-labelledby={label ? id : undefined} className={cn("grid gap-1", className)} {...props}>
      {label &&
        (rail ? (
          <>
            <span id={id} className="sr-only">{label}</span>
            <span aria-hidden="true" className="mx-auto my-1 h-px w-6 bg-border" />
          </>
        ) : (
          <div className="flex h-7 items-center justify-between gap-2 px-3">
            <span id={id} className="truncate text-xs font-medium text-fg-muted">{label}</span>
            {action}
          </div>
        ))}
      {children}
    </div>
  );
}

/* ---------- Trigger ---------- */

export interface SidebarTriggerProps extends Omit<React.ComponentProps<typeof Button>, "children"> {
  /** Accessible label. Default "Toggle sidebar". */
  label?: string;
}

const PanelIcon = ({ side }: { side: "left" | "right" }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2.75" y="3.75" width="14.5" height="12.5" rx="2" />
    <path d={side === "left" ? "M7.75 3.75v12.5" : "M12.25 3.75v12.5"} />
  </svg>
);

/** The button that opens/closes the drawer on phones and collapses/expands the sidebar on wide screens. */
export const SidebarTrigger = React.forwardRef<HTMLButtonElement, SidebarTriggerProps>(({ label = "Toggle sidebar", onClick, ...props }, ref) => {
  const { toggle, mode, collapsed, drawerOpen, sidebarId, side, triggerRef } = useSidebar();
  const expanded = mode === "drawer" ? drawerOpen : !collapsed;
  return (
    <Button
      ref={(node: HTMLButtonElement | null) => {
        triggerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      variant="ghost"
      size="sm"
      iconOnly
      aria-label={label}
      aria-expanded={expanded}
      aria-controls={sidebarId}
      title={`${label} (Ctrl/⌘ B)`}
      onClick={(e) => {
        onClick?.(e);
        toggle();
      }}
      {...props}
    >
      <PanelIcon side={side} />
    </Button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

/** The main area beside the sidebar. */
export function SidebarInset({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { contained } = useSidebar();
  return <div className={cn("flex min-w-0 flex-1 flex-col", contained && "overflow-y-auto", className)} {...props} />;
}

/* ---------- The menu ---------- */

export interface SidebarNavItem {
  label: string;
  /** Where it goes. Items with children don't need one (they open their submenu). */
  href?: string;
  icon?: IconInput;
  /** Something at the end, e.g. a count: <Pill size="sm">12</Pill>. */
  badge?: React.ReactNode;
  /** A submenu. Nest as deep as you need. */
  children?: SidebarNavItem[];
  /** Open this submenu at first. Parents of the active page open automatically. */
  defaultOpen?: boolean;
  disabled?: boolean;
  /** For actions that aren't links (e.g. "Invite people"). */
  onSelect?: () => void;
  /** Open in a new tab. */
  external?: boolean;
  /** Stable key if labels repeat. */
  id?: string;
}

export interface SidebarNavProps {
  items: SidebarNavItem[];
  /** The current page's path. Its item is highlighted and its parents open. */
  activeHref?: string;
  /** Also treat an item as active when the current path starts with its href (e.g. /invoices/1047). Default true. */
  matchNested?: boolean;
  "aria-label"?: string;
  className?: string;
}

const Chevron = ({ open }: { open: boolean }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    className={cn("size-4 shrink-0 text-fg-muted transition-transform duration-200 motion-reduce:transition-none rtl:-scale-x-100", open && "rotate-90")}>
    <path d="M8 5.5l4.5 4.5L8 14.5" />
  </svg>
);

function isActive(item: SidebarNavItem, active: string | undefined, nested: boolean) {
  if (!active || !item.href) return false;
  if (item.href === active) return true;
  return nested && item.href !== "/" && active.startsWith(item.href.endsWith("/") ? item.href : item.href + "/");
}
function containsActive(item: SidebarNavItem, active: string | undefined, nested: boolean): boolean {
  return !!item.children?.some((c) => isActive(c, active, nested) || containsActive(c, active, nested));
}
const keyOf = (item: SidebarNavItem, i: number) => item.id ?? `${item.label}-${i}`;

/** A menu from data, with submenus to any depth. */
export function SidebarNav({ items, activeHref, matchNested = true, "aria-label": ariaLabel, className }: SidebarNavProps) {
  const rail = useRail();
  // The most specific match wins, so "/invoices" isn't highlighted alongside "/invoices/recurring".
  const best = React.useMemo(() => {
    let found: string | undefined;
    const walk = (list: SidebarNavItem[]) =>
      list.forEach((it) => {
        if (isActive(it, activeHref, matchNested) && (!found || (it.href?.length ?? 0) > found.length)) found = it.href;
        if (it.children) walk(it.children);
      });
    walk(items);
    return found;
  }, [items, activeHref, matchNested]);

  return (
    <nav aria-label={ariaLabel} className={className}>
      <ul role="list" className={cn("grid gap-0.5", rail && "justify-items-center")}>
        {items.map((item, i) =>
          rail ? (
            <RailItem key={keyOf(item, i)} item={item} activeHref={best} />
          ) : (
            <NavItem key={keyOf(item, i)} item={item} depth={0} activeHref={best} />
          )
        )}
      </ul>
    </nav>
  );
}

function ItemLink({
  item,
  className,
  children,
  active,
  ...rest
}: { item: SidebarNavItem; className: string; children: React.ReactNode; active: boolean } & Record<string, unknown>) {
  const { linkComponent: LinkC, setDrawerOpen, mode, onNavigate } = useSidebar();
  const close = () => mode === "drawer" && setDrawerOpen(false);
  if (item.href && !item.disabled) {
    const Comp = item.external ? "a" : LinkC;
    return (
      <Comp
        href={item.href}
        className={className}
        aria-current={active ? "page" : undefined}
        {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        onClick={() => {
          close();
          onNavigate?.(item.href!);
        }}
        {...rest}
      >
        {children}
      </Comp>
    );
  }
  return (
    <button
      type="button"
      disabled={item.disabled}
      className={className}
      onClick={() => {
        item.onSelect?.();
        close();
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

const rowBase =
  "group/row flex h-9 w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-control px-3 text-start text-sm text-fg-muted outline-none transition-colors duration-100 hover:bg-secondary-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-45 [&_svg:not(.size-4)]:size-[1.125rem] [&_svg]:shrink-0 [&_i]:text-[1.125rem] [&_i]:leading-none";
const rowActive = "bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)] font-medium text-primary hover:bg-[color:color-mix(in_srgb,var(--color-primary)_14%,transparent)] hover:text-primary";

function NavItem({ item, depth, activeHref }: { item: SidebarNavItem; depth: number; activeHref?: string }) {
  const hasChildren = !!item.children?.length;
  const active = !!activeHref && item.href === activeHref;
  // activeHref is already the single best match, so an exact search down the tree is enough.
  const holdsActive = hasChildren && containsActive(item, activeHref, false);
  const [open, setOpen] = React.useState(!!item.defaultOpen || holdsActive);
  React.useEffect(() => {
    if (holdsActive) setOpen(true);
  }, [holdsActive]);
  const subId = React.useId();
  const subRef = React.useRef<HTMLDivElement>(null);
  // A closed submenu stays out of the tab order (set directly: works on React 18 and 19).
  React.useEffect(() => {
    if (!subRef.current) return;
    if (open) subRef.current.removeAttribute("inert");
    else subRef.current.setAttribute("inert", "");
  }, [open]);

  const content = (
    <>
      {depth === 0 ? renderIcon(item.icon) : item.icon ? renderIcon(item.icon) : null}
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.badge && <span className="shrink-0">{item.badge}</span>}
      {item.external && (
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" aria-hidden="true" className="size-3 shrink-0 opacity-60">
          <path d="M4 2.5h5.5V8M9.5 2.5L3 9" />
        </svg>
      )}
    </>
  );

  return (
    <li className="grid min-w-0">
      {hasChildren ? (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={subId}
          disabled={item.disabled}
          onClick={() => setOpen((o) => !o)}
          className={cn(rowBase, holdsActive && !open && "text-fg")}
        >
          {content}
          <Chevron open={open} />
        </button>
      ) : (
        <ItemLink item={item} active={active} className={cn(rowBase, active && rowActive)}>
          {content}
        </ItemLink>
      )}
      {hasChildren && (
        // Animated open/close: the row grows from 0fr to 1fr.
        <div
          ref={subRef}
          id={subId}
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="min-h-0 overflow-hidden">
            {/* A guide line down the left shows where the submenu belongs. */}
            <ul role="list" className={cn("ms-[1.3rem] mt-0.5 grid gap-0.5 border-s border-border ps-2", depth > 0 && "ms-3")}>
              {item.children!.map((child, i) => (
                <NavItem key={keyOf(child, i)} item={child} depth={depth + 1} activeHref={activeHref} />
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
}

/* ---------- Icon rail + flyout ---------- */

function RailItem({ item, activeHref }: { item: SidebarNavItem; activeHref?: string }) {
  const { side } = useSidebar();
  const hasChildren = !!item.children?.length;
  const active = !!activeHref && (item.href === activeHref || (hasChildren && containsActive(item, activeHref, false)));
  const [open, setOpen] = React.useState(false);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const flyRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<React.CSSProperties>({});
  const flyId = React.useId();

  const icon = item.icon ? renderIcon(item.icon) : (
    <span aria-hidden="true" className="grid size-6 place-items-center rounded-control-sm bg-secondary-hover text-xs font-semibold">
      {item.label.slice(0, 1).toUpperCase()}
    </span>
  );
  const cls = cn(rowBase, "size-10 justify-center px-0", active && rowActive);

  React.useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const top = Math.max(8, Math.min(r.top - 4, window.innerHeight - 320));
    setPos(side === "left" ? { position: "fixed", top, left: r.right + 10 } : { position: "fixed", top, right: window.innerWidth - r.left + 10 });
  }, [open, side]);

  React.useEffect(() => {
    if (!open) return;
    flyRef.current?.querySelector<HTMLElement>("a[href], button")?.focus();
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!flyRef.current?.contains(t) && !btnRef.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!hasChildren) {
    return (
      <li>
        <ItemLink item={item} active={!!activeHref && item.href === activeHref} className={cls} aria-label={item.label} title={item.label}>
          {icon}
        </ItemLink>
      </li>
    );
  }
  return (
    <li className="relative">
      <button
        ref={btnRef}
        type="button"
        aria-label={item.label}
        title={item.label}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? flyId : undefined}
        onClick={() => setOpen((o) => !o)}
        className={cn(cls, open && "bg-secondary-hover text-fg")}
      >
        {icon}
      </button>
      {open && (
        <div
          ref={flyRef}
          id={flyId}
          style={pos}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a[href]")) setOpen(false);
          }}
          className="z-[60] w-60 rounded-control-lg border border-border bg-surface p-2 shadow-[var(--ui-shadow-lg)] animate-[ui-menu-down_140ms_cubic-bezier(0.2,0.9,0.3,1)]"
        >
          <p className="px-3 pb-1.5 pt-1 text-xs font-medium text-fg-muted">{item.label}</p>
          {/* The flyout shows the full submenu tree, expanded style. */}
          <RailFlyoutMenu items={item.children!} activeHref={activeHref} />
        </div>
      )}
    </li>
  );
}

function RailFlyoutMenu({ items, activeHref }: { items: SidebarNavItem[]; activeHref?: string }) {
  // Render expanded rows even though the sidebar is a rail.
  const ctx = useSidebar();
  const expandedCtx = React.useMemo(() => ({ ...ctx, collapsed: false }), [ctx]);
  return (
    <SidebarContext.Provider value={expandedCtx}>
      <ul role="list" className="grid gap-0.5">
        {items.map((it, i) => (
          <NavItem key={keyOf(it, i)} item={it} depth={0} activeHref={activeHref} />
        ))}
      </ul>
    </SidebarContext.Provider>
  );
}
