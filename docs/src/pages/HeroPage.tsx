import * as React from "react";
import {
  Hero,
  HeroEyebrow,
  HeroTitle,
  HeroSubtitle,
  HeroActions,
  HeroStats,
  HeroLogos,
  HeroMedia,
  Button,
  Input,
  Tabs,
  TabList,
  Tab,
  Text,
  Stack,
  Grid,
  KpiCard,
} from "@astherix/ui";
import { PageHeader, Section } from "../components/Doc";

/** A fake app screenshot, so the demos don't need image files. */
function FakeApp() {
  return (
    <div className="grid gap-3 bg-surface p-4">
      <Stack direction="row" align="center" gap={2}>
        <div className="h-2.5 w-20 rounded-full bg-secondary-hover" />
        <div className="ms-auto h-6 w-16 rounded-control bg-primary/15" />
      </Stack>
      <Grid columns={3} gap={2}>
        <KpiCard label="Paid" value="₱312k" change={8.2} />
        <KpiCard label="Due" value="₱86k" change={-4.1} invertTrend />
        <KpiCard label="Clients" value="38" change={5.6} />
      </Grid>
      <div className="h-24 rounded-card bg-[linear-gradient(135deg,color-mix(in_srgb,var(--ui-chart-1)_22%,transparent),color-mix(in_srgb,var(--ui-chart-4)_22%,transparent))]" />
    </div>
  );
}

const logos = ["Northwind", "Blue Harbor", "Luzon Freight", "Pixel & Pine", "Mabuhay Tours", "Sunrise Dental"];

function BackgroundDemo() {
  const [bg, setBg] = React.useState<string | null>("aurora");
  const background = (bg ?? "aurora") as "aurora" | "grid" | "dots" | "gradient" | "none";
  return (
    <div className="grid w-full gap-3">
      <Tabs value={bg} onValueChange={setBg} size="sm" variant="pills">
            <TabList aria-label="Background">
        <Tab value="aurora">Aurora</Tab>
        <Tab value="grid">Grid</Tab>
        <Tab value="dots">Dots</Tab>
        <Tab value="gradient">Gradient</Tab>
        <Tab value="none">None</Tab>
        </TabList>
          </Tabs>
      <div className="overflow-hidden rounded-card border border-border">
        <Hero background={background} size="sm">
          <HeroEyebrow icon="bi bi-stars">Now with recurring invoices</HeroEyebrow>
          <HeroTitle size="md" gradient={background === "none" || background === "grid" || background === "dots"}>
            Get paid without chasing anyone
          </HeroTitle>
          <HeroSubtitle>Send an invoice in thirty seconds and let the reminders go out on their own.</HeroSubtitle>
          <HeroActions>
            <Button size="lg">Start free</Button>
            <Button size="lg" variant="secondary">See a demo</Button>
          </HeroActions>
        </Hero>
      </div>
    </div>
  );
}

