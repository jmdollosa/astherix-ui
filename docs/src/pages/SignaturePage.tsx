import * as React from "react";
import {
  SignaturePad,
  type SignaturePadHandle,
  Button,
  Field,
  Input,
  Checkbox,
  Text,
  Pill,
  PillGroup,
  PillOption,
  toast,
} from "@jm/ui";
import { PageHeader, Section } from "../components/Doc";

function BasicDemo() {
  const pad = React.useRef<SignaturePadHandle>(null);
  const [saved, setSaved] = React.useState<{ png: string; svg: string } | null>(null);
  const [empty, setEmpty] = React.useState(true);
  const [ink, setInk] = React.useState<string | null>("ink");
  const colors: Record<string, string | undefined> = { ink: undefined, blue: "#1d4ed8", black: "#111827" };
  return (
    <div className="grid w-full max-w-lg gap-4">
      <PillGroup value={ink} onValueChange={setInk} size="sm" aria-label="Pen color">
        <PillOption value="ink">Default</PillOption>
        <PillOption value="blue">Blue ink</PillOption>
        <PillOption value="black">Black</PillOption>
      </PillGroup>
      <Field label="Signature" description="Draw with a finger, stylus or mouse. The line thickens as you slow down.">
        <SignaturePad ref={pad} penColor={colors[ink ?? "ink"]} onChange={(v) => setEmpty(!v)} height={190} />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={empty}
          onClick={() => {
            // Store dark ink whatever the theme, so it's readable on white paper.
            setSaved({ png: pad.current!.toDataURL({ trim: true, ink: "#111827" }), svg: pad.current!.toSVG({ trim: true, ink: "#111827" }) });
            toast.success("Signature saved");
          }}
        >
          Save signature
        </Button>
        <Button size="sm" variant="secondary" disabled={!saved} onClick={() => saved && pad.current?.fromDataURL(saved.png)}>
          Load the saved one
        </Button>
      </div>
      {saved && (
        <div className="grid gap-3 rounded-card border border-border bg-surface p-4">
          <Text size="sm" tone="muted">Saved and trimmed — the empty space around the signature is cropped away:</Text>
          <div className="flex flex-wrap items-end gap-6">
            <figure className="grid gap-1">
              <img src={saved.png} alt="Your signature as a PNG" className="max-h-24 rounded-control border border-border bg-bg p-1" />
              <figcaption className="text-xs text-fg-muted">PNG · {Math.round(saved.png.length / 1024)} KB</figcaption>
            </figure>
            <figure className="grid gap-1">
              <img src={`data:image/svg+xml;utf8,${encodeURIComponent(saved.svg)}`} alt="Your signature as vector SVG" className="max-h-24 rounded-control border border-border bg-bg p-1" />
              <figcaption className="text-xs text-fg-muted">SVG · {Math.round(saved.svg.length / 1024)} KB · sharp at any size</figcaption>
            </figure>
          </div>
        </div>
      )}
    </div>
  );
}

function ContractDemo() {
  const [signed, setSigned] = React.useState<string | null>(null);
  const [agreed, setAgreed] = React.useState(false);
  const [name, setName] = React.useState("");
  const [done, setDone] = React.useState(false);
  const ready = !!signed && agreed && name.trim().length > 1;
  if (done) {
    return (
      <div className="grid w-full max-w-lg justify-items-center gap-3 rounded-card border border-border bg-surface p-8 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-success text-2xl text-success-fg" aria-hidden="true">✓</span>
        <p className="font-medium">Agreement signed</p>
        {signed && <img src={signed} alt={`${name}'s signature`} className="max-h-20" />}
        <Text size="sm" tone="muted">Signed by {name} · {new Date().toLocaleString()}</Text>
        <Button size="sm" variant="secondary" onClick={() => { setDone(false); setSigned(null); setAgreed(false); setName(""); }}>Start over</Button>
      </div>
    );
  }
  return (
    <form
      className="grid w-full max-w-lg gap-5 rounded-card border border-border bg-surface p-5"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
    >
      <div className="grid gap-1">
        <p className="font-semibold">Service agreement</p>
        <Text size="sm" tone="muted">Retainer for design work, ₱48,000 per month, 30 days' notice to cancel.</Text>
      </div>
      <Field label="Full name" required>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Juan dela Cruz" autoComplete="name" />
      </Field>
      <Field label="Signature" required description="Sign with your finger, or switch to Type if that's easier.">
        <SignaturePad name="signature" allowTyped onChange={setSigned} height={170} />
      </Field>
      <Checkbox checked={agreed} onCheckedChange={setAgreed} label="I have read and agree to the terms above." />
      <Button type="submit" disabled={!ready} className="justify-self-start">Sign agreement</Button>
    </form>
  );
}

