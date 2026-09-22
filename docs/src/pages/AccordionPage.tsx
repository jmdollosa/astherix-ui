import * as React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionToggleAll,
  Input,
  Field,
  Button,
  Switch,
  Slider,
  CheckboxGroup,
  RadioGroup,
  Radio,
  Select,
  Pill,
  Text,
  toast,
} from "@jm/ui";
import { PageHeader, Section } from "../components/Doc";

const peso = (v: number) => `₱${v.toLocaleString("en-PH")}`;

/* ---------- 1. Searchable FAQ ---------- */

const faqs = [
  { id: "refunds", q: "How do refunds work?", a: "Open the invoice, choose Refund, and pick the full amount or part of it. The money goes back to the card or GCash account it came from within 3–5 business days." },
  { id: "late-fees", q: "Can I charge late fees automatically?", a: "Yes. In Payment settings, turn on late fees and set a percentage or a fixed amount. It's added the day after the due date and shown clearly on the invoice." },
  { id: "currencies", q: "Which currencies can I invoice in?", a: "Philippine peso, US dollar, euro, Singapore dollar and Japanese yen. Each client can have their own currency; reports convert to your home currency." },
  { id: "recurring", q: "How do recurring invoices work?", a: "Create an invoice, then choose Repeat — monthly, quarterly or yearly. Each copy is sent on schedule, and you can pause or edit the series any time." },
  { id: "export", q: "Can I export my data?", a: "Everything exports to CSV or Excel from Reports, and your accountant can have read-only access to download statements themselves." },
];

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q.trim()) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q.trim().toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-[3px] bg-[color:color-mix(in_srgb,var(--color-warning)_35%,transparent)] px-0.5 text-inherit">{text.slice(i, i + q.trim().length)}</mark>
      {text.slice(i + q.trim().length)}
    </>
  );
}

function FaqDemo() {
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState<string[]>(["refunds"]);
  const [voted, setVoted] = React.useState<Record<string, string>>({});
  const needle = q.trim().toLowerCase();
  const list = faqs.filter((f) => !needle || (f.q + " " + f.a).toLowerCase().includes(needle));
  // While searching, open every match so the answers are visible.
  const shownOpen = needle ? list.map((f) => f.id) : open;
  return (
    <div className="grid w-full max-w-xl gap-3">
      <Input type="search" placeholder="Search questions" leadingIcon="bi bi-search" value={q} onChange={(e) => setQ(e.target.value)} clearable aria-label="Search questions" />
      <Accordion type="multiple" value={shownOpen} onValueChange={setOpen} variant="outline">
        {list.map((f) => (
          <AccordionItem key={f.id} value={f.id} title={<Highlight text={f.q} q={q} />}>
            <p><Highlight text={f.a} q={q} /></p>
            <div className="mt-3 flex items-center gap-2 text-xs">
              {voted[f.id] ? (
                <span className="text-fg-muted">Thanks for letting us know.</span>
              ) : (
                <>
                  <span>Was this helpful?</span>
                  <Button size="sm" variant="ghost" onClick={() => setVoted((v) => ({ ...v, [f.id]: "yes" }))}>Yes</Button>
                  <Button size="sm" variant="ghost" onClick={() => setVoted((v) => ({ ...v, [f.id]: "no" }))}>No</Button>
                </>
              )}
            </div>
          </AccordionItem>
        ))}
      </Accordion>
      {list.length === 0 && <Text size="sm" tone="muted">No questions match “{q}”. Try other words, or contact support.</Text>}
    </div>
  );
}

/* ---------- 2. One-page checkout ---------- */

type StepKey = "contact" | "shipping" | "payment" | "review";

