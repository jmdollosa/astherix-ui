import * as React from "react";
import {
  Carousel,
  CarouselSlide,
  type CarouselHandle,
  Button,
  Modal,
  ModalTrigger,
  ModalContent,
  ModalBody,
  ModalClose,
  KpiCard,
  Avatar,
  Pill,
  Text,
} from "@jm/ui";
import { PageHeader, Section } from "../components/Doc";

/* A little landscape, drawn in SVG, so the guide needs no image files. */
function landscape(hue: number, sun = 0.72) {
  const c = (l: number, s = 55) => `hsl(${hue} ${s}% ${l}%)`;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'>
  <defs><linearGradient id='s' x1='0' x2='0' y1='0' y2='1'><stop offset='0' stop-color='${c(78, 70)}'/><stop offset='1' stop-color='${c(90, 60)}'/></linearGradient></defs>
  <rect width='400' height='250' fill='url(#s)'/>
  <circle cx='${400 * sun}' cy='80' r='30' fill='hsl(${(hue + 30) % 360} 90% 92%)'/>
  <path d='M0 170 L70 110 L130 150 L200 90 L270 145 L330 105 L400 150 V250 H0Z' fill='${c(58, 35)}'/>
  <path d='M0 200 L90 150 L160 185 L240 140 L320 190 L400 165 V250 H0Z' fill='${c(40, 40)}'/>
  <path d='M0 225 C80 205 160 235 240 215 S360 220 400 210 V250 H0Z' fill='${c(26, 45)}'/>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const photos = [
  { hue: 205, name: "Morning, Sagada" },
  { hue: 28, name: "Sunset, Pagudpud" },
  { hue: 155, name: "Rice terraces, Batad" },
  { hue: 265, name: "Dusk, Taal" },
  { hue: 340, name: "Blossoms, Baguio" },
  { hue: 185, name: "Lagoon, El Nido" },
];

function Photo({ hue, name, sun, className }: { hue: number; name: string; sun?: number; className?: string }) {
  return <img src={landscape(hue, sun)} alt={name} className={className ?? "aspect-[16/10] w-full rounded-card object-cover"} draggable={false} />;
}

/* ---------- onboarding tour in a modal ---------- */

const tour = [
  { icon: "bi bi-lightning-charge", title: "Invoices in a minute", text: "Pick a client, add a few lines, and send. Totals, taxes and due dates fill themselves in." },
  { icon: "bi bi-phone", title: "Clients pay from their phone", text: "Every invoice has a payment link for GCash, cards and bank transfer — no account needed." },
  { icon: "bi bi-bell", title: "Polite reminders, on autopilot", text: "Reminders go out before and after the due date, so you don't have to chase anyone." },
  { icon: "bi bi-graph-up-arrow", title: "Know where you stand", text: "The dashboard shows what's paid, what's late and what's coming — live." },
];

function OnboardingDemo() {
  const ref = React.useRef<CarouselHandle>(null);
  const [i, setI] = React.useState(0);
  const last = i === tour.length - 1;
  return (
    <Modal>
      <ModalTrigger asChild>
        <Button leadingIcon="bi bi-stars">See what's new</Button>
      </ModalTrigger>
      <ModalContent size="sm" aria-label="What's new">
        <ModalBody className="grid gap-5 pt-6">
          <Carousel ref={ref} aria-label="What's new" controls="none" onSlideChange={setI}>
            {tour.map((t) => (
              <CarouselSlide key={t.title} label={t.title}>
                <div className="grid justify-items-center gap-3 px-2 text-center">
                  <span className="grid size-16 place-items-center rounded-2xl bg-[color:color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-2xl text-primary" aria-hidden="true">
                    <i className={t.icon} />
                  </span>
                  <h3 className="text-lg font-semibold">{t.title}</h3>
                  <p className="text-sm leading-relaxed text-fg-muted">{t.text}</p>
                </div>
              </CarouselSlide>
            ))}
          </Carousel>
          <div className="flex items-center justify-between gap-3">
            {i === 0 ? (
              <ModalClose asChild><Button variant="ghost" size="sm">Skip</Button></ModalClose>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => ref.current?.prev()}>Back</Button>
            )}
            {last ? (
              <ModalClose asChild><Button size="sm">Get started</Button></ModalClose>
            ) : (
              <Button size="sm" trailingIcon="bi bi-arrow-right" onClick={() => ref.current?.next()}>Next</Button>
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

/* ---------- stories ---------- */

const stories = [
  { hue: 205, kicker: "This week", title: "₱318K collected", text: "Up 8% on last week — your best week this quarter." },
  { hue: 150, kicker: "Tip", title: "Turn on reminders", text: "Clients with reminders pay 6 days sooner on average." },
  { hue: 28, kicker: "Heads up", title: "3 invoices overdue", text: "Northgate Clinic, Pixel & Pine and Kape Kultura." },
  { hue: 265, kicker: "New", title: "Recurring invoices", text: "Bill retainers automatically every month." },
];

const plans = [
  { name: "Starter", price: "₱0", note: "For trying things out", features: ["5 clients", "Payment links", "Email reminders"] },
  { name: "Pro", price: "₱499", note: "For freelancers", features: ["Unlimited clients", "Recurring invoices", "Late fees", "Client portal"], popular: true },
  { name: "Team", price: "₱1,499", note: "For small studios", features: ["Everything in Pro", "5 team members", "Approvals", "Accounting sync"] },
];

const quotes = [
  { name: "Maria Santos", role: "Designer, Quezon City", text: "I used to spend Sunday nights chasing payments. Now the reminders do it and I just watch the dashboard turn green." },
  { name: "Paolo Reyes", role: "Tour operator, El Nido", text: "Guests pay with GCash straight from the invoice. Setting it up took ten minutes." },
  { name: "Liza Cruz", role: "Clinic manager, Cebu", text: "The monthly retainers run themselves. Our accountant downloads everything she needs without asking me." },
  { name: "Ben Tan", role: "Developer, Makati", text: "Clean, fast and honest pricing. The late-fee setting alone paid for the subscription." },
];

export function CarouselPage() {
  return (
    <>
      <PageHeader
        title="Carousel"
        intro="Slides you swipe, drag or step through. It uses the browser's own scroll snapping, so swiping on phones has real momentum, trackpads and mouse wheels just work, and there's no jank. And it's not just for photos — here it's a gallery, an onboarding tour, stories, swipeable KPI cards, testimonials and a pricing picker."
        importLine={`import { Carousel, CarouselSlide, type CarouselHandle } from "@jm/ui";`}
      />

      <Section
        title="Photo gallery"
        desc="Thumbnails below, arrows on hover (hidden on touch screens, where you swipe). Drag with a mouse; a quick flick moves one photo. Focus the slides and use ← → too."
        code={`
<Carousel aria-label="Photos" indicators="thumbnails">
  {photos.map((p) => (
    <CarouselSlide key={p.src} label={p.name} thumbnail={<img src={p.thumb} alt="" />}>
      <img src={p.src} alt={p.name} />
    </CarouselSlide>
  ))}
</Carousel>`}
      >
        <div className="w-full max-w-xl">
          <Carousel aria-label="Photos from the trip" indicators="thumbnails">
            {photos.map((p) => (
              <CarouselSlide key={p.name} label={p.name} thumbnail={<Photo hue={p.hue} name="" className="size-full object-cover" />}>
                <figure className="grid gap-2">
                  <Photo hue={p.hue} name={p.name} />
                  <figcaption className="text-center text-sm text-fg-muted">{p.name}</figcaption>
                </figure>
              </CarouselSlide>
            ))}
          </Carousel>
        </div>
      </Section>

      <Section
        title="An onboarding tour"
        desc="Informative slides inside a Modal, driven by your own Back / Next buttons through a ref. The last slide turns Next into Get started."
        code={`
const tour = useRef<CarouselHandle>(null);

<Carousel ref={tour} aria-label="What's new" controls="none" onSlideChange={setStep}>
  {steps.map((s) => <CarouselSlide key={s.title} label={s.title}>…</CarouselSlide>)}
</Carousel>
<Button onClick={() => tour.current?.next()}>Next</Button>   // also prev(), goTo(i)`}
      >
        <OnboardingDemo />
      </Section>

      <Section
        title="Stories"
        desc="Bars across the top fill as each story plays. Tap the right side for the next one and the left for the previous; hold or hover to pause. There's a pause button too — and nothing plays by itself for people who've turned on reduced motion."
        code={`
<Carousel aria-label="Highlights" indicators="stories" autoplay={4000} controls="none" loop>
  {stories.map((s) => <CarouselSlide key={s.title}>…</CarouselSlide>)}
</Carousel>`}
      >
        <div className="w-full max-w-72">
          <Carousel aria-label="This week's highlights" indicators="stories" autoplay={4000} controls="none" loop gap={0}>
            {stories.map((s) => (
              <CarouselSlide key={s.title} label={s.title}>
                <div className="relative aspect-[9/14] overflow-hidden rounded-card text-white">
                  <Photo hue={s.hue} name="" sun={0.3} className="absolute inset-0 size-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/30" />
                  <div className="absolute inset-x-0 bottom-0 grid gap-1.5 p-5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-white/80">{s.kicker}</span>
                    <p className="text-2xl font-semibold leading-tight">{s.title}</p>
                    <p className="text-sm text-white/85">{s.text}</p>
                  </div>
                </div>
              </CarouselSlide>
            ))}
          </Carousel>
        </div>
      </Section>

      <Section
        title="Swipeable KPI cards"
        desc="On a phone, four KPI cards side by side are too cramped and stacked they push everything down. Show one and a bit — the peeking edge says “swipe me” — and all four on wide screens."
        code={`
<Carousel aria-label="Key numbers" slidesPerView={{ base: 1.15, sm: 2, md: 4 }} gap={12} indicators="none" controls="none">
  <CarouselSlide><KpiCard label="Revenue" value={318400} formatValue={peso} change={8.2} /></CarouselSlide>
  …
</Carousel>`}
      >
        <div className="grid w-full gap-4">
          <Carousel aria-label="Key numbers" slidesPerView={{ base: 1.15, sm: 2, md: 4 }} gap={12} indicators="none" controls="none">
            <CarouselSlide><KpiCard className="h-full" label="Revenue" value="₱318,400" change={8.2} sparkline={[5, 7, 6, 9, 8, 11, 12]} /></CarouselSlide>
            <CarouselSlide><KpiCard className="h-full" label="Outstanding" value="₱86,400" change={-4.1} invertTrend sparkline={[12, 11, 12, 10, 9, 9, 8]} /></CarouselSlide>
            <CarouselSlide><KpiCard className="h-full" label="Clients" value="38" change={5.6} sparkline={[30, 31, 33, 34, 35, 36, 38]} /></CarouselSlide>
            <CarouselSlide><KpiCard className="h-full" label="Days to pay" value="18" change={6} invertTrend sparkline={[22, 21, 19, 18, 17, 17, 18]} sparklineType="bar" /></CarouselSlide>
          </Carousel>
          <Text size="xs" tone="muted">Narrow your window (or open this on your phone) to see it become swipeable.</Text>
        </div>
      </Section>

      <Section
        title="Testimonials"
        desc="Informative text, one or two at a time, moving on every five seconds. The active dot fills as a timer, and it pauses while you read (hover, touch or focus)."
        code={`
<Carousel aria-label="What customers say" slidesPerView={{ base: 1, md: 2 }} autoplay={5000} loop>
  …
</Carousel>`}
      >
        <div className="w-full">
          <Carousel aria-label="What customers say" slidesPerView={{ base: 1, md: 2 }} autoplay={5000} loop>
            {quotes.map((q) => (
              <CarouselSlide key={q.name}>
                <figure className="grid h-full content-between gap-4 rounded-card border border-border bg-surface p-5">
                  <blockquote className="text-[0.9375rem] leading-relaxed text-fg">“{q.text}”</blockquote>
                  <figcaption className="flex items-center gap-3">
                    <Avatar name={q.name} size="sm" decorative />
                    <span className="grid text-sm leading-tight">
                      <span className="font-medium">{q.name}</span>
                      <span className="text-xs text-fg-muted">{q.role}</span>
                    </span>
                  </figcaption>
                </figure>
              </CarouselSlide>
            ))}
          </Carousel>
        </div>
      </Section>

      <Section
        title="A pricing picker"
        desc="effect=&quot;coverflow&quot; centers the chosen plan and lets its neighbors shrink and fade as they slide away. Tap a side plan to bring it to the middle. It starts on the popular one."
        code={`
<Carousel aria-label="Plans" effect="coverflow" slidesPerView={{ base: 1.3, md: 2.4 }} defaultIndex={1} indicators="dots">
  {plans.map((p) => <CarouselSlide key={p.name} label={p.name}>…</CarouselSlide>)}
</Carousel>`}
      >
        <div className="w-full">
          <Carousel aria-label="Plans" effect="coverflow" slidesPerView={{ base: 1.3, md: 2.4 }} defaultIndex={1} gap={8} controls="below">
            {plans.map((p) => (
              <CarouselSlide key={p.name} label={p.name}>
                <div className={`grid h-full content-start gap-4 rounded-card border bg-surface p-5 ${p.popular ? "border-primary shadow-[var(--ui-shadow-lg)]" : "border-border"}`}>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{p.name}</p>
                    {p.popular && <Pill size="sm" tone="primary">Popular</Pill>}
                  </div>
                  <p><span className="text-3xl font-semibold tracking-tight">{p.price}</span> <span className="text-sm text-fg-muted">/ month</span></p>
                  <p className="text-sm text-fg-muted">{p.note}</p>
                  <ul className="grid gap-1.5 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2"><i className="bi bi-check2 text-success" aria-hidden="true" />{f}</li>
                    ))}
                  </ul>
                  <Button variant={p.popular ? "primary" : "secondary"} size="sm">Choose {p.name}</Button>
                </div>
              </CarouselSlide>
            ))}
          </Carousel>
        </div>
      </Section>

      <Section
        title="Options"
        desc="Everything is optional. The slides are real content in the page, so links and buttons inside them work and screen readers hear “slide 3 of 8”."
        code={`
<Carousel
  aria-label="…"
  slidesPerView={{ base: 1, sm: 2, md: 3 }}   // or a number; fractions show a peek
  gap={16}
  peek={48}                     // show part of the next slide
  align="center"                // or "start"
  effect="coverflow"
  loop
  autoplay={5000}               // ms; pauses on hover, touch, focus, hidden tab
  indicators="dots"             // "counter" | "stories" | "thumbnails" | "none"
  controls="overlay"            // "below" | "none"
  defaultIndex={0}
  onSlideChange={(i) => …}
/>`}
      >
        <div className="w-full max-w-md">
          <Carousel aria-label="Counter example" indicators="counter" controls="below" peek={40}>
            {photos.slice(0, 5).map((p) => (
              <CarouselSlide key={p.name} label={p.name}><Photo hue={p.hue} name={p.name} /></CarouselSlide>
            ))}
          </Carousel>
        </div>
      </Section>
    </>
  );
}
