import * as React from "react";
import {
  ThemeProvider,
  Button,
  Field,
  Input,
  Select,
  Switch,
  Checkbox,
  Pill,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Textarea,
  Text,
  PillGroup,
  PillOption,
  type ThemeConfig,
} from "@jm/ui";
import { validateTheme } from "@jm/ui/theme";
import { Code, PageHeader, Section } from "../components/Doc";

const presets: Record<string, { label: string; theme: ThemeConfig }> = {
  default: { label: "Default", theme: { colors: { primary: "#0d6efd" }, radius: "md", density: "comfortable" } },
  emerald: {
    label: "Emerald, compact",
    theme: {
      colors: { primary: "#047857", secondary: "#0e7490", tertiary: "#b45309" },
      fonts: { sans: '"DM Sans", ui-sans-serif, system-ui, sans-serif', googleFonts: ["DM Sans:wght@400..700"] },
      radius: "sm",
      density: "compact",
      shadows: "subtle",
    },
  },
  sunset: {
    label: "Sunset, roomy",
    theme: {
      colors: { primary: "#c2410c", secondary: "#be185d", tertiary: "#7c3aed" },
      fonts: {
        sans: '"Nunito Sans", ui-sans-serif, system-ui, sans-serif',
        heading: '"Fraunces", Georgia, serif',
        googleFonts: ["Nunito Sans:wght@400..700", "Fraunces:wght@600"],
      },
      radius: "lg",
      density: "spacious",
      shadows: "strong",
    },
  },
  ink: {
    label: "Ink, square",
    theme: {
      colors: { primary: { light: "#111827", dark: "#e5e7eb" }, secondary: "#0891b2" },
      fonts: { sans: '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif', mono: '"IBM Plex Mono", ui-monospace, monospace', googleFonts: ["IBM Plex Sans:wght@400..600", "IBM Plex Mono"] },
      radius: "none",
      shadows: "none",
    },
  },
};

const pretty = (t: ThemeConfig) => JSON.stringify(t, null, 2);

function Preview() {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader title="New invoice" description="Northwind Traders · due in 14 days" action={<Pill size="sm" tone="warning" dot>Draft</Pill>} />
        <CardContent className="grid gap-4">
          <Field label="Client email">
            <Input type="email" defaultValue="accounts@northwind.example" leadingIcon="bi bi-envelope" />
          </Field>
          <Field label="Payment method">
            <Select
              searchable={false}
              defaultValue="gcash"
              options={[
                { value: "card", label: "Card" },
                { value: "gcash", label: "GCash" },
                { value: "bank", label: "Bank transfer" },
              ]}
            />
          </Field>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Checkbox label="Attach PDF" defaultChecked />
            <Switch label="Reminders" defaultChecked />
            <Switch label="Paid" variant="mark" color="secondary" defaultChecked />
            <Switch label="Late fee" variant="liquid" color="tertiary" defaultChecked />
          </div>
        </CardContent>
        <CardFooter divided justify="between">
          <Button variant="ghost" size="sm">Save draft</Button>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">Preview</Button>
            <Button size="sm" leadingIcon="bi bi-send">Send</Button>
          </div>
        </CardFooter>
      </Card>
      <div className="flex flex-wrap gap-2">
        <Pill tone="primary">Primary</Pill>
        <Pill tone="success" dot>Paid</Pill>
        <Pill tone="danger" dot>Overdue</Pill>
        <Pill appearance="outline">Outline</Pill>
      </div>
      <h3 className="font-heading text-xl font-semibold tracking-[-0.01em]">Headings use the heading font</h3>
      <Text size="sm" tone="muted">
        Body text uses the sans font. Numbers like <code className="font-mono">INV-1047</code> use the mono font.
      </Text>
    </div>
  );
}

function Playground() {
  const [key, setKey] = React.useState<string | null>("sunset");
  const [text, setText] = React.useState(pretty(presets.sunset.theme));
  const [applied, setApplied] = React.useState<ThemeConfig>(presets.sunset.theme);
  const [problems, setProblems] = React.useState<string[]>([]);

  const update = (value: string) => {
    setText(value);
    let parsed: unknown;
    try {
      parsed = JSON.parse(value);
    } catch (e) {
      setProblems([`That isn't valid JSON yet: ${(e as Error).message}`]);
      return;
    }
    const found = validateTheme(parsed);
    setProblems(found);
    if (!found.length) setApplied(parsed as ThemeConfig);
  };

  return (
    <div className="grid w-full gap-5">
      <PillGroup
        value={key}
        onValueChange={(k) => {
          if (!k) return;
          setKey(k);
          update(pretty(presets[k].theme));
        }}
        size="sm"
        aria-label="Preset themes"
      >
        {Object.entries(presets).map(([k, p]) => (
          <PillOption key={k} value={k}>{p.label}</PillOption>
        ))}
      </PillGroup>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Field label="ui.theme.json" description="Edit it — the preview updates as you type." error={problems[0]}>
          <Textarea
            value={text}
            onChange={(e) => {
              setKey(null);
              update(e.target.value);
            }}
            autoResize
            minRows={10}
            maxRows={24}
            spellCheck={false}
            className="font-mono text-[0.8125rem] leading-[1.55]"
          />
        </Field>
        <div className="grid min-w-0 content-start gap-1.5">
          <p className="text-sm font-medium">Preview</p>
          {/* The theme is scoped to this box, so the rest of the guide keeps its look. */}
          <ThemeProvider theme={applied} selector="[data-theme-preview]">
            <div data-theme-preview="" className="rounded-card border border-border bg-bg p-4">
              <Preview />
            </div>
          </ThemeProvider>
        </div>
      </div>
    </div>
  );
}

