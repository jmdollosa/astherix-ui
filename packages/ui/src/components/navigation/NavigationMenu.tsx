import * as React from "react";
import { cn } from "../../lib/cn";
import { renderIcon, type IconInput } from "../button/Button";

/*
 * NavigationMenu — a site's main links, from data, for the top of a page. Items with
 * `children` open a panel of links (with optional descriptions), like a product menu.
 *
 *   <NavigationMenu linkComponent={Link} activeHref={url} items={[
 *     { label: "Dashboard", href: "/dashboard", icon: <LayoutGrid /> },
 *     { label: "Reports", children: [
 *       { label: "Sales", href: "/reports/sales", description: "Revenue by month and client" },
 *       { label: "Aging", href: "/reports/aging", description: "Who owes what, and for how long" },
 *     ] },
 *   ]} />
 *
 * Horizontal (default) for a header bar; vertical for the same links in a Drawer on
 * phones, where panels open in place instead. It follows the disclosure pattern
 * recommended for site navigation: real links in the Tab order, buttons that show and
 * hide each panel (Enter, Space, ↓), Escape to close, ← → between top-level items.
 * On devices with a mouse, panels also open on hover.
 */

export interface NavigationMenuItem {
  label: string;
  /** Where it goes. Items with children don't need one (they open their panel). */
  href?: string;
  icon?: IconInput;
  /** A line under the label — shown in panels. */
  description?: React.ReactNode;
  /** Something after the label, e.g. <Pill size="sm">New</Pill>. */
  badge?: React.ReactNode;
  /** A panel of links. One level deep. */
  children?: NavigationMenuItem[];
  /** Open in a new tab. */
  external?: boolean;
  /** Stable key if labels repeat. */
  id?: string;
}

export interface NavigationMenuProps {
  items: NavigationMenuItem[];
  /** The current page's path. Its item (or the item whose panel holds it) is highlighted. */
  activeHref?: string;
  /** Also treat an item as active when the path starts with its href (e.g. /invoices/1047). Default true. */
  matchNested?: boolean;
  /** "horizontal" (default) for a header; "vertical" for a drawer or a side column. */
  orientation?: "horizontal" | "vertical";
  /**
   * How the current page shows in a horizontal menu: "pill" (a soft background, default)
   * or "underline" (a line along the bottom — give the menu the header's height with
   * className="h-full" so the line sits on the header's edge).
   */
  indicator?: "pill" | "underline";
  /** The link component — e.g. Next.js `Link` or Inertia's `Link`. Default <a>. */
  linkComponent?: React.ElementType;
  /** Called after a link is followed — e.g. close the Drawer the menu sits in. */
  onNavigate?: (href: string) => void;
  "aria-label"?: string;
  className?: string;
}

const keyOf = (item: NavigationMenuItem, i: number) => item.id ?? `${item.label}-${i}`;

function matches(href: string | undefined, active: string | undefined, nested: boolean) {
  if (!href || !active) return false;
  if (href === active) return true;
  return nested && href !== "/" && active.startsWith(href.endsWith("/") ? href : `${href}/`);
}

/** The single most specific match, so "/reports" isn't lit alongside "/reports/sales". */
function bestMatch(items: NavigationMenuItem[], active: string | undefined, nested: boolean) {
  let found: string | undefined;
  const walk = (list: NavigationMenuItem[]) =>
    list.forEach((it) => {
      if (matches(it.href, active, nested) && (!found || (it.href?.length ?? 0) > found.length)) found = it.href;
      if (it.children) walk(it.children);
    });
  walk(items);
  return found;
}

const ExternalIcon = () => (
  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" aria-hidden="true" className="size-3 shrink-0 opacity-60">
    <path d="M4 2.5h5.5V8M9.5 2.5L3 9" />
  </svg>
);

