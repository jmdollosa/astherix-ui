# @jm/ui

Tailwind v4 + React components for Next.js and Laravel (React + Inertia) apps.

## Layout

```
packages/ui/
  theme.css              Tokens (colors, font, radius), light/dark themes
  src/lib/cn.ts          Class merging helper
  src/components/activity/ ActivityIndicator, ProgressBar, ProgressRing, Skeleton, ActivitySteps, LoadingOverlay
  src/components/button/ Button
  src/components/editor/ Editor (entry: @jm/ui/editor)
  src/components/input/  Field, Input, Textarea
  src/components/modal/  Modal
  src/components/pill/   Pill, PillGroup, PillOption
  src/components/select/ Select
  src/components/tabs/   Tabs
docs/                    User guide
  index.html             Built guide — open it in any browser, works offline
  src/main.tsx           Navigation and page list
  src/pages/             One page per component (Getting started, Button, Modal…)
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

## Activity indicators

```tsx
<ActivityIndicator variant="spinner" | "dots" | "bars" | "pulse" | "orbit" label="Loading invoices" showLabel />
<ProgressBar label="Uploading" value={pct} showValue striped />
<ProgressRing value={72} size="xl" label="Storage used" />
<Skeleton shape="text" lines={3} />
<ActivitySteps steps={[{ label: "Build", status: "done" }, { label: "Deploy", status: "active" }]} />
<LoadingOverlay loading={refreshing} label="Refreshing">…</LoadingOverlay>
```

`ActivityIndicator`: `variant`, `size` (`xs`–`xl`), `tone` (`primary` `neutral` `current` `success`
`warning` `danger` `info`), `label`, `showLabel`, `labelPosition`. `ProgressBar`: `value` (omit for
indeterminate), `max`, `label`, `showValue`, `valueText`, `size`, `tone`, `striped`.
`ProgressRing`: `value`, `max`, `size` (`sm`–`xl`), `tone`, `label`, `valueText`, center `children`.
`Skeleton`: `shape` (`rect` `circle` `text`), `lines`. `ActivitySteps`: `steps` (`label`,
`description`, `status`: `done` `active` `pending` `error` `skipped`, `meta`), `orientation`,
`size`. `LoadingOverlay`: `loading`, `label`, `variant`, `delay`.

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
| `loadingIndicator` | `spinner` `orbit` `progress` (both experimental) | `spinner` |
| `progressStyle` | `fill` `bar` (with `progress` indicator)        | `fill`      |
| `progress`     | 0–100 real progress; omit for automatic         |             |
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

### Progress (experimental)

```tsx
<Button loadingIndicator="progress" onClick={generate}>Generate report</Button>
<Button loadingIndicator="progress" progressStyle="bar" loading={uploading} progress={pct}>
  Upload
</Button>
```

`fill` sweeps a translucent fill across the button; `bar` runs a thin bar along the bottom.
Without `progress` it creeps toward ~92% and completes when loading ends. Tune with
`--ui-progress-fill`, `--ui-progress-bar`, `--ui-progress-height`, `--ui-progress-duration`.

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

## Field, Input and Textarea

```tsx
import { Field, Input, Textarea } from "@jm/ui";

<Field label="Email" description="We'll send receipts here." error={form.errors.email} required>
  <Input type="email" leadingIcon="bi bi-envelope" />
</Field>

<Field label="Message">
  <Textarea autoResize minRows={3} maxRows={8} showCount maxLength={500} />
</Field>
```

**Field** — `label`, `description`, `error` (marks the control invalid), `required`, `optional`,
`disabled`, `id`. Wires the label, `aria-describedby` and `aria-invalid` for you. Custom
controls can read it with `useField()`.

**Input** — `size` (`sm` `md` `lg`, same heights as Button), `rounded` (`none` … `full`),
`leadingIcon` / `trailingIcon` (element or icon-font class), `prefix` / `suffix` text,
`invalid`, `clearable` + `onClear`, `revealable` (password show/hide, default on),
`frameClassName`. All native input props work; `ref` goes to the `<input>`.

**Textarea** — `size`, `rounded` (`none` … `lg`), `invalid`, `autoResize` with `minRows` /
`maxRows`, `showCount` (with `maxLength` shows "12 / 280"), `resize` (`vertical` `none`),
`frameClassName`.

## Pills

```tsx
<Pill tone="success" dot>Paid</Pill>
<Pill tone="danger" appearance="solid">Overdue</Pill>
<Pill size="lg" onRemove={() => removeTag(tag)}>{tag}</Pill>
<Pill asChild tone="primary"><Link href="/topics/laravel">Laravel</Link></Pill>

<PillGroup value={category} onValueChange={setCategory} aria-label="Category">
  <PillOption value="all" count={5}>All</PillOption>
  <PillOption value="design">Design</PillOption>
</PillGroup>
<PillGroup type="multiple" value={tags} onValueChange={setTags}>…</PillGroup>
```

`Pill`: `tone` (`neutral` `primary` `success` `warning` `danger` `info`), `appearance`
(`soft` `solid` `outline`), `size` (`sm` `md` `lg`), `icon`, `dot` (`true` or `"pulse"`),
`count`, `onRemove`, `removeLabel`, `asChild`. `PillGroup`: `type` (`single` `multiple`),
`value` / `defaultValue` / `onValueChange`, `allowDeselect`, `size`, `tone`, `showCheck`,
`disabled`. `PillOption`: `value`, `icon`, `count`, `disabled`.
Status colors are theme tokens: `--ui-success`, `--ui-warning`, `--ui-info` (+ `-fg`).

## Select

A searchable dropdown in the spirit of Select2.

```tsx
<Field label="Country">
  <Select options={countries} value={country} onChange={setCountry} />
