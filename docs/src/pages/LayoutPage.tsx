import * as React from "react";
import {
  Stack,
  Grid,
  GridItem,
  Container,
  Center,
  Spacer,
  AspectRatio,
  Divider,
  Avatar,
  Button,
  Field,
  KpiCard,
  Pill,
  Slider,
  Text,
} from "@jm/ui";
import { PageHeader, Section } from "../components/Doc";

const Box = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`grid min-h-12 place-items-center rounded-control border border-dashed border-primary/40 bg-[color:color-mix(in_srgb,var(--color-primary)_8%,transparent)] px-3 py-2 text-xs font-medium text-primary ${className}`}
  >
    {children}
  </div>
);

function GridPlayground() {
  const [columns, setColumns] = React.useState(3);
  const [gap, setGap] = React.useState(4);
  return (
    <div className="grid w-full gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={`Columns: ${columns}`}>
          <Slider value={columns} onChange={(v) => setColumns(v as number)} min={1} max={6} marks size="sm" />
        </Field>
        <Field label={`Gap: ${gap} (${(gap * 0.25).toFixed(2)}rem)`}>
          <Slider value={gap} onChange={(v) => setGap(v as number)} min={0} max={10} marks size="sm" />
        </Field>
      </div>
      <Grid columns={columns} gap={gap}>
        {Array.from({ length: 9 }, (_, i) => (
          <Box key={i}>{i + 1}</Box>
        ))}
      </Grid>
    </div>
  );
}

