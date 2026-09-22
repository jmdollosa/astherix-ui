import * as React from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarTrigger,
  SidebarInset,
  SidebarNav,
  useSidebar,
  type SidebarNavItem,
  Pill,
  Avatar,
  Button,
  Card,
  CardContent,
  Stat,
  StatGroup,
  Text,
  PillGroup,
  PillOption,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@jm/ui";
import { PageHeader, Section } from "../components/Doc";

const workspace: SidebarNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "bi bi-grid-1x2" },
  {
    label: "Invoices",
    icon: "bi bi-receipt",
    children: [
      { label: "All invoices", href: "/invoices", badge: <Pill size="sm">47</Pill> },
      { label: "Drafts", href: "/invoices/drafts" },
      {
        label: "Recurring",
        children: [
          { label: "Monthly", href: "/invoices/recurring/monthly" },
          { label: "Yearly", href: "/invoices/recurring/yearly" },
          {
            label: "Templates",
            children: [
              { label: "Retainer", href: "/invoices/recurring/templates/retainer" },
              { label: "Subscription", href: "/invoices/recurring/templates/subscription" },
            ],
          },
        ],
      },
    ],
  },
  { label: "Clients", href: "/clients", icon: "bi bi-people" },
  { label: "Payments", href: "/payments", icon: "bi bi-credit-card", badge: <Pill size="sm" tone="danger">3</Pill> },
];

const reports: SidebarNavItem[] = [
  {
    label: "Sales",
    icon: "bi bi-graph-up",
    children: [
      { label: "Revenue", href: "/reports/revenue" },
      { label: "By client", href: "/reports/by-client" },
    ],
  },
  { label: "Taxes", href: "/reports/taxes", icon: "bi bi-bank" },
];

const more: SidebarNavItem[] = [
  { label: "Settings", href: "/settings", icon: "bi bi-gear" },
  { label: "Help center", href: "https://example.com/help", icon: "bi bi-question-circle", external: true },
];

const titles: Record<string, string> = {};
const collect = (items: SidebarNavItem[]) => items.forEach((i) => (i.href && (titles[i.href] = i.label), i.children && collect(i.children)));
[workspace, reports, more].forEach(collect);

function Brand() {
  const { mode, collapsed } = useSidebar();
  const rail = mode === "desktop" && collapsed;
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-control bg-primary text-sm font-bold text-primary-fg shadow-[inset_0_-2px_0_var(--color-primary-edge)]">A</span>
      {!rail && (
        <span className="grid min-w-0 leading-tight">
          <span className="truncate text-sm font-semibold">Astherix Billing</span>
          <span className="truncate text-xs text-fg-muted">Team workspace</span>
        </span>
      )}
    </div>
  );
}