export function SignaturePage() {
  return (
    <>
      <PageHeader
        title="Signature"
        intro="A pad for signing with a finger, stylus or mouse. The ink thickens and thins with your speed, so it looks like a pen rather than a wobbly line. Export it as a PNG or as vector SVG for contracts and PDFs, trimmed of empty space, and post it with a form like any other field."
        importLine={`import { SignaturePad, type SignaturePadHandle } from "@jm/ui";`}
      />

      <Section
        title="Sign and save"
        desc="Draw slowly and then quickly to see the line swell and taper. Undo removes the last stroke; Clear starts over. Save shows what you'd store: a trimmed PNG and a vector SVG."
        code={`
const pad = useRef<SignaturePadHandle>(null);

<SignaturePad ref={pad} onChange={(dataUrl) => setSignature(dataUrl)} />

pad.current.toDataURL({ trim: true })              // PNG, cropped to the ink
pad.current.toSVG({ trim: true })                  // vector, for print and PDFs
pad.current.toDataURL({ background: "#fff", scale: 2 })   // flattened, high resolution

// The pen follows the theme, so someone signing in dark mode draws in white.
// Force the stored ink (and paper) to stay readable on a printed contract:
pad.current.toDataURL({ trim: true, ink: "#111827", background: "#ffffff" })
pad.current.clear();  pad.current.undo();  pad.current.isEmpty();`}
      >
        <BasicDemo />
      </Section>

      <Section
        title="In a form"
        desc="With a name, the signature posts with the rest of the form as a PNG data URL — no extra wiring. allowTyped adds a Type tab that renders a typed name in a handwriting font, which matters because nobody can draw a signature with a keyboard."
        code={`
<form method="post" action="/agreements/42/sign">
  <Field label="Signature" required>
    <SignaturePad name="signature" allowTyped />
  </Field>
  <Button type="submit">Sign agreement</Button>
</form>`}
      >
        <ContractDemo />
      </Section>

      <Section
        title="Storing it in Laravel"
        desc="The field arrives as a data URL. Decode it, save the file, and keep a little evidence with it — who signed, when, and from where."
        code={`
// routes/web.php
Route::post('/agreements/{agreement}/sign', function (Agreement $agreement, Request $request) {
    $request->validate(['signature' => ['required', 'string', 'starts_with:data:image/png;base64,']]);

    [, $base64] = explode(',', $request->input('signature'), 2);
    $path = "signatures/{$agreement->id}-" . Str::random(8) . '.png';
    Storage::disk('private')->put($path, base64_decode($base64));

    $agreement->update([
        'signature_path' => $path,
        'signed_by'      => $request->user()?->name ?? $request->input('name'),
        'signed_at'      => now(),
        'signed_ip'      => $request->ip(),
    ]);

    return back()->with('status', 'Agreement signed');
});

// Showing it again later (read-only)
<SignaturePad defaultValue={agreement.signature_url} readOnly toolbar={false} guide={false} />`}
      >
        <div className="grid w-full max-w-lg gap-2">
          <Text size="sm" tone="muted">A saved signature, shown read-only:</Text>
          <SignaturePad
            readOnly
            toolbar={false}
            guide={false}
            height={120}
            defaultValue="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='520' height='120'%3E%3Cg fill='none' stroke='%231d4ed8' stroke-width='2.2' stroke-linecap='round'%3E%3Cpath d='M40 86 C70 20 84 18 88 44 C92 70 78 92 74 74 C70 56 96 30 120 62 C132 78 140 64 150 44'/%3E%3Cpath d='M150 70 C170 30 186 26 190 50 C194 74 180 92 176 76 C172 60 196 34 222 64 C236 80 248 58 258 40'/%3E%3Cpath d='M262 74 C300 60 330 58 360 66'/%3E%3C/g%3E%3C/svg%3E"
          />
        </div>
      </Section>

      <Section
        title="Options"
        desc="Sizes, ink, the signing line, and what shows in the toolbar."
        code={`
<SignaturePad
  penColor="#1d4ed8"           // default: the text color (follows dark mode)
  penWidth={[0.9, 2.6]}        // thinnest and thickest, in px
  height={200}
  background="#ffffff"         // default: transparent
  guide                        // the ✗ signing line (default true)
  guideLabel="Sign here"
  toolbar                      // Undo and Clear (default true)
  actions={<Button size="sm">Save</Button>}
  readOnly                     // show a saved signature
  defaultValue={savedPng}
  name="signature"             // posts with the form
  allowTyped                   // adds the Type tab
  onChange={(dataUrl) => …}  onBegin={…}  onEnd={…}
/>`}
      >
        <div className="grid w-full max-w-lg gap-4">
          <SignaturePad penColor="#1d4ed8" penWidth={[1.2, 4]} height={150} guideLabel="Sign with a thicker pen" />
          <div className="flex flex-wrap gap-2">
            <Pill size="sm">Export with ink="#111827" for dark-mode signers</Pill>
            <Pill size="sm">Stylus pressure supported</Pill>
            <Pill size="sm">Redrawn crisply on resize</Pill>
            <Pill size="sm">Scrolling isn't hijacked while drawing</Pill>
          </div>
        </div>
      </Section>
    </>
  );
}