export function LayoutPage() {
  return (
    <>
      <PageHeader
        title="Layout"
        intro="Small pieces for arranging things: Stack for rows and columns, Grid for grids, plus Container, Center, Spacer, Divider and AspectRatio. Every size prop can change by screen size — direction={{ base: 'column', md: 'row' }} — so a form's buttons stack on a phone and sit side by side on a laptop, without writing media queries."
        importLine={'import { Stack, Grid, GridItem, Container, Center, Spacer, Divider, AspectRatio } from "@jm/ui";'}
      />

      <Section
        title="Stack"
        desc="Children in a row or a column with even spacing. gap counts in spacing steps, so 4 is 1rem and everything stays on the same rhythm as the rest of the framework."
        code={`
<Stack gap={3}>…</Stack>                                  {/* a column */}
<Stack direction="row" gap={2} align="center">…</Stack>    {/* a row */}
<Stack direction={{ base: "column", md: "row" }} justify="between" align="center">…</Stack>
<Stack direction="row" wrap gap={2}>…</Stack>
<Stack divider gap={3}>…</Stack>                          {/* lines between */}`}
      >
        <div className="grid w-full gap-6">
          <div className="grid gap-2">
            <Text size="xs" tone="muted">A column (default)</Text>
            <Stack gap={2}>
              <Box>First</Box>
              <Box>Second</Box>
              <Box>Third</Box>
            </Stack>
          </div>

          <div className="grid gap-2">
            <Text size="xs" tone="muted">A row, centered, with a Spacer pushing the last one away</Text>
            <Stack direction="row" gap={2} align="center">
              <Avatar name="Maria Santos" size="sm" decorative />
              <Box className="min-h-9">Maria Santos</Box>
              <Spacer />
              <Button size="sm" variant="secondary">Message</Button>
            </Stack>
          </div>

          <div className="grid gap-2">
            <Text size="xs" tone="muted">Column on phones, row from medium screens — narrow your window</Text>
            <Stack direction={{ base: "column", md: "row" }} gap={{ base: 2, md: 4 }} align={{ md: "center" }} justify={{ md: "between" }} wrap>
              <Box>Invoice total: ₱48,200</Box>
              <Stack direction="row" gap={2} wrap>
                <Button size="sm" variant="secondary">Save draft</Button>
                <Button size="sm">Send</Button>
              </Stack>
            </Stack>
          </div>

          <div className="grid gap-2">
            <Text size="xs" tone="muted">With dividers between children</Text>
            <Stack divider gap={3} className="rounded-card border border-border bg-surface p-4">
              <Text size="sm">Invoice sent to accounts@northwind.example</Text>
              <Text size="sm">Payment received · ₱48,200</Text>
              <Text size="sm">Receipt emailed</Text>
            </Stack>
          </div>
        </div>
      </Section>

      <Section
        title="Grid"
        desc="Equal columns, with a count that can change by screen size. Drag the sliders."
        code={`
<Grid columns={3} gap={4}>…</Grid>
<Grid columns={{ base: 1, sm: 2, lg: 4 }} gap={{ base: 3, lg: 5 }}>…</Grid>`}
      >
        <GridPlayground />
      </Section>

      <Section
        title="Grids that arrange themselves"
        desc="minChildWidth fits as many columns as will hold that width and reflows on its own — no breakpoints to pick. Good for card galleries and dashboards that live in panels of unknown width."
        code={`
<Grid minChildWidth="16rem" gap={4}>
  {clients.map((c) => <ClientCard key={c.id} client={c} />)}
</Grid>`}
      >
        <Grid minChildWidth="14rem" gap={4} className="w-full">
          {["Northwind Traders", "Blue Harbor Café", "Luzon Freight", "Pixel & Pine", "Mabuhay Tours"].map((name) => (
            <Stack key={name} gap={2} className="rounded-card border border-border bg-surface p-4">
              <Stack direction="row" gap={2} align="center">
                <Avatar name={name} size="sm" decorative />
                <Text size="sm" className="truncate font-medium">{name}</Text>
              </Stack>
              <Text size="xs" tone="muted">12 invoices · ₱312,400 billed</Text>
            </Stack>
          ))}
        </Grid>
      </Section>

      <Section
        title="Spanning columns"
        desc="GridItem takes several columns or rows — the usual dashboard shape, where a chart is wide and the smaller cards sit beside it. A span never exceeds the number of columns, so nothing overflows on a phone."
        code={`
<Grid columns={{ base: 1, md: 4 }} gap={4}>
  <GridItem span={{ base: 1, md: 3 }}><Chart /></GridItem>
  <GridItem><Summary /></GridItem>
  <GridItem span={{ base: 1, md: 2 }} rowSpan={2}><Table /></GridItem>
</Grid>`}
      >
        <Grid columns={{ base: 1, md: 4 }} gap={4} className="w-full">
          <GridItem span={{ base: 1, md: 3 }}><Box className="min-h-28">span 3</Box></GridItem>
          <GridItem><Box className="min-h-28">1</Box></GridItem>
          <GridItem span={{ base: 1, md: 2 }}><Box className="min-h-20">span 2</Box></GridItem>
          <GridItem><Box className="min-h-20">1</Box></GridItem>
          <GridItem><Box className="min-h-20">1</Box></GridItem>
        </Grid>
      </Section>

      <Section
        title="A page, put together"
        desc="Container keeps the content from getting too wide and centers it; Stack and Grid do the rest. This is roughly how a dashboard page is laid out."
        code={`
<Container size="xl">
  <Stack gap={6}>
    <Stack direction={{ base: "column", sm: "row" }} justify="between" align={{ sm: "center" }} gap={3}>
      <Heading>Invoices</Heading>
      <Button>New invoice</Button>
    </Stack>
    <Grid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>{kpis}</Grid>
    <Grid columns={{ base: 1, lg: 3 }} gap={4}>
      <GridItem span={{ base: 1, lg: 2 }}><Chart /></GridItem>
      <GridItem><TopClients /></GridItem>
    </Grid>
  </Stack>
</Container>`}
      >
        <Container size="lg" padding={0} className="rounded-card border border-border bg-bg p-4">
          <Stack gap={5}>
            <Stack direction={{ base: "column", sm: "row" }} justify={{ sm: "between" }} align={{ sm: "center" }} gap={3}>
              <Stack gap={1}>
                <Text className="text-lg font-semibold">Invoices</Text>
                <Text size="xs" tone="muted">September 2026</Text>
              </Stack>
              <Stack direction="row" gap={2}>
                <Button size="sm" variant="secondary">Export</Button>
                <Button size="sm">New invoice</Button>
              </Stack>
            </Stack>
            <Grid columns={{ base: 1, sm: 2, lg: 4 }} gap={3}>
              <KpiCard label="Paid" value="₱312,400" change={8.2} />
              <KpiCard label="Outstanding" value="₱86,400" change={-4.1} invertTrend />
              <KpiCard label="Overdue" value="3" invertTrend change={50} />
              <KpiCard label="Clients" value="38" change={5.6} />
            </Grid>
            <Grid columns={{ base: 1, lg: 3 }} gap={3}>
              <GridItem span={{ base: 1, lg: 2 }}><Box className="min-h-32">Chart · span 2</Box></GridItem>
              <GridItem><Box className="min-h-32">Top clients</Box></GridItem>
            </Grid>
          </Stack>
        </Container>
      </Section>

      <Section
        title="The rest"
        desc="Center puts things in the middle, Divider separates them (with words in the middle if you like), AspectRatio keeps a box at a fixed shape, and Spacer pushes things apart in a row."
        code={`
<Center minHeight="60vh"><EmptyState /></Center>

<Divider />
<Divider dashed spacing={4} />
<Divider>or</Divider>

<AspectRatio ratio="16/9"><img src={cover} alt="" /></AspectRatio>

<Stack direction="row"><Logo /><Spacer /><Account /></Stack>`}
      >
        <div className="grid w-full gap-5">
          <Center minHeight={140} className="rounded-card border border-dashed border-border-strong">
            <Stack gap={2} align="center">
              <Text size="sm" tone="muted">Nothing here yet</Text>
              <Button size="sm" variant="secondary">Create your first invoice</Button>
            </Stack>
          </Center>

          <Stack gap={3}>
            <Divider />
            <Divider dashed />
            <Divider>or</Divider>
          </Stack>

          <Grid columns={{ base: 1, sm: 3 }} gap={3}>
            {["16/9", "1/1", "4/3"].map((ratio, i) => (
              <Stack key={ratio} gap={1}>
                <AspectRatio ratio={ratio} className="rounded-card">
                  {/* An inline style, because the chart number is picked at runtime. */}
                  <div
                    style={{
                      backgroundImage: `linear-gradient(135deg, var(--ui-chart-${i + 1}), color-mix(in srgb, var(--ui-chart-${i + 2}) 70%, transparent))`,
                    }}
                  />
                </AspectRatio>
                <Text size="xs" tone="muted">ratio {ratio}</Text>
              </Stack>
            ))}
          </Grid>

          <Stack direction="row" gap={2} align="center" className="rounded-card border border-border bg-surface p-3">
            <Pill size="sm" tone="primary">Logo</Pill>
            <Spacer />
            <Text size="sm" tone="muted">pushed to the end by Spacer</Text>
            <Avatar name="JM" size="sm" decorative />
          </Stack>
        </div>
      </Section>

      <Section
        title="Notes"
        desc={
          <>
            Sizes follow the <strong>window</strong>, like Tailwind's own breakpoints — so a row inside a narrow panel still turns
            horizontal on a wide screen. When a layout should react to the space it's actually in, use Grid's minChildWidth (it needs
            no breakpoints), or add wrap so a row can fold onto a second line. gap and padding count in spacing steps, so they follow
            your theme's density.
          </>
        }
        code={`
gap={4}   // 4 × --spacing (1rem by default; tighter on "compact" density)

<Stack direction={{ base: "column", md: "row" }} wrap />   // folds instead of overflowing
<Grid minChildWidth="16rem" />                              // reacts to its own width, not the window

<Container size="sm | md | lg | xl | 2xl | prose | full" padding={{ base: 4, md: 8 }} />
<Stack as="section" … />   <Grid as="ul" … />               // render as any element`}
      >
        <Text size="sm" tone="muted">Any of these can render as another element with `as`, so lists stay lists and sections stay sections.</Text>
      </Section>
    </>
  );
}
