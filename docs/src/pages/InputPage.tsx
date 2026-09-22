import * as React from "react";
import { Button, Field, Input } from "@jm/ui";
import { PageHeader, Section } from "../components/Doc";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const SearchIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true">
    <circle cx="9" cy="9" r="5.5" />
    <path d="M13 13l3.5 3.5" />
  </svg>
);

function Stack({ children }: { children: React.ReactNode }) {
  return <div className="grid w-full max-w-sm gap-5">{children}</div>;
}

/* ---------- demos ---------- */

function ValidationDemo() {
  const [email, setEmail] = React.useState("ana@example");
  const [touched, setTouched] = React.useState(true);
  const error =
    touched && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? "Enter an email address like name@example.com."
      : undefined;
  return (
    <Stack>
      <Field label="Work email" error={error} required>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          leadingIcon="bi bi-envelope"
        />
      </Field>
    </Stack>
  );
}

function SignInDemo() {
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});
  const [done, setDone] = React.useState(false);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await wait(900);
    const next: typeof errors = {};
    if (!data.get("email")) next.email = "Enter your email address.";
    if (String(data.get("password") ?? "").length < 8) next.password = "Passwords are at least 8 characters.";
    setErrors(next);
    setDone(Object.keys(next).length === 0);
  };
  const [pending, setPending] = React.useState(false);
  return (
    <form
      className="grid w-full max-w-sm gap-5 rounded-[0.625rem] border border-border bg-surface p-5"
      noValidate
      onSubmit={async (e) => {
        setPending(true);
        await submit(e);
        setPending(false);
      }}
    >
      <Field label="Email" error={errors.email}>
        <Input name="email" type="email" autoComplete="email" placeholder="you@example.com" />
      </Field>
      <Field label="Password" error={errors.password}>
        <Input name="password" type="password" autoComplete="current-password" />
      </Field>
      <Button type="submit" fullWidth loading={pending} spinnerPlacement="start" loadingLabel="Signing in…">
        Sign in
      </Button>
      {done && <p role="status" className="text-sm text-fg-muted">Signed in.</p>}
    </form>
  );
}

/* ---------- page ---------- */

