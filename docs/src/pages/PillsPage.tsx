import * as React from "react";
import { Button, Pill, PillGroup, PillOption, type PillTone } from "@jm/ui";
import { PageHeader, Section } from "../components/Doc";

const tones: PillTone[] = ["neutral", "primary", "success", "warning", "danger", "info"];
const Row = ({ children }: { children: React.ReactNode }) => <div className="flex flex-wrap items-center gap-2">{children}</div>;

const invoices = [
  { no: "INV-1042", client: "Northwind Traders", amount: "₱48,200.00", status: ["Paid", "success"] },
  { no: "INV-1041", client: "Blue Harbor Café", amount: "₱12,750.00", status: ["Overdue", "danger"] },
  { no: "INV-1040", client: "Luzon Freight", amount: "₱96,000.00", status: ["Due in 3 days", "warning"] },
  { no: "INV-1039", client: "Pixel & Pine", amount: "₱8,400.00", status: ["Draft", "neutral"] },
] as const;

function RemovableDemo() {
  const initial = ["Laravel", "React", "Tailwind CSS", "MySQL", "Docker"];
  const [tags, setTags] = React.useState(initial);
  return (
    <div className="grid gap-3">
      <Row>
        {tags.map((t) => (
          <Pill key={t} size="lg" onRemove={() => setTags((ts) => ts.filter((x) => x !== t))}>
            {t}
          </Pill>
        ))}
        {tags.length === 0 && <span className="text-sm text-fg-muted">No skills added.</span>}
      </Row>
      {tags.length < initial.length && (
        <div>
          <Button size="sm" variant="ghost" onClick={() => setTags(initial)}>Restore all</Button>
        </div>
      )}
    </div>
  );
}

const projects = [
  { name: "Customer portal", category: "engineering", tags: ["web", "urgent"] },
  { name: "Brand refresh", category: "design", tags: ["brand"] },
  { name: "Mobile app beta", category: "engineering", tags: ["mobile", "urgent"] },
  { name: "Pricing page", category: "design", tags: ["web"] },
  { name: "Q4 campaign", category: "marketing", tags: ["brand", "web"] },
];

function FilterDemo() {
  const [category, setCategory] = React.useState<string | null>("all");
  const [tags, setTags] = React.useState<string[]>([]);
  const shown = projects.filter(
    (p) => (category === "all" || p.category === category) && tags.every((t) => p.tags.includes(t))
  );
  const countFor = (c: string) => projects.filter((p) => c === "all" || p.category === c).length;
  return (
    <div className="grid w-full max-w-xl gap-4">
      <PillGroup value={category} onValueChange={setCategory} aria-label="Category">
        {["all", "design", "engineering", "marketing"].map((c) => (
          <PillOption key={c} value={c} count={countFor(c)}>
            {c === "all" ? "All" : c[0].toUpperCase() + c.slice(1)}
          </PillOption>
        ))}
      </PillGroup>
      <PillGroup type="multiple" value={tags} onValueChange={setTags} size="sm" aria-label="Tags">
        <PillOption value="web" icon="bi bi-globe2">Web</PillOption>
        <PillOption value="mobile" icon="bi bi-phone">Mobile</PillOption>
        <PillOption value="brand" icon="bi bi-palette">Brand</PillOption>
        <PillOption value="urgent" icon="bi bi-lightning">Urgent</PillOption>
        <PillOption value="archived" disabled>Archived</PillOption>
      </PillGroup>
      <ul className="divide-y divide-border rounded-control border border-border bg-surface text-sm">
        {shown.map((p) => (
          <li key={p.name} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
            <span className="font-medium">{p.name}</span>
            <span className="flex gap-1.5">
              {p.tags.map((t) => (
                <Pill key={t} size="sm" tone={t === "urgent" ? "danger" : "neutral"}>{t}</Pill>
              ))}
            </span>
          </li>
        ))}
        {shown.length === 0 && <li className="px-4 py-3 text-fg-muted">No projects match these filters.</li>}
      </ul>
    </div>
  );
}

