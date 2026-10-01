import * as React from "react";
import {
  Button,
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
  useDrawer,
  NavigationMenu,
  Checkbox,
  Field,
  Select,
  Text,
} from "@astherix/ui";
import { PageHeader, Section } from "../components/Doc";
import { DemoLink, DemoRoutes, useDemoRoute } from "../components/DemoLink";

/* ---------- demos ---------- */

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: "bi bi-grid" },
  { label: "Invoices", href: "/invoices", icon: "bi bi-receipt" },
  {
    label: "Reports",
    icon: "bi bi-bar-chart",
    children: [
      { label: "Sales", href: "/reports/sales" },
      { label: "Aging", href: "/reports/aging" },
    ],
  },
  { label: "Clients", href: "/clients", icon: "bi bi-people" },
];

function NavigationDemo() {
  return (
    <DemoRoutes initial="/dashboard">
      <NavigationDrawer />
    </DemoRoutes>
  );
}

function NavigationDrawer() {
  const menu = useDrawer();
  const { path } = useDemoRoute();
  return (
    <div className="grid gap-3">
    <Drawer {...menu.drawerProps}>
      <DrawerTrigger asChild>
        <Button variant="secondary" leadingIcon="bi bi-list">Open menu</Button>
      </DrawerTrigger>
      <DrawerContent side="left" size="sm">
        <DrawerHeader>
          <DrawerTitle>Northwind Billing</DrawerTitle>
        </DrawerHeader>
        <DrawerBody className="px-3">
          <NavigationMenu orientation="vertical" items={nav} activeHref={path} linkComponent={DemoLink} onNavigate={menu.close} />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
    <Text size="sm" tone="muted" role="status">Current page: {path}</Text>
    </div>
  );
}

function FiltersDemo() {
  const [applied, setApplied] = React.useState("All invoices");
  const [status, setStatus] = React.useState<string | null>("overdue");
  const [mine, setMine] = React.useState(false);
  return (
    <div className="grid gap-3">
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="secondary" leadingIcon="bi bi-funnel">Filters</Button>
        </DrawerTrigger>
        <DrawerContent side="right">
          <DrawerHeader>
            <DrawerTitle>Filter invoices</DrawerTitle>
            <DrawerDescription>Only the invoices that match are listed.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="grid content-start gap-5">
            <Field label="Status">
              <Select
                value={status}
                onChange={(v) => setStatus(v)}
                options={[
                  { value: "draft", label: "Draft" },
                  { value: "sent", label: "Sent" },
                  { value: "overdue", label: "Overdue" },
                  { value: "paid", label: "Paid" },
                ]}
              />
            </Field>
            <Checkbox label="Only clients I manage" checked={mine} onCheckedChange={setMine} />
          </DrawerBody>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DrawerClose>
            <DrawerClose asChild>
              <Button onClick={() => setApplied(`${status ?? "Any"} status${mine ? ", my clients" : ""}`)}>Show results</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <Text size="sm" tone="muted" role="status">Showing: {applied}</Text>
    </div>
  );
}

function BottomDemo() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="secondary" leadingIcon="bi bi-share">Share invoice</Button>
      </DrawerTrigger>
      <DrawerContent side="bottom" size="sm">
        <DrawerHeader>
          <DrawerTitle>Share INV-1047</DrawerTitle>
        </DrawerHeader>
        <DrawerBody className="grid gap-2 pb-6 sm:grid-cols-3">
          <DrawerClose asChild><Button variant="secondary" leadingIcon="bi bi-envelope">Email</Button></DrawerClose>
          <DrawerClose asChild><Button variant="secondary" leadingIcon="bi bi-link-45deg">Copy link</Button></DrawerClose>
          <DrawerClose asChild><Button variant="secondary" leadingIcon="bi bi-download">Download PDF</Button></DrawerClose>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

/* ---------- page ---------- */

export function DrawerPage() {
  return (
    <>
      <PageHeader
        title="Drawer"
        intro="A panel that slides in from an edge of the screen — the menu on phones, filters, a record's details. It works like a Modal: the page behind can't be reached, Escape and the backdrop close it, and focus returns to the button that opened it."
        importLine={`import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerBody } from "@astherix/ui";`}
      />

      <Section
        title="Navigation on phones"
        desc={<>Pair it with a vertical NavigationMenu for a header layout's menu on small screens. Pass <code>onNavigate</code> so following a link closes the drawer.</>}
        code={`
const menu = useDrawer();

<Drawer {...menu.drawerProps}>
  <DrawerTrigger asChild>
    <Button variant="ghost" iconOnly icon="bi bi-list" aria-label="Open menu" />
  </DrawerTrigger>
  <DrawerContent side="left" size="sm">
    <DrawerHeader><DrawerTitle>Northwind Billing</DrawerTitle></DrawerHeader>
    <DrawerBody className="px-3">
      <NavigationMenu orientation="vertical" items={nav} activeHref={url}
        linkComponent={Link} onNavigate={menu.close} />
    </DrawerBody>
  </DrawerContent>
</Drawer>`}
      >
        <NavigationDemo />
      </Section>

      <Section
        title="Filters and forms"
        desc="From the right (the default) for filters or a record's details. DrawerFooter stays at the bottom however short the content is."
        code={`
<Drawer>
  <DrawerTrigger asChild><Button variant="secondary" leadingIcon="bi bi-funnel">Filters</Button></DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Filter invoices</DrawerTitle>
      <DrawerDescription>Only the invoices that match are listed.</DrawerDescription>
    </DrawerHeader>
    <DrawerBody>…</DrawerBody>
    <DrawerFooter>
      <DrawerClose asChild><Button variant="ghost">Cancel</Button></DrawerClose>
      <DrawerClose asChild><Button onClick={apply}>Show results</Button></DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>`}
      >
        <FiltersDemo />
      </Section>

      <Section
        title="From the bottom"
        desc={<>A sheet of choices that suits phones. <code>side="bottom"</code> rounds its top corners; <code>size</code> sets how far it reaches (height here, width for left and right).</>}
        code={`
<DrawerContent side="bottom" size="sm">…</DrawerContent>

// side: "left" | "right" (default) | "top" | "bottom"
// size: "sm" | "md" (default) | "lg"`}
      >
        <BottomDemo />
      </Section>

      <Section
        title="Accessibility"
        desc="Built on the same native dialog as Modal, so the behaviour is the same."
        code={`
// Open from code
const details = useDrawer();      // { isOpen, open, close, toggle, drawerProps }
<Drawer {...details.drawerProps}>…</Drawer>

// Without a visible title, label it yourself:
<DrawerContent aria-label="Menu">…</DrawerContent>

// Keep it open while saving:
<DrawerContent dismissible={false}>…</DrawerContent>`}
      >
        <ul className="grid gap-1.5 text-sm text-fg-muted">
          <li>Escape and a press on the backdrop close it (unless it's not dismissible).</li>
          <li>Focus moves in on open and back to the opener on close; Tab stays inside.</li>
          <li>The page doesn't scroll behind it.</li>
          <li>With reduced motion on, it fades instead of sliding.</li>
        </ul>
      </Section>
    </>
  );
}
