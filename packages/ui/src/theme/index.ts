/*
 * @jm/ui/theme — turn a theme config (ui.theme.json) into CSS variables.
 * Pure functions, no React: safe on the server, in build scripts and in the CLI.
 */
import { adjust, lightness, parseHex, readableOn } from "./color";

export type ColorInput =
  | string
  | {
      /** The color in light mode. */
      light: string;
      /** The color in dark mode. Worked out from light if left out. */
      dark?: string;
      /** Text/icons on the color in light mode. Worked out for contrast if left out. */
      foreground?: string;
      darkForeground?: string;
    };

export type SurfaceInput = string | { light: string; dark?: string };

export interface ThemeConfig {
  $schema?: string;
  colors?: {
    /** Buttons, links, focus rings, selected states. Hover, pressed edge and dark mode are derived. */
    primary?: ColorInput;
    /** Extra accents (e.g. Switch color="secondary" / "tertiary"). */
    secondary?: ColorInput;
    tertiary?: ColorInput;
    success?: ColorInput;
    warning?: ColorInput;
    danger?: ColorInput;
    info?: ColorInput;
    /** Page background. */
    background?: SurfaceInput;
    /** Cards, fields, menus. */
    surface?: SurfaceInput;
    /** Main text. */
    foreground?: SurfaceInput;
    /** Secondary text. */
    muted?: SurfaceInput;
    /** Hairlines and field borders. */
    border?: SurfaceInput;
  };
  fonts?: {
    /** Body font stack, e.g. "Inter, system-ui, sans-serif". */
    sans?: string;
    /** Headings (defaults to sans). */
    heading?: string;
    mono?: string;
    /** Google Fonts to load, e.g. ["Inter:wght@400..700", "Fraunces:wght@600"]. */
    googleFonts?: string[];
  };
  /** Corner roundness: a preset, or exact values. */
  radius?:
    | "none"
    | "sm"
    | "md"
    | "lg"
    | { control?: string; controlSm?: string; controlLg?: string; card?: string; modal?: string };
  /** Spacing and control sizes: a preset, or a multiplier (1 = default, 0.9 = tighter, 1.1 = roomier). */
  density?: "compact" | "comfortable" | "spacious" | number;
  /** Shadow strength. */
  shadows?: "none" | "subtle" | "default" | "strong";
  /** Root font size, e.g. "16px" (default) or "15px". Scales everything sized in rem. */
  baseFontSize?: string;
}

/** Identity helper for typed theme configs in .ts files. */
export const defineTheme = (config: ThemeConfig) => config;

type Pair = { light: string; dark: string; fg: string; darkFg: string };

function resolveColor(input: ColorInput | undefined): Pair | null {
  if (!input) return null;
  const c = typeof input === "string" ? { light: input } : input;
  if (!parseHex(c.light)) return null;
  // Dark mode needs a lighter, slightly calmer version to glow on dark backgrounds.
  const L = lightness(c.light);
  const dark = c.dark ?? adjust(c.light, Math.max(0, 0.72 - L), 0.95);
  return {
    light: c.light,
    dark,
    fg: c.foreground ?? readableOn(c.light),
    darkFg: c.darkForeground ?? readableOn(dark),
  };
}

function surface(input: SurfaceInput | undefined) {
  if (!input) return null;
  return typeof input === "string" ? { light: input, dark: undefined } : input;
}

const radiusPresets = {
  none: { controlSm: "0", control: "0", controlLg: "0", card: "0", modal: "0" },
  sm: { controlSm: "0.125rem", control: "0.25rem", controlLg: "0.375rem", card: "0.375rem", modal: "0.5rem" },
  md: { controlSm: "0.1875rem", control: "0.375rem", controlLg: "0.75rem", card: "0.75rem", modal: "0.875rem" },
  lg: { controlSm: "0.375rem", control: "0.625rem", controlLg: "1rem", card: "1rem", modal: "1.25rem" },
};

const densityUnits = { compact: 0.225, comfortable: 0.25, spacious: 0.28 };

function shadows(strength: number, dark: boolean) {
  if (strength === 0) return { sm: "none", md: "none", lg: "none", xl: "none", modal: "none" };
  const c = dark ? "0 0 0" : "var(--ui-shadow-color)";
  const k = (a: number) => Math.min(1, +(a * strength * (dark ? 3 : 1)).toFixed(3));
  return {
    sm: `0 1px 2px rgb(${c} / ${k(0.14)})`,
    md: `0 1px 2px rgb(${c} / ${k(0.12)}), 0 3px 8px -1px rgb(${c} / ${k(0.14)})`,
    lg: `0 2px 4px rgb(${c} / ${k(0.1)}), 0 8px 18px -4px rgb(${c} / ${k(0.22)})`,
    xl: `0 3px 6px rgb(${c} / ${k(0.1)}), 0 16px 32px -8px rgb(${c} / ${k(0.32)})`,
    modal: `0 2px 6px rgb(${c} / ${k(0.08)}), 0 24px 56px -12px rgb(${c} / ${k(0.35)})`,
  };
}