</Field>

<Select multiple options={skills} value={skills} onChange={setSkills} maxSelected={5} clearable />
<Select loadOptions={(q) => api.searchRepos(q)} minSearchLength={2} />
<Select multiple creatable options={labels} onCreateOption={(text) => api.createLabel(text)} />
```

Options: `{ value, label, description?, icon?, group?, disabled?, keywords? }`.

Props: `options`, `value` / `defaultValue` / `onChange` (string | null, or string[] with
`multiple`), `multiple`, `maxSelected`, `searchable` (default true), `searchPlaceholder`,
`clearable`, `placeholder`, `loadOptions` + `minSearchLength` + `searchDelay`, `creatable` +
`onCreateOption`, `renderOption`, `noOptionsMessage`, `closeOnSelect`, `onOpenChange`,
`name` (hidden inputs for form posts), `size`, `rounded`, `invalid`, `disabled`, `required`.

Keyboard: Enter/Space/↓ open, type to search, ↑ ↓ Home End move, Enter picks, Backspace removes
the last chip, Escape closes (before a surrounding Modal), Tab closes and moves on.

## Editor (rich text)

A basic WYSIWYG editor built on [Tiptap](https://tiptap.dev). It has its own entry point so
apps that don't use it don't load it:

```tsx
import { Editor } from "@jm/ui/editor";

<Field label="Release notes">
  <Editor value={html} onChange={setHtml} />
</Field>

<Editor toolbar={["bold", "italic", "link", "|", "bulletList"]} maxLength={280} />
<Editor name="body" />            {/* posts the HTML with the form */}
<Editor readOnly value={post.body} />
```

Props: `value` / `defaultValue` / `onChange` (HTML; empty editor gives `""`), `placeholder`,
`toolbar` (tools: `paragraph heading2 heading3 bold italic underline strike code link
bulletList orderedList blockquote horizontalRule undo redo`, `"|"` for a divider),
`maxLength`, `showCount`, `minHeight`, `maxHeight`, `rounded`, `invalid`, `disabled`,
`readOnly`, `name`, `autoFocus`, `onReady(editor)` for the Tiptap instance.

Show saved HTML with the same styles: `<div className="ui-prose" dangerouslySetInnerHTML={…} />`.
Always sanitize HTML on the server (e.g. `stevebauman/purify` in Laravel).

## Modal

```tsx
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle,
  ModalDescription, ModalBody, ModalFooter, ModalClose, useModal } from "@jm/ui";

// Open with a button
<Modal>
  <ModalTrigger asChild><Button>Rename project</Button></ModalTrigger>
  <ModalContent size="sm">
    <ModalHeader>
      <ModalTitle>Rename project</ModalTitle>
      <ModalDescription>The new name shows up for everyone.</ModalDescription>
    </ModalHeader>
    <ModalBody>…</ModalBody>
    <ModalFooter>
      <ModalClose asChild><Button variant="ghost">Cancel</Button></ModalClose>
      <Button onClick={save}>Save name</Button>
    </ModalFooter>
  </ModalContent>
</Modal>

// Open from code
const session = useModal();          // { isOpen, open, close, toggle, modalProps }
<Modal {...session.modalProps}>…</Modal>
session.open();
```

| Component / prop                 | Values                                   | Default |
| -------------------------------- | ---------------------------------------- | ------- |
| `Modal` `open` / `onOpenChange`  | controlled state                         |         |
| `Modal` `defaultOpen`            | boolean                                  | `false` |
| `ModalContent` `size`            | `sm` `md` `lg` `xl` `full`               | `md`    |
| `ModalContent` `backdrop`        | `default` `dark` `blur` `solid`          | `default` |
| `ModalContent` `dismissible`     | Escape, backdrop and × close it          | `true`  |
| `ModalContent` `showCloseButton` | boolean                                  | `true`  |
| `ModalContent` `closeLabel`      | label for ×                              | `"Close"` |

Built on the native `<dialog>`: focus moves in on open (honours `autoFocus`) and returns
to the opener on close, Tab stays inside, the page behind is inert and doesn't scroll.
Theme tokens: `--radius-modal`, `--ui-shadow-modal`, `--ui-backdrop`, `--ui-backdrop-dark`,
`--ui-backdrop-blur`, `--ui-backdrop-blur-radius`, `--ui-backdrop-solid`.

## Tabs

```tsx
<Tabs defaultValue="overview" orientation="horizontal" variant="line">
  <TabList aria-label="Project">
    <Tab value="overview">Overview</Tab>
    <Tab value="billing" disabled>Billing</Tab>
  </TabList>
  <TabPanel value="overview">…</TabPanel>
</Tabs>

// Editable: drag or Alt+arrows to move, double-click/F2 to rename, + to add, ×/Delete to close
<TabList onReorder={(ids) => …} onRename={(id, name) => …} onAdd={() => newId} onClose={(id) => …} renameOnAdd>
```

`Tabs`: `value` / `defaultValue` / `onValueChange`, `orientation` (`horizontal` `vertical`),
`variant` (`line` `enclosed` `pills`), `size` (`sm` `md`), `activation` (`automatic` `manual`).
`TabList`: `onReorder`, `onRename`, `onAdd` (return the new value to select it), `addLabel`,
`renameOnAdd`, `onClose`, `closeLabel`. `Tab`: `value`, `label`, `disabled`, `icon`, `badge`,
`renamable`, `closable`. `TabPanel`: `value`, `keepMounted`.

## Theming

Components only use semantic variables (`--ui-primary`, `--ui-border`, …). Override them in
your app to re-brand without rebuilding:

```css
:root { --ui-primary: #6d28d9; --ui-primary-hover: #5b21b6; --ui-primary-edge: #3b0764; }
```
