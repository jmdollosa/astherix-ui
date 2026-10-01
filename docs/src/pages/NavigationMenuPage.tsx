import * as React from "react";
import { NavigationMenu, Pill, Text, type NavigationMenuItem } from "@astherix/ui";
import { PageHeader, Section } from "../components/Doc";
import { DemoLink, DemoRoutes, useDemoRoute } from "../components/DemoLink";

const simple: NavigationMenuItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "bi bi-grid" },
  { label: "Invoices", href: "/invoices", icon: "bi bi-receipt" },
  { label: "Clients", href: "/clients", icon: "bi bi-people" },
  { label: "Docs", href: "https://example.com/docs", external: true },
];

const withPanels: NavigationMenuItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  {
    label: "Billing",
    children: [
      { label: "Invoices", href: "/invoices", icon: "bi bi-receipt", description: "Create, send and track invoices" },
      { label: "Recurring", href: "/invoices/recurring", icon: "bi bi-arrow-repeat", description: "Bill retainers on a schedule" },
      { label: "Payments", href: "/payments", icon: "bi bi-credit-card", description: "Card, GCash and bank transfers" },
    ],
  },
  {
    label: "Reports",
    badge: <Pill size="sm" tone="primary">New</Pill>,
    children: [
      { label: "Sales", href: "/reports/sales", icon: "bi bi-graph-up", description: "Revenue by month and client" },
      { label: "Aging", href: "/reports/aging", icon: "bi bi-hourglass-split", description: "Who owes what, and for how long" },
      { label: "Tax", href: "/reports/tax", icon: "bi bi-bank", description: "VAT and withholding summaries" },
      { label: "Expenses", href: "/reports/expenses", icon: "bi bi-wallet2", description: "Spending by category" },
      { label: "Export", href: "/reports/export", icon: "bi bi-download", description: "CSV and Excel downloads" },
    ],
  },
  { label: "Clients", href: "/clients" },
];

function Current() {
  const { path } = useDemoRoute();
  return <Text size="sm" tone="muted" role="status">Current page: {path}</Text>;
}

function Bar({ items, indicator }: { items: NavigationMenuItem[]; indicator?: "pill" | "underline" }) {
  const { path } = useDemoRoute();
  return (
    <div className="grid w-full gap-3">
      <div className="flex h-14 w-full items-center gap-4 rounded-card border border-border bg-surface px-4">
        <span className="font-semibold">Northwind</span>
        <NavigationMenu
          items={items}
          activeHref={path}
          linkComponent={DemoLink}
          indicator={indicator}
          className={indicator === "underline" ? "h-full" : undefined}
        />
      </div>
      <Current />
    </div>
  );
}

function VerticalDemo() {
  const { path } = useDemoRoute();
  return (
    <div className="grid w-full gap-3">
      <div className="w-64 rounded-card border border-border bg-surface p-2">
        <NavigationMenu orientation="vertical" items={withPanels} activeHref={path} linkComponent={DemoLink} />
      </div>
      <Current />
    </div>
  );
}

export function NavigationMenuPage() {
  return (
    <>
      <PageHeader
        title="Navigation menu"
        intro="A site's main links for the top of the page, from data. Items can open a panel of links with descriptions. The same items work vertically, in a Drawer on phones."
        importLine={`import { NavigationMenu } from "@astherix/ui";`}
      />

      <Section
        title="Links"
        desc={<>Pass the current path as <code>activeHref</code>; the most specific match is highlighted, so <code>/invoices/1047</code> lights up Invoices. External links open in a new tab.</>}
        code={`
import { Link, usePage } from "@inertiajs/react";   // or next/link + usePathname()

<NavigationMenu
  linkComponent={Link}
  activeHref={usePage().url}
  items={[
    { label: "Dashboard", href: "/dashboard", icon: <LayoutGrid /> },
    { label: "Invoices", href: "/invoices", icon: "bi bi-receipt" },
    { label: "Clients", href: "/clients", icon: "bi bi-people" },
    { label: "Docs", href: "https://example.com/docs", external: true },
  ]}
/>`}
      >
        <DemoRoutes initial="/dashboard">
          <Bar items={simple} />
        </DemoRoutes>
      </Section>

      <Section
        title="Panels"
        desc="Give an item children and it opens a panel of links — on click, on ↓, or on hover with a mouse. Descriptions explain where each goes; long panels split into two columns."
        code={`
{
  label: "Reports",
  badge: <Pill size="sm" tone="primary">New</Pill>,
  children: [
    { label: "Sales", href: "/reports/sales", icon: "bi bi-graph-up",
      description: "Revenue by month and client" },
    { label: "Aging", href: "/reports/aging", icon: "bi bi-hourglass-split",
      description: "Who owes what, and for how long" },
  ],
}`}
      >
        <DemoRoutes initial="/reports/sales">
          <Bar items={withPanels} />
        </DemoRoutes>
      </Section>

      <Section
        title="Underline indicator"
        desc={<>A line under the current item instead of a background. Give the menu the header's height (<code>className="h-full"</code>) so the line sits on the header's bottom edge.</>}
        code={`
<header className="flex h-16 items-center border-b border-border">
  <NavigationMenu indicator="underline" className="h-full" items={items} activeHref={url} />
</header>`}
      >
        <DemoRoutes initial="/invoices">
          <Bar items={simple} indicator="underline" />
        </DemoRoutes>
      </Section>

      <Section
        title="Vertical"
        desc={<>The same items as a list: panels open in place, and the one holding the current page starts open. Use it in a Drawer for phones, with <code>onNavigate</code> to close the drawer.</>}
        code={`
<NavigationMenu orientation="vertical" items={items} activeHref={url}
  linkComponent={Link} onNavigate={drawer.close} />`}
      >
        <DemoRoutes initial="/payments">
          <VerticalDemo />
        </DemoRoutes>
      </Section>

      <Section
        title="Accessibility"
        desc="It follows the disclosure pattern recommended for site navigation, not an application menu: links stay links, and buttons show and hide each panel."
        code={`
// aria-label names the landmark. Default "Main"; give each menu its own if a page has several.
<NavigationMenu aria-label="Account" … />`}
      >
        <ul className="grid gap-1.5 text-sm text-fg-muted">
          <li>Tab moves through the top-level items; ← → and Home / End also move between them.</li>
          <li>Enter, Space or ↓ opens a panel; ↑ ↓ move inside it; Escape closes it and returns focus.</li>
          <li>A panel closes when focus or a press goes elsewhere.</li>
          <li>The current page is marked with aria-current="page".</li>
        </ul>
      </Section>
    </>
  );
}
