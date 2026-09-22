import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts", "src/editor.ts"],
    format: ["esm"],
    dts: true,
    clean: false, // cleaned by the build script (configs build in parallel)
    sourcemap: true,
    external: ["react", "react-dom", /^@tiptap\//],
    // Components are interactive, so mark the bundle as client code for Next.js App Router.
    // Inertia/Vite ignores this directive.
    banner: { js: '"use client";' },
  },
  {
    // "@jm/ui/theme": pure theme helpers, no "use client" — usable on the server and in build tools.
    entry: { theme: "src/theme-entry.ts" },
    format: ["esm"],
    dts: true,
    sourcemap: true,
  },
  {
    // The jm-ui command-line tool.
    entry: { cli: "src/cli.ts" },
    format: ["esm"],
    platform: "node",
    target: "node18",
    banner: { js: "#!/usr/bin/env node" },
  },
]);
