import * as React from "react";
import { Button } from "@jm/ui";
import { Code, Section, PageHeader } from "../components/Doc";

/* ---------- helpers ---------- */

// Stands in for a real HTTP request in this demo.
const fakeRequest = (ms = 1800, fail = false) =>
  new Promise<void>((resolve, reject) => setTimeout(() => (fail ? reject(new Error("Request failed")) : resolve()), ms));

const svg = (paths: string[]) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {paths.map((d) => <path key={d} d={d} />)}
  </svg>
);
const PlusIcon = () => svg(["M10 4.5v11", "M4.5 10h11"]);
const DownloadIcon = () => svg(["M10 3.5v9", "M6 8.5l4 4 4-4", "M4 15.5h12"]);
const TrashIcon = () => svg(["M4 6h12", "M8 6V4.5h4V6", "M5.5 6l.7 9.5h7.6l.7-9.5"]);

/* ---------- demos ---------- */

function OnDemandDemo() {
  const [syncing, setSyncing] = React.useState(false);
  return (
    <>
      <Button variant="secondary" loading={syncing} spinnerPlacement="start" leadingIcon="bi bi-arrow-repeat" loadingLabel="Syncing…">
        Sync contacts
      </Button>
      <Button variant="ghost" onClick={() => setSyncing((s) => !s)}>
        {syncing ? "Stop" : "Start"} loading
      </Button>
    </>
  );
}

function OrbitToggleDemo() {
  const [on, setOn] = React.useState(true);
  return (
    <>
      <Button variant="secondary" loadingIndicator="orbit" loading={on} loadingLabel="Listening…" leadingIcon="bi bi-mic">
        Voice search
      </Button>
      <Button variant="ghost" onClick={() => setOn((v) => !v)}>
        {on ? "Stop" : "Start"} loading
      </Button>
    </>
  );
}

function UploadDemo({ progressStyle }: { progressStyle: "fill" | "bar" }) {
  const [pct, setPct] = React.useState<number | null>(null);
  const start = () => {
    setPct(0);
    let p = 0;
    const tick = setInterval(() => {
      p = Math.min(100, p + Math.round(4 + Math.random() * 12));
      setPct(p);
      if (p >= 100) {
        clearInterval(tick);
        setTimeout(() => setPct(null), 250);
      }
    }, 280);
  };
  return (
    <Button
      variant={progressStyle === "fill" ? "primary" : "secondary"}
      leadingIcon="bi bi-cloud-arrow-up"
      loadingIndicator="progress"
      progressStyle={progressStyle}
      loading={pct !== null}
      progress={pct ?? 0}
      loadingLabel={`Uploading ${pct ?? 0}%`}
      onClick={start}
    >
      Upload photos
    </Button>
  );
}

function ErrorDemo() {
  const [error, setError] = React.useState("");
  return (
    <>
      <Button
        spinnerPlacement="end"
        loadingLabel="Sending…"
        onClick={async () => {
          setError("");
          try {
            await fakeRequest(1400, true);
          } catch {
            setError("Couldn't send the invite. Check the email address and try again.");
          }
        }}
      >
        Send invite
      </Button>
      {error && <p role="alert" className="basis-full text-sm text-danger">{error}</p>}
    </>
  );
}

