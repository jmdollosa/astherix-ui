import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardMedia,
  CardLink,
  CardBody,
  ChoiceCardGroup,
  ChoiceCard,
  Button,
  Pill,
  Field,
  Input,
  Stat,
  AvatarGroup,
  Avatar,
  ProgressBar,
  Text,
} from "@jm/ui";
import { PageHeader, Section } from "../components/Doc";

// Illustrations as inline SVG (the published docs can't load remote images).
function scene(a: string, b: string, c: string, variant: 0 | 1 | 2) {
  const shapes =
    variant === 0
      ? `<circle cx="300" cy="70" r="46" fill="${c}"/><path d="M0 170 L120 90 L210 150 L300 100 L400 160 L400 225 L0 225Z" fill="${b}" opacity=".85"/><path d="M0 200 L90 150 L200 190 L320 140 L400 180 L400 225 L0 225Z" fill="${b}"/>`
      : variant === 1
        ? `<rect x="70" y="50" width="120" height="150" rx="10" fill="#fff" opacity=".92"/><rect x="88" y="72" width="70" height="8" rx="4" fill="${b}"/><rect x="88" y="92" width="84" height="6" rx="3" fill="${c}"/><rect x="88" y="106" width="60" height="6" rx="3" fill="${c}"/><rect x="88" y="170" width="84" height="14" rx="4" fill="${b}"/><rect x="210" y="80" width="120" height="150" rx="10" fill="#fff" opacity=".7"/>`
        : `<circle cx="120" cy="120" r="70" fill="${c}" opacity=".9"/><rect x="200" y="60" width="130" height="110" rx="55" fill="${b}"/><circle cx="265" cy="115" r="22" fill="#fff" opacity=".85"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice"><rect width="400" height="225" fill="${a}"/>${shapes}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const articles = [
  { title: "Getting paid faster with payment links", tag: "Guides", time: "6 min read", img: scene("#dbeafe", "#1d4ed8", "#93c5fd", 0) },
  { title: "Designing invoices clients actually read", tag: "Design", time: "4 min read", img: scene("#fef3c7", "#b45309", "#fcd34d", 1) },
  { title: "Reminders that don't annoy anyone", tag: "Product", time: "5 min read", img: scene("#dcfce7", "#15803d", "#86efac", 2) },
];

function PlanDemo() {
  const [plan, setPlan] = React.useState<string | null>("team");
  const [addons, setAddons] = React.useState<string[]>(["reminders"]);
  return (
    <div className="grid w-full gap-6">
      <ChoiceCardGroup value={plan} onValueChange={setPlan} name="plan" aria-label="Plan">
        <ChoiceCard value="starter" icon="bi bi-person" title="Starter" description="For freelancers sending a few invoices." meta="Free" />
        <ChoiceCard
          value="team"
          icon="bi bi-people"
          title="Team"
          badge={<Pill size="sm" tone="primary">Recommended</Pill>}
          description="Unlimited invoices, reminders and 5 teammates."
          meta="₱990 / month"
        />
        <ChoiceCard value="business" icon="bi bi-buildings" title="Business" description="Approvals, audit log and priority support." meta="₱2,490 / month" disabled />
      </ChoiceCardGroup>
      <ChoiceCardGroup type="multiple" value={addons} onValueChange={setAddons} columns={2} name="addons" aria-label="Add-ons">
        <ChoiceCard value="reminders" title="Automatic reminders" description="Nudges before and after the due date." meta="Included" />
        <ChoiceCard value="gcash" title="GCash payments" description="Let clients pay with GCash." meta="+ ₱150 / month" />
      </ChoiceCardGroup>
      <Text size="sm" tone="muted">
        plan = {JSON.stringify(plan)}, add-ons = {JSON.stringify(addons)}
      </Text>
    </div>
  );
}

export function CardPage() {
  return (
    <>
      <PageHeader
        title="Card"
        intro="A container for one topic — a summary, a setting, an item in a grid. Compose it from a header, content, footer and media; make the whole card a link; or turn cards into choices."
        importLine={`import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  CardFooter, CardMedia, CardLink, CardBody, ChoiceCardGroup, ChoiceCard,
} from "@jm/ui";`}
      />

      <Section
        title="Basic"
        desc="A header with a title, description and an action at the top right; content; and a footer for buttons. Use only the parts you need."
        code={`
