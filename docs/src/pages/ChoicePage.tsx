import * as React from "react";
import { Checkbox, CheckboxGroup, RadioGroup, Radio, Switch, Field, Button, Card, CardHeader, CardContent, Text, toast, PillGroup, PillOption, type SwitchVariant } from "@jm/ui";
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

function VariantsDemo() {
  return (
    <div className="grid w-full max-w-md gap-3">
      {(
        [
          ["labelled", "Labelled", "The word sits inside the pill: “On” in white on blue, “Off” in gray."],
          ["mark", "Mark", "The knob shows × when off and bends into a blue ✓ when on."],
          ["liquid", "Liquid", "An outlined pill that floods blue out from the knob."],
        ] as const
      ).map(([v, name, text]) => (
        <Card key={v} padding="sm">
          <CardContent className="grid gap-3">
            <div>
              <p className="text-sm font-semibold">{name}</p>
              <p className="text-[0.8125rem] text-fg-muted">{text}</p>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <Switch variant={v} defaultChecked aria-label={`${name} switch, on`} />
              <Switch variant={v} aria-label={`${name} switch, off`} />
              <Switch variant={v} size="sm" defaultChecked aria-label={`${name} small switch, on`} />
              <Switch variant={v} size="sm" aria-label={`${name} small switch, off`} />
              <Switch variant={v} disabled aria-label={`${name} switch, disabled`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ColorsDemo() {
  const colors = [
    ["primary", "Primary"],
    ["secondary", "Secondary"],
    ["tertiary", "Tertiary"],
    ["#7c3aed", "Custom"],
  ] as const;
  return (
    <div className="grid w-full max-w-md gap-3">
      <Card padding="sm">
        <CardContent className="grid gap-4">
          {(["labelled", "mark", "liquid"] as const).map((v) => (
            <div key={v} className="grid gap-2">
              <p className="text-[0.8125rem] font-medium capitalize text-fg-muted">{v}</p>
              <div className="flex flex-wrap items-center gap-4">
                {colors.map(([c, name]) => (
                  <div key={c} className="grid justify-items-center gap-1.5">
                    <Switch variant={v} color={c} defaultChecked aria-label={`${name} ${v} switch`} />
                    <span className="text-[0.6875rem] text-fg-muted">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsDemo() {
  const [fail, setFail] = React.useState(false);
  const [variant, setVariant] = React.useState<string | null>("labelled");
  const [color, setColor] = React.useState<string | null>("primary");
  const save = (label: string) => async (on: boolean) => {
    await wait(900);
    if (fail) {
      toast.error(`Couldn't update “${label}”`, { description: "Check your connection and try again." });
      throw new Error("failed");
    }
    toast.success(`${label} ${on ? "on" : "off"}`);
  };
  const v = (variant ?? "labelled") as SwitchVariant;
  return (
    <div className="grid w-full max-w-md gap-3">
      <PillGroup value={variant} onValueChange={setVariant} size="sm" aria-label="Switch style">
        <PillOption value="labelled">Labelled</PillOption>
        <PillOption value="mark">Mark</PillOption>
        <PillOption value="liquid">Liquid</PillOption>
      </PillGroup>
      <PillGroup value={color} onValueChange={setColor} size="sm" aria-label="Switch color">
        <PillOption value="primary">Primary</PillOption>
        <PillOption value="secondary">Secondary</PillOption>
        <PillOption value="tertiary">Tertiary</PillOption>
      </PillGroup>
      <Card>
        <CardHeader title="Notifications" description="Changes save as soon as you flip a switch." />
        <CardContent className="grid gap-4">
          <Switch variant={v} color={color ?? "primary"} labelPosition="start" defaultChecked label="Payment received" description="When a client pays an invoice." onCheckedChange={save("Payment received")} />
          <Switch variant={v} color={color ?? "primary"} labelPosition="start" defaultChecked label="Invoice viewed" description="The first time a client opens it." onCheckedChange={save("Invoice viewed")} />
          <Switch variant={v} color={color ?? "primary"} labelPosition="start" label="Weekly summary" description="Every Monday at 8 AM." onCheckedChange={save("Weekly summary")} />
          <Switch variant={v} color={color ?? "primary"} labelPosition="start" label="Product news" disabled description="Turned off by your workspace admin." />
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
        title="Switch styles"
        desc="Three looks for the same switch. Labelled puts the word inside the pill; mark shows × or ✓ on the knob, so the state never depends on color alone; liquid floods blue out from the knob. The knob stretches slightly while pressed and springs into place."
        code={`
<Switch label="Payment received" />                     {/* variant="labelled", the default */}
<Switch variant="mark" label="Payment received" />
<Switch variant="liquid" label="Payment received" />

<Switch size="sm" … />                                 {/* compact */}
<Switch onLabel="Yes" offLabel="No" … />               {/* your own words (labelled) */}`}
      >
        <VariantsDemo />
      </Section>

      <Section
        title="Colors"
        desc={
          <>
            Pick the “on” color with <code className="font-mono text-[0.8125rem]">color</code>: primary (blue, the
            default), secondary (green) or tertiary (orange). They're theme tokens, so you can rebrand them — or pass
            success, warning, danger, info, or any CSS color.
          </>
        }
        code={`
<Switch color="primary" … />       {/* blue, the default */}
<Switch color="secondary" … />     {/* green */}
<Switch color="tertiary" … />      {/* orange */}
<Switch color="#7c3aed" … />       {/* any CSS color */}

/* Rebrand secondary and tertiary for your app, after the theme import */
:root {
  --ui-tone-secondary: #0f766e;  --ui-tone-secondary-fg: #ffffff;
  --ui-tone-tertiary:  #db2777;  --ui-tone-tertiary-fg:  #ffffff;
}
.dark {
  --ui-tone-secondary: #2dd4bf;  --ui-tone-secondary-fg: #042f2e;
  --ui-tone-tertiary:  #f472b6;  --ui-tone-tertiary-fg:  #500724;
}`}
      >
        <ColorsDemo />
      </Section>

      <Section
        title="Saving as you flip"
        desc="Return a Promise from onCheckedChange and the knob shows a spinner while it saves — and the switch flips back if saving fails. Pick a style, then try it with the failure box ticked."
        code={`
<Switch
  variant="mark"
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
