import * as React from "react";
import { Button, Field, Textarea } from "@jm/ui";
import { PageHeader, Section } from "../components/Doc";

function Stack({ children }: { children: React.ReactNode }) {
  return <div className="grid w-full max-w-md gap-5">{children}</div>;
}

function FeedbackDemo() {
  const [text, setText] = React.useState("");
  const [error, setError] = React.useState<string>();
  const [sent, setSent] = React.useState(false);
  return (
    <form
      className="grid w-full max-w-md gap-4"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        setSent(false);
        if (text.trim().length < 10) {
          setError("Tell us a bit more — at least 10 characters.");
          return;
        }
        setError(undefined);
        await new Promise((r) => setTimeout(r, 1000));
        setText("");
        setSent(true);
      }}
    >
      <Field label="What could we do better?" error={error}>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoResize
          minRows={3}
          maxRows={8}
          showCount
          maxLength={500}
        />
      </Field>
      <div className="flex items-center justify-end gap-3">
        {sent && <p role="status" className="text-sm text-fg-muted">Thanks — feedback sent.</p>}
        <Button type="submit" spinnerPlacement="start" loadingLabel="Sending…">Send feedback</Button>
      </div>
    </form>
  );
}

export function TextareaPage() {
  return (
    <>
      <PageHeader
        title="Textarea"
        intro="A multi-line text field for messages, notes and descriptions. It shares its look, sizes and Field wiring with Input, and can grow with its content."
        importLine={`import { Field, Textarea } from "@jm/ui";`}
      />

      <Section
        title="With a label"
        desc="Wrap it in a Field for the label, description and error message."
        code={`
<Field label="Project description" description="A sentence or two about what it's for.">
  <Textarea />
</Field>`}
      >
        <Stack>
          <Field label="Project description" description="A sentence or two about what it's for.">
            <Textarea />
          </Field>
        </Stack>
      </Section>

      <Section
        title="Grow with the text"
        desc={
          <>
            With <code className="font-mono text-[0.8125rem]">autoResize</code> it starts at{" "}
            <code className="font-mono text-[0.8125rem]">minRows</code> and grows as you type, up to{" "}
            <code className="font-mono text-[0.8125rem]">maxRows</code>; after that it scrolls. Type a few lines to try
            it.
          </>
        }
        code={`
<Field label="Message">
  <Textarea autoResize minRows={2} maxRows={6} placeholder="Write a message…" />
</Field>`}
      >
        <Stack>
          <Field label="Message">
            <Textarea autoResize minRows={2} maxRows={6} placeholder="Write a message…" />
          </Field>
        </Stack>
      </Section>

      <Section
        title="Character count"
        desc="showCount displays how much has been typed. With maxLength it shows the limit and turns darker near it."
        code={`
<Field label="Bio">
  <Textarea showCount maxLength={160} />
</Field>

<Textarea showCount />   {/* "42 characters" */}`}
      >
        <Stack>
          <Field label="Bio">
            <Textarea showCount maxLength={160} defaultValue="Developer building web and mobile apps with Laravel, Next.js and React." />
          </Field>
        </Stack>
      </Section>

      <Section
        title="Sizes and corners"
        desc="The same size and rounded options as Input, except pill corners, which don't suit several lines of text."
        code={`
<Textarea size="sm" rows={2} />
<Textarea />                   {/* medium, the default */}
<Textarea size="lg" rounded="lg" />`}
      >
        <Stack>
          <Textarea size="sm" minRows={2} placeholder="Small" aria-label="Small example" />
          <Textarea placeholder="Medium" aria-label="Medium example" />
          <Textarea size="lg" rounded="lg" placeholder="Large, more rounded" aria-label="Large example" />
        </Stack>
      </Section>

      <Section
        title="Resizing"
        desc={'By default people can drag the corner to make it taller. Set resize="none" to turn that off. autoResize always turns it off.'}
        code={`
<Textarea resize="vertical" />   {/* default */}
<Textarea resize="none" />`}
      >
        <Stack>
          <Textarea resize="none" placeholder="Fixed height" aria-label="Fixed height example" />
        </Stack>
      </Section>

      <Section
        title="Errors, disabled and read-only"
        desc="Same behavior as Input."
        code={`
<Field label="Reason for refund" error="Tell us why you'd like a refund." required>
  <Textarea />
</Field>
<Field label="Original request" disabled>
  <Textarea defaultValue="…" />
</Field>`}
      >
        <Stack>
          <Field label="Reason for refund" error="Tell us why you'd like a refund." required>
            <Textarea minRows={2} />
          </Field>
          <Field label="Original request" disabled>
            <Textarea minRows={2} defaultValue="Please change the invoice address to our new office." />
          </Field>
        </Stack>
      </Section>

      <Section
        title="In a form"
        desc="A feedback form with validation, a growing textarea and a character limit. Send it with fewer than 10 characters to see the error."
        code={`
<Field label="What could we do better?" error={errors.feedback}>
  <Textarea
    value={text}
    onChange={(e) => setText(e.target.value)}
    autoResize minRows={3} maxRows={8}
    showCount maxLength={500}
  />
</Field>
<Button type="submit">Send feedback</Button>`}
      >
        <FeedbackDemo />
      </Section>
    </>
  );
}
