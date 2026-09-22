import * as React from "react";
import {
  Heading,
  Text,
  Lead,
  Link,
  Code,
  Kbd,
  Mark,
  Blockquote,
  List,
  ListItem,
  Prose,
  Stat,
  StatGroup,
  type HeadingSize,
} from "@jm/ui";
import { PageHeader, Section } from "../components/Doc";

const scale: Array<[HeadingSize, string, string]> = [
  ["display", "Display", "36–56px, fluid"],
  ["h1", "Heading 1", "30–38px, fluid"],
  ["h2", "Heading 2", "26px"],
  ["h3", "Heading 3", "21px"],
  ["h4", "Heading 4", "17px"],
  ["h5", "Heading 5", "15px"],
  ["h6", "Heading 6", "13px"],
];

const article = `
<h2>Sending invoices from your phone</h2>
<p>You can now create, send and follow up on invoices from the mobile app. Everything syncs with the web dashboard, so you can start an invoice on your laptop and send it from the road.</p>
<h3>What's new</h3>
<ul>
  <li><p><strong>Payment links</strong> — clients pay by card or GCash straight from the email.</p></li>
  <li><p><strong>Reminders</strong> — a polite nudge goes out 3 days before and after the due date.</p></li>
  <li><p><strong>Offline drafts</strong> — drafts save on the device and sync when you're back online.</p></li>
</ul>
<blockquote><p>We cut the time from job done to invoice sent from two days to ten minutes.</p></blockquote>
<h3>For developers</h3>
<p>The invoices endpoint now accepts a <code>send_at</code> date. Schedule an invoice like this:</p>
<pre><code>POST /api/invoices/1042/send
{ "send_at": "2026-10-01T09:00:00+08:00" }</code></pre>
<table>
  <thead><tr><th>Plan</th><th>Invoices a month</th><th>Price</th></tr></thead>
  <tbody>
    <tr><td>Starter</td><td>50</td><td>Free</td></tr>
    <tr><td>Team</td><td>Unlimited</td><td>₱990</td></tr>
  </tbody>
</table>
<p>Read the <a href="#/typography">API reference</a> for every option.</p>
`;

