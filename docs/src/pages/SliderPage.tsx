import * as React from "react";
import { Slider, Field, Text, Card, CardContent, toast } from "@jm/ui";
import { PageHeader, Section } from "../components/Doc";

const peso = (v: number) => `₱${v.toLocaleString("en-PH")}`;

function Stack({ children }: { children: React.ReactNode }) {
  return <div className="grid w-full max-w-md gap-6">{children}</div>;
}

function BasicDemo() {
  const [v, setV] = React.useState(10);
  return (
    <Stack>
      <Field label="Late fee" description="Charged on overdue invoices.">
        <Slider value={v} onChange={(x) => setV(x as number)} formatValue={(x) => `${x}%`} max={25} step={1} />
      </Field>
      <Text size="sm" tone="muted">value = {v}</Text>
    </Stack>
  );
}

function RangeDemo() {
  const [range, setRange] = React.useState<[number, number]>([5000, 60000]);
  return (
    <Stack>
      <Field label="Invoice amount">
        <Slider
          value={range}
          onChange={(x) => setRange(x as [number, number])}
          min={0}
          max={100000}
          step={1000}
          minDistance={5000}
          formatValue={peso}
          thumbLabels={["Lowest amount", "Highest amount"]}
          marks={[
            { value: 0, label: "₱0" },
            { value: 25000, label: "25k" },
            { value: 50000, label: "50k" },
            { value: 75000, label: "75k" },
            { value: 100000, label: "100k" },
          ]}
        />
      </Field>
      <Text size="sm" tone="muted">
        Showing invoices from {peso(range[0])} to {peso(range[1])}.
      </Text>
    </Stack>
  );
}

function StepsDemo() {
  const [seats, setSeats] = React.useState(3);
  return (
    <Stack>
      <Field label="Team seats" description="Feel the tick on each step if your phone supports it.">
        <Slider
          value={seats}
          onChange={(x) => setSeats(x as number)}
          min={1}
          max={10}
          marks
          color="secondary"
          formatValue={(x) => `${x} ${x === 1 ? "seat" : "seats"}`}
        />
      </Field>
      <Text size="sm" tone="muted" numeric>₱{(seats * 249).toLocaleString()} / month</Text>
    </Stack>
  );
}

export function SliderPage() {
  return (
    <>
      <PageHeader
        title="Slider"
        intro="Pick a number or a range by dragging. At rest the thumb is a simple raised knob; press it and it swells into a frosted glass lens, with the value floating in a glass bubble above your finger — so the number is never hidden under your thumb."
        importLine={`import { Slider, Field } from "@jm/ui";`}
      />

      <Section
        title="Press and drag"
        desc="Tap anywhere on the track and the thumb jumps there, already in its glass state, so you can keep dragging. Pull past either end and it stretches a little, then springs back when you let go."
        code={`
const [fee, setFee] = useState(10);

<Field label="Late fee">
  <Slider value={fee} onChange={setFee} max={25} formatValue={(v) => \`\${v}%\`} />
</Field>`}
      >
        <BasicDemo />
      </Section>

      <Section
        title="Range"
        desc="Give it two values for a range with two thumbs. They can't cross, and minDistance keeps them apart. Marks can carry labels."
        code={`
const [range, setRange] = useState([5000, 60000]);

<Slider
  value={range}
  onChange={setRange}
  max={100000}
  step={1000}
  minDistance={5000}
  formatValue={(v) => \`₱\${v.toLocaleString()}\`}
  thumbLabels={["Lowest amount", "Highest amount"]}
  marks={[{ value: 0, label: "₱0" }, { value: 50000, label: "50k" }, { value: 100000, label: "100k" }]}
/>`}
      >
        <RangeDemo />
      </Section>

      <Section
        title="Steps you can feel"
        desc="marks shows a dot for every step. On phones that support vibration, crossing a mark gives a tiny tick — like the detents on a physical dial. Turn it off with haptics={false}."
        code={`
<Slider min={1} max={10} marks color="secondary"
  formatValue={(v) => \`\${v} seats\`} value={seats} onChange={setSeats} />`}
      >
        <StepsDemo />
      </Section>

      <Section
        title="Colors and sizes"
        desc="The same color palette as Switch, and three sizes. Larger sizes are easier to grab on touch screens."
        code={`
<Slider size="sm" color="primary" />
<Slider size="md" color="tertiary" />
<Slider size="lg" color="#7c3aed" />`}
      >
        <Stack>
          <Slider size="sm" defaultValue={30} aria-label="Small, primary" />
          <Slider size="md" color="tertiary" defaultValue={55} aria-label="Medium, tertiary" />
          <Slider size="lg" color="#7c3aed" defaultValue={75} aria-label="Large, custom color" />
          <Slider size="md" defaultValue={45} disabled aria-label="Disabled" />
        </Stack>
      </Section>

      <Section
        title="Save when they let go"
        desc="onChange fires as the value moves; onValueCommit fires once, when the person lets go or finishes with the keyboard — the right moment to save."
        code={`
<Slider
  defaultValue={70}
  onValueCommit={(v) => api.updateSetting("reminder_threshold", v)}
/>`}
      >
        <Card className="w-full max-w-md">
          <CardContent className="grid gap-3">
            <Field label="Send a reminder when an invoice is this many days late">
              <Slider
                defaultValue={7}
                max={30}
                marks={[{ value: 0, label: "0" }, { value: 7, label: "7" }, { value: 14, label: "14" }, { value: 30, label: "30 days" }]}
                formatValue={(v) => `${v} day${v === 1 ? "" : "s"}`}
                onValueCommit={(v) => toast.success(`Reminders after ${v} day${v === 1 ? "" : "s"} late`)}
              />
            </Field>
          </CardContent>
        </Card>
      </Section>

      <Section
        title="Keyboard and forms"
        desc="Each thumb is a proper slider for screen readers, with the formatted value read out. With a name, values post like normal fields."
        code={`
← →  ↑ ↓          one step (Shift: ten steps)
Page Up / Down    a tenth of the range
Home / End        minimum / maximum

<Slider name="late_fee" … />                 // posts late_fee=10
<Slider name="amount[]" value={[0, 5000]} …/> // posts amount[]=0&amount[]=5000`}
      >
        <Text size="sm" tone="muted">
          showValue="always" keeps the bubble visible; "never" hides it. With reduced motion on, the lens and bubble
          appear without the springy movement.
        </Text>
      </Section>
    </>
  );
}
