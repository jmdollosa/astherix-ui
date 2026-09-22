import * as React from "react";
import { SpotlightText, Button, Pill, Text, PillGroup, PillOption, Slider, Field, ActivityIndicator } from "@jm/ui";
import { PageHeader, Section } from "../components/Doc";

/** A dark stage so the light has something to shine against (in light and dark mode). */
function Stage({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`dark relative grid w-full place-items-center overflow-hidden rounded-card px-6 py-12 text-center ${className}`}
      style={{ background: "radial-gradient(120% 90% at 50% 0%, #1f2937 0%, #0b0f16 70%)", color: "#f6f7f9" }}
    >
      {children}
    </div>
  );
}

function TryIt() {
  const [mode, setMode] = React.useState<string | null>("follow");
  const [tint, setTint] = React.useState<string | null>("white");
  const tints: Record<string, string | undefined> = {
    white: undefined,
    blue: "#60a5fa",
    brand: "linear-gradient(90deg, #60a5fa, #a78bfa 45%, #f472b6)",
    gold: "linear-gradient(90deg, #fde68a, #f59e0b)",
  };
  return (
    <div className="grid w-full gap-4">
      <div className="flex flex-wrap gap-3">
        <PillGroup value={mode} onValueChange={setMode} size="sm" aria-label="Mode">
          <PillOption value="follow">Follow</PillOption>
          <PillOption value="sweep">Sweep</PillOption>
          <PillOption value="reveal">Reveal</PillOption>
        </PillGroup>
        <PillGroup value={tint} onValueChange={setTint} size="sm" aria-label="Light">
          <PillOption value="white">White</PillOption>
          <PillOption value="blue">Blue</PillOption>
          <PillOption value="brand">Gradient</PillOption>
          <PillOption value="gold">Gold</PillOption>
        </PillGroup>
      </div>
      <Stage className="min-h-64">
        <SpotlightText
          key={`${mode}-${tint}`}
          as="h2"
          mode={(mode ?? "follow") as "follow"}
          tint={tints[tint ?? "white"]}
          className="max-w-[16ch] text-4xl font-semibold leading-[1.1] tracking-[-0.03em] sm:text-5xl"
        >
          Get paid faster, without the awkward follow-ups.
        </SpotlightText>
      </Stage>
      <Text size="sm" tone="muted">
        {mode === "follow" && "Move your pointer (or drag a finger) across the headline. Leave it, and the light drifts on its own."}
        {mode === "sweep" && "A beam of light passes across every few seconds, like light catching polished metal."}
        {mode === "reveal" && "A dark room: the words are barely there until the light finds them. Move across to read."}
      </Text>
    </div>
  );
}


function SpeedDemo() {
  const [ms, setMs] = React.useState(1200);
  const label = ms <= 700 ? "Very fast" : ms <= 1100 ? "Fast" : ms <= 2400 ? "Normal" : "Slow";
  return (
    <div className="grid w-full max-w-md gap-5">
      <Field label="Speed" description="Time for one pass of the light">
        <Slider value={ms} onChange={(v) => setMs(v as number)} min={400} max={4000} step={100} formatValue={(v) => `${(v / 1000).toFixed(1)}s`} />
      </Field>
      <div className="grid gap-1 rounded-card border border-border bg-surface px-5 py-6 text-center">
        <SpotlightText mode="sweep" speed={ms} tint="var(--color-primary)" dim={0.55} className="text-2xl font-semibold tracking-tight">
          Your invoices, on autopilot
        </SpotlightText>
        <Text size="xs" tone="muted">{label} · speed={"{"}{ms}{"}"}</Text>
      </div>
    </div>
  );
}

const steps = ["Reading 47 invoices…", "Matching payments to invoices…", "Checking for duplicates…", "Building your report…"];

