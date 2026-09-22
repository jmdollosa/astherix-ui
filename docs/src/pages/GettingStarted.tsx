import * as React from "react";
import { Code, PageHeader } from "../components/Doc";

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-border py-9 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-10">
      <h2 className="text-[1.0625rem] font-semibold tracking-[-0.01em]">{title}</h2>
      <div className="grid min-w-0 content-start gap-4 text-[0.9375rem] leading-relaxed [&_code]:font-mono [&_code]:text-[0.8125rem] [&>p]:max-w-[60ch]">
        {children}
      </div>
    </section>
  );
}

export function GettingStarted() {
  return (
    <>
      <PageHeader
        title="Getting started"
        intro="@jm/ui is a set of React components styled with Tailwind CSS. The same package works in Next.js and in Laravel apps that use React with Inertia."
      />

      <Step title="Install">
        <p>Until the package is published, install it from a local folder or add it to the same workspace as your app.</p>
        <Code code={`npm install ../ui-framework/packages/ui`} />
        <p>Your app needs React 18 or newer and Tailwind CSS 4.</p>
      </Step>

      <Step title="Add the theme">
        <p>
          Import the theme after Tailwind in your main stylesheet, and point Tailwind at the package so it generates the
          classes the components use. The <code>@source</code> path is relative to the stylesheet.
        </p>
        <Code
          code={`
/* Next.js: app/globals.css */
@import "tailwindcss";
@import "@jm/ui/theme.css";
@source "../node_modules/@jm/ui/dist";

/* Laravel: resources/css/app.css */
@import "tailwindcss";
@import "@jm/ui/theme.css";
@source "../../node_modules/@jm/ui/dist";`}
        />
      </Step>

      <Step title="Load the font">
        <p>The theme uses Schibsted Grotesk. Load it once per app.</p>
        <Code
          code={`
// Next.js: app/layout.tsx
import { Schibsted_Grotesk } from "next/font/google";
const font = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-schibsted" });

export default function RootLayout({ children }) {
  return <html lang="en" className={font.variable}><body>{children}</body></html>;
}

/* then in app/globals.css, after the theme import */
@theme { --font-sans: var(--font-schibsted), ui-sans-serif, system-ui, sans-serif; }`}
        />
        <Code
          code={`
<!-- Laravel: resources/views/app.blade.php, inside <head> -->
<link rel="preconnect" href="https://fonts.bunny.net">
<link href="https://fonts.bunny.net/css?family=schibsted-grotesk:400,500,600,700" rel="stylesheet">`}
        />
      </Step>

      <Step title="Dark mode">
        <p>
          Components switch to dark colors when <code>&lt;html&gt;</code> has the <code>dark</code> class. With
          next-themes, set <code>attribute="class"</code>. Laravel's React starter kit already toggles this class.
        </p>
        <Code code={`<ThemeProvider attribute="class" defaultTheme="system">{children}</ThemeProvider>`} />
      </Step>

      <Step title="Change the colors">
        <p>
          Components only use semantic variables, so you can re-brand an app by overriding them. No rebuild of the
          package is needed.
        </p>
        <Code
          code={`
:root {
  --ui-primary: #6d28d9;
  --ui-primary-hover: #5b21b6;
  --ui-primary-edge: #3b0764;
}
.dark {
  --ui-primary: #a78bfa;
}`}
        />
      </Step>

      <Step title="Icon fonts (optional)">
        <p>To pass icon-font classes like <code>"bi bi-download"</code> to components, load the font's CSS once.</p>
        <Code
          code={`
npm install bootstrap-icons

// Next.js app/layout.tsx, or Laravel resources/js/app.tsx
import "bootstrap-icons/font/bootstrap-icons.css";`}
        />
      </Step>
    </>
  );
}