function Account() {
  const { mode, collapsed } = useSidebar();
  const rail = mode === "desktop" && collapsed;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={
          rail
            ? "grid cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-ring"
            : "flex w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-control p-1.5 text-start hover:bg-secondary-hover focus-visible:outline-2 focus-visible:outline-ring"
        }
        aria-label="Account menu"
      >
        <Avatar name="JM" size="sm" status="online" decorative />
        {!rail && (
          <>
            <span className="grid min-w-0 flex-1 leading-tight">
              <span className="truncate text-sm font-medium">JM</span>
              <span className="truncate text-xs text-fg-muted">jm@example.com</span>
            </span>
            <i className="bi bi-chevron-expand text-fg-muted" aria-hidden="true" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start">
        <DropdownMenuItem icon="bi bi-person">Profile</DropdownMenuItem>
        <DropdownMenuItem icon="bi bi-credit-card">Billing</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon="bi bi-box-arrow-right">Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DashboardDemo() {
  const [path, setPath] = React.useState("/invoices/recurring/monthly");
  const [side, setSide] = React.useState<string | null>("left");
  const [screen, setScreen] = React.useState<string | null>("desktop");
  const widths: Record<string, string> = { desktop: "100%", tablet: "720px", phone: "390px" };

  // In a real app this is your router's Link. Here it just changes the "page".
  const DemoLink = React.useMemo(
    () =>
      React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(({ href = "", onClick, ...rest }, ref) => (
        <a
          ref={ref}
          href={href}
          onClick={(e) => {
            e.preventDefault();
            onClick?.(e);
            setPath(href);
          }}
          {...rest}
        />
      )),
    []
  );

  return (
    <div className="grid w-full gap-4">
      <div className="flex flex-wrap gap-3">
        <PillGroup value={screen} onValueChange={setScreen} size="sm" aria-label="Screen size">
          <PillOption value="desktop" icon="bi bi-display">Desktop</PillOption>
          <PillOption value="tablet" icon="bi bi-tablet">Tablet</PillOption>
          <PillOption value="phone" icon="bi bi-phone">Phone</PillOption>
        </PillGroup>
        <PillGroup value={side} onValueChange={setSide} size="sm" aria-label="Sidebar side">
          <PillOption value="left">Left</PillOption>
          <PillOption value="right">Right</PillOption>
        </PillGroup>
      </div>
      <div className="w-full overflow-x-auto">
        <div
          className="mx-auto h-[36rem] overflow-hidden rounded-card border border-border shadow-[var(--ui-shadow-md)] transition-[width] duration-300"
          style={{ width: widths[screen ?? "desktop"], maxWidth: "100%" }}
        >
          <SidebarProvider
            contained
            side={(side ?? "left") as "left"}
            linkComponent={DemoLink}
            shortcut={false}
            // Break points scaled to this demo frame (your app would use the defaults: 768 / 1024).
            drawerBelow={600}
            railBelow={800}
          >
            <Sidebar aria-label="Main">
              <SidebarHeader>
                <Brand />
              </SidebarHeader>
              <SidebarContent>
                <SidebarGroup label="Workspace">
                  <SidebarNav items={workspace} activeHref={path} aria-label="Workspace" />
                </SidebarGroup>
                <SidebarGroup label="Reports">
                  <SidebarNav items={reports} activeHref={path} aria-label="Reports" />
                </SidebarGroup>
                <SidebarGroup label="More">
                  <SidebarNav items={more} activeHref={path} aria-label="More" />
                </SidebarGroup>
              </SidebarContent>
              <SidebarFooter>
                <Account />
              </SidebarFooter>
            </Sidebar>
            <SidebarInset>
              <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-bg/85 px-3 backdrop-blur">
                <SidebarTrigger />
                <span aria-hidden="true" className="h-5 w-px bg-border" />
                <p className="truncate text-sm font-medium">{titles[path] ?? "Dashboard"}</p>
                <Button size="sm" className="ms-auto" leadingIcon="bi bi-plus-lg">New</Button>
              </header>
              <main className="grid content-start gap-4 p-4">
                <p className="text-xs text-fg-muted">Page: <code className="font-mono">{path}</code></p>
                <Card>
                  <CardContent>
                    <StatGroup columns={3}>
                      <Stat label="Paid this month" value="₱312,400" change="8.2%" trend="up" />
                      <Stat label="Outstanding" value="₱86,400" change="4.1%" trend="down" invertTrend />
                      <Stat label="Clients" value="38" />
                    </StatGroup>
                  </CardContent>
                </Card>
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="h-16 rounded-card border border-dashed border-border" />
                ))}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </div>
    </div>
  );
}