export function ButtonPage() {
  return (
    <>
      <PageHeader
        title="Button"
        intro="Starts an action. Use one primary button per view for the main thing a person came to do, and secondary or ghost buttons for everything around it."
        importLine={`import { Button } from "@jm/ui";`}
      />

      <Section
        title="Variants"
        desc="Primary for the main action, secondary for alternatives, ghost for low-emphasis actions, danger for anything destructive."
        code={`
<Button>Save changes</Button>
<Button variant="secondary">Preview</Button>
<Button variant="ghost">Cancel</Button>
<Button variant="danger">Delete project</Button>`}
      >
        <Button>Save changes</Button>
        <Button variant="secondary">Preview</Button>
        <Button variant="ghost">Cancel</Button>
        <Button variant="danger">Delete project</Button>
      </Section>

      <Section
        title="Sizes"
        desc="Medium is the default. Small fits tables and toolbars; large suits touch-first screens."
        code={`
<Button size="sm">Small</Button>
<Button>Medium</Button>
<Button size="lg">Large</Button>`}
      >
        <Button size="sm">Small</Button>
        <Button>Medium</Button>
        <Button size="lg">Large</Button>
      </Section>

      <Section
        title="Corners"
        desc={
          <>
            Set <code className="font-mono text-[0.8125rem]">rounded</code> to change the corner radius. Medium is the
            default. Pill buttons get slightly wider padding so the label has room.
          </>
        }
        code={`
<Button rounded="none">Square</Button>
<Button rounded="sm">Slightly rounded</Button>
<Button rounded="md">Medium</Button>   {/* default */}
<Button rounded="lg">More rounded</Button>
<Button rounded="full">Pill</Button>`}
      >
        <Button rounded="none">Square</Button>
        <Button rounded="sm">Slightly rounded</Button>
        <Button rounded="md">Medium</Button>
        <Button rounded="lg">More rounded</Button>
        <Button rounded="full">Pill</Button>
      </Section>

      <Section
        title="Circle"
        desc={
          <>
            Combine <code className="font-mono text-[0.8125rem]">iconOnly</code> with{" "}
            <code className="font-mono text-[0.8125rem]">rounded="full"</code> for a perfect circle. Always add an
            aria-label.
          </>
        }
        code={`
<Button iconOnly rounded="full" size="sm" icon="bi bi-plus-lg" aria-label="Add" />
<Button iconOnly rounded="full" icon="bi bi-play-fill" aria-label="Play" />
<Button iconOnly rounded="full" size="lg" icon="bi bi-telephone" aria-label="Call" />
<Button iconOnly rounded="full" variant="secondary" icon="bi bi-heart" aria-label="Save to favorites" />
<Button iconOnly rounded="full" variant="danger" icon="bi bi-trash3" aria-label="Delete" />

// Circles show the spinner too
<Button iconOnly rounded="full" icon="bi bi-send" aria-label="Send"
  onClick={() => fetch("/api/messages", { method: "POST" })} />`}
      >
        <Button iconOnly rounded="full" size="sm" icon="bi bi-plus-lg" aria-label="Add" />
        <Button iconOnly rounded="full" icon="bi bi-play-fill" aria-label="Play" />
        <Button iconOnly rounded="full" size="lg" icon="bi bi-telephone" aria-label="Call" />
        <Button iconOnly rounded="full" variant="secondary" icon="bi bi-heart" aria-label="Save to favorites" />
        <Button iconOnly rounded="full" variant="danger" icon="bi bi-trash3" aria-label="Delete" />
        <Button iconOnly rounded="full" icon="bi bi-send" aria-label="Send" onClick={() => fakeRequest()} />
      </Section>

      <Section
        title="Default corners for an app"
        desc="To change the corners of every button in an app at once, override the radius tokens in your stylesheet instead of passing the prop each time."
        code={`
/* app/globals.css or resources/css/app.css, after the theme import */
:root {
  --radius-control: 0.625rem;     /* rounded="md", the default */
  --radius-control-sm: 0.25rem;   /* rounded="sm" */
  --radius-control-lg: 1rem;      /* rounded="lg" */
}`}
      >
        <div className="flex flex-wrap gap-3 [--radius-control:0.625rem]">
          <Button>Save changes</Button>
          <Button variant="secondary">Preview</Button>
        </div>
      </Section>

      <Section
        title="Raised edge"
        desc={
          <>
            Buttons have a darker bottom edge that makes them look raised, and they press down when clicked. Set{" "}
            <code className="font-mono text-[0.8125rem]">raised={"{false}"}</code> for a flat button. Ghost buttons are
            always flat.
          </>
        }
        code={`
<Button>Raised</Button>                      {/* default */}
<Button raised={false}>Flat</Button>
<Button variant="secondary">Raised</Button>
<Button variant="secondary" raised={false}>Flat</Button>
<Button variant="danger" raised={false} rounded="full">Flat pill</Button>`}
      >
        <Button>Raised</Button>
        <Button raised={false}>Flat</Button>
        <Button variant="secondary">Raised</Button>
        <Button variant="secondary" raised={false}>Flat</Button>
        <Button variant="danger" raised={false} rounded="full">Flat pill</Button>
      </Section>

      <Section
        title="Shadows"
        desc={
          <>
            Add a drop shadow with <code className="font-mono text-[0.8125rem]">shadow</code>. Heavier levels spread
            further and look higher off the page. Pressing the button lowers its shadow.
          </>
        }
        code={`
<Button shadow="none">None</Button>         {/* default */}
<Button shadow="sm">Small</Button>
<Button shadow="md">Medium</Button>
<Button shadow="lg">Large</Button>
<Button shadow="xl">Extra large</Button>`}
      >
        <Button variant="secondary" shadow="none">None</Button>
        <Button variant="secondary" shadow="sm">Small</Button>
        <Button variant="secondary" shadow="md">Medium</Button>
        <Button variant="secondary" shadow="lg">Large</Button>
        <Button variant="secondary" shadow="xl">Extra large</Button>
      </Section>

      <Section
        title="Edge and shadow together"
        desc="The raised edge and the shadow are independent, so you can mix them. A flat button with a large shadow suits floating actions."
        code={`
<Button shadow="md">Raised with shadow</Button>
<Button raised={false} shadow="lg">Flat with shadow</Button>
<Button raised={false} shadow="xl" rounded="full" leadingIcon="bi bi-pencil">
  Compose
</Button>
<Button raised={false} shadow="xl" iconOnly rounded="full" size="lg"
  icon="bi bi-plus-lg" aria-label="Create" />`}
      >
        <Button shadow="md">Raised with shadow</Button>
        <Button raised={false} shadow="lg">Flat with shadow</Button>
        <Button raised={false} shadow="xl" rounded="full" leadingIcon="bi bi-pencil">Compose</Button>
        <Button raised={false} shadow="xl" iconOnly rounded="full" size="lg" icon="bi bi-plus-lg" aria-label="Create" />
      </Section>

      <Section
        title="Custom shadow weight"
        desc="Shadow levels are theme tokens, with separate values for light and dark mode. Override them to make every level heavier or lighter."
        code={`
/* after the theme import */
:root {
  --ui-shadow-lg: 0 2px 4px rgb(29 33 38 / 0.14), 0 12px 24px -4px rgb(29 33 38 / 0.3);
}
.dark {
  --ui-shadow-lg: 0 2px 4px rgb(0 0 0 / 0.5), 0 12px 24px -4px rgb(0 0 0 / 0.7);
}

/* or tint every shadow, e.g. with the brand blue */
:root { --ui-shadow-color: 8 72 173; }
.dark { --ui-shadow-color: 0 0 0; }  /* keep dark mode shadows black */`}
      >
        <div className="flex flex-wrap gap-3 [--ui-shadow-lg:0_2px_4px_rgb(8_72_173/0.14),0_8px_18px_-4px_rgb(8_72_173/0.38)] [--ui-shadow-xl:0_3px_6px_rgb(8_72_173/0.14),0_16px_32px_-8px_rgb(8_72_173/0.5)]">
          <Button raised={false} shadow="lg">Tinted shadow</Button>
          <Button raised={false} shadow="xl" iconOnly rounded="full" icon="bi bi-plus-lg" aria-label="Create" />
        </div>
      </Section>

      <Section
        title="SVG icons"
        desc="Pass any icon component. Icons scale with the text. Icon-only buttons need an aria-label."
        code={`
<Button leadingIcon={<PlusIcon />}>New invoice</Button>
<Button variant="secondary" leadingIcon={<DownloadIcon />}>Export CSV</Button>
<Button variant="ghost" iconOnly aria-label="Delete">
  <TrashIcon />
</Button>`}
      >
        <Button leadingIcon={<PlusIcon />}>New invoice</Button>
        <Button variant="secondary" leadingIcon={<DownloadIcon />}>Export CSV</Button>
        <Button variant="ghost" iconOnly aria-label="Delete"><TrashIcon /></Button>
      </Section>

      <Section
        title="Icon fonts"
        desc="Pass an icon-font class string. Works with Bootstrap Icons, Font Awesome and Glyphicons."
        code={`
<Button leadingIcon="bi bi-cloud-arrow-up">Upload files</Button>
<Button variant="secondary" trailingIcon="bi bi-chevron-down">Sort by date</Button>
<Button variant="danger" leadingIcon="bi bi-trash3">Remove</Button>
<Button variant="secondary" iconOnly icon="bi bi-gear" aria-label="Settings" />`}
      >
        <Button leadingIcon="bi bi-cloud-arrow-up">Upload files</Button>
        <Button variant="secondary" trailingIcon="bi bi-chevron-down">Sort by date</Button>
        <Button variant="danger" leadingIcon="bi bi-trash3">Remove</Button>
        <Button variant="secondary" iconOnly icon="bi bi-gear" aria-label="Settings" />
      </Section>

      <Section
        title="Loading after click"
        desc={
          <>
            Return a Promise from <code className="font-mono text-[0.8125rem]">onClick</code> and the spinner shows until the
            response arrives. Tap these — each one waits for a simulated request.
          </>
        }
        code={`
// Spinner replaces the label
<Button onClick={() => fetch("/api/report", { method: "POST" })}>
  Generate report
</Button>

// Spinner on the left, with a loading label
<Button
  spinnerPlacement="start"
  loadingLabel="Saving…"
  onClick={() => axios.put("/profile", data)}
>
  Save profile
</Button>

// Spinner on the right, label stays
<Button variant="secondary" spinnerPlacement="end" onClick={() => api.export()}>
  Export
</Button>

// Spinner takes the icon's place
<Button
  leadingIcon="bi bi-cloud-arrow-up"
  spinnerPlacement="start"
  loadingLabel="Uploading…"
  onClick={upload}
>
  Upload files
</Button>`}
      >
        <Button onClick={() => fakeRequest()}>Generate report</Button>
        <Button spinnerPlacement="start" loadingLabel="Saving…" onClick={() => fakeRequest()}>Save profile</Button>
        <Button variant="secondary" spinnerPlacement="end" onClick={() => fakeRequest()}>Export</Button>
        <Button leadingIcon="bi bi-cloud-arrow-up" spinnerPlacement="start" loadingLabel="Uploading…" onClick={() => fakeRequest(2400)}>
          Upload files
        </Button>
      </Section>

      <Section
        title="Loading on demand"
        desc={
          <>
            Control the spinner yourself with <code className="font-mono text-[0.8125rem]">loading</code>. This is the
            best fit for Inertia forms and Next.js server actions, which already track pending state.
          </>
        }
        code={`
// Any state you control
const [syncing, setSyncing] = useState(false);
<Button loading={syncing} spinnerPlacement="start" loadingLabel="Syncing…">
  Sync contacts
</Button>

// Laravel + Inertia
const form = useForm({ email: "" });
<Button type="submit" loading={form.processing}>Save</Button>

// Next.js server action
const [isPending, startTransition] = useTransition();
<Button loading={isPending} onClick={() => startTransition(() => saveDraft(id))}>
  Save draft
</Button>`}
      >
        <OnDemandDemo />
      </Section>

      <Section
        title="Failed requests"
        desc="The spinner also stops when the request fails. Catch the error in your handler and tell the person what to do next."
        code={`
<Button
  spinnerPlacement="end"
  loadingLabel="Sending…"
  onClick={async () => {
    try {
      await api.sendInvite(email);
    } catch {
      setError("Couldn't send the invite. Check the email address and try again.");
    }
  }}
>
  Send invite
</Button>`}
      >
        <ErrorDemo />
      </Section>

      <Section
        title="Avoiding flicker"
        desc="Very fast responses can make the spinner flash. Set a minimum time it stays visible."
        code={`
<Button minLoadingTime={500} onClick={() => fetch("/api/like", { method: "POST" })}>
  Like
</Button>`}
      >
        <Button variant="secondary" onClick={() => fakeRequest(80)}>Without minimum</Button>
        <Button variant="secondary" minLoadingTime={500} onClick={() => fakeRequest(80)}>With 500 ms minimum</Button>
      </Section>

      <Section
        title="Running light (experimental)"
        desc={
          <>
            Set <code className="font-mono text-[0.8125rem]">loadingIndicator="orbit"</code> to show a light running
            around the button's edge instead of a spinner. The label stays visible, or swaps to{" "}
            <code className="font-mono text-[0.8125rem]">loadingLabel</code>. Works with every shape, including
            circles. Tap to try.
          </>
        }
        code={`
<Button loadingIndicator="orbit" loadingLabel="Saving…"
  onClick={() => fetch("/api/profile", { method: "PUT", body })}>
  Save profile
</Button>

<Button variant="secondary" loadingIndicator="orbit" rounded="full"
  onClick={syncCalendar}>
  Sync calendar
</Button>

<Button iconOnly rounded="full" loadingIndicator="orbit" icon="bi bi-arrow-clockwise"
  aria-label="Refresh" onClick={refresh} />

// On demand
<Button loadingIndicator="orbit" loading={isListening} loadingLabel="Listening…">
  Voice search
</Button>`}
      >
        <Button loadingIndicator="orbit" loadingLabel="Saving…" onClick={() => fakeRequest(3000)}>Save profile</Button>
        <Button variant="secondary" loadingIndicator="orbit" rounded="full" onClick={() => fakeRequest(3000)}>Sync calendar</Button>
        <Button variant="danger" loadingIndicator="orbit" loadingLabel="Deleting…" onClick={() => fakeRequest(3000)}>Delete files</Button>
        <Button iconOnly rounded="full" loadingIndicator="orbit" icon="bi bi-arrow-clockwise" aria-label="Refresh" onClick={() => fakeRequest(3000)} />
        <div className="basis-full" />
        <OrbitToggleDemo />
      </Section>

      <Section
        title="Tuning the running light"
        desc="Change the light's color, thickness and speed with CSS variables, on one button or for the whole app. With reduced motion turned on, the ring gently pulses instead of running."
        code={`
<Button
  loadingIndicator="orbit"
  className="[--ui-orbit-color:#facc15] [--ui-orbit-width:3px] [--ui-orbit-speed:0.7s]"
  onClick={publish}
>
  Publish
</Button>

/* or app-wide, after the theme import */
:root { --ui-orbit-speed: 1.4s; }`}
      >
        <Button
          loadingIndicator="orbit"
          className="[--ui-orbit-color:#facc15] [--ui-orbit-width:3px] [--ui-orbit-speed:0.7s]"
          loading
        >
          Publish
        </Button>
        <Button variant="secondary" loadingIndicator="orbit" className="[--ui-orbit-speed:2s]" loading>
          Slower light
        </Button>
      </Section>

      <Section
        title="Progress (experimental)"
        desc={
          <>
            Set <code className="font-mono text-[0.8125rem]">loadingIndicator="progress"</code> to show progress
            instead of a spinner. With <code className="font-mono text-[0.8125rem]">progressStyle="fill"</code> (the
            default) a translucent fill sweeps across the button; with{" "}
            <code className="font-mono text-[0.8125rem]">"bar"</code> a thin bar runs along the bottom. It creeps
            forward on its own and completes when the response arrives. Tap to try.
          </>
        }
        code={`
<Button loadingIndicator="progress" loadingLabel="Generating…"
  onClick={() => fetch("/api/report", { method: "POST" })}>
  Generate report
</Button>

<Button variant="secondary" loadingIndicator="progress" progressStyle="bar"
  onClick={() => api.sync()}>
  Sync contacts
</Button>

<Button variant="danger" raised={false} rounded="full"
  loadingIndicator="progress" loadingLabel="Emptying…" onClick={emptyTrash}>
  Empty trash
</Button>`}
      >
        <Button loadingIndicator="progress" loadingLabel="Generating…" onClick={() => fakeRequest(3200)}>Generate report</Button>
        <Button variant="secondary" loadingIndicator="progress" progressStyle="bar" onClick={() => fakeRequest(3200)}>Sync contacts</Button>
        <Button variant="secondary" loadingIndicator="progress" onClick={() => fakeRequest(3200)} leadingIcon="bi bi-download">Export CSV</Button>
        <Button variant="danger" raised={false} rounded="full" loadingIndicator="progress" loadingLabel="Emptying…" onClick={() => fakeRequest(3200)}>Empty trash</Button>
        <Button loadingIndicator="progress" progressStyle="bar" raised={false} shadow="md" onClick={() => fakeRequest(3200)}>Publish</Button>
      </Section>

      <Section
        title="Real progress"
        desc={
          <>
            When you know how far along the work is — like an upload — pass it as{" "}
            <code className="font-mono text-[0.8125rem]">progress</code> (0–100). The fill or bar follows it, then
            finishes and fades when you stop loading.
          </>
        }
        code={`
const [progress, setProgress] = useState<number | null>(null);

async function upload(files: FileList) {
  setProgress(0);
  await axios.post("/api/photos", toFormData(files), {
    onUploadProgress: (e) => setProgress(Math.round((e.loaded / (e.total ?? 1)) * 100)),
  });
  setProgress(null);
}

<Button
  leadingIcon="bi bi-cloud-arrow-up"
  loadingIndicator="progress"
  loading={progress !== null}
  progress={progress ?? 0}
  loadingLabel={\`Uploading \${progress}%\`}
  onClick={() => upload(files)}
>
  Upload photos
</Button>

// Laravel + Inertia: useForm tracks upload progress for you
<Button loadingIndicator="progress" progressStyle="bar"
  loading={form.processing} progress={form.progress?.percentage}>
  Save
</Button>`}
      >
        <UploadDemo progressStyle="fill" />
        <UploadDemo progressStyle="bar" />
      </Section>

      <Section
        title="Tuning the progress"
        desc="Change the colors, the bar's thickness, and how long the automatic progress takes to reach the end with CSS variables — per button or app-wide."
        code={`
<Button
  loadingIndicator="progress"
  progressStyle="bar"
  className="[--ui-progress-bar:#facc15] [--ui-progress-height:4px] [--ui-progress-duration:4s]"
  onClick={deploy}
>
  Deploy
</Button>

/* app-wide, after the theme import */
:root { --ui-progress-duration: 12s; }  /* for slower operations */`}
      >
        <Button
          loadingIndicator="progress"
          progressStyle="bar"
          className="[--ui-progress-bar:#facc15] [--ui-progress-height:4px] [--ui-progress-duration:4s]"
          onClick={() => fakeRequest(3000)}
        >
          Deploy
        </Button>
        <Button
          variant="secondary"
          loadingIndicator="progress"
          className="[--ui-progress-fill:rgb(22_163_74/0.18)] [--ui-progress-duration:3s]"
          onClick={() => fakeRequest(2600)}
        >
          Green fill
        </Button>
      </Section>

      <Section
        title="Disabled"
        desc="Disabled buttons can't be focused or clicked. While loading, a button stays focusable but ignores extra clicks."
        code={`
<Button disabled>Save changes</Button>
<Button variant="secondary" disabled>Preview</Button>`}
      >
        <Button disabled>Save changes</Button>
        <Button variant="secondary" disabled>Preview</Button>
      </Section>

      <Section
        title="Links"
        desc="Use asChild to give a link the button's look, with your framework's Link component."
        code={`
// Next.js
import Link from "next/link";
<Button asChild><Link href="/billing">Open billing</Link></Button>

// Laravel + Inertia
import { Link } from "@inertiajs/react";
<Button asChild variant="secondary"><Link href="/billing">Open billing</Link></Button>`}
      >
        <Button asChild><a href="#/button">Open billing</a></Button>
        <Button asChild variant="secondary"><a href="#/button">View invoices</a></Button>
      </Section>

      <Section
        title="In a form"
        desc={<>The main action sits last. Buttons default to <code className="font-mono text-[0.8125rem]">type="button"</code>, so set <code className="font-mono text-[0.8125rem]">type="submit"</code> on the one that submits.</>}
        code={`
<form onSubmit={handleSubmit}>
  …
  <Button variant="ghost">Keep project</Button>
  <Button type="submit" variant="danger">Delete project</Button>
</form>`}
      >
        <div className="w-full max-w-md rounded-[0.625rem] border border-border bg-surface p-5">
          <p className="font-semibold">Delete this project?</p>
          <p className="mt-1 text-sm leading-relaxed text-fg-muted">Its 14 pages and all uploaded files will be removed. This can't be undone.</p>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Button variant="ghost">Keep project</Button>
            <Button variant="danger" spinnerPlacement="start" loadingLabel="Deleting…" onClick={() => fakeRequest()}>Delete project</Button>
          </div>
        </div>
      </Section>
    </>
  );
}
