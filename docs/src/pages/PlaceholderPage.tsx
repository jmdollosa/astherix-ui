import * as React from "react";
import { Placeholder } from "@astherix/ui";
import { PageHeader, Section } from "../components/Doc";

export function PlaceholderPage() {
  return (
    <>
      <PageHeader
        title="Placeholder"
        intro="A patterned box that holds a slot in a layout before its content exists — a wireframe, a new dashboard's empty widgets. For content that's on its way, use Skeleton instead."
        importLine={`import { Placeholder } from "@astherix/ui";`}
      />

      <Section
        title="Dashboard slots"
        desc="Give it a height or a ratio. A label says what will go there."
        code={`
<div className="grid gap-4 md:grid-cols-3">
  <Placeholder ratio="16/9" />
  <Placeholder ratio="16/9" />
  <Placeholder ratio="16/9" />
</div>
<Placeholder className="h-80" label="Revenue chart" />`}
      >
        <div className="grid w-full gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Placeholder ratio="16/9" />
            <Placeholder ratio="16/9" />
            <Placeholder ratio="16/9" />
          </div>
          <Placeholder className="h-48" label="Revenue chart" />
        </div>
      </Section>

      <Section
        title="Patterns"
        desc="Stripes (the default), dots, a grid, or just the outline. The pattern uses the text color, so it follows the theme — set a text color to tint it."
        code={`
<Placeholder pattern="stripes" />
<Placeholder pattern="dots" />
<Placeholder pattern="grid" />
<Placeholder pattern="none" label="Drop files here" />
<Placeholder border="solid" className="text-primary" />`}
      >
        <div className="grid w-full gap-4 sm:grid-cols-3">
          <Placeholder pattern="stripes" label="stripes" />
          <Placeholder pattern="dots" label="dots" />
          <Placeholder pattern="grid" label="grid" />
          <Placeholder pattern="none" label="none" />
          <Placeholder border="solid" className="text-primary" label="tinted, solid border" />
        </div>
      </Section>
    </>
  );
}