export function HeroPage() {
  return (
    <>
      <PageHeader
        title="Hero"
        intro="The top of a landing page: an announcement pill, a headline, a sentence, the buttons, and whatever proof you have — numbers, logos, a screenshot. The pieces are separate, so a hero can be one quiet line of text or a full screen of drifting color. Every animated background stops for people who ask for less motion."
        importLine={'import { Hero, HeroTitle, HeroSubtitle, HeroActions } from "@astherix/ui";'}
      />

      <Section
        wide
        title="Backgrounds"
        desc="Five backdrops. Aurora drifts three soft clouds of color behind the words; grid and dots are quieter, and fade out at the edges; gradient fills the band and flips the text to white."
        code={`
<Hero background="aurora" size="lg">
  <HeroEyebrow icon="bi bi-stars">Now with recurring invoices</HeroEyebrow>
  <HeroTitle gradient>Get paid without chasing anyone</HeroTitle>
  <HeroSubtitle>Send an invoice in thirty seconds…</HeroSubtitle>
  <HeroActions>
    <Button size="lg">Start free</Button>
    <Button size="lg" variant="secondary">See a demo</Button>
  </HeroActions>
</Hero>

// background: "none" | "aurora" | "grid" | "dots" | "gradient" | "image"
// colors={["#0d6efd", "#7c3aed", "#db2777"]}   the three colors it mixes from`}
      >
        <BackgroundDemo />
      </Section>

      <Section
        wide
        title="With a screenshot beside it"
        desc="media puts your product next to the words — one column on phones, two from medium screens. HeroMedia can wrap it in browser chrome, tilt it slightly, and let it drift."
        code={`
<Hero
  background="dots"
  media={
    <HeroMedia frame url="app.example.com/invoices" tilt float>
      <img src={screenshot} alt="The invoices screen" />
    </HeroMedia>
  }
>
  <HeroTitle size="md">Every invoice, in one place</HeroTitle>
  <HeroSubtitle>Drafts, sent, paid and overdue — with the chasing done for you.</HeroSubtitle>
  <HeroActions><Button size="lg">Start free</Button></HeroActions>
</Hero>`}
      >
        <div className="overflow-hidden rounded-card border border-border">
          <Hero
            background="dots"
            size="sm"
            media={
              <HeroMedia frame url="app.example.com/invoices" tilt float>
                <FakeApp />
              </HeroMedia>
            }
          >
            <HeroEyebrow href="#/hero">Changelog · v2.4</HeroEyebrow>
            <HeroTitle size="md">Every invoice, in one place</HeroTitle>
            <HeroSubtitle>Drafts, sent, paid and overdue — with the chasing done for you.</HeroSubtitle>
            <HeroActions>
              <Button size="lg">Start free</Button>
              <Button size="lg" variant="ghost">Talk to us</Button>
            </HeroActions>
          </Hero>
        </div>
      </Section>

      <Section
        wide
        title="Proof: numbers and logos"
        desc="HeroStats is a short row of figures — the number reads first, the label sits under it. HeroLogos is the 'trusted by' strip; add marquee and it scrolls forever, pausing when you hover so a name can actually be read."
        code={`
<HeroStats stats={[
  { value: "12,400", label: "invoices sent" },
  { value: "₱48M", label: "collected" },
  { value: "6 days", label: "faster on average" },
]} />

<HeroLogos logos={["Northwind", "Blue Harbor", …]} marquee speed={28} />
<HeroLogos logos={brands.map((b) => <img key={b.name} src={b.logo} alt={b.name} />)} />`}
      >
        <div className="overflow-hidden rounded-card border border-border">
          <Hero background="gradient" size="sm" colors={["#0a5ad6", "#7c3aed", "#0d9488"]}>
            <HeroTitle size="md">Invoicing that finishes the job</HeroTitle>
            <HeroSubtitle>Reminders, receipts and reconciliation, without you touching a thing.</HeroSubtitle>
            <HeroStats
              stats={[
                { value: "12,400", label: "invoices sent" },
                { value: "₱48M", label: "collected" },
                { value: "6 days", label: "faster on average" },
              ]}
            />
            <HeroLogos logos={logos} marquee />
          </Hero>
        </div>
      </Section>

      <Section
        wide
        title="Over a photo"
        desc={'background="image" lays your photo behind everything, darkens it so the words stay readable, and switches the text to white. Tune how dark with overlay.'}
        code={`
<Hero
  background="image"
  image="/img/warehouse.jpg"
  overlay={0.6}          // 0–1; how much the photo is darkened
  size="screen"          // fills the first screenful
  align="start"
>
  <HeroTitle>Built for the people doing the work</HeroTitle>
  <HeroActions><Button size="lg">Start free</Button></HeroActions>
</Hero>`}
      >
        <div className="overflow-hidden rounded-card border border-border">
          <Hero
            background="image"
            size="sm"
            align="start"
            overlay={0.58}
            // An inline SVG stands in for a photograph, so the guide needs no image files.
            image={
              "data:image/svg+xml;utf8," +
              encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b3f7a"/><stop offset="0.5" stop-color="#7c3aed"/><stop offset="1" stop-color="#db2777"/></linearGradient></defs><rect width="1200" height="600" fill="url(#g)"/><g fill="#ffffff" opacity="0.14"><circle cx="220" cy="140" r="170"/><circle cx="980" cy="470" r="220"/><circle cx="640" cy="80" r="110"/></g></svg>`,
              )
            }
          >
            <HeroEyebrow>For teams of 2 to 200</HeroEyebrow>
            <HeroTitle size="md">Built for the people doing the work</HeroTitle>
            <HeroSubtitle>No training day, no consultant, no migration project.</HeroSubtitle>
            <HeroActions>
              <Button size="lg">Start free</Button>
            </HeroActions>
          </Hero>
        </div>
      </Section>

      <Section
        wide
        title="A quiet one"
        desc="Not every page needs weather. Left-aligned, no background, a single line and a sign-up field — the same pieces, turned down."
        code={`
<Hero align="start" size="sm">
  <HeroTitle as="h1" size="md">Changelog</HeroTitle>
  <HeroSubtitle>Everything we shipped, newest first.</HeroSubtitle>
  <HeroActions>
    <Input type="email" placeholder="you@company.com" />
    <Button>Get the monthly email</Button>
  </HeroActions>
</Hero>`}
      >
        <div className="overflow-hidden rounded-card border border-border bg-surface">
          <Hero align="start" size="sm">
            <HeroTitle size="md">Changelog</HeroTitle>
            <HeroSubtitle>Everything we shipped, newest first.</HeroSubtitle>
            <HeroActions>
              <Input type="email" placeholder="you@company.com" aria-label="Email address" className="sm:w-64" />
              <Button>Get the monthly email</Button>
            </HeroActions>
          </Hero>
        </div>
      </Section>

      <Section
        title="Notes"
        desc={
          <>
            The headline is an <code>h1</code> by default — use <code>as="h2"</code> if the page already has one. The eyebrow becomes a
            link when you give it an <code>href</code>. <code>size="screen"</code> uses <code>100svh</code>, so a phone's address bar
            doesn't cut the buttons off. Aurora, float and marquee all stop under <code>prefers-reduced-motion</code>.
          </>
        }
        code={`
<Hero size="sm | md | lg | screen" align="center | start" as="header" />
<HeroTitle as="h2" size="md | lg | xl" gradient colors={[a, b, c]} />
<HeroEyebrow href="/changelog" icon="bi bi-stars">New</HeroEyebrow>
<HeroMedia frame url="app.example.com" tilt float />
<HeroLogos logos={…} label="Trusted by teams at" marquee speed={28} />`}
      >
        <Text size="sm" tone="muted">Hero sits outside a Container — it spans the page and pads its own content to the same width.</Text>
      </Section>
    </>
  );
}
