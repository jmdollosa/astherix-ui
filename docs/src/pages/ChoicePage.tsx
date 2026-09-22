import * as React from "react";
import { Checkbox, CheckboxGroup, RadioGroup, Radio, Switch, Field, Button, Card, CardHeader, CardContent, Text, toast } from "@jm/ui";
import { PageHeader, Section } from "../components/Doc";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function SelectAllDemo() {
  const items = ["Northwind Traders", "Blue Harbor Café", "Luzon Freight", "Pixel & Pine"];
  const [picked, setPicked] = React.useState<string[]>(["Blue Harbor Café"]);
  const all = picked.length === items.length;
  return (
    <div className="grid gap-3">
      <Checkbox
        label="Send the statement to all clients"
        checked={all}
        indeterminate={picked.length > 0 && !all}
        onCheckedChange={(v) => setPicked(v ? items : [])}
      />
      <div className="ms-7 grid gap-2.5">
        {items.map((c) => (
          <Checkbox key={c} size="sm" label={c} checked={picked.includes(c)} onCheckedChange={(v) => setPicked((p) => (v ? [...p, c] : p.filter((x) => x !== c)))} />
        ))}
      </div>
    </div>
  );
}

function SettingsDemo() {
  const [fail, setFail] = React.useState(false);
  const save = (label: string) => async (on: boolean) => {
    await wait(900);
    if (fail) {
      toast.error(`Couldn't update “${label}”`, { description: "Check your connection and try again." });
      throw new Error("failed");
    }
    toast.success(`${label} ${on ? "on" : "off"}`);
  };
  return (
    <div className="grid w-full max-w-md gap-3">
      <Card>
        <CardHeader title="Notifications" description="Changes save as soon as you flip a switch." />
        <CardContent className="grid gap-4">
          <Switch labelPosition="start" defaultChecked label="Payment received" description="When a client pays an invoice." onCheckedChange={save("Payment received")} />
          <Switch labelPosition="start" defaultChecked label="Invoice viewed" description="The first time a client opens it." onCheckedChange={save("Invoice viewed")} />
          <Switch labelPosition="start" label="Weekly summary" description="Every Monday at 8 AM." onCheckedChange={save("Weekly summary")} />
          <Switch labelPosition="start" label="Product news" disabled description="Turned off by your workspace admin." />
        </CardContent>
      </Card>
      <label className="flex items-center gap-2 text-sm text-fg-muted">
        <input type="checkbox" className="size-4 accent-[color:var(--color-danger)]" checked={fail} onChange={(e) => setFail(e.target.checked)} />
        Make saving fail (the switch flips back)
      </label>
    </div>
  );
}

function FormDemo() {
  const [result, setResult] = React.useState("");
  const [error, setError] = React.useState<string>();
  return (
    <form
      className="grid w-full max-w-md gap-6 rounded-card border border-border bg-surface p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        if (!data.get("terms")) {
          setError("Accept the terms to continue.");
          setResult("");
          return;
        }
        setError(undefined);
        setResult(new URLSearchParams(data as unknown as Record<string, string>).toString().replace(/%5B%5D/g, "[]"));
      }}
    >
      <Field label="Billing cycle">
        <RadioGroup name="cycle" defaultValue="monthly" orientation="horizontal">
          <Radio value="monthly" label="Monthly" />
          <Radio value="yearly" label="Yearly" description="2 months free" />
        </RadioGroup>
      </Field>
      <Field label="Payment methods to offer" description="Clients see these on the payment page.">
        <CheckboxGroup
          name="methods[]"
          defaultValue={["card", "gcash"]}
          options={[
            { value: "card", label: "Credit or debit card" },
            { value: "gcash", label: "GCash" },
            { value: "maya", label: "Maya" },
            { value: "bank", label: "Bank transfer", description: "Clients upload a deposit slip." },
          ]}
        />
      </Field>
      <Field label="Terms" error={error}>
        <Checkbox name="terms" value="accepted" label={<>I agree to the <a className="text-primary underline" href="#/choice">terms of service</a></>} />
      </Field>
      <div className="flex items-center justify-between gap-3">
        <Text size="xs" tone="muted" className="break-all">{result}</Text>
        <Button type="submit">Save settings</Button>
      </div>
    </form>
  );
}