function CheckoutDemo() {
  const [step, setStep] = React.useState<StepKey>("contact");
  const [done, setDone] = React.useState<StepKey[]>([]);
  const [email, setEmail] = React.useState("ana@northwind.example");
  const [shipping, setShipping] = React.useState("standard");
  const [pay, setPay] = React.useState("gcash");
  const [error, setError] = React.useState<string>();
  const order: StepKey[] = ["contact", "shipping", "payment", "review"];
  const status = (k: StepKey) => (done.includes(k) ? "complete" : k === step ? "current" : order.indexOf(k) > order.indexOf(step) && !done.includes(order[order.indexOf(k) - 1]) ? "locked" : undefined);
  const next = (k: StepKey) => {
    setDone((d) => [...new Set([...d, k])]);
    setStep(order[order.indexOf(k) + 1] ?? k);
  };
  const ship = { standard: ["Standard", 150, "3–5 days"], express: ["Express", 350, "Next day"] } as const;
  const shipInfo = ship[shipping as keyof typeof ship];

  return (
    <div className="grid w-full max-w-xl gap-3">
      <Accordion value={step} onValueChange={(v) => v && setStep(v as StepKey)} collapsible={false}>
        <AccordionItem value="contact" title="Contact" status={status("contact")} summary={email}>
          <form
            noValidate
            className="grid gap-3 text-fg"
            onSubmit={(e) => {
              e.preventDefault();
              if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter an email address like name@example.com.");
              setError(undefined);
              next("contact");
            }}
          >
            <Field label="Email for the receipt" error={error}>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Button type="submit" size="sm" className="justify-self-start">Continue</Button>
          </form>
        </AccordionItem>
        <AccordionItem value="shipping" title="Delivery" status={status("shipping")} summary={`${shipInfo[0]} · ${peso(shipInfo[1])} · ${shipInfo[2]}`}>
          <div className="grid gap-3 text-fg">
            <RadioGroup value={shipping} onValueChange={setShipping} aria-label="Delivery speed">
              <Radio value="standard" label="Standard — ₱150" description="3–5 business days" />
              <Radio value="express" label="Express — ₱350" description="Next business day in Metro Manila" />
            </RadioGroup>
            <Button size="sm" className="justify-self-start" onClick={() => next("shipping")}>Continue</Button>
          </div>
        </AccordionItem>
        <AccordionItem value="payment" title="Payment" status={status("payment")} summary={pay === "gcash" ? "GCash" : "Card ending 4417"}>
          <div className="grid gap-3 text-fg">
            <RadioGroup value={pay} onValueChange={setPay} orientation="horizontal" aria-label="Payment method">
              <Radio value="gcash" label="GCash" />
              <Radio value="card" label="Card ending 4417" />
            </RadioGroup>
            <Button size="sm" className="justify-self-start" onClick={() => next("payment")}>Continue</Button>
          </div>
        </AccordionItem>
        <AccordionItem value="review" title="Review and pay" status={status("review")}>
          <div className="grid gap-3 text-fg">
            <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm">
              <dt className="text-fg-muted">Starter plan, 1 year</dt><dd className="tabular-nums">{peso(2988)}</dd>
              <dt className="text-fg-muted">Delivery ({shipInfo[0].toLowerCase()})</dt><dd className="tabular-nums">{peso(shipInfo[1])}</dd>
              <dt className="font-medium">Total</dt><dd className="font-semibold tabular-nums">{peso(2988 + shipInfo[1])}</dd>
            </dl>
            <Button className="justify-self-start" onClick={() => { setDone(order); toast.success("Order placed", { description: `Receipt sent to ${email}` }); }}>
              Pay {peso(2988 + shipInfo[1])}
            </Button>
          </div>
        </AccordionItem>
      </Accordion>
      <Text size="xs" tone="muted">Finished steps collapse to a one-line summary; click one to change it. Later steps stay locked until the earlier ones are done.</Text>
    </div>
  );
}

/* ---------- 3. Settings with switches in the headers ---------- */

function SettingsDemo() {
  const [on, setOn] = React.useState({ reminders: true, lateFees: false, portal: true });
  const [open, setOpen] = React.useState<string[]>(["reminders"]);
  const set = (k: keyof typeof on) => (v: boolean) => {
    setOn((s) => ({ ...s, [k]: v }));
    // Turning a feature on opens its options; turning it off tucks them away.
    setOpen((o) => (v ? [...new Set([...o, k])] : o.filter((x) => x !== k)));
  };
  return (
    <Accordion type="multiple" value={open} onValueChange={setOpen} variant="outline" className="w-full max-w-xl">
      <AccordionItem value="reminders" icon="bi bi-bell" title="Payment reminders" description="Nudge clients before and after the due date" action={<Switch size="sm" variant="mark" checked={on.reminders} onCheckedChange={set("reminders")} aria-label="Payment reminders" />} disabled={!on.reminders}>
        <div className="grid gap-3 text-fg">
          <Field label="Send the first reminder">
            <Select searchable={false} defaultValue="3" options={[{ value: "1", label: "1 day before" }, { value: "3", label: "3 days before" }, { value: "7", label: "A week before" }]} />
          </Field>
        </div>
      </AccordionItem>
      <AccordionItem value="lateFees" icon="bi bi-percent" title="Late fees" description="Added the day after the due date" action={<Switch size="sm" variant="mark" checked={on.lateFees} onCheckedChange={set("lateFees")} aria-label="Late fees" />} disabled={!on.lateFees}>
        <Field label="Late fee">
          <Slider defaultValue={5} max={25} formatValue={(v) => `${v}%`} />
        </Field>
      </AccordionItem>
      <AccordionItem value="portal" icon="bi bi-person-badge" title="Client portal" description="Clients see and pay all their invoices in one place" action={<Switch size="sm" variant="mark" checked={on.portal} onCheckedChange={set("portal")} aria-label="Client portal" />} disabled={!on.portal}>
        <p>Your portal link: <code className="font-mono text-fg">billing.example.com/p/astherix</code></p>
      </AccordionItem>
    </Accordion>
  );
}