export function ThemingPage() {
  return (
    <>
      <PageHeader
        title="Theming"
        intro="Describe your brand once in ui.theme.json — colors, fonts, corners, spacing and shadows — and every component follows. Use it at build time (a CSS file, no JavaScript needed) or at runtime (for themes that change, like one per customer)."
      />

      <Section
        title="Try it"
        desc="Pick a preset or edit the JSON. From one primary color the framework works out the hover shade, the pressed edge, readable text on top, and a dark-mode version. Switch the guide to dark mode to see those."
        code={`
{
  "$schema": "./node_modules/@jm/ui/ui.theme.schema.json",
  "colors": { "primary": "#c2410c", "secondary": "#be185d", "tertiary": "#7c3aed" },
  "fonts": {
    "sans": "\\"Nunito Sans\\", ui-sans-serif, system-ui, sans-serif",
    "heading": "\\"Fraunces\\", Georgia, serif",
    "googleFonts": ["Nunito Sans:wght@400..700", "Fraunces:wght@600"]
  },
  "radius": "lg",
  "density": "spacious",
  "shadows": "strong"
}`}
      >
        <Playground />
      </Section>

      <Section
        title="The settings"
        desc="Everything is optional — leave a setting out to keep the default. The $schema line gives you autocomplete and checking in VS Code."
        code={`
colors        primary, secondary, tertiary, success, warning, danger, info
              → "#0d6efd", or { "light": "#…", "dark": "#…", "foreground": "#…", "darkForeground": "#…" }
              background, surface, foreground, muted, border → "#…" or { "light", "dark" }
fonts         sans, heading, mono (CSS font stacks), googleFonts (["Inter:wght@400..700"])
radius        "none" | "sm" | "md" | "lg"  or  { control, controlSm, controlLg, card, modal }
density       "compact" | "comfortable" | "spacious"  or a multiplier like 0.9
shadows       "none" | "subtle" | "default" | "strong"
baseFontSize  "16px" — scales everything sized in rem`}
      >
        <Text size="sm" tone="muted">
          Text on each color is chosen for readable contrast. If you want a specific one, set foreground — for example
          white text on a mid-green.
        </Text>
      </Section>

      <Section
        title="Build time (recommended)"
        desc="The jm-ui command turns ui.theme.json into a small CSS file. Import it after the framework's theme. Run it with --watch while developing; it tells you exactly what's wrong if the JSON has a mistake."
        code={`
# once: create a starter file
npx jm-ui init

# turn it into CSS (add --watch during development)
npx jm-ui theme ui.theme.json --out app/ui-theme.css             # Next.js
npx jm-ui theme ui.theme.json --out resources/css/ui-theme.css   # Laravel

# package.json — keep it in sync automatically
"scripts": {
  "theme": "jm-ui theme ui.theme.json --out resources/css/ui-theme.css",
  "predev": "npm run theme",
  "prebuild": "npm run theme"
}`}
      >
        <div className="grid w-full gap-3">
          <Text size="sm" tone="muted">Then import it right after the framework's theme:</Text>
          <Code
            code={`
/* app/globals.css (Next.js) or resources/css/app.css (Laravel) */
@import "tailwindcss";
@import "@jm/ui/theme.css";
@import "./ui-theme.css";          /* ← your theme */
@source "../node_modules/@jm/ui/dist";`}
          />
        </div>
      </Section>

      <Section
        title="Runtime"
        desc="Import the JSON (Next.js and Vite both can) or load it from your API, and wrap your app in ThemeProvider. Use a selector to theme just one part of a page, like the preview above."
        code={`
import theme from "../ui.theme.json";
import { ThemeProvider } from "@jm/ui";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </body>
    </html>
  );
}

// A theme per customer, from Laravel
<ThemeProvider theme={tenant.theme} selector="[data-tenant]">…</ThemeProvider>`}
      >
        <Text size="sm" tone="muted">Prefer the build step for a single, fixed theme — the page doesn't need to run any code to look right.</Text>
      </Section>

      <Section
        title="From code"
        desc="The same engine is available as functions — for server rendering, a Laravel-side cache, or your own build step."
        code={`
import { createThemeCss, validateTheme, defineTheme } from "@jm/ui/theme";

const theme = defineTheme({ colors: { primary: "#047857" }, density: "compact" });
const problems = validateTheme(theme);            // [] when it's fine
const css = createThemeCss(theme, { selector: ":root", darkSelector: ".dark" });`}
      >
        <Text size="sm" tone="muted">createThemeCss is pure — it works in Node, in the browser, and on the edge.</Text>
      </Section>
    </>
  );
}
