import * as React from "react";
import { cn } from "../../lib/cn";
import { renderIcon, type IconInput } from "../button/Button";

/*
 * Breadcrumbs — where this page sits: "Settings › Billing › Invoices". The last item is
 * the current page (not a link). Long trails fold their middle into "…", which opens in
 * place when pressed; long labels are cut with an ellipsis and keep their full text as
 * a tooltip.
 *
 *   <Breadcrumbs linkComponent={Link} items={[
 *     { label: "Clients", href: "/clients" },
 *     { label: "Northwind Traders", href: "/clients/7" },
 *     { label: "Invoices" },
 *   ]} />
 */

export interface BreadcrumbItem {
  label: string;
  /** Where it goes. Leave it out on the last item (the current page). */
  href?: string;
  icon?: IconInput;
}

export interface BreadcrumbsProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  items: BreadcrumbItem[];
  /** Fold the middle into "…" when there are more items than this. Default 4; 0 never folds. */
  maxItems?: number;
  /** What goes between items: "chevron" (default), "slash", or your own element. */
  separator?: "chevron" | "slash" | React.ReactNode;
  /** The link component — e.g. Next.js `Link` or Inertia's `Link`. Default <a>. */
  linkComponent?: React.ElementType;
  size?: "sm" | "md";
}

const Chevron = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-3.5 rtl:-scale-x-100">
    <path d="M6 3.5l4.5 4.5L6 12.5" />
  </svg>
);

export function Breadcrumbs({
  items,
  maxItems = 4,
  separator = "chevron",
  linkComponent: LinkC = "a",
  size = "sm",
  className,
  "aria-label": ariaLabel = "Breadcrumb",
  ...props
}: BreadcrumbsProps) {
  const [expanded, setExpanded] = React.useState(false);
  const firstHiddenRef = React.useRef<HTMLElement | null>(null);
  const fold = !expanded && maxItems > 0 && items.length > maxItems;
  // Keep the first item and the last (maxItems - 2), so the trail still starts at the top.
  const tail = Math.max(1, maxItems - 2);
  const hiddenFrom = 1;
  const hiddenTo = items.length - tail;

  // After "…" opens, move focus to the first item it revealed.
  React.useEffect(() => {
    if (expanded) firstHiddenRef.current?.focus();
  }, [expanded]);

  const sep = (
    <li role="presentation" aria-hidden="true" className="flex shrink-0 items-center text-fg-muted/70">
      {separator === "chevron" ? <Chevron /> : separator === "slash" ? <span className="px-0.5">/</span> : separator}
    </li>
  );

  const crumb = (item: BreadcrumbItem, i: number) => {
    const current = i === items.length - 1;
    const content = (
      <>
        {renderIcon(item.icon)}
        <span className="truncate">{item.label}</span>
      </>
    );
    const base =
      "inline-flex min-w-0 max-w-[16rem] items-center gap-1.5 rounded-control-sm [&_svg]:size-[1.1em] [&_svg]:shrink-0";
    return (
      <li key={`${item.label}-${i}`} className="flex min-w-0 items-center">
        {current || !item.href ? (
          <span aria-current={current ? "page" : undefined} title={item.label} className={cn(base, current ? "font-medium text-fg" : "text-fg-muted")}>
            {content}
          </span>
        ) : (
          <LinkC
            ref={i === hiddenFrom && expanded ? firstHiddenRef : undefined}
            href={item.href}
            title={item.label}
            className={cn(
              base,
              "text-fg-muted underline-offset-4 transition-colors hover:text-fg hover:underline",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            )}
          >
            {content}
          </LinkC>
        )}
      </li>
    );
  };

  const shown: React.ReactNode[] = [];
  items.forEach((item, i) => {
    if (fold && i >= hiddenFrom && i < hiddenTo) {
      if (i === hiddenFrom) {
        shown.push(sep);
        shown.push(
          <li key="more" className="flex items-center">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              aria-label={`Show ${hiddenTo - hiddenFrom} more`}
              className="grid h-6 min-w-6 cursor-pointer place-items-center rounded-control-sm px-1 text-fg-muted hover:bg-secondary-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-ring"
            >
              …
            </button>
          </li>
        );
      }
      return;
    }
    if (i > 0) shown.push(sep);
    shown.push(crumb(item, i));
  });

  return (
    <nav aria-label={ariaLabel} className={cn("min-w-0", className)} {...props}>
      <ol
        className={cn(
          "flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1",
          size === "sm" ? "text-sm" : "text-[0.9375rem]"
        )}
      >
        {shown.map((node, i) => (
          <React.Fragment key={i}>{node}</React.Fragment>
        ))}
      </ol>
    </nav>
  );
}
