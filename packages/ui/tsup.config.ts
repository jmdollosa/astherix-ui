import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/editor.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ["react", "react-dom", /^@tiptap\//],
  // Components are interactive, so mark the bundle as client code for Next.js App Router.
  // Inertia/Vite ignores this directive.
  banner: { js: '"use client";' },
});
