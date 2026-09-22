import * as React from "react";
import { toast, Button, Text, PillGroup, PillOption, type ToasterPosition } from "@jm/ui";
import { PageHeader, Section } from "../components/Doc";
import { useToasterSettings } from "../toasterSettings";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function ToastPage() {
  const settings = useToasterSettings();
  const [deleted, setDeleted] = React.useState(false);

  return (
    <>
      <PageHeader
        title="Toast"
        intro="Short messages about something that just happened — saved, sent, failed. Put one <Toaster /> in your app and call toast() from anywhere. They stack neatly, pause while you read them, and get out of the way."
        importLine={`import { Toaster, toast } from "@jm/ui";`}
      />

      <Section
        title="Setup"
        desc="Add the Toaster once, near the root — your Next.js layout or the Inertia app wrapper. Then toast() works in any component, event handler or router callback."
        code={`
// app/layout.tsx (Next.js) or resources/js/app.tsx (Inertia)
<Toaster position="bottom-right" />

// anywhere
toast("Invoice saved");`}
      >
        <Text size="sm" tone="muted">This guide already has one — try the buttons below.</Text>
      </Section>

      <Section
        title="Kinds"
        desc="A plain toast, or success, error, warning and info with their own icon. Errors stay longer (8 seconds) and are announced right away; the rest wait for a pause."
        code={`
toast("Draft saved");
toast.success("Invoice sent", { description: "Northwind Traders will get it in a minute." });
toast.error("Couldn't send the invoice", { description: "The email address bounced." });
toast.warning("Your trial ends in 3 days");
toast.info("New: pay with Maya");`}
      >
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => toast("Draft saved")}>Default</Button>
          <Button size="sm" variant="secondary" onClick={() => toast.success("Invoice sent", { description: "Northwind Traders will get it in a minute." })}>Success</Button>
          <Button size="sm" variant="secondary" onClick={() => toast.error("Couldn't send the invoice", { description: "The email address bounced. Check it and try again." })}>Error</Button>
          <Button size="sm" variant="secondary" onClick={() => toast.warning("Your trial ends in 3 days", { description: "Add a payment method to keep your invoices." })}>Warning</Button>
          <Button size="sm" variant="secondary" onClick={() => toast.info("New: pay with Maya", { description: "Turn it on in Payment settings." })}>Info</Button>
        </div>
      </Section>

      <Section
        title="Waiting on something"
        desc="toast.promise shows a loading toast while a Promise runs, then turns it into success or error in place. It returns the same Promise, so you can await it."
        code={`
await toast.promise(api.sendInvoice(id), {
  loading: "Sending invoice…",
  success: (res) => \`Sent to \${res.email}\`,
  error: (err) => err.message,
});`}
      >
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() =>
              toast.promise(wait(2000).then(() => ({ email: "accounts@northwind.example" })), {
                loading: "Sending invoice…",
                success: (res) => `Sent to ${res.email}`,
                error: "Couldn't send it",
              })
            }
          >
            Send invoice
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              toast.promise(wait(2000).then(() => Promise.reject(new Error("The server is busy. Try again in a minute."))), {
                loading: "Syncing with the bank…",
                success: "Synced",
                error: (e) => (e as Error).message,
              })
            }
          >
            Sync (fails)
          </Button>
        </div>
      </Section>

      <Section
        title="Undo"
        desc="Add an action for a quick fix — most often Undo after a delete. The toast closes when it's used."
        code={`
deleteInvoice(id);
toast("Invoice deleted", {
  description: "INV-1042 · ₱48,200.00",
  action: { label: "Undo", onClick: () => restoreInvoice(id) },
});`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            variant="danger"
            disabled={deleted}
            onClick={() => {
              setDeleted(true);
              toast("Invoice deleted", {
                description: "INV-1042 · ₱48,200.00",
                action: { label: "Undo", onClick: () => { setDeleted(false); toast.success("Invoice restored"); } },
              });
            }}
          >
            Delete INV-1042
          </Button>
          <Text size="sm" tone="muted">{deleted ? "INV-1042 is deleted." : "INV-1042 is here."}</Text>
        </div>
      </Section>

      <Section
        title="Position and style"
        desc="Choose where they appear on wide screens (on phones they span the width). richColors tints the whole toast; expand shows them all spread out instead of stacked. Add a few to see the stack — hover or focus it to spread it out."
        code={`
<Toaster position="top-center" richColors expand />`}
      >
        <div className="grid w-full gap-3">
          <PillGroup value={settings.position} onValueChange={(v) => v && settings.set({ position: v as ToasterPosition })} size="sm" aria-label="Position">
            {(["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"] as const).map((p) => (
              <PillOption key={p} value={p}>{p.replace("-", " ")}</PillOption>
            ))}
          </PillGroup>
          <PillGroup
            type="multiple"
            value={[settings.richColors && "rich", settings.expand && "expand"].filter(Boolean) as string[]}
            onValueChange={(v) => settings.set({ richColors: v.includes("rich"), expand: v.includes("expand") })}
            size="sm"
            aria-label="Style"
          >
            <PillOption value="rich">Rich colors</PillOption>
            <PillOption value="expand">Always expanded</PillOption>
          </PillGroup>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const n = ["Receipt uploaded", "Client added", "Reminder scheduled", "Report exported"];
                n.forEach((m, i) => setTimeout(() => toast.success(m), i * 250));
              }}
            >
              Add four toasts
            </Button>
            <Button size="sm" variant="ghost" onClick={() => toast.dismiss()}>Dismiss all</Button>
          </div>
        </div>
      </Section>

      <Section
        title="Details"
        desc="The small things that make them pleasant."
        code={`
toast("Saved", { duration: 3000 });            // ms; Infinity keeps it until closed
toast.loading("Importing…", { id: "import" });  // reuse an id to update it later
toast.success("Imported 1,284 invoices", { id: "import" });
toast.dismiss("import");                        // or toast.dismiss() for all`}
      >
        <ul className="grid gap-1.5 text-sm text-fg-muted">
          <li>They pause while hovered or focused, and while the tab is in the background.</li>
          <li>A thin line along the bottom shows the time left.</li>
          <li>Swipe one sideways to dismiss it on a phone; press Escape when it's focused.</li>
          <li>Alt+T jumps to the newest one from the keyboard.</li>
          <li>Screen readers hear them politely — errors right away.</li>
        </ul>
      </Section>
    </>
  );
}
