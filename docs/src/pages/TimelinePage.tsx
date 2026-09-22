import * as React from "react";
import {
  Timeline,
  TimelineGroup,
  TimelineItem,
  TimelineCollapse,
  Roadmap,
  Avatar,
  Pill,
  Card,
  CardHeader,
  CardContent,
  Button,
} from "@jm/ui";
import { PageHeader, Section } from "../components/Doc";

const ago = (minutes: number) => new Date(Date.now() - minutes * 60000);

function ActivityDemo() {
  return (
    <div className="w-full max-w-xl">
      <Timeline aria-label="Invoice INV-1047 activity">
        <TimelineGroup date={ago(0)}>
          <TimelineItem icon="bi bi-check-lg" tone="success" title={<>Payment received <span className="font-normal text-fg-muted">via GCash</span></>} time={ago(12)} meta={<Pill size="sm" tone="success">₱48,200.00</Pill>} />
          <TimelineItem
            avatar={<Avatar name="Maria Santos" size="sm" decorative />}
            title={<>Maria Santos <span className="font-normal text-fg-muted">commented</span></>}
            time={ago(95)}
            card
          >
            The client asked for the PO number on the invoice — I've added it and re-sent the PDF.
          </TimelineItem>
          <TimelineItem icon="bi bi-eye" title="Northwind Traders opened the invoice" time={ago(180)} />
        </TimelineGroup>
        <TimelineGroup date={ago(60 * 24)}>
          <TimelineItem icon="bi bi-bell" tone="warning" title="Reminder sent — due in 3 days" time={ago(60 * 26)} />
          <TimelineCollapse>
            <TimelineItem icon="bi bi-eye" title="Northwind Traders opened the invoice" time={ago(60 * 28)} />
            <TimelineItem icon="bi bi-eye" title="Northwind Traders opened the invoice" time={ago(60 * 30)} />
            <TimelineItem icon="bi bi-download" title="PDF downloaded" time={ago(60 * 31)} />
          </TimelineCollapse>
        </TimelineGroup>
        <TimelineGroup date={ago(60 * 24 * 9)}>
          <TimelineItem icon="bi bi-send" tone="primary" title="Invoice sent to accounts@northwind.example" time={ago(60 * 24 * 9)} />
          <TimelineItem icon="bi bi-file-earmark-plus" title={<>Created by <span className="font-normal text-fg-muted">JM</span></>} time={ago(60 * 24 * 9 + 20)} last />
        </TimelineGroup>
      </Timeline>
    </div>
  );
}

function OrderDemo() {
  const steps = [
    ["bi bi-bag-check", "Order placed", "12 Sep, 9:41 AM"],
    ["bi bi-credit-card", "Payment confirmed", "12 Sep, 9:42 AM"],
    ["bi bi-box-seam", "Packed at the warehouse", "Today, 8:15 AM"],
    ["bi bi-truck", "Out for delivery", "Expected tomorrow"],
    ["bi bi-house-check", "Delivered", ""],
  ] as const;
  const [current, setCurrent] = React.useState(2);
  return (
    <div className="grid w-full max-w-md gap-4">
      <Timeline variant="progress" aria-label="Order #5821 progress">
        {steps.map(([icon, title, when], i) => (
          <TimelineItem
            key={title}
            icon={icon}
            title={title}
            timeLabel={when}
            status={i < current ? "past" : i === current ? "current" : "upcoming"}
            last={i === steps.length - 1}
          >
            {i === current &&
              ["We've got your order.", "Payment went through.", "Your parcel is packed and waiting for the courier.", "The courier is on the way to you.", "Enjoy your order!"][i]}
          </TimelineItem>
        ))}
      </Timeline>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}>Back a step</Button>
        <Button size="sm" onClick={() => setCurrent((c) => Math.min(steps.length - 1, c + 1))} disabled={current === steps.length - 1}>Next step</Button>
      </div>
    </div>
  );
}