const COLOR_ALIASES = [
  "bg", "surface", "fg", "fg-muted", "border", "border-strong", "ring",
  "primary", "primary-hover", "primary-edge", "primary-fg",
  "secondary", "secondary-hover",
  "danger", "danger-hover", "danger-edge", "danger-fg",
  "success", "success-fg", "warning", "warning-fg", "info", "info-fg",
  "tone-secondary", "tone-secondary-fg", "tone-tertiary", "tone-tertiary-fg",
];

/** Google Fonts stylesheet URL for the config (or null). */
export function getFontsHref(config: ThemeConfig) {
  const fams = config.fonts?.googleFonts?.filter(Boolean);
  if (!fams?.length) return null;
  return `https://fonts.googleapis.com/css2?${fams.map((f) => `family=${f.trim().replace(/ /g, "+")}`).join("&")}&display=swap`;
}

export interface ThemeCssOptions {
  /** Where light values go. Default ":root". Use e.g. "[data-tenant=acme]" to scope a theme. */
  selector?: string;
  /** Where dark values go. Default ".dark" (the class the framework's dark mode uses). */
  darkSelector?: string;
  /** Add an @import for Google Fonts at the top (for CSS files). Default false. */
  includeFontImport?: boolean;
}

/** Turn a theme config into CSS custom properties that override the defaults in theme.css. */
export function createThemeCss(config: ThemeConfig, options: ThemeCssOptions = {}) {
  const { selector = ":root", darkSelector = ".dark", includeFontImport = false } = options;
  const light: string[] = [];
  const dark: string[] = [];
  const set = (arr: string[], name: string, value: string | undefined) => value && arr.push(`  ${name}: ${value};`);

  const c = config.colors ?? {};
  const primary = resolveColor(c.primary);
  if (primary) {
    // Hover a little darker, the raised bottom edge much darker; in dark mode hover goes lighter.
    set(light, "--ui-primary", primary.light);
    set(light, "--ui-primary-hover", adjust(primary.light, -0.07));
    set(light, "--ui-primary-edge", adjust(primary.light, -0.26));
    set(light, "--ui-primary-fg", primary.fg);
    set(light, "--ui-ring", primary.light);
    set(dark, "--ui-primary", primary.dark);
    set(dark, "--ui-primary-hover", adjust(primary.dark, 0.07));
    set(dark, "--ui-primary-edge", adjust(primary.dark, -0.16));
    set(dark, "--ui-primary-fg", primary.darkFg);
    set(dark, "--ui-ring", adjust(primary.dark, 0.06));
  }
  const tones: Array<[keyof NonNullable<ThemeConfig["colors"]>, string, boolean]> = [
    ["secondary", "--ui-tone-secondary", false],
    ["tertiary", "--ui-tone-tertiary", false],
    ["success", "--ui-success", false],
    ["warning", "--ui-warning", false],
    ["danger", "--ui-danger", true],
    ["info", "--ui-info", false],
  ];
  for (const [key, name, hasStates] of tones) {
    const p = resolveColor(c[key] as ColorInput | undefined);
    if (!p) continue;
    set(light, name, p.light);
    set(light, `${name}-fg`, p.fg);
    set(dark, name, p.dark);
    set(dark, `${name}-fg`, p.darkFg);
    if (hasStates) {
      set(light, `${name}-hover`, adjust(p.light, -0.07));
      set(light, `${name}-edge`, adjust(p.light, -0.26));
      set(dark, `${name}-hover`, adjust(p.dark, 0.07));
      set(dark, `${name}-edge`, adjust(p.dark, -0.16));
    }
  }
  const surfaces: Array<[keyof NonNullable<ThemeConfig["colors"]>, string[]]> = [
    ["background", ["--ui-bg"]],
    ["surface", ["--ui-surface", "--ui-secondary"]],
    ["foreground", ["--ui-fg"]],
    ["muted", ["--ui-fg-muted"]],
    ["border", ["--ui-border"]],
  ];
  for (const [key, names] of surfaces) {
    const s = surface(c[key] as SurfaceInput | undefined);
    if (!s) continue;
    names.forEach((n) => {
      set(light, n, s.light);
      set(dark, n, s.dark);
    });
    if (key === "border") {
      set(light, "--ui-border-strong", parseHex(s.light) ? adjust(s.light, -0.08) : undefined);
      set(dark, "--ui-border-strong", s.dark && parseHex(s.dark) ? adjust(s.dark, 0.08) : undefined);
    }
  }

  const f = config.fonts ?? {};
  set(light, "--font-sans", f.sans);
  set(light, "--font-heading", f.heading ?? (f.sans ? "var(--font-sans)" : undefined));
  set(light, "--font-mono", f.mono);

  if (config.radius) {
    const r = typeof config.radius === "string" ? radiusPresets[config.radius] : config.radius;
    if (r) {
      set(light, "--radius-control-sm", r.controlSm);
      set(light, "--radius-control", r.control);
      set(light, "--radius-control-lg", r.controlLg);
      set(light, "--radius-card", r.card);
      set(light, "--radius-modal", r.modal);
    }
  }

  if (config.density !== undefined) {
    // Tailwind v4 sizes every spacing utility (padding, gaps, control heights) from --spacing.
    const unit = typeof config.density === "number" ? 0.25 * config.density : densityUnits[config.density];
    if (unit) set(light, "--spacing", `${+unit.toFixed(4)}rem`);
  }

  if (config.shadows) {
    const k = { none: 0, subtle: 0.6, default: 1, strong: 1.6 }[config.shadows];
    const l = shadows(k, false);
    const d = shadows(k, true);
    (["sm", "md", "lg", "xl", "modal"] as const).forEach((s) => {
      set(light, `--ui-shadow-${s}`, l[s]);
      set(dark, `--ui-shadow-${s}`, d[s]);
    });
  }

  // When a theme is scoped to part of the page, the framework's --color-* aliases (declared on
  // :root) would still point at the page-level values. Re-declare them on the scope so they
  // resolve against this theme.
  if (selector !== ":root" && (light.length || dark.length)) {
    for (const name of COLOR_ALIASES) light.push(`  --color-${name}: var(--ui-${name});`);
    if (f.sans || f.heading) light.push("  font-family: var(--font-sans);");
  }

  const blocks: string[] = [];
  const href = getFontsHref(config);
  if (includeFontImport && href) blocks.push(`@import url("${href}");`);
  blocks.push("/* Generated by @jm/ui from your theme config. Import it after @jm/ui/theme.css. */");
  if (config.baseFontSize) blocks.push(`html {\n  font-size: ${config.baseFontSize};\n}`);
  if (light.length) blocks.push(`${selector} {\n${light.join("\n")}\n}`);
  if (dark.length) {
    // Scope dark values to the same element when the theme is scoped (e.g. per tenant).
    const darkSel = selector === ":root" ? darkSelector : `${darkSelector} ${selector}, ${selector}${darkSelector}`;
    blocks.push(`${darkSel} {\n${dark.join("\n")}\n}`);
  }
  return blocks.join("\n\n") + "\n";
}

