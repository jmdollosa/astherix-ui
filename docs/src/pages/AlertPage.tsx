import * as React from "react";
import { Alert, Button, Field, Input, Text, Tabs, TabList, Tab, toast } from "@astherix/ui";
import { PageHeader, Section } from "../components/Doc";

const seed = [
  { id: 1, tone: "warning" as const, title: "Your card expires this month", body: "Update it before 30 September so invoices keep going out." },
  { id: 2, tone: "info" as const, title: "New: recurring invoices", body: "Bill retainers automatically every month." },
];

function DismissDemo() {
  const [alerts, setAlerts] = React.useState(seed);
  return (
    <div className="grid w-full max-w-xl gap-3">
      {alerts.map((a) => (
        <Alert key={a.id} tone={a.tone} title={a.title} dismissible onDismiss={() => setAlerts((list) => list.filter((x) => x.id !== a.id))}>
          {a.body}
        </Alert>
      ))}
      {alerts.length === 0 && (
        <div className="flex items-center gap-3">
          <Text size="sm" tone="muted">All dismissed.</Text>
          <Button size="sm" variant="secondary" onClick={() => setAlerts(seed)}>Bring them back</Button>
        </div>
      )}
    </div>
  );
}

function ValidationDemo() {
  const [errors, setErrors] = React.useState<string[] | null>(null);
  const [saved, setSaved] = React.useState(false);
  return (
    <form
      className="grid w-full max-w-xl gap-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const problems: string[] = [];
        if (!String(data.get("client")).trim()) problems.push("The client name is required.");
        if (!/^\S+@\S+\.\S+$/.test(String(data.get("email")))) problems.push("The email address must be valid.");
        if (Number(data.get("amount")) <= 0) problems.push("The amount must be greater than zero.");
        setErrors(problems.length ? problems : null);
        setSaved(problems.length === 0);
      }}
    >
      {errors && (
        <Alert tone="danger" title={`We couldn't save this invoice (${errors.length} ${errors.length === 1 ? "problem" : "problems"})`} items={errors} />
      )}
      {saved && (
        <Alert
          tone="success"
          title="Invoice saved"
          dismissible
          onDismiss={() => setSaved(false)}
          actions={<Button size="sm" variant="secondary" onClick={() => toast("Opening the invoice…")}>View invoice</Button>}
        >
          INV-1048 is ready to send to your client.
        </Alert>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Client"><Input name="client" placeholder="Northwind Traders" /></Field>
        <Field label="Email"><Input name="email" type="email" placeholder="ap@example.com" /></Field>
        <Field label="Amount"><Input name="amount" type="number" prefix="₱" defaultValue="0" /></Field>
      </div>
      <Button type="submit" className="justify-self-start">Save invoice</Button>
      <Text size="xs" tone="muted">Submit with empty fields to see the error summary — the same shape Laravel's validation errors arrive in.</Text>
    </form>
  );
}

function BannerDemo() {
  const [show, setShow] = React.useState(true);
  return (
    <div className="w-full overflow-hidden rounded-card border border-border">
      {show && (
        <Alert
          banner
          tone="warning"
          size="sm"
          icon="bi bi-exclamation-triangle"
          dismissible
          onDismiss={() => setShow(false)}
          actions={<Button size="sm" variant="secondary">Add a payment method</Button>}
          title="Your trial ends in 3 days"
        >
          Add a payment method to keep sending invoices after 26 September.
        </Alert>
      )}
      <div className="grid gap-3 bg-bg p-5">
        <div className="h-8 w-40 rounded-control bg-secondary-hover" />
        <div className="h-24 rounded-card bg-secondary-hover" />
        <div className="h-24 rounded-card bg-secondary-hover" />
      </div>
      {!show && (
        <div className="border-t border-border p-3">
          <Button size="sm" variant="ghost" onClick={() => setShow(true)}>Show the banner again</Button>
        </div>
      )}
    </div>
  );
}