const Chevron = ({ open, vertical }: { open: boolean; vertical: boolean }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={cn(
      "size-3.5 shrink-0 opacity-70 transition-transform duration-200 motion-reduce:transition-none",
      open && (vertical ? "rotate-90" : "rotate-180"),
      vertical && !open && "rtl:-scale-x-100"
    )}
  >
    <path d={vertical ? "M6 3.5l4.5 4.5L6 12.5" : "M3.5 6l4.5 4.5L12.5 6"} />
  </svg>
);

type Ctx = {
  linkComponent: React.ElementType;
  best?: string;
  onNavigate?: (href: string) => void;
  close: () => void;
};

function ItemLink({
  item,
  ctx,
  className,
  children,
  ...rest
}: { item: NavigationMenuItem; ctx: Ctx; className?: string; children: React.ReactNode } & Record<string, unknown>) {
  const Comp = item.external ? "a" : ctx.linkComponent;
  const active = !!item.href && item.href === ctx.best;
  return (
    <Comp
      href={item.href}
      aria-current={active ? "page" : undefined}
      data-active={active || undefined}
      {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={className}
      onClick={() => {
        ctx.close();
        if (item.href) ctx.onNavigate?.(item.href);
      }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

const focusRing = "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function NavigationMenu({
  items,
  activeHref,
  matchNested = true,
  orientation = "horizontal",
  indicator = "pill",
  linkComponent = "a",
  onNavigate,
  "aria-label": ariaLabel = "Main",
  className,
}: NavigationMenuProps) {
  const vertical = orientation === "vertical";
  const best = React.useMemo(() => bestMatch(items, activeHref, matchNested), [items, activeHref, matchNested]);
  const [openKey, setOpenKey] = React.useState<string | null>(null);
  const navRef = React.useRef<HTMLElement>(null);
  const hoverTimer = React.useRef(0);
  const focusFirstLink = React.useRef(false);
  const id = React.useId();

  const ctx: Ctx = { linkComponent, best, onNavigate, close: () => !vertical && setOpenKey(null) };

  // Horizontal panels close on a press outside and when focus leaves the menu.
  React.useEffect(() => {
    if (vertical || openKey === null) return;
    const onDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenKey(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [vertical, openKey]);
  React.useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  // ↓ on an item opens its panel and moves into it, once the panel is shown.
  React.useEffect(() => {
    if (!focusFirstLink.current || openKey === null) return;
    focusFirstLink.current = false;
    document.getElementById(`${id}-${openKey}`)?.querySelector<HTMLElement>("a,button")?.focus();
  }, [openKey, id]);

  // Keep an open panel on screen: it starts under its item and shifts in from the edge.
  React.useLayoutEffect(() => {
    if (vertical || openKey === null) return;
    const panel = document.getElementById(`${id}-${openKey}`);
    if (!panel) return;
    const fit = () => {
      panel.style.translate = "";
      const r = panel.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      let shift = 0;
      if (r.right > vw - 8) shift = vw - 8 - r.right;
      if (r.left + shift < 8) shift = 8 - r.left;
      if (shift) panel.style.translate = `${shift}px 0`;
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [vertical, openKey, id]);

  const triggers = () => Array.from(navRef.current?.querySelectorAll<HTMLElement>("[data-nav-top]") ?? []);

  const onTopKeyDown = (e: React.KeyboardEvent<HTMLElement>, key: string, hasPanel: boolean) => {
    if (vertical) return;
    const list = triggers();
    const i = list.indexOf(e.currentTarget);
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const next = rtl ? "ArrowLeft" : "ArrowRight";
    const prev = rtl ? "ArrowRight" : "ArrowLeft";
    if (e.key === "Escape" && openKey !== null) {
      e.preventDefault();
      setOpenKey(null);
    } else if (e.key === next || e.key === prev) {
      e.preventDefault();
      const target = list[(i + (e.key === next ? 1 : -1) + list.length) % list.length];
      target?.focus();
      if (openKey !== null) setOpenKey(null);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      list[e.key === "Home" ? 0 : list.length - 1]?.focus();
    } else if (e.key === "ArrowDown" && hasPanel) {
      e.preventDefault();
      if (openKey === key) {
        document.getElementById(`${id}-${key}`)?.querySelector<HTMLElement>("a,button")?.focus();
      } else {
        focusFirstLink.current = true;
        setOpenKey(key);
      }
    }
  };

  const onPanelKeyDown = (e: React.KeyboardEvent<HTMLElement>, key: string) => {
    const links = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("a,button"));
    const i = links.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setOpenKey(null);
      navRef.current?.querySelector<HTMLElement>(`[data-nav-key="${CSS.escape(key)}"]`)?.focus();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      links[(i + (e.key === "ArrowDown" ? 1 : -1) + links.length) % links.length]?.focus();
    }
  };

  // Mouse hover opens a panel (with a short delay so passing over doesn't flash it).
  const hoverOpen = (key: string | null, e: React.PointerEvent) => {
    if (vertical || e.pointerType !== "mouse") return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpenKey(key), key === null ? 220 : openKey === null ? 120 : 0);
  };

  const topItemClass = cn(
    "relative inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-control px-3 text-sm font-medium text-fg-muted transition-colors duration-100",
    "hover:text-fg [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
    focusRing,
    indicator === "pill"
      ? "hover:bg-secondary-hover data-[active]:bg-secondary-hover data-[active]:text-fg"
      : "data-[active]:text-fg"
  );
  const underline = (on: boolean) =>
    indicator === "underline" && on ? (
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-fg" />
    ) : null;

  const rowClass = cn(
    "flex min-h-9 w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-control px-3 py-1.5 text-start text-sm text-fg-muted transition-colors duration-100",
    "hover:bg-secondary-hover hover:text-fg data-[active]:bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)] data-[active]:font-medium data-[active]:text-primary",
    "[&_svg:not([class*='size-'])]:size-[1.125rem] [&_svg]:shrink-0",
    focusRing
  );

  const panelLink = (child: NavigationMenuItem, j: number) =>
    vertical ? (
      // In a list, sub-links are quieter rows under their section, like SidebarNav.
      <li key={keyOf(child, j)}>
        <ItemLink item={child} ctx={ctx} className={cn(rowClass, "min-h-8 py-1")}>
          {renderIcon(child.icon)}
          <span className="min-w-0 flex-1 truncate">{child.label}</span>
          {child.badge}
          {child.external && <ExternalIcon />}
        </ItemLink>
      </li>
    ) : (
    <li key={keyOf(child, j)}>
      <ItemLink
        item={child}
        ctx={ctx}
        className={cn(
          "group/link flex min-w-0 gap-3 rounded-control p-2.5 text-sm transition-colors duration-100 hover:bg-secondary-hover",
          "data-[active]:bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)]",
          "[&_svg]:mt-0.5 [&_svg]:size-[1.125rem] [&_svg]:shrink-0 [&_svg]:text-fg-muted data-[active]:[&_svg]:text-primary",
          focusRing
        )}
      >
        {renderIcon(child.icon)}
        <span className="grid min-w-0 gap-0.5">
          <span className="flex items-center gap-1.5 font-medium text-fg group-data-[active]/link:text-primary">
            <span className="truncate">{child.label}</span>
            {child.badge}
            {child.external && <ExternalIcon />}
          </span>
          {child.description && <span className="text-[0.8125rem] leading-snug text-fg-muted">{child.description}</span>}
        </span>
      </ItemLink>
    </li>
    );

  return (
    <nav
      ref={navRef}
      aria-label={ariaLabel}
      className={cn(vertical ? "grid" : "flex items-stretch", className)}
      onBlur={(e) => {
        if (!vertical && !e.currentTarget.contains(e.relatedTarget as Node)) setOpenKey(null);
      }}
    >
      <ul role="list" className={cn(vertical ? "grid gap-0.5" : "flex items-stretch gap-1")}>
        {items.map((item, i) => {
          const key = keyOf(item, i);
          const hasPanel = !!item.children?.length;
          const holdsActive = hasPanel && item.children!.some((c) => !!c.href && c.href === best);
          const active = !!item.href && item.href === best;

          if (vertical) {
            return (
              <VerticalItem key={key} item={item} ctx={ctx} rowClass={rowClass} holdsActive={holdsActive} panelLink={panelLink} />
            );
          }

          const open = openKey === key;
          return (
            <li
              key={key}
              className="relative flex items-center"
              onPointerEnter={(e) => hasPanel && hoverOpen(key, e)}
              onPointerLeave={(e) => hasPanel && hoverOpen(null, e)}
            >
              {hasPanel ? (
                <button
                  type="button"
                  data-nav-top=""
                  data-nav-key={key}
                  data-active={holdsActive || undefined}
                  aria-expanded={open}
                  aria-controls={`${id}-${key}`}
                  onClick={() => setOpenKey(open ? null : key)}
                  onKeyDown={(e) => onTopKeyDown(e, key, true)}
                  className={topItemClass}
                >
                  {renderIcon(item.icon)}
                  {item.label}
                  {item.badge}
                  <Chevron open={open} vertical={false} />
                </button>
              ) : (
                <ItemLink item={item} ctx={ctx} data-nav-top="" onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => onTopKeyDown(e, key, false)} className={topItemClass}>
                  {renderIcon(item.icon)}
                  {item.label}
                  {item.badge}
                  {item.external && <ExternalIcon />}
                </ItemLink>
              )}
              {underline(active || holdsActive)}
              {hasPanel && (
                <div
                  id={`${id}-${key}`}
                  hidden={!open}
                  onKeyDown={(e) => onPanelKeyDown(e, key)}
                  className={cn(
                    "absolute left-0 top-full z-50 pt-2 rtl:left-auto rtl:right-0",
                    "animate-[ui-menu-down_140ms_cubic-bezier(0.2,0.9,0.3,1)] motion-reduce:animate-none"
                  )}
                >
                  <ul
                    role="list"
                    className={cn(
                      "grid w-max max-w-[min(36rem,calc(100vw-2rem))] gap-0.5 rounded-control-lg border border-border bg-surface p-1.5 shadow-[var(--ui-shadow-lg)]",
                      item.children!.length > 4 && item.children!.some((c) => c.description) ? "sm:grid-cols-2" : "min-w-56"
                    )}
                  >
                    {item.children!.map(panelLink)}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function VerticalItem({
  item,
  ctx,
  rowClass,
  holdsActive,
  panelLink,
}: {
  item: NavigationMenuItem;
  ctx: Ctx;
  rowClass: string;
  holdsActive: boolean;
  panelLink: (child: NavigationMenuItem, j: number) => React.ReactNode;
}) {
  const [open, setOpen] = React.useState(holdsActive);
  const subId = React.useId();
  const subRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (holdsActive) setOpen(true);
  }, [holdsActive]);
  // A closed section stays out of the Tab order (set directly: works on React 18 and 19).
  React.useEffect(() => {
    if (!subRef.current) return;
    if (open) subRef.current.removeAttribute("inert");
    else subRef.current.setAttribute("inert", "");
  }, [open]);

  if (!item.children?.length) {
    return (
      <li>
        <ItemLink item={item} ctx={ctx} className={rowClass}>
          {renderIcon(item.icon)}
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {item.badge}
          {item.external && <ExternalIcon />}
        </ItemLink>
      </li>
    );
  }
  return (
    <li className="grid">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={subId}
        onClick={() => setOpen((o) => !o)}
        className={cn(rowClass, holdsActive && !open && "text-fg")}
      >
        {renderIcon(item.icon)}
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        {item.badge}
        <Chevron open={open} vertical />
      </button>
      <div
        ref={subRef}
        id={subId}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <ul role="list" className="ms-4 grid gap-0.5 border-s border-border py-1 ps-2">
            {item.children.map(panelLink)}
          </ul>
        </div>
      </div>
    </li>
  );
}