function StatusDemo() {
  const [step, setStep] = React.useState<number | null>(null);
  const running = step !== null && step < steps.length;
  const done = step === steps.length;
  React.useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setStep((s) => (s ?? 0) + 1), 1600);
    return () => clearTimeout(t);
  }, [running, step]);
  return (
    <div className="grid w-full max-w-md gap-4">
      <div className="flex items-center gap-3 rounded-card border border-border bg-surface px-4 py-3" role="status" aria-live="polite">
        {running ? (
          <>
            <ActivityIndicator variant="orbit" size="sm" label="" aria-hidden="true" role={undefined} />
            {/* key: each new message starts its own shimmer and is announced once */}
            <SpotlightText key={step} mode="sweep" speed="fast" dim={0.55} className="text-sm font-medium">
              {steps[step!]}
            </SpotlightText>
          </>
        ) : done ? (
          <>
            <i className="bi bi-check-circle-fill text-success" aria-hidden="true" />
            <span className="text-sm font-medium">Report ready — 47 invoices, 2 duplicates found</span>
          </>
        ) : (
          <span className="text-sm text-fg-muted">Press the button to generate a report.</span>
        )}
      </div>
      <Button className="justify-self-start" size="sm" leadingIcon="bi bi-file-earmark-bar-graph" disabled={running} onClick={() => setStep(0)}>
        {done ? "Generate again" : "Generate report"}
      </Button>
    </div>
  );
}