export function AlertPage() {
  const [look, setLook] = React.useState<string | null>("soft");
  const variant = (look ?? "soft") as "soft" | "outline" | "accent" | "solid";

  return (
    <>
      <PageHeader
        title="Alert"
        intro="A message that stays on the page: something needs attention, something went wrong, something worked. (For a message that appears and leaves on its own, use Toast.) Five tones, four looks, optional actions, and dismissal that collapses the space smoothly instead of snapping the page up."
        importLine={'import { Alert } from "@astherix/ui";'}
      />

      <Section
        title="Tones and looks"
        desc="Each tone brings its own icon and color: info, success, warning, danger and neutral. Switch between the four looks — soft, outline, accent and solid."
        code={`
<Alert tone="info" title="Heads up">Payments settle in 1–2 business days.</Alert>
<Alert tone="success" title="Invoice sent" />
<Alert tone="warning" variant="accent" title="Your card expires this month" />
<Alert tone="danger" variant="solid" title="We couldn't reach the bank" />`}
      >
        <div className="grid w-full max-w-xl gap-3">
          <Tabs value={look} onValueChange={setLook} size="sm" variant="pills">
            <TabList aria-label="Look">
            <Tab value="soft">Soft</Tab>
            <Tab value="outline">Outline</Tab>
            <Tab value="accent">Accent</Tab>
            <Tab value="solid">Solid</Tab>
            </TabList>
          </Tabs>
          <Alert variant={variant} tone="info" title="Payments settle in 1–2 business days">Clients see the invoice as paid straight away.</Alert>
          <Alert variant={variant} tone="success" title="Invoice sent to Northwind Traders" />
          <Alert variant={variant} tone="warning" title="Your card expires this month">Update it before 30 September so invoices keep going out.</Alert>
          <Alert variant={variant} tone="danger" title="We couldn't reach the bank feed">Payments may be missing from today's totals.</Alert>
          <Alert variant={variant} tone="neutral" title="This invoice is a draft">Only you can see it until you send it.</Alert>
        </div>
      </Section>

      <Section
        title="With actions, and dismissible"
        desc="Put the next step right in the alert. Dismissible alerts fade and collapse, so the page settles gently rather than jumping."
        code={`
<Alert
  tone="warning"
  title="Your card expires this month"
  dismissible
  onDismiss={() => hide(alert.id)}
  actions={<><Button size="sm">Update card</Button><Button size="sm" variant="ghost">Remind me later</Button></>}
>
  Update it before 30 September so invoices keep going out.
</Alert>`}
      >
        <div className="grid w-full max-w-xl gap-5">
          <Alert
            tone="warning"
            title="Your card expires this month"
            actions={
              <>
                <Button size="sm">Update card</Button>
                <Button size="sm" variant="ghost">Remind me later</Button>
              </>
            }
          >
            Update it before 30 September so invoices keep going out.
          </Alert>
          <DismissDemo />
        </div>
      </Section>

      <Section
        title="Validation errors"
        desc="items turns a list of problems into a summary at the top of a form — the shape Laravel's errors arrive in. Errors and warnings are announced to screen readers straight away; calmer tones wait for a pause."
        code={`
// Inertia / React
{Object.keys(errors).length > 0 && (
  <Alert tone="danger" title={\`We couldn't save this invoice (\${Object.keys(errors).length} problems)\`}
    items={Object.values(errors)} />
)}

// Laravel Blade, with the session's flash messages
@if (session('status'))  <div id="alert-success" data-message="{{ session('status') }}"></div>  @endif`}
      >
        <ValidationDemo />
      </Section>

      <Section
        title="Page banner"
        desc="banner makes it edge to edge with square corners, for the top of a page or a layout. Keep it short, and give people a way to act on it."
        code={`
<Alert banner size="sm" tone="warning" dismissible title="Your trial ends in 3 days"
  actions={<Button size="sm" variant="secondary">Add a payment method</Button>}>
  Add a payment method to keep sending invoices after 26 September.
</Alert>`}
      >
        <BannerDemo />
      </Section>

      <Section
        title="Options"
        desc="Alerts can close themselves, take a custom icon or none at all, and come in two sizes. Auto-dismiss pauses while the pointer or keyboard focus is on the alert."
        code={`
<Alert autoDismiss={6000} tone="success" title="Saved" />      // closes itself, pauses on hover
<Alert icon="bi bi-stars" tone="info" title="New feature" />   // your own icon
<Alert icon={false} size="sm" title="No icon, compact" />
<Alert live="off" … />    // don't announce (e.g. alerts already on the page at load)`}
      >
        <div className="grid w-full max-w-xl gap-3">
          <Alert tone="success" title="Saved — this one closes itself in 6 seconds" autoDismiss={6000} dismissible>
            Hover or focus it and the countdown pauses.
          </Alert>
          <Alert tone="info" icon="bi bi-stars" title="New: pay with Maya" size="sm">Turn it on in Payment settings.</Alert>
          <Alert icon={false} size="sm" tone="neutral" title="Compact, no icon" />
        </div>
      </Section>
    </>
  );
}