<Card>
  <CardHeader
    title="Website refresh"
    description="Due 30 September · 12 of 18 tasks done"
    action={<Button variant="ghost" size="sm" iconOnly icon="bi bi-three-dots" aria-label="Project options" />}
  />
  <CardContent>
    <ProgressBar value={67} aria-label="Tasks done" size="sm" />
  </CardContent>
  <CardFooter justify="between">
    <AvatarGroup size="sm">…</AvatarGroup>
    <Button size="sm" variant="secondary">Open project</Button>
  </CardFooter>
</Card>`}
      >
        <Card className="w-full max-w-sm">
          <CardHeader
            title="Website refresh"
            description="Due 30 September · 12 of 18 tasks done"
            action={<Button variant="ghost" size="sm" iconOnly icon="bi bi-three-dots" aria-label="Project options" />}
          />
          <CardContent>
            <ProgressBar value={67} aria-label="Tasks done" size="sm" />
          </CardContent>
          <CardFooter justify="between">
            <AvatarGroup size="sm" aria-label="Project members">
              <Avatar name="Maria Santos" />
              <Avatar name="Ana Reyes" />
              <Avatar name="Ben Cruz" />
            </AvatarGroup>
            <Button size="sm" variant="secondary">Open project</Button>
          </CardFooter>
        </Card>
      </Section>

      <Section
        title="Styles"
        desc="Outline (the default) is calm on busy pages. Elevated lifts a card off a tinted background. Filled groups content inside another surface without more borders."
        code={`
<Card variant="outline">…</Card>
<Card variant="elevated">…</Card>
<Card variant="filled">…</Card>`}
      >
        <div className="grid w-full gap-4 sm:grid-cols-3">
          {(["outline", "elevated", "filled"] as const).map((v) => (
            <Card key={v} variant={v} padding="sm">
              <CardContent>
                <Stat label="Paid this month" value="₱312,400" change="8.2%" trend="up" />
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        title="With media"
        desc="CardMedia shows an image edge to edge at a set ratio (16/9 by default), or inset with its own rounded corners."
        code={`
<Card>
  <CardMedia src={post.cover} alt="" ratio="16/9" />
  <CardHeader title={post.title} description={post.excerpt} />
</Card>

<CardMedia src={…} inset ratio="4/3" />`}
      >
        <div className="grid w-full gap-4 sm:grid-cols-2">
          <Card>
            <CardMedia src={articles[0].img} />
            <CardHeader title="Getting paid faster" description="How payment links cut the time from invoice to paid." />
          </Card>
          <Card variant="elevated">
            <CardMedia src={articles[1].img} inset ratio="4/3" />
            <CardHeader title="Invoice templates" description="Three layouts, tested with real clients." />
          </Card>
        </div>
      </Section>

      <Section
        title="The whole card as a link"
        desc="Wrap the title in CardLink and the entire card becomes clickable — with one clean link for screen readers. Buttons in the header action or footer still work on their own. Add interactive for hover and press feedback."
        code={`