export function SpotlightTextPage() {
  return (
    <>
      <PageHeader
        title="Spotlight text"
        intro="Text lit by a moving spotlight: the lit part glows and the rest sits in shadow. It can follow the pointer, sweep across on its own, or reveal words hidden in the dark. It's real text — selectable, readable by screen readers — and people who prefer reduced motion see it simply, fully lit."
        importLine={`import { SpotlightText } from "@jm/ui";`}
      />

      <Section
        wide
        title="Try it"
        desc="Pick a mode and a color of light. Headlines over several lines work too — the light moves across all of them."
        code={`
<SpotlightText as="h1" className="text-5xl font-semibold">
  Get paid faster, without the awkward follow-ups.
</SpotlightText>

<SpotlightText mode="sweep" tint="linear-gradient(90deg, #fde68a, #f59e0b)">…</SpotlightText>
<SpotlightText mode="reveal">…</SpotlightText>`}
      >
        <TryIt />
      </Section>

      <Section
        title="A hero headline"
        desc="The classic use: a big dark hero where the light follows the visitor's pointer. On phones it follows the finger, and drifts across by itself between touches."
        code={`
<section className="dark bg-[#0b0f16] text-white">
  <SpotlightText as="h1" tint="linear-gradient(90deg, #60a5fa, #a78bfa 45%, #f472b6)"
    className="text-6xl font-semibold tracking-tight">
    Invoices that pay themselves.
  </SpotlightText>
  <Button>Start free</Button>
</section>`}
      >
        <Stage>
          <div className="grid justify-items-center gap-5">
            <Pill tone="primary" appearance="outline" className="border-white/20 text-white/80">New · Recurring invoices</Pill>
            <SpotlightText as="h2" tint="linear-gradient(90deg, #60a5fa, #a78bfa 45%, #f472b6)" className="max-w-[14ch] text-4xl font-semibold leading-[1.05] tracking-[-0.03em]">
              Invoices that pay themselves.
            </SpotlightText>
            <p className="max-w-[40ch] text-sm text-white/65">Send once, get paid on time, and never write another “just following up” email.</p>
            <Button size="sm">Start free</Button>
          </div>
        </Stage>
      </Section>

      <Section
        title="A beam of light"
        desc="mode=&quot;sweep&quot; needs no pointer at all, so it suits labels, badges and short titles that should catch the eye. Change the pace with duration and pause."
        code={`
<SpotlightText mode="sweep" tint="#fde68a" duration={1600} pause={2400}>
  ★ Most popular
</SpotlightText>`}
      >
        <div className="flex flex-wrap items-center gap-4">
          <span className="rounded-full bg-[#1d2126] px-4 py-1.5 text-sm font-semibold text-white">
            <SpotlightText mode="sweep" tint="#fde68a" duration={1600} pause={2400} dim={0.75}>★ Most popular</SpotlightText>
          </span>
          <SpotlightText mode="sweep" tint="linear-gradient(90deg, var(--color-primary), #db2777)" className="text-2xl font-semibold tracking-tight">
            Pro plan
          </SpotlightText>
        </div>
      </Section>

      <Section
        title="Speed"
        desc="speed sets how fast the light moves: &quot;slow&quot;, &quot;normal&quot; or &quot;fast&quot;, or the exact time for one pass in milliseconds. Drag the slider to feel the difference."
        code={`
<SpotlightText mode="sweep" speed="slow">…</SpotlightText>
<SpotlightText mode="sweep" speed="fast">…</SpotlightText>
<SpotlightText mode="sweep" speed={1200}>…</SpotlightText>      // ms per pass

// Fine control: duration (one pass) and pause (rest between passes) override speed
<SpotlightText mode="sweep" duration={800} pause={0}>…</SpotlightText>`}
      >
        <SpeedDemo />
      </Section>

      <Section
        title="Status messages"
        desc="A fast shimmer says “working on it” without a progress bar — great for steps that take a moment. Keep the text readable (dim around 0.55) and put it in a role=&quot;status&quot; area so each new message is announced once. When the work is done, swap it for plain text."
        code={`
<div role="status" aria-live="polite">
  {busy ? (
    <SpotlightText key={message} mode="sweep" speed="fast" dim={0.55}>
      {message}                      {/* "Matching payments to invoices…" */}
    </SpotlightText>
  ) : (
    <span>✓ Report ready</span>
  )}
</div>`}
      >
        <div className="grid w-full gap-5">
          <StatusDemo />
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium">
              <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
              <SpotlightText mode="sweep" speed="fast" dim={0.6}>Syncing with the bank…</SpotlightText>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-3 py-1.5 text-xs font-medium text-primary">
              <i className="bi bi-stars" aria-hidden="true" />
              <SpotlightText mode="sweep" speed="fast" dim={0.6}>Drafting a reminder…</SpotlightText>
            </span>
            <span className="inline-flex items-center gap-2 text-sm text-fg-muted">
              <SpotlightText mode="sweep" speed={700} dim={0.5}>Uploading receipt.pdf · 62%</SpotlightText>
            </span>
          </div>
        </div>
      </Section>

      <Section
        title="Hidden in the dark"
        desc="mode=&quot;reveal&quot; keeps the words nearly invisible; a faint glimmer drifts to hint at them until the pointer brings the light. Use it for playful moments — not for text people must read, since it's hard to see until lit."
        code={`
<SpotlightText mode="reveal" as="p" radius={90}>
  Psst — use code EARLYBIRD for 30% off your first year.
</SpotlightText>`}
      >
        <Stage className="min-h-44">
          <SpotlightText mode="reveal" as="p" radius={90} className="max-w-[22ch] text-2xl font-medium leading-snug">
            Psst — use code EARLYBIRD for 30% off your first year.
          </SpotlightText>
        </Stage>
      </Section>

      <Section
        title="On a light page"
        desc="It isn't only for dark backgrounds: on a light page the light is the text color, and a colored tint makes the lit area stand out."
        code={`
<SpotlightText as="h3" tint="var(--color-primary)" className="text-3xl font-semibold">
  Everything you need to get paid
</SpotlightText>`}
      >
        <SpotlightText as="h3" tint="var(--color-primary)" dim={0.5} className="text-3xl font-semibold tracking-tight">
          Everything you need to get paid
        </SpotlightText>
      </Section>

      <Section
        title="Options"
        desc="The unlit text is the real text — selectable, and read normally by screen readers; the glowing copy is decorative. The animation pauses when it's scrolled out of view."
        code={`
<SpotlightText
  as="h1"                // any element; default "span"
  mode="follow"          // "sweep" | "reveal"
  tint="…"               // a color or a gradient for the lit text
  radius={80}            // spotlight size in px (default: about 2× the font size)
  dim={0.4}              // how visible the unlit text is, 0–1
  glow                   // soft glow around lit letters (default true)
  smoothing={0.14}       // how closely it trails the pointer
  speed="fast"           // "slow" | "normal" | "fast" | ms per pass
  duration={2200} pause={1400}   // exact sweep pace (overrides speed)
/>`}
      >
        <Text size="sm" tone="muted">With reduced motion turned on, the spotlight doesn't move: the text is shown fully lit instead.</Text>
      </Section>
    </>
  );
}