export function PillsPage() {
  return (
    <>
      <PageHeader
        title="Pills"
        intro="Small rounded labels for statuses, tags and counts — and selectable pills for filters and quick choices. For switching between views, use Tabs with variant=&quot;pills&quot;."
        importLine={`import { Pill, PillGroup, PillOption } from "@jm/ui";`}
      />

      <Section
        title="Tones and styles"
        desc="Six tones carry meaning — keep them consistent across your app (success for paid, danger for overdue). Soft is the default; solid draws more attention; outline is the quietest."
        code={`
<Pill tone="success">Paid</Pill>                       {/* soft, the default */}
<Pill tone="danger" appearance="solid">Overdue</Pill>
<Pill tone="info" appearance="outline">Beta</Pill>

// tones: neutral primary success warning danger info`}
      >
        <div className="grid gap-3">
          {(["soft", "solid", "outline"] as const).map((a) => (
            <Row key={a}>
              {tones.map((t) => (
                <Pill key={t} tone={t} appearance={a}>
                  {t[0].toUpperCase() + t.slice(1)}
                </Pill>
              ))}
            </Row>
          ))}
        </div>
      </Section>

      <Section
        title="Sizes"
        desc="Small fits tables and dense lists, medium is the default, large suits tags people interact with."
        code={`
<Pill size="sm">Small</Pill>
<Pill>Medium</Pill>
<Pill size="lg">Large</Pill>`}
      >
        <Row>
          <Pill size="sm" tone="primary">Small</Pill>
          <Pill tone="primary">Medium</Pill>
          <Pill size="lg" tone="primary">Large</Pill>
        </Row>
      </Section>

      <Section
        title="Dots, icons and counts"
        desc={'A dot signals status at a glance; dot="pulse" adds a gentle pulse for things happening right now. Icons take an element or an icon-font class, and count adds a number.'}
        code={`
<Pill tone="success" dot>Online</Pill>
<Pill tone="danger" dot="pulse" appearance="solid">Live</Pill>
<Pill tone="warning" icon="bi bi-clock">Pending review</Pill>
<Pill tone="primary" count={12}>Open issues</Pill>`}
      >
        <Row>
          <Pill tone="success" dot>Online</Pill>
          <Pill tone="neutral" dot>Away</Pill>
          <Pill tone="danger" dot="pulse" appearance="solid">Live</Pill>
          <Pill tone="warning" icon="bi bi-clock">Pending review</Pill>
          <Pill tone="info" icon="bi bi-stars">New</Pill>
          <Pill tone="primary" count={12}>Open issues</Pill>
        </Row>
      </Section>

      <Section
        title="In a table"
        desc="Statuses are the most common use. Pair the tone with clear words — color alone isn't enough for everyone."
        code={`
<td><Pill size="sm" tone="success" dot>Paid</Pill></td>
<td><Pill size="sm" tone="danger" dot>Overdue</Pill></td>`}
      >
        <div className="w-full overflow-x-auto rounded-control border border-border bg-surface">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="text-fg-muted">
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 font-medium">Invoice</th>
                <th className="px-4 py-2.5 font-medium">Client</th>
                <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((i) => (
                <tr key={i.no}>
                  <td className="px-4 py-2.5 tabular-nums">{i.no}</td>
                  <td className="px-4 py-2.5">{i.client}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{i.amount}</td>
                  <td className="px-4 py-2.5">
                    <Pill size="sm" tone={i.status[1]} dot>{i.status[0]}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Removable"
        desc="onRemove adds a × button, labelled “Remove Laravel” for screen readers."
        code={`
{tags.map((tag) => (
  <Pill key={tag} size="lg" onRemove={() => removeTag(tag)}>
    {tag}
  </Pill>
))}`}
      >
        <RemovableDemo />
      </Section>

      <Section
        title="As links"
        desc="With asChild, a pill can be a link — for example, topics that lead to a filtered list."
        code={`
<Pill asChild tone="primary">
  <Link href="/blog?topic=laravel">Laravel</Link>
</Pill>`}
      >
        <Row>
          {["Laravel", "Next.js", "Tailwind CSS", "Deployment"].map((t) => (
            <Pill key={t} asChild tone="primary" size="lg">
              <a href="#/pills">{t}</a>
            </Pill>
          ))}
        </Row>
      </Section>

      <Section
        title="Selectable pills"
        desc={
          <>
            <code className="font-mono text-[0.8125rem]">PillGroup</code> turns pills into choices. The default picks
            one (like the category row); <code className="font-mono text-[0.8125rem]">type="multiple"</code> picks
            several and shows a check on each (like the tag row). Try them — the list filters.
          </>
        }
        code={`
// Pick one
<PillGroup value={category} onValueChange={setCategory} aria-label="Category">
  <PillOption value="all" count={5}>All</PillOption>
  <PillOption value="design" count={2}>Design</PillOption>
  <PillOption value="engineering" count={2}>Engineering</PillOption>
</PillGroup>

// Pick several
<PillGroup type="multiple" value={tags} onValueChange={setTags} size="sm" aria-label="Tags">
  <PillOption value="web" icon="bi bi-globe2">Web</PillOption>
  <PillOption value="urgent" icon="bi bi-lightning">Urgent</PillOption>
  <PillOption value="archived" disabled>Archived</PillOption>
</PillGroup>`}
      >
        <FilterDemo />
      </Section>

      <Section
        title="Accessibility"
        desc="Selectable pills are toggle buttons, so screen readers announce whether each is selected."
        code={`
// Single choice that can be cleared again:
<PillGroup allowDeselect …>

// Give every group a name when it has no visible label:
<PillGroup aria-label="Category">…</PillGroup>`}
      >
        <ul className="grid gap-1.5 text-sm text-fg-muted">
          <li>Tab moves between pills; Enter or Space toggles.</li>
          <li>Status pills use words, not only color.</li>
          <li>The pulsing dot stops when reduced motion is on.</li>
        </ul>
      </Section>
    </>
  );
}
