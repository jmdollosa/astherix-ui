# @jm/ui

Tailwind v4 + React components for Next.js and Laravel (React + Inertia) apps.

## Layout

```
packages/ui/
  theme.css              Tokens (colors, font, radius), light/dark themes
  src/lib/cn.ts          Class merging helper
  src/components/button/ Button
docs/                    User guide
  index.html             Built guide — open it in any browser, works offline
  src/main.tsx           Navigation and page list
  src/pages/             One page per component (Getting started, Button…)
  src/components/Doc.tsx Shared building blocks: Section, Code, PageHeader
```

## Develop

```
npm install
npm run build        # builds packages/ui/dist
npm run typecheck
npm run docs         # rebuilds docs/index.html
```

### Adding a component page to the guide

1. Create `docs/src/pages/InputPage.tsx` using `Section` blocks (demo + code example).
2. Add it to the `pages` list in `docs/src/main.tsx`.
3. Run `npm run docs`.

## Use in an app

Until the package is published, link it locally (`npm install ../ui-framework/packages/ui`)
or add it to the same workspace.

**1. Stylesheet** (`app/globals.css` in Next.js, `resources/css/app.css` in Laravel):

```css
@import "tailwindcss";
@import "@jm/ui/theme.css";
@source "../node_modules/@jm/ui/dist";   /* adjust the path relative to this file */
```

**2. Font — Schibsted Grotesk**

Next.js (`app/layout.tsx`):

```tsx
import { Schibsted_Grotesk } from "next/font/google";
const font = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-schibsted" });
// <html className={font.variable}>
```

Then in your stylesheet, after the theme import:

```css
@theme { --font-sans: var(--font-schibsted), ui-sans-serif, system-ui, sans-serif; }
```

Laravel (`resources/views/app.blade.php`, inside `<head>`):

```html
<link rel="preconnect" href="https://fonts.bunny.net">
<link href="https://fonts.bunny.net/css?family=schibsted-grotesk:400,500,600,700" rel="stylesheet">
```

**3. Dark mode** — add the `dark` class to `<html>` (next-themes with `attribute="class"`,
or the appearance handling in Laravel's starter kit).

## Button

```tsx
import { Button } from "@jm/ui";

<Button>Save changes</Button>
<Button variant="secondary" leadingIcon={<DownloadIcon />}>Export CSV</Button>
<Button variant="danger" loading={isDeleting}>Delete project</Button>
<Button variant="ghost" iconOnly aria-label="More options"><MoreIcon /></Button>

// Links keep button styles with asChild
<Button asChild><Link href="/billing">Open billing</Link></Button>
```

| Prop           | Values                                          | Default     |
| -------------- | ----------------------------------------------- | ----------- |
| `variant`      | `primary` `secondary` `ghost` `danger`          | `primary`   |
| `size`         | `sm` `md` `lg`                                  | `md`        |
| `rounded`      | `none` `sm` `md` `lg` `full`                    | `md`        |
| `raised`       | boolean — darker bottom edge + press effect     | `true`      |
| `shadow`       | `none` `sm` `md` `lg` `xl`                      | `none`      |
| `iconOnly`     | boolean (needs `aria-label`)                    | `false`     |
| `fullWidth`    | boolean                                         | `false`     |
| `loading`      | boolean — show the spinner on demand            | `false`     |
| `spinnerPlacement` | `center` `start` `end`                      | `center`    |
| `loadingIndicator` | `spinner` `orbit` (experimental running light) | `spinner` |
| `loadingLabel` | label while loading, e.g. "Saving…" (start/end) |             |
| `minLoadingTime` | ms the spinner stays visible at minimum       | `0`         |
| `onClick`      | may return a Promise → spinner until it settles |             |
| `leadingIcon`  | element or icon-font class string               |             |
| `trailingIcon` | element or icon-font class string               |             |
| `icon`         | icon for `iconOnly` buttons (same options)      |             |
| `asChild`      | boolean — render the child (e.g. a Link)        | `false`     |

### Corners

```tsx
<Button rounded="sm">Slightly rounded</Button>
<Button rounded="full">Pill</Button>
<Button iconOnly rounded="full" icon="bi bi-plus-lg" aria-label="Add" />  // circle
```

Change the default for a whole app with `--radius-control` (and `--radius-control-sm`,
`--radius-control-lg`) in your stylesheet.

### Raised edge and shadows

```tsx
<Button raised={false}>Flat</Button>
<Button shadow="lg">Raised with a large shadow</Button>
<Button raised={false} shadow="xl" iconOnly rounded="full" icon="bi bi-plus-lg" aria-label="Create" />
```

Shadow weights are theme tokens (`--ui-shadow-sm` … `--ui-shadow-xl`, and
`--ui-shadow-color` for the tint), with separate values for dark mode.

### Loading (Ladda-style)

Return a Promise from `onClick` and the spinner shows until the response arrives,
whether the request succeeds or fails:

```tsx
<Button onClick={() => fetch("/api/report", { method: "POST" })}>Generate report</Button>
<Button spinnerPlacement="start" loadingLabel="Saving…" onClick={() => axios.put("/profile", data)}>
  Save profile
</Button>
```

Or control it yourself with `loading`:

```tsx
<Button type="submit" loading={form.processing}>Save</Button>          // Inertia useForm
<Button loading={isPending} onClick={() => startTransition(save)}>Save</Button> // Next.js
```

While loading, the button stays focusable, is marked `aria-busy`, and ignores
further clicks (so forms can't be submitted twice).

### Running light (experimental)

```tsx
<Button loadingIndicator="orbit" loadingLabel="Saving…" onClick={save}>Save profile</Button>
```

A light runs around the button's edge while loading; the label stays visible. Tune it with
`--ui-orbit-color`, `--ui-orbit-width` and `--ui-orbit-speed`. It needs CSS `@property`
(current Chrome, Edge, Safari and Firefox); older browsers show a still light.

### Icon fonts (Bootstrap Icons, Font Awesome, Glyphicons)

Pass the icon's class string and the Button renders `<i class="…" aria-hidden="true">`,
sized to match the label:

```tsx
<Button leadingIcon="bi bi-cloud-arrow-up">Upload files</Button>
<Button variant="secondary" trailingIcon="bi bi-chevron-down">Sort by date</Button>
<Button iconOnly icon="bi bi-gear" aria-label="Settings" />
<Button leadingIcon="glyphicon glyphicon-print">Print</Button>
```

Load the icon font's CSS once in each app, e.g. `npm install bootstrap-icons`, then
`import "bootstrap-icons/font/bootstrap-icons.css"` in Next.js `app/layout.tsx`
or Laravel `resources/js/app.tsx`.

`type` defaults to `"button"`; set `type="submit"` on form submit buttons.

## Theming

Components only use semantic variables (`--ui-primary`, `--ui-border`, …). Override them in
your app to re-brand without rebuilding:

```css
:root { --ui-primary: #6d28d9; --ui-primary-hover: #5b21b6; --ui-primary-edge: #3b0764; }
```
