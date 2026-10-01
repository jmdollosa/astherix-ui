import * as React from "react";
import { Breadcrumbs, Text } from "@astherix/ui";
import { PageHeader, Section } from "../components/Doc";
import { DemoLink, DemoRoutes, useDemoRoute } from "../components/DemoLink";

function Current() {
  const { path } = useDemoRoute();
  return <Text size="sm" tone="muted" role="status">{path ? `You followed: ${path}` : " "}</Text>;
}

export function BreadcrumbsPage() {
  return (
    <>
      <PageHeader
        title="Breadcrumbs"
        intro="Where this page sits, as a trail of links back up. The last item is the current page."
        importLine={`import { Breadcrumbs } from "@astherix/ui";`}
      />

      <Section
        title="Basic"
        desc={<>Leave <code>href</code> off the last item — it's the page you're on, marked with aria-current.</>}
        code={`
<Breadcrumbs
  linkComponent={Link}
  items={[
    { label: "Clients", href: "/clients" },
    { label: "Northwind Traders", href: "/clients/7" },
    { label: "Invoices" },
  ]}
/>`}
      >
        <DemoRoutes initial="">
          <div className="grid gap-3">
            <Breadcrumbs
              linkComponent={DemoLink}
              items={[
                { label: "Clients", href: "/clients" },
                { label: "Northwind Traders", href: "/clients/7" },
                { label: "Invoices" },
              ]}
            />
            <Current />
          </div>
        </DemoRoutes>
      </Section>

      <Section
        title="Long trails"
        desc={<>Past <code>maxItems</code> (default 4) the middle folds into "…", which opens in place. Long labels are cut short and keep their full text as a tooltip.</>}
        code={`
<Breadcrumbs maxItems={3} items={[
  { label: "Workspace", href: "/", icon: "bi bi-house" },
  { label: "Settings", href: "/settings" },
  { label: "Billing", href: "/settings/billing" },
  { label: "Payment methods", href: "/settings/billing/methods" },
  { label: "BDO Unibank corporate account ending 4821 (primary)" },
]} />`}
      >
        <DemoRoutes initial="">
          <div className="grid w-full gap-3">
            <Breadcrumbs
              maxItems={3}
              linkComponent={DemoLink}
              items={[
                { label: "Workspace", href: "/", icon: "bi bi-house" },
                { label: "Settings", href: "/settings" },
                { label: "Billing", href: "/settings/billing" },
                { label: "Payment methods", href: "/settings/billing/methods" },
                { label: "BDO Unibank corporate account ending 4821 (primary)" },
              ]}
            />
            <Current />
          </div>
        </DemoRoutes>
      </Section>

      <Section
        title="Options"
        desc="Pick the separator and size. Items can carry an icon."
        code={`
<Breadcrumbs separator="slash" size="md" items={items} />
<Breadcrumbs separator={<span>·</span>} items={items} />   // your own
<Breadcrumbs maxItems={0} items={items} />                  // never fold`}
      >
        <DemoRoutes initial="">
          <div className="grid gap-3">
            <Breadcrumbs linkComponent={DemoLink} separator="slash" size="md" items={[{ label: "Reports", href: "/reports" }, { label: "Aging" }]} />
            <Breadcrumbs linkComponent={DemoLink} separator={<span>·</span>} items={[{ label: "Home", href: "/", icon: "bi bi-house" }, { label: "Help center", href: "/help" }, { label: "Refunds" }]} />
            <Current />
          </div>
        </DemoRoutes>
      </Section>
    </>
  );
}