/** Check a config and return friendly problems (empty when it's fine). */
export function validateTheme(config: unknown): string[] {
  const problems: string[] = [];
  if (!config || typeof config !== "object") return ["The theme must be a JSON object."];
  const t = config as ThemeConfig;
  const known = ["$schema", "colors", "fonts", "radius", "density", "shadows", "baseFontSize"];
  Object.keys(t).forEach((k) => !known.includes(k) && problems.push(`Unknown setting "${k}". Known settings: ${known.slice(1).join(", ")}.`));
  const checkColor = (name: string, v: unknown) => {
    if (v === undefined) return;
    const vals = typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v as object) : [v];
    vals.forEach((x) => {
      if (typeof x !== "string" || (!parseHex(x) && !/^(rgb|hsl|oklch|oklab|color|var)\(/.test(x)))
        problems.push(`colors.${name}: "${String(x)}" isn't a color. Use a hex value like "#16a34a".`);
    });
  };
  Object.entries(t.colors ?? {}).forEach(([k, v]) => checkColor(k, v));
  const derived = ["primary", "secondary", "tertiary", "success", "warning", "danger", "info"];
  derived.forEach((k) => {
    const v = (t.colors as Record<string, ColorInput> | undefined)?.[k];
    const light = typeof v === "string" ? v : v?.light;
    const alreadyReported = problems.some((p) => p.startsWith(`colors.${k}:`));
    if (light && !parseHex(light) && !alreadyReported) problems.push(`colors.${k}: use a hex color (like "#16a34a") so hover and dark shades can be worked out.`);
  });
  if (typeof t.radius === "string" && !(t.radius in radiusPresets)) problems.push(`radius: use "none", "sm", "md" or "lg", or an object with exact values.`);
  if (typeof t.density === "string" && !(t.density in densityUnits)) problems.push(`density: use "compact", "comfortable" or "spacious", or a number like 0.9.`);
  if (typeof t.density === "number" && (t.density < 0.6 || t.density > 1.6)) problems.push(`density: ${t.density} is extreme. Use a number between 0.6 and 1.6.`);
  if (t.shadows && !["none", "subtle", "default", "strong"].includes(t.shadows)) problems.push(`shadows: use "none", "subtle", "default" or "strong".`);
  return problems;
}
