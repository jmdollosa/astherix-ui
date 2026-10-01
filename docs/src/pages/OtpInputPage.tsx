import * as React from "react";
import { Button, Field, OtpInput, Text } from "@astherix/ui";
import { PageHeader, Section } from "../components/Doc";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function VerifyDemo() {
  const [code, setCode] = React.useState("");
  const [state, setState] = React.useState<{ checking: boolean; error?: string; ok?: boolean }>({ checking: false });

  const check = async (value: string) => {
    setState({ checking: true });
    await wait(700);
    if (value === "123456") setState({ checking: false, ok: true });
    else {
      setState({ checking: false, error: "That code didn't work. Check it and try again." });
      setCode("");
    }
  };

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        void check(code);
      }}
    >
      <Field label="Authentication code" description="Try 123456." error={state.error}>
        <OtpInput value={code} onValueChange={setCode} onComplete={check} disabled={state.checking} autoFocus={false} />
      </Field>
      <div className="flex items-center gap-3">
        <Button type="submit" loading={state.checking} disabled={code.length < 6}>
          Verify
        </Button>
        {state.ok && <Text size="sm" tone="success" role="status">Verified</Text>}
      </div>
    </form>
  );
}

export function OtpInputPage() {
  return (
    <>
      <PageHeader
        title="One-time code"
        intro="A code in separate boxes, for two-factor sign-in and email or phone verification. Underneath it's one real input, so phones can offer the code from an SMS, pasting fills every box, and it posts with a form like any other field."
        importLine={`import { OtpInput } from "@astherix/ui";`}
      />

      <Section
        title="Verify a code"
        desc={<>Inside a Field it gets the label, help text and error. <code>onComplete</code> fires when the last box fills — handy for checking straight away.</>}
        code={`
<Field label="Authentication code" error={errors.code}>
  <OtpInput value={code} onValueChange={setCode} onComplete={verify} />
</Field>`}
      >
        <VerifyDemo />
      </Section>

      <Section
        title="In a form"
        desc={<>Give it a <code>name</code> and it posts like an input — no state needed. A form reset (such as Inertia's <code>resetOnError</code>) clears it.</>}
        code={`
<Form action="/two-factor-challenge" method="post" resetOnError>
  <OtpInput name="code" autoFocus />
  <Button type="submit">Continue</Button>
</Form>`}
      >
        <form className="flex flex-wrap items-center gap-3" onSubmit={(e) => e.preventDefault()}>
          <OtpInput name="code" />
          <Button type="reset" variant="ghost">Clear</Button>
        </form>
      </Section>

      <Section
        title="Options"
        desc={<>Split long codes into groups, allow letters, hide the characters for a PIN, and pick a size that matches the buttons beside it.</>}
        code={`
<OtpInput length={6} groupSize={3} />                  // 123–456
<OtpInput length={8} allow="alphanumeric" groupSize={4} />   // backup codes, upper-cased
<OtpInput length={4} mask size="lg" />                 // a PIN
<OtpInput allow={/[0-9a-f]/} />                         // your own rule per character`}
      >
        <div className="grid gap-4">
          <OtpInput aria-label="Grouped code" groupSize={3} />
          <OtpInput aria-label="Backup code" length={8} allow="alphanumeric" groupSize={4} size="sm" />
          <OtpInput aria-label="PIN" length={4} mask size="lg" />
        </div>
      </Section>

      <Section
        title="Accessibility"
        desc="Screen readers meet one text field with the whole code, not six unlabeled boxes."
        code={`
// Outside a Field, name it:
<OtpInput aria-label="Code from your authenticator app" />`}
      >
        <ul className="grid gap-1.5 text-sm text-fg-muted">
          <li>autocomplete="one-time-code" lets iOS and Android offer codes from messages.</li>
          <li>Digits-only codes bring up the number keypad.</li>
          <li>Backspace deletes from the end; letters outside <code>allow</code> are ignored, so pasting "123 456" works.</li>
        </ul>
      </Section>
    </>
  );
}