export function InputPage() {
  return (
    <>
      <PageHeader
        title="Input"
        intro="A single-line text field. Put it inside a Field to give it a label, help text and an error message — the ids and screen-reader wiring are handled for you."
        importLine={`import { Field, Input } from "@jm/ui";`}
      />

      <Section
        title="With a label"
        desc="Field adds the label, an optional description, and marks required fields with an asterisk."
        code={`
<Field label="Full name" required>
  <Input autoComplete="name" />
</Field>

<Field label="Company" description="Shown on your invoices." optional>
  <Input autoComplete="organization" />
</Field>`}
      >
        <Stack>
          <Field label="Full name" required>
            <Input autoComplete="name" />
          </Field>
          <Field label="Company" description="Shown on your invoices." optional>
            <Input autoComplete="organization" />
          </Field>
        </Stack>
      </Section>

      <Section
        title="Sizes"
        desc="Heights match Button sizes, so an input and a button sit in a row without adjusting anything."
        code={`
<Input size="sm" placeholder="Small" />
<Input placeholder="Medium" />           {/* default */}
<Input size="lg" placeholder="Large" />

<div className="flex gap-2">
  <Input placeholder="Invite by email" />
  <Button>Invite</Button>
</div>`}
      >
        <Stack>
          <Input size="sm" placeholder="Small" aria-label="Small example" />
          <Input placeholder="Medium" aria-label="Medium example" />
          <Input size="lg" placeholder="Large" aria-label="Large example" />
          <div className="flex gap-2">
            <Input placeholder="Invite by email" aria-label="Email to invite" />
            <Button>Invite</Button>
          </div>
        </Stack>
      </Section>

      <Section
        title="Corners"
        desc="The same rounded scale as Button. Pill inputs suit search boxes."
        code={`
<Input rounded="none" />
<Input rounded="sm" />
<Input rounded="md" />                     {/* default */}
<Input rounded="lg" />
<Input rounded="full" leadingIcon={<SearchIcon />} placeholder="Search" />`}
      >
        <Stack>
          <Input rounded="none" placeholder="Square" aria-label="Square example" />
          <Input rounded="sm" placeholder="Slightly rounded" aria-label="Slightly rounded example" />
          <Input rounded="lg" placeholder="More rounded" aria-label="More rounded example" />
          <Input rounded="full" leadingIcon={<SearchIcon />} placeholder="Search" type="search" aria-label="Search" />
        </Stack>
      </Section>

      <Section
        title="Icons"
        desc="Add an icon before or after the text — an SVG element or an icon-font class, like Button."
        code={`
<Input leadingIcon={<SearchIcon />} placeholder="Search invoices" />
<Input leadingIcon="bi bi-envelope" type="email" placeholder="you@example.com" />
<Input leadingIcon="bi bi-geo-alt" trailingIcon="bi bi-chevron-down" placeholder="City" />`}
      >
        <Stack>
          <Input leadingIcon={<SearchIcon />} placeholder="Search invoices" aria-label="Search invoices" />
          <Input leadingIcon="bi bi-envelope" type="email" placeholder="you@example.com" aria-label="Email" />
          <Input leadingIcon="bi bi-geo-alt" trailingIcon="bi bi-chevron-down" placeholder="City" aria-label="City" />
        </Stack>
      </Section>

      <Section
        title="Prefix and suffix"
        desc="Fixed text that belongs to the value but isn't typed, like a protocol, a currency or a unit."
        code={`
<Field label="Website">
  <Input prefix="https://" placeholder="example.com" />
</Field>
<Field label="Price">
  <Input prefix="₱" type="number" inputMode="decimal" suffix="PHP" />
</Field>
<Field label="Weight">
  <Input type="number" suffix="kg" />
</Field>
<Field label="Username">
  <Input suffix="@astherix.com" />
</Field>`}
      >
        <Stack>
          <Field label="Website">
            <Input prefix="https://" placeholder="example.com" />
          </Field>
          <Field label="Price">
            <Input prefix="₱" type="number" inputMode="decimal" suffix="PHP" placeholder="0.00" />
          </Field>
          <Field label="Weight">
            <Input type="number" suffix="kg" defaultValue={72} />
          </Field>
          <Field label="Username">
            <Input suffix="@astherix.com" defaultValue="jm" />
          </Field>
        </Stack>
      </Section>

      <Section
        title="Clearable"
        desc="A × button appears once there's text, and puts focus back in the field after clearing."
        code={`
<Input
  type="search"
  leadingIcon={<SearchIcon />}
  placeholder="Search people"
  clearable
  value={query}
  onChange={(e) => setQuery(e.target.value)}
/>`}
      >
        <Stack>
          <Input type="search" leadingIcon={<SearchIcon />} placeholder="Search people" clearable defaultValue="Maria" aria-label="Search people" />
        </Stack>
      </Section>

      <Section
        title="Password"
        desc="Password inputs get a button to show and hide what's typed. Turn it off with revealable={false}."
        code={`
<Field label="Password" description="At least 8 characters.">
  <Input type="password" autoComplete="new-password" />
</Field>`}
      >
        <Stack>
          <Field label="Password" description="At least 8 characters.">
            <Input type="password" autoComplete="new-password" defaultValue="correct horse" />
          </Field>
        </Stack>
      </Section>

      <Section
        title="Errors"
        desc="Pass an error to Field and the input turns red, the message appears under it, and screen readers announce both."
        code={`
<Field label="Work email" error={errors.email} required>
  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
</Field>

// Without a Field
<Input invalid aria-label="Email" />`}
      >
        <ValidationDemo />
      </Section>

      <Section
        title="Disabled and read-only"
        desc="Disabled inputs can't be focused and aren't submitted with the form. Read-only inputs can be focused, selected and copied, and are submitted."
        code={`
<Field label="Plan" disabled>
  <Input defaultValue="Team" />
</Field>
<Field label="API key" description="Copy it into your .env file.">
  <Input readOnly defaultValue="sk_live_4f9a…" />
</Field>`}
      >
        <Stack>
          <Field label="Plan" disabled>
            <Input defaultValue="Team" />
          </Field>
          <Field label="API key" description="Copy it into your .env file.">
            <Input readOnly defaultValue="sk_live_4f9a2c81d0e7" />
          </Field>
        </Stack>
      </Section>

      <Section
        title="In a form"
        desc="Inputs work with plain forms, react-hook-form, and Inertia's useForm. Submit with empty fields to see the errors."
        code={`
// Laravel + Inertia
const form = useForm({ email: "", password: "" });

<form onSubmit={(e) => { e.preventDefault(); form.post("/login"); }}>
  <Field label="Email" error={form.errors.email}>
    <Input type="email" value={form.data.email}
      onChange={(e) => form.setData("email", e.target.value)} />
  </Field>
  <Field label="Password" error={form.errors.password}>
    <Input type="password" value={form.data.password}
      onChange={(e) => form.setData("password", e.target.value)} />
  </Field>
  <Button type="submit" fullWidth loading={form.processing}>Sign in</Button>
</form>`}
      >
        <SignInDemo />
      </Section>
    </>
  );
}
