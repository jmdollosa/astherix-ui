import * as React from "react";
import { Button, Field } from "@jm/ui";
import { Editor } from "@jm/ui/editor";
import { Code, PageHeader, Section } from "../components/Doc";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const sample = `<h2>Release notes</h2><p>This update makes invoices <strong>faster to send</strong> and easier to read.</p><ul><li><p>Send reminders from the invoice page</p></li><li><p>Download a <em>PDF</em> for any invoice</p></li></ul><blockquote><p>Tip: press ⌘K or Ctrl+K to add a link.</p></blockquote><p>Read the <a href="https://example.com/changelog">full changelog</a>.</p>`;

function Stack({ children }: { children: React.ReactNode }) {
  return <div className="grid w-full max-w-2xl gap-5">{children}</div>;
}

function ControlledDemo() {
  const [html, setHtml] = React.useState("<p>Edit this text and watch the HTML update.</p>");
  return (
    <Stack>
      <Field label="Announcement">
        <Editor value={html} onChange={setHtml} />
      </Field>
      <div className="grid gap-1.5">
        <p className="text-sm font-medium">HTML output</p>
        <Code code={html || '""'} />
      </div>
    </Stack>
  );
}

function FormDemo() {
  const [error, setError] = React.useState<string>();
  const [saved, setSaved] = React.useState<string>();
  const [pending, setPending] = React.useState(false);
  return (
    <Stack>
      <form
        className="grid gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const body = String(new FormData(e.currentTarget).get("body") ?? "");
          if (!body) {
            setError("Write a message before posting.");
            return;
          }
          setError(undefined);
          setPending(true);
          await wait(800);
          setPending(false);
          setSaved(body);
        }}
      >
        <Field label="Comment" error={error}>
          <Editor name="body" toolbar={["bold", "italic", "link", "bulletList", "code"]} minHeight="6rem" placeholder="Write a comment…" />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" loading={pending} spinnerPlacement="start" loadingLabel="Posting…">Post comment</Button>
        </div>
      </form>
      {saved && (
        <div className="grid gap-2">
          <p className="text-sm font-medium">Posted comment, shown with className="ui-prose"</p>
          <div className="ui-prose rounded-[0.625rem] border border-border bg-surface p-4" dangerouslySetInnerHTML={{ __html: saved }} />
        </div>
      )}
    </Stack>
  );
}

export function EditorPage() {
  return (
    <>
      <PageHeader
        title="Editor"
        intro="A basic rich-text editor for comments, descriptions and announcements. It edits HTML, supports the usual shortcuts, and matches the look of the other form controls. It's built on Tiptap and lives in its own entry point, so apps that don't use it don't load it."
        importLine={`import { Editor } from "@jm/ui/editor";`}
      />

      <Section
        title="Basic"
        desc="Headings, bold, italic, underline, strikethrough, inline code, links, lists, quotes, and undo. Put it in a Field for the label."
        code={`
<Field label="Release notes">
  <Editor defaultValue={savedHtml} />
</Field>`}
      >
        <Stack>
          <Field label="Release notes">
            <Editor defaultValue={sample} />
          </Field>
        </Stack>
      </Section>

      <Section
        title="Controlled"
        desc="value and onChange work with HTML strings. An empty editor gives an empty string, so a required check is just !html."
        code={`
const [html, setHtml] = useState("<p>Hello</p>");

<Editor value={html} onChange={setHtml} />

// Inertia
<Editor value={form.data.body} onChange={(html) => form.setData("body", html)} />`}
      >
        <ControlledDemo />
      </Section>

      <Section
        title="Choose the toolbar"
        desc={'Pass the buttons you want, in order. "|" adds a divider. Shortcuts still work for anything left out.'}
        code={`
<Editor toolbar={["bold", "italic", "link", "|", "bulletList", "orderedList"]} />

// All tools:
// paragraph heading2 heading3 bold italic underline strike code
// link bulletList orderedList blockquote horizontalRule undo redo`}
      >
        <Stack>
          <Editor aria-label="Short note" toolbar={["bold", "italic", "link", "|", "bulletList", "orderedList"]} minHeight="6rem" placeholder="Leave a short note…" />
        </Stack>
      </Section>

      <Section
        title="Character limit"
        desc="maxLength stops typing at the limit and shows a counter that darkens as it gets close."
        code={`
<Field label="Summary">
  <Editor maxLength={280} minHeight="5rem" />
</Field>`}
      >
        <Stack>
          <Field label="Summary">
            <Editor maxLength={280} minHeight="5rem" toolbar={["bold", "italic", "link"]} defaultValue="<p>A short summary that shows on the project card.</p>" />
          </Field>
        </Stack>
      </Section>

      <Section
        title="Height"
        desc="minHeight sets the starting size. With maxHeight, the writing area scrolls instead of growing past it."
        code={`
<Editor minHeight="6rem" maxHeight="16rem" />`}
      >
        <Stack>
          <Editor aria-label="Scrolling example" minHeight="6rem" maxHeight="10rem" defaultValue={sample + sample} />
        </Stack>
      </Section>

      <Section
        title="Read-only, disabled and errors"
        desc="Read-only shows the formatted text without a toolbar. Errors come from Field like every other control."
        code={`
<Editor readOnly value={post.body} />
<Editor disabled defaultValue="…" />

<Field label="Description" error="Add a description of at least one sentence.">
  <Editor />
</Field>`}
      >
        <Stack>
          <Field label="Published post">
            <Editor readOnly defaultValue={sample} />
          </Field>
          <Field label="Description" error="Add a description of at least one sentence.">
            <Editor minHeight="5rem" toolbar={["bold", "italic", "link"]} />
          </Field>
        </Stack>
      </Section>

      <Section
        title="Saving and showing HTML"
        desc="Give it a name and the HTML is posted with the form. To show saved HTML, use the ui-prose class so it looks the same as in the editor. Always sanitize HTML on the server before showing it."
        code={`
<form method="post" action="/comments">
  <Field label="Comment">
    <Editor name="body" />
  </Field>
  <Button type="submit">Post comment</Button>
</form>

// Laravel: sanitize before saving (e.g. stevebauman/purify)
$comment->body = Purify::clean($request->input('body'));

// Showing it
<div className="ui-prose" dangerouslySetInnerHTML={{ __html: comment.body }} />`}
      >
        <FormDemo />
      </Section>

      <Section
        title="Shortcuts"
        desc="Common keyboard shortcuts work, and so does Markdown-style typing at the start of a line."
        code={`
Ctrl/⌘ + B  I  U      bold, italic, underline
Ctrl/⌘ + E            inline code
Ctrl/⌘ + K            add or edit a link
Ctrl/⌘ + Z / Y        undo / redo

"## " + space         heading
"### " + space        subheading
"- " or "* "          bulleted list
"1. "                 numbered list
"> "                  quote
"---"                 divider line`}
      >
        <p className="text-sm text-fg-muted">Try them in any editor above. In the toolbar, use the arrow keys to move between buttons.</p>
      </Section>
    </>
  );
}