<Card interactive>
  <CardMedia src={post.cover} />
  <CardHeader action={<Button iconOnly icon="bi bi-bookmark" aria-label="Save" … />}>
    <Pill size="sm">{post.tag}</Pill>
    <CardTitle>
      <CardLink href={\`/blog/\${post.slug}\`}>{post.title}</CardLink>
    </CardTitle>
  </CardHeader>
  <CardFooter justify="start"><Text size="sm" tone="muted">6 min read</Text></CardFooter>
</Card>

// Next.js / Inertia
<CardLink asChild><Link href="/blog/…">{post.title}</Link></CardLink>`}
      >
        <div className="grid w-full gap-4 sm:grid-cols-3">
          {articles.map((a) => (
            <Card key={a.title} interactive>
              <CardMedia src={a.img} />
              <CardHeader action={<Button variant="ghost" size="sm" iconOnly icon="bi bi-bookmark" aria-label={`Save “${a.title}”`} />}>
                <div className="mb-1"><Pill size="sm">{a.tag}</Pill></div>
                <CardTitle>
                  <CardLink href="#/card">{a.title}</CardLink>
                </CardTitle>
              </CardHeader>
              <CardFooter justify="start" className="mt-auto pt-3">
                <Text size="sm" tone="muted">{a.time}</Text>
              </CardFooter>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        title="Horizontal"
        desc='orientation="horizontal" puts media beside the content from small screens up; on phones it stacks. Wrap the text parts in CardBody.'
        code={`
<Card orientation="horizontal">
  <CardMedia src={…} />
  <CardBody>
    <CardHeader title="…" description="…" />
    <CardFooter justify="start">…</CardFooter>
  </CardBody>
</Card>`}
      >
        <Card orientation="horizontal" className="w-full max-w-2xl">
          <CardMedia src={articles[2].img} />
          <CardBody>
            <CardHeader
              title="Reminders that don't annoy anyone"
              description="Friendly timing, clear amounts and one-tap payment: what we learned from 40,000 reminder emails."
            />
            <CardFooter justify="start" className="mt-auto">
              <Button size="sm" variant="secondary">Read the guide</Button>
            </CardFooter>
          </CardBody>
        </Card>
      </Section>

      <Section
        title="Settings cards"
        desc="A divided footer with a tinted background suits settings sections with a Save button. tone=&quot;danger&quot; marks irreversible actions."
        code={`
<Card>
  <CardHeader title="Business details" description="Shown on every invoice you send." />
  <CardContent>…fields…</CardContent>
  <CardFooter divided justify="between">
    <Text size="sm" tone="muted">Changes apply to new invoices.</Text>
    <Button size="sm">Save</Button>
  </CardFooter>
</Card>

<Card tone="danger">
  <CardHeader title="Delete workspace" description="…" />
  <CardFooter divided><Button variant="danger" size="sm">Delete workspace</Button></CardFooter>
</Card>`}
      >
        <div className="grid w-full max-w-xl gap-5">
          <Card>
            <CardHeader title="Business details" description="Shown on every invoice you send." />
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Business name"><Input defaultValue="Astherix Software Services" /></Field>
              <Field label="TIN" optional><Input placeholder="000-000-000-000" /></Field>
            </CardContent>
            <CardFooter divided justify="between">
              <Text size="sm" tone="muted">Changes apply to new invoices.</Text>
              <Button size="sm">Save</Button>
            </CardFooter>
          </Card>
          <Card tone="danger">
            <CardHeader
              title="Delete workspace"
              description="Removes all invoices, clients and files for everyone in this workspace. This can't be undone."
            />
            <CardFooter divided>
              <Button variant="danger" size="sm">Delete workspace</Button>
            </CardFooter>
          </Card>
        </div>
      </Section>

      <Section
        title="Choice cards"
        desc="For choices that need a sentence of explanation — plans, delivery options, roles. They use real radio buttons or checkboxes underneath, so the keyboard, screen readers and forms all work as expected."
        code={`
<ChoiceCardGroup value={plan} onValueChange={setPlan} name="plan" aria-label="Plan">
  <ChoiceCard value="starter" icon="bi bi-person" title="Starter"
    description="For freelancers sending a few invoices." meta="Free" />
  <ChoiceCard value="team" title="Team" badge={<Pill size="sm" tone="primary">Recommended</Pill>}
    description="Unlimited invoices, reminders and 5 teammates." meta="₱990 / month" />
  <ChoiceCard value="business" title="Business" … disabled />
</ChoiceCardGroup>

<ChoiceCardGroup type="multiple" value={addons} onValueChange={setAddons} columns={2}>…</ChoiceCardGroup>`}
      >
        <PlanDemo />
      </Section>
    </>
  );
}