/* ---------- 4. Filters ---------- */

function FiltersDemo() {
  const [status, setStatus] = React.useState<string[]>(["overdue"]);
  const [range, setRange] = React.useState<[number, number]>([0, 100000]);
  const [client, setClient] = React.useState<string | null>(null);
  const priceActive = range[0] > 0 || range[1] < 100000;
  const count = (n: number) => (n ? <Pill size="sm" tone="primary">{n}</Pill> : null);
  return (
    <div className="grid w-full max-w-sm gap-2 rounded-card border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Filters</p>
        <button type="button" className="cursor-pointer text-xs font-medium text-primary" onClick={() => { setStatus([]); setRange([0, 100000]); setClient(null); }}>Clear all</button>
      </div>
      <Accordion type="multiple" defaultValue={["status", "amount"]} variant="flush" size="sm">
        <AccordionItem value="status" title="Status" meta={count(status.length)}>
          <CheckboxGroup size="sm" value={status} onValueChange={setStatus} aria-label="Status" options={[{ value: "paid", label: "Paid" }, { value: "sent", label: "Sent" }, { value: "overdue", label: "Overdue" }, { value: "draft", label: "Draft" }]} />
        </AccordionItem>
        <AccordionItem value="amount" title="Amount" meta={count(priceActive ? 1 : 0)}>
          <Slider size="sm" value={range} onChange={(v) => setRange(v as [number, number])} max={100000} step={1000} formatValue={(v) => `₱${v / 1000}k`} aria-label="Amount" />
        </AccordionItem>
        <AccordionItem value="client" title="Client" meta={count(client ? 1 : 0)}>
          <RadioGroup size="sm" value={client} onValueChange={setClient} aria-label="Client">
            {["Northwind Traders", "Luzon Freight", "Blue Harbor Café"].map((c) => <Radio key={c} value={c} label={c} />)}
          </RadioGroup>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

/* ---------- 5. Nested breakdown ---------- */

function Breakdown() {
  const Amount = ({ v }: { v: number }) => <span className="tabular-nums font-medium text-fg">{peso(v)}</span>;
  return (
    <div className="grid w-full max-w-xl gap-2">
      <Accordion type="multiple" variant="outline" defaultValue={["ops"]}>
        <AccordionToggleAll className="m-1" />
        <AccordionItem value="ops" icon="bi bi-gear" title="Operations" meta={<Amount v={148200} />}>
          <Accordion type="multiple" variant="flush" size="sm" defaultValue={["cloud"]} headingLevel={4}>
            <AccordionItem value="cloud" title="Cloud and software" meta={<Amount v={61400} />}>
              <Accordion type="multiple" variant="flush" size="sm" headingLevel={5}>
                <AccordionItem value="hosting" title="Hosting" meta={<Amount v={38900} />}>Railway (₱24,300), backups (₱6,100), CDN (₱8,500).</AccordionItem>
                <AccordionItem value="tools" title="Tools and licenses" meta={<Amount v={22500} />}>Design tools, email service and the accounting sync.</AccordionItem>
              </Accordion>
            </AccordionItem>
            <AccordionItem value="office" title="Office" meta={<Amount v={86800} />}>Rent (₱72,000), internet (₱3,800) and utilities (₱11,000).</AccordionItem>
          </Accordion>
        </AccordionItem>
        <AccordionItem value="people" icon="bi bi-people" title="People" meta={<Amount v={512000} />}>Salaries and benefits for 6 people, plus a contractor for design.</AccordionItem>
        <AccordionItem value="marketing" icon="bi bi-megaphone" title="Marketing" meta={<Amount v={42600} />}>Ads (₱30,000) and sponsored newsletters (₱12,600).</AccordionItem>
      </Accordion>
    </div>
  );
}

export function AccordionPage() {
  return (
    <>
      <PageHeader
        title="Accordion"
        intro="Sections that open and close — and more than FAQs. It can be a searchable help center, a one-page checkout, a settings panel with switches in the headers, a filter sidebar, or a drill-down cost breakdown. Closed sections stay findable with the browser's Ctrl/⌘+F."
        importLine={`import { Accordion, AccordionItem, AccordionToggleAll, useAccordion } from "@jm/ui";`}
      />

      <Section
        title="A searchable FAQ"
        desc="Type to filter questions — matches are highlighted and opened. Each answer asks whether it helped. In Chrome and Edge, the browser's own Ctrl/⌘+F also finds text inside closed answers and opens them."
        code={`
<Accordion type="multiple" variant="outline" linkToHash>   {/* /help#refunds opens it */}
  {faqs.map((f) => (
    <AccordionItem key={f.id} value={f.id} title={f.q}>{f.a}</AccordionItem>
  ))}
</Accordion>`}
      >
        <FaqDemo />
      </Section>

      <Section
        title="A one-page checkout"
        desc="Give items a status and a summary: finished steps show a ✓ and collapse to what was entered (“Express · ₱350 · Next day”), the current step shows a dot, and later steps stay locked. Click a finished step to change it."
        code={`
<Accordion value={step} onValueChange={setStep} collapsible={false}>
  <AccordionItem value="contact" title="Contact" status="complete" summary="ana@northwind.example">…</AccordionItem>
  <AccordionItem value="shipping" title="Delivery" status="current" summary="Express · ₱350">…</AccordionItem>
  <AccordionItem value="payment" title="Payment" status="locked">…</AccordionItem>
</Accordion>
// status: "complete" | "current" | "error" | "locked"`}
      >
        <CheckoutDemo />
      </Section>

      <Section
        title="Settings with switches"
        desc="Put controls in the header with action — they work on their own without opening the section. Here, turning a feature on reveals its options, and turning it off tucks them away."
        code={`
<AccordionItem
  value="reminders"
  icon="bi bi-bell"
  title="Payment reminders"
  description="Nudge clients before and after the due date"
  action={<Switch size="sm" checked={on} onCheckedChange={setOn} aria-label="Payment reminders" />}
  disabled={!on}
>
  …options…
</AccordionItem>`}
      >
        <SettingsDemo />
      </Section>

      <Section
        title="A filter sidebar"
        desc="variant=&quot;flush&quot; and size=&quot;sm&quot; suit sidebars. meta shows how many filters are active in each group, even while it's closed."
        code={`
<Accordion type="multiple" variant="flush" size="sm" defaultValue={["status", "amount"]}>
  <AccordionItem value="status" title="Status" meta={<Pill size="sm">{selected.length}</Pill>}>
    <CheckboxGroup … />
  </AccordionItem>
  <AccordionItem value="amount" title="Amount"><Slider value={range} … /></AccordionItem>
</Accordion>`}
      >
        <FiltersDemo />
      </Section>

      <Section
        title="A drill-down breakdown"
        desc="Accordions nest, so totals can open into their parts, level by level. AccordionToggleAll opens or closes a whole level at once. Set headingLevel on nested ones for a correct outline."
        code={`
<Accordion type="multiple" variant="outline">
  <AccordionToggleAll />
  <AccordionItem value="ops" title="Operations" meta="₱148,200">
    <Accordion type="multiple" variant="flush" size="sm" headingLevel={4}>
      <AccordionItem value="cloud" title="Cloud and software" meta="₱61,400">…</AccordionItem>
    </Accordion>
  </AccordionItem>
</Accordion>`}
      >
        <Breakdown />
      </Section>

      <Section
        title="Styles and keyboard"
        desc="Three looks: separated cards (default), one outlined group, or flush dividers. ↑ ↓ move between headers, Home/End jump to the ends, Enter or Space opens."
        code={`
<Accordion variant="separated" />   // cards with a lift when open
<Accordion variant="outline" />     // one bordered group
<Accordion variant="flush" />       // dividers only

<Accordion type="single" collapsible defaultValue="a" />   // one at a time
<Accordion type="multiple" defaultValue={["a", "b"]} />   // any number

const { expandAll, collapseAll, toggle, open } = useAccordion();   // inside an Accordion`}
      >
        <div className="grid w-full max-w-xl gap-6">
          {(["separated", "outline", "flush"] as const).map((v) => (
            <Accordion key={v} variant={v} defaultValue="one">
              <AccordionItem value="one" title={`${v[0].toUpperCase()}${v.slice(1)}`} meta={<Pill size="sm">{v}</Pill>}>
                The open section eases down, and its content fades in as it goes.
              </AccordionItem>
              <AccordionItem value="two" title="Another section">Only one section is open at a time with type="single".</AccordionItem>
            </Accordion>
          ))}
        </div>
      </Section>
    </>
  );
}