export function ChoicePage() {
  return (
    <>
      <PageHeader
        title="Checkbox, radio & switch"
        intro="The small choices: tick boxes, pick-one options, and on/off switches. They're real form inputs underneath — the keyboard, screen readers and form posts all work as they should — dressed to match the rest: sunken when empty, filled like a button when on."
        importLine={`import { Checkbox, CheckboxGroup, RadioGroup, Radio, Switch } from "@jm/ui";`}
      />

      <Section
        title="Checkbox"
        desc="With a label and an optional description; the check draws itself in. Two sizes, disabled and invalid states, and an indeterminate “some are selected” state for select-all boxes."
        code={`
<Checkbox label="Email me a copy" />
<Checkbox label="Attach PDF" description="Adds the invoice as an attachment." defaultChecked />
<Checkbox label="Mark as paid" disabled />

// Select all
<Checkbox
  label="Send to all clients"
  checked={all}
  indeterminate={some && !all}
  onCheckedChange={(v) => setPicked(v ? everyone : [])}
/>`}
      >
        <div className="grid w-full gap-8 sm:grid-cols-2">
          <div className="grid gap-3.5">
            <Checkbox label="Email me a copy" />
            <Checkbox label="Attach PDF" description="Adds the invoice as an attachment." defaultChecked />
            <Checkbox label="Mark as paid" disabled />
            <Checkbox label="Mark as paid" disabled defaultChecked />
            <Checkbox size="sm" label="Small" defaultChecked />
          </div>
          <SelectAllDemo />
        </div>
      </Section>

      <Section
        title="Radio group"
        desc="For one choice from a few options. The arrow keys move between them, as with native radios. Use a Select when there are more than five or so."
        code={`
<RadioGroup label="Send the invoice" defaultValue="now" onValueChange={setWhen}>
  <Radio value="now" label="Now" />
  <Radio value="scheduled" label="On a date" description="Choose the date on the next step." />
  <Radio value="draft" label="Save as draft" />
</RadioGroup>`}
      >
        <div className="grid w-full gap-8 sm:grid-cols-2">
          <RadioGroup label="Send the invoice" defaultValue="now">
            <Radio value="now" label="Now" />
            <Radio value="scheduled" label="On a date" description="Choose the date on the next step." />
            <Radio value="draft" label="Save as draft" />
            <Radio value="recurring" label="Every month" disabled description="Available on the Team plan." />
          </RadioGroup>
          <RadioGroup label="Paper size" defaultValue="a4" orientation="horizontal" size="sm">
            <Radio value="a4" label="A4" />
            <Radio value="letter" label="Letter" />
            <Radio value="legal" label="Legal" />
          </RadioGroup>
        </div>
      </Section>

      <Section
        title="Switch"
        desc="A flip switch for settings that take effect right away: the knob slides across a track marked On and Off. Return a Promise from onCheckedChange and the switch shows a spinner while it saves — and flips back if saving fails. Try it with the failure box ticked."
        code={`
<Switch
  labelPosition="start"
  label="Payment received"
  description="When a client pays an invoice."
  defaultChecked
  onCheckedChange={(on) => api.updateSetting("notify_paid", on)}   // a Promise
/>`}
      >
        <SettingsDemo />
      </Section>

      <Section
        title="In a form"
        desc="Inside a Field they take its label, help and error. Give them names and they post like native inputs — checkbox groups as name[]=value for Laravel arrays. Submit without ticking the terms to see the error."
        code={`
<Field label="Billing cycle">
  <RadioGroup name="cycle" defaultValue="monthly" orientation="horizontal">…</RadioGroup>
</Field>
<Field label="Payment methods to offer">
  <CheckboxGroup name="methods[]" defaultValue={["card", "gcash"]} options={[…]} />
</Field>
<Field label="Terms" error={errors.terms}>
  <Checkbox name="terms" value="accepted" label="I agree to the terms of service" />
</Field>`}
      >
        <FormDemo />
      </Section>
    </>
  );
}
