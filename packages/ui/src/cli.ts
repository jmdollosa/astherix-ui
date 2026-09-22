/*
 * jm-ui — command-line tools.
 *
 *   npx jm-ui theme ui.theme.json --out resources/css/ui-theme.css [--watch]
 *   npx jm-ui init                         (writes a starter ui.theme.json)
 */
import { readFileSync, writeFileSync, watch, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createThemeCss, validateTheme, type ThemeConfig } from "./theme/index";

const [, , command, ...rest] = process.argv;
const arg = (name: string) => {
  const i = rest.indexOf(name);
  return i >= 0 ? rest[i + 1] : undefined;
};

function build(input: string, output: string) {
  let config: ThemeConfig;
  try {
    config = JSON.parse(readFileSync(input, "utf8"));
  } catch (e) {
    console.error(`✗ Couldn't read ${input}: ${(e as Error).message}`);
    return false;
  }
  const problems = validateTheme(config);
  if (problems.length) {
    console.error(`✗ ${input} has ${problems.length} problem${problems.length === 1 ? "" : "s"}:`);
    problems.forEach((p) => console.error(`  • ${p}`));
    return false;
  }
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, createThemeCss(config, { includeFontImport: true }));
  console.log(`✓ Wrote ${output}`);
  return true;
}

const starter = {
  $schema: "./node_modules/@jm/ui/ui.theme.schema.json",
  colors: { primary: "#0d6efd", secondary: "#15803d", tertiary: "#ea580c" },
  fonts: { sans: '"Schibsted Grotesk", ui-sans-serif, system-ui, sans-serif' },
  radius: "md",
  density: "comfortable",
  shadows: "default",
};

if (command === "theme") {
  const input = resolve(rest.find((a) => !a.startsWith("--") && a !== arg("--out")) ?? "ui.theme.json");
  const output = resolve(arg("--out") ?? "ui-theme.css");
  const ok = build(input, output);
  if (rest.includes("--watch")) {
    console.log(`Watching ${input} for changes…`);
    let timer: ReturnType<typeof setTimeout> | undefined;
    watch(input, () => {
      clearTimeout(timer);
      timer = setTimeout(() => build(input, output), 80);
    });
  } else if (!ok) process.exit(1);
} else if (command === "init") {
  const file = resolve(rest[0] ?? "ui.theme.json");
  if (existsSync(file)) {
    console.error(`✗ ${file} already exists.`);
    process.exit(1);
  }
  writeFileSync(file, JSON.stringify(starter, null, 2) + "\n");
  console.log(`✓ Wrote ${file}. Next: npx jm-ui theme ${rest[0] ?? "ui.theme.json"} --out <your css folder>/ui-theme.css`);
} else {
  console.log(`jm-ui

  jm-ui init [file]                          Write a starter ui.theme.json
  jm-ui theme <file> --out <css> [--watch]   Turn ui.theme.json into CSS variables`);
}