export function SidebarPage() {
  return (
    <>
      <PageHeader
        title="Sidebar"
        intro="The dashboard navigation panel. On wide screens it's a full sidebar that collapses to an icon rail; on phones it slides in as a drawer. Menus nest to any depth, it can sit on the left or right, and it works with your router's links."
        importLine={`import {
  SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter,
  SidebarGroup, SidebarNav, SidebarTrigger, SidebarInset, useSidebar,
} from "@jm/ui";`}
      />

      <Section
        wide
        title="Try it"
        desc="Press the panel button at the top of the demo to collapse or expand it. Switch to Tablet to start with the icon rail — click Invoices there to see its submenu as a flyout. Switch to Phone and the sidebar becomes a drawer. The Recurring submenu is open because the current page is inside it."
        code={`
const nav = [
  { label: "Dashboard", href: "/dashboard", icon: "bi bi-grid-1x2" },
  {
    label: "Invoices", icon: "bi bi-receipt",
    children: [
      { label: "All invoices", href: "/invoices", badge: <Pill size="sm">47</Pill> },
      { label: "Drafts", href: "/invoices/drafts" },
      {
        label: "Recurring",
        children: [
          { label: "Monthly", href: "/invoices/recurring/monthly" },
          { label: "Templates", children: [ … ] },      // as deep as you need
        ],
      },
    ],
  },
  { label: "Payments", href: "/payments", icon: "bi bi-credit-card", badge: <Pill size="sm" tone="danger">3</Pill> },
];

<SidebarProvider side="left">
  <Sidebar>
    <SidebarHeader><Logo /></SidebarHeader>
    <SidebarContent>
      <SidebarGroup label="Workspace">
        <SidebarNav items={nav} activeHref={pathname} />
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter><AccountMenu /></SidebarFooter>
  </Sidebar>
  <SidebarInset>
    <header><SidebarTrigger /> …</header>
    <main>…</main>
  </SidebarInset>
</SidebarProvider>`}
      >
        <DashboardDemo />
      </Section>

      <Section
        title="How it adapts"
        desc="It chooses by the layout's own width, so it also behaves inside a smaller area. Change the break points to suit your app."
        code={`
<SidebarProvider
  drawerBelow={768}        // narrower than this: a drawer over the page
  railBelow={1024}         // up to this: start as an icon rail
  defaultCollapsed={false} // wide screens: start expanded
  persistKey="sidebar"     // remember the person's choice in this browser
  shortcut="b"             // Ctrl/⌘ + B toggles it (false to turn off)
>`}
      >
        <ul className="grid gap-1.5 text-sm text-fg-muted">
          <li><span className="font-medium text-fg">Wide:</span> full sidebar; the button collapses it to icons. Labels show as tooltips.</li>
          <li><span className="font-medium text-fg">Icon rail:</span> items with submenus open a flyout with the whole tree.</li>
          <li><span className="font-medium text-fg">Phone:</span> hidden until the button slides it in. The page behind dims, can't be scrolled, and Escape or tapping outside closes it. Picking a page closes it too.</li>
        </ul>
      </Section>

      <Section
        title="With your router"
        desc="Pass your framework's Link so menu items navigate without a full page load, and the current path so the right item is highlighted and its parents open. Deeper pages (like /invoices/1047) highlight their section."
        code={`
// Next.js (app/(dashboard)/layout.tsx — a client component)
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

<SidebarProvider linkComponent={Link} persistKey="sidebar">
  … <SidebarNav items={nav} activeHref={usePathname()} /> …
</SidebarProvider>

// Laravel + Inertia (resources/js/Layouts/AppLayout.tsx)
import { Link, usePage } from "@inertiajs/react";

<SidebarProvider linkComponent={Link} persistKey="sidebar">
  … <SidebarNav items={nav} activeHref={usePage().url.split("?")[0]} /> …
</SidebarProvider>`}
      >
        <Text size="sm" tone="muted">Items can also be actions instead of links: give them onSelect instead of href (for example “Invite people”).</Text>
      </Section>

      <Section
        title="Your own parts"
        desc="The header, footer and groups take any content. useSidebar tells your components which layout is showing, so a logo can hide its name in the icon rail."
        code={`
function Logo() {
  const { mode, collapsed } = useSidebar();       // mode: "desktop" | "drawer"
  const rail = mode === "desktop" && collapsed;
  return <>{icon}{!rail && <span>Astherix Billing</span>}</>;
}

<SidebarGroup label="Projects" action={<Button size="sm" variant="ghost" iconOnly icon="bi bi-plus" aria-label="New project" />}>
  …
</SidebarGroup>

// Open or close it from anywhere inside the provider
const { toggle, setCollapsed, setDrawerOpen } = useSidebar();`}
      >
        <Text size="sm" tone="muted">
          Accessibility: the panel is a labelled landmark, submenus are buttons that announce open or closed, the current
          page is marked, closed submenus and the closed drawer are skipped by Tab, and focus returns to the toggle button
          when the drawer closes.
        </Text>
      </Section>
    </>
  );
}