export function TypographyPage() {
  return (
    <>
      <PageHeader
        title="Typography"
        intro="A type scale and the small text pieces every app needs — headings, body text, links, code, key caps, quotes, lists, long-form content and key numbers — all tuned to Schibsted Grotesk and the rest of the framework."
        importLine={`import {
  Heading, Text, Lead, Link, Code, Kbd, Mark,
  Blockquote, List, ListItem, Prose, Stat, StatGroup,
} from "@jm/ui";`}
      />

      <Section
        title="Type scale"
        desc="Seven heading sizes. Display and Heading 1 shrink smoothly on phones. Large sizes get tighter letter spacing so they don't look loose, and every heading balances its lines."
        code={`
<Heading level={1} size="display">Get paid faster</Heading>
<Heading level={1}>Invoices</Heading>
<Heading level={2}>Recent activity</Heading>
<Heading level={3}>Payment details</Heading>`}
      >
        <div className="grid w-full gap-5">
          {scale.map(([size, name, px]) => (
            <div key={size} className="grid gap-1 border-b border-border pb-4 last:border-0 sm:grid-cols-[8rem_1fr] sm:items-baseline sm:gap-6">
              <Text size="xs" tone="muted" numeric>
                {name} · {px}
              </Text>
              <Heading level={2} size={size} lineClamp={2}>
                Send invoices in minutes
              </Heading>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Level and size"
        desc={
          <>
            <code className="font-mono text-[0.8125rem]">level</code> sets the tag (h1–h6) for the page outline that
            screen readers and search engines use. <code className="font-mono text-[0.8125rem]">size</code> sets the
            look. Keep the levels in order, and change the size when the design needs it.
          </>
        }
        code={`
// A card title is an h3 in the outline, but looks like a small heading
<Heading level={3} size="h5">Monthly revenue</Heading>

// A hero: the page's h1, at display size
<Heading level={1} size="display">Get paid faster</Heading>`}
      >
        <div className="w-full max-w-xs rounded-control-lg border border-border bg-surface p-4">
          <Heading level={3} size="h5">Monthly revenue</Heading>
          <Text size="sm" tone="muted">Paid invoices, September</Text>
        </div>
      </Section>

      <Section
        title="Text"
        desc="Five sizes (md is the body size), tones for meaning, weights, and tabular numbers so amounts line up. Lead is for the opening paragraph."
        code={`
<Lead>Create, send and track invoices from one place.</Lead>
<Text>Body text for most content.</Text>
<Text size="sm" tone="muted">Updated 2 hours ago</Text>
<Text tone="danger" weight="medium">Payment failed</Text>
<Text numeric>₱48,200.00</Text>`}
      >
        <div className="grid max-w-xl gap-4">
          <Lead>Create, send and track invoices from one place — and get paid by card or GCash.</Lead>
          <Text>
            Body text is 15px with a comfortable line height, set for reading on screens. Keep lines under about 70
            characters so eyes don't lose their place.
          </Text>
          <div className="grid gap-1">
            <Text size="xl">Extra large — 19px</Text>
            <Text size="lg">Large — 17px</Text>
            <Text size="md">Medium — 15px, the body size</Text>
            <Text size="sm">Small — 13px, for secondary details</Text>
            <Text size="xs">Extra small — 12px, for fine print</Text>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {(["default", "muted", "subtle", "primary", "success", "warning", "danger", "info"] as const).map((t) => (
              <Text key={t} as="span" tone={t} weight="medium">{t}</Text>
            ))}
          </div>
          <div className="grid w-fit gap-0.5 text-end">
            <Text numeric>₱48,200.00</Text>
            <Text numeric>₱1,750.50</Text>
            <Text numeric weight="semibold">₱49,950.50</Text>
          </div>
        </div>
      </Section>

      <Section
        title="Links"
        desc="Inline links are underlined, so they don't rely on color alone. Links to other sites get an ↗ and open in a new tab, which screen readers are told about."
        code={`
<Text>Read the <Link href="/docs/api">API reference</Link> for details.</Text>
<Link href="https://laravel.com/docs">Laravel docs</Link>           {/* external: ↗ */}
<Link variant="subtle" href="/privacy">Privacy</Link>
<Link variant="standalone" href="/invoices">View all invoices</Link>

// With your framework's link
<Link asChild><NextLink href="/billing">Billing</NextLink></Link>
<Link asChild><InertiaLink href="/billing">Billing</InertiaLink></Link>`}
      >
        <div className="grid max-w-xl gap-3">
          <Text>
            Read the <Link href="#/typography">API reference</Link> for details, or check the{" "}
            <Link href="https://laravel.com/docs">Laravel docs</Link> for setting up queues.
          </Text>
          <Text size="sm" tone="muted">
            <Link variant="subtle" href="#/typography">Privacy</Link> · <Link variant="subtle" href="#/typography">Terms</Link> ·{" "}
            <Link variant="subtle" href="#/typography">Status</Link>
          </Text>
          <Link variant="standalone" href="#/typography">View all invoices</Link>
        </div>
      </Section>

      <Section
        title="Code, keys and highlights"
        desc="Inline code for names and values, key caps for shortcuts (raised, like the buttons), and a highlighter for search matches."
        code={`
<Text>Set <Code>APP_ENV</Code> to <Code>production</Code>.</Text>
<Text>Press <Kbd keys={["⌘", "K"]} /> to search, or <Kbd>Esc</Kbd> to close.</Text>
<Text>Results for “<Mark>invoice</Mark>”</Text>`}
      >
        <div className="grid gap-3">
          <Text>Set <Code>APP_ENV</Code> to <Code>production</Code> in your <Code>.env</Code> file.</Text>
          <Text>Press <Kbd keys={["⌘", "K"]} /> or <Kbd keys={["Ctrl", "K"]} /> to search, and <Kbd>Esc</Kbd> to close.</Text>
          <Text>Send the <Mark>invoice</Mark> reminder three days before the due date.</Text>
        </div>
      </Section>

      <Section
        title="Cutting off long text"
        desc="truncate keeps text to one line; lineClamp allows a few. The full text is still there for screen readers and copying."
        code={`
<Text truncate>…</Text>
<Text lineClamp={2}>…</Text>
<Heading level={3} size="h4" lineClamp={1}>…</Heading>`}
      >
        <div className="grid w-full max-w-xs gap-3 rounded-control-lg border border-border bg-surface p-4">
          <Heading level={3} size="h5" truncate>Northwind Traders — quarterly maintenance retainer</Heading>
          <Text size="sm" tone="muted" lineClamp={2}>
            Covers server updates, security patches, uptime monitoring and up to ten hours of small changes each month,
            billed on the first working day.
          </Text>
        </div>
      </Section>

      <Section
        title="Quotes"
        desc="For testimonials and pull quotes. Add an author and source for attribution."
        code={`
<Blockquote size="lg" author="Maria Santos" source="Owner, Blue Harbor Café">
  We cut the time from job done to invoice sent from two days to ten minutes.
</Blockquote>`}
      >
        <div className="max-w-xl">
          <Blockquote size="lg" author="Maria Santos" source="Owner, Blue Harbor Café">
            We cut the time from job done to invoice sent from two days to ten minutes.
          </Blockquote>
        </div>
      </Section>

      <Section
        title="Lists"
        desc="Bullets, numbers, or check marks for feature lists and what's included."
        code={`
<List variant="check">
  <ListItem>Unlimited invoices</ListItem>
  <ListItem>Payment links</ListItem>
</List>
<List variant="number">…</List>`}
      >
        <div className="grid w-full gap-6 sm:grid-cols-3">
          <List>
            <ListItem>Create an invoice</ListItem>
            <ListItem>Add line items</ListItem>
            <ListItem>Send it</ListItem>
          </List>
          <List variant="number">
            <ListItem>Connect your bank</ListItem>
            <ListItem>Import clients</ListItem>
            <ListItem>Send your first invoice</ListItem>
          </List>
          <List variant="check">
            <ListItem>Unlimited invoices</ListItem>
            <ListItem>Payment links</ListItem>
            <ListItem>Automatic reminders</ListItem>
          </List>
        </div>
      </Section>

      <Section
        title="Long-form content"
        desc="Prose styles whole articles — from the Editor, a CMS or Markdown — with the same type scale: headings, lists, quotes, code blocks, tables and images."
        code={`
<Prose>
  <h2>Sending invoices from your phone</h2>
  <p>…</p>
</Prose>

// HTML from the Editor or a CMS (sanitize it on the server first)
<Prose html={post.body} />`}
      >
        <div className="w-full rounded-control-lg border border-border bg-surface p-5 sm:p-7">
          <Prose html={article} />
        </div>
      </Section>

      <Section
        title="Key numbers"
        desc="Stat shows a number with its label and change. Rising is green and falling is red — unless lower is better (costs, errors, wait times), then set invertTrend."
        code={`
<StatGroup columns={3} divided>
  <Stat label="Revenue" value="₱1.24M" change="12.5%" trend="up" description="vs August" />
  <Stat label="Overdue" value="₱86,400" change="4.1%" trend="down" invertTrend description="vs August" />
  <Stat label="Avg. days to pay" value="9.2" change="1.3 days" trend="up" invertTrend />
</StatGroup>`}
      >
        <div className="w-full rounded-control-lg border border-border bg-surface p-5">
          <StatGroup columns={3} divided>
            <Stat label="Revenue" value="₱1.24M" change="12.5%" trend="up" description="vs August" />
            <Stat label="Overdue" value="₱86,400" change="4.1%" trend="down" invertTrend description="vs August" />
            <Stat label="Avg. days to pay" value="9.2" change="1.3 days" trend="up" invertTrend description="vs August" />
          </StatGroup>
        </div>
      </Section>

      <Section
        title="A different heading font"
        desc="Headings use --font-heading, which is the body font unless you change it. Pair a serif for an editorial feel, for example."
        code={`
// Next.js: app/layout.tsx
import { Newsreader } from "next/font/google";
const serif = Newsreader({ subsets: ["latin"], variable: "--font-serif" });

/* app/globals.css, after the theme import */
@theme { --font-heading: var(--font-serif), Georgia, serif; }`}
      >
        <div className="grid gap-2" style={{ ["--font-heading" as string]: "Georgia, 'Times New Roman', serif" }}>
          <Heading level={2} size="h1">Notes from the field</Heading>
          <Lead>The same components, with a serif for headings and Schibsted Grotesk for everything else.</Lead>
        </div>
      </Section>
    </>
  );
}