const history = [
  ["2019", "Started in a spare bedroom", "The first invoices went out from a laptop and a borrowed printer.", "bi bi-lightbulb"],
  ["2021", "First 100 clients", "Mostly cafés, tour operators and print shops nearby.", "bi bi-people"],
  ["2023", "Payment links", "Clients could finally pay by card or GCash straight from the email.", "bi bi-link-45deg"],
  ["2025", "The mobile app", "Invoices from the road, with offline drafts.", "bi bi-phone"],
  ["2026", "Astherix UI", "One design system across the web dashboard and the app.", "bi bi-palette"],
] as const;

export function TimelinePage() {
  return (
    <>
      <PageHeader
        title="Timeline"
        intro="A thread with beads: events hang on a line that draws itself as it scrolls into view. Use it for activity and history, for step-by-step progress, for a story told on both sides of the thread — and Roadmap for milestones laid out across the page."
        importLine={`import { Timeline, TimelineGroup, TimelineItem, TimelineCollapse, Roadmap } from "@jm/ui";`}
      />

      <Section
        title="Activity"
        desc="Days become chapters with headings that stick while you scroll through them. Times read naturally — “2 hours ago” — with the exact time on hover. Beads can be dots, icons or avatars; card turns an item into a comment bubble; quiet stretches fold into “Show 3 more”. Scroll to watch the thread draw."
        code={`
<Timeline aria-label="Invoice activity">
  <TimelineGroup date={new Date()}>                       {/* "Today" */}
    <TimelineItem icon="bi bi-check-lg" tone="success" title="Payment received"
      time={payment.at} meta={<Pill size="sm" tone="success">₱48,200.00</Pill>} />
    <TimelineItem avatar={<Avatar name="Maria Santos" size="sm" decorative />}
      title="Maria Santos commented" time={comment.at} card>
      I've added the PO number and re-sent the PDF.
    </TimelineItem>
  </TimelineGroup>
  <TimelineGroup date={yesterday}>
    <TimelineItem icon="bi bi-bell" tone="warning" title="Reminder sent" time={…} />
    <TimelineCollapse>{quietEvents}</TimelineCollapse>        {/* "Show 3 more updates" */}
  </TimelineGroup>
</Timeline>`}
      >
        <ActivityDemo />
      </Section>

      <Section
        title="Progress"
        desc={'variant="progress" turns the thread into a path: the part you\'ve traveled is solid, the current step pulses, and what\'s ahead is dashed and muted. Step through the order below.'}
        code={`
<Timeline variant="progress" aria-label="Order progress">
  <TimelineItem icon="bi bi-bag-check" title="Order placed" timeLabel="12 Sep, 9:41 AM" />
  <TimelineItem icon="bi bi-credit-card" title="Payment confirmed" timeLabel="12 Sep, 9:42 AM" />
  <TimelineItem icon="bi bi-box-seam" title="Packed" status="current">
    Your parcel is waiting for the courier.
  </TimelineItem>
  <TimelineItem icon="bi bi-truck" title="Out for delivery" status="upcoming" />
  <TimelineItem icon="bi bi-house-check" title="Delivered" status="upcoming" last />
</Timeline>`}
      >
        <OrderDemo />
      </Section>

      <Section
        title="Both sides of the thread"
        desc={'layout="alternate" centers the thread on wide containers and lets items take turns on each side, with each time sitting opposite its card like a caption. On narrow screens it falls back to one side.'}
        code={`
<Timeline layout="alternate" variant="progress" aria-label="Our story">
  {history.map((h) => (
    <TimelineItem key={h.year} timeLabel={h.year} icon={h.icon} title={h.title} card>
      {h.text}
    </TimelineItem>
  ))}
</Timeline>`}
      >
        <div className="w-full">
          <Timeline layout="alternate" variant="progress" aria-label="Our story">
            {history.map(([year, title, text, icon], i) => (
              <TimelineItem
                key={year}
                timeLabel={<span className="font-heading text-lg font-semibold tracking-[-0.01em] text-fg">{year}</span>}
                icon={icon}
                title={title}
                status={i === history.length - 1 ? "current" : "past"}
                card
                last={i === history.length - 1}
              >
                {text}
              </TimelineItem>
            ))}
          </Timeline>
        </div>
      </Section>

      <Section
        title="Roadmap"
        desc="Milestones across the page, on a track you can swipe or scroll. It snaps to each milestone, fades the edge where there's more, and starts with the current one in view."
        code={`
<Roadmap
  aria-label="Product roadmap"
  items={[
    { label: "Q1 2026", title: "Payment links", status: "done", description: "…" },
    { label: "Q3 2026", title: "Mobile app 2.0", status: "current", description: "…",
      footer: <Pill size="sm" tone="primary">In beta</Pill> },
    { label: "Q4 2026", title: "Recurring invoices", status: "upcoming" },
  ]}
/>`}
      >
        <Roadmap
          aria-label="Product roadmap"
          items={[
            { label: "Q3 2025", title: "Invoices and clients", status: "done", description: "The core: create, send and track invoices." },
            { label: "Q4 2025", title: "Reminders", status: "done", description: "Polite nudges before and after the due date." },
            { label: "Q1 2026", title: "Payment links", status: "done", description: "Card and GCash payments straight from the email." },
            { label: "Q2 2026", title: "Team workspaces", status: "done", description: "Roles, approvals and a shared client list." },
            { label: "Q3 2026", title: "Mobile app 2.0", status: "current", description: "Offline drafts and receipt scanning.", footer: <><Pill size="sm" tone="primary">In beta</Pill><Pill size="sm">iOS · Android</Pill></> },
            { label: "Q4 2026", title: "Recurring invoices", status: "upcoming", description: "Retainers and subscriptions billed automatically." },
            { label: "Q1 2027", title: "Accounting sync", status: "upcoming", description: "Two-way sync with popular accounting tools." },
            { label: "Q2 2027", title: "Public API", status: "upcoming", description: "Build your own integrations." },
          ]}
        />
      </Section>

      <Section
        title="Compact"
        desc={'size="sm" fits a sidebar or card — here, the latest activity on a client.'}
        code={`
<Card>
  <CardHeader title="Recent activity" />
  <CardContent>
    <Timeline size="sm" aria-label="Recent activity">…</Timeline>
  </CardContent>
</Card>`}
      >
        <Card className="w-full max-w-xs">
          <CardHeader title="Recent activity" description="Blue Harbor Café" />
          <CardContent>
            <Timeline size="sm" aria-label="Recent activity for Blue Harbor Café">
              <TimelineItem tone="success" title="Paid INV-1041" time={ago(40)} />
              <TimelineItem tone="primary" title="Sent INV-1044" time={ago(60 * 5)} />
              <TimelineItem title="Contact details updated" time={ago(60 * 30)} />
              <TimelineItem tone="danger" title="INV-1033 overdue" time={ago(60 * 24 * 4)} last />
            </Timeline>
          </CardContent>
        </Card>
      </Section>

      <Section
        title="Accessibility"
        desc="It's an ordered list, so screen readers announce how many events there are and where you are."
        code={`
<Timeline aria-label="Invoice activity">…</Timeline>

// Times are <time> elements with the exact date; the current step has aria-current="step"
// and "(current)" / "(upcoming)" are read after titles. Roadmap milestones read
// "— done", "— in progress" or "— planned".`}
      >
        <ul className="grid gap-1.5 text-sm text-fg-muted">
          <li>With reduced motion on, the thread is simply drawn and beads don't pulse.</li>
          <li>Roadmap arrows and swiping both work; the arrows hide when there's nothing further.</li>
        </ul>
      </Section>
    </>
  );
}
