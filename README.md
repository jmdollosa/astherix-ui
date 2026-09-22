# @jm/ui

Tailwind v4 + React components for Next.js and Laravel (React + Inertia) apps.

## Layout

```
packages/ui/
  theme.css              Tokens (colors, font, radius), light/dark themes
  src/lib/cn.ts          Class merging helper
  src/components/activity/ ActivityIndicator, ProgressBar, ProgressRing, Skeleton, ActivitySteps, LoadingOverlay
  src/components/avatar/ Avatar, AvatarGroup, AvatarLabel, AvatarUpload
  src/components/button/ Button
  src/components/card/   Card, ChoiceCard
  src/components/editor/ Editor (entry: @jm/ui/editor)
  src/components/input/  Field, Input, Textarea
  src/components/menu/   DropdownMenu, SplitButton
  src/components/modal/  Modal
  src/components/pill/   Pill, PillGroup, PillOption
  src/components/choice/ Checkbox, CheckboxGroup, RadioGroup, Radio, Switch
  src/components/select/ Select
  src/components/sidebar/ SidebarProvider, Sidebar, SidebarNav, SidebarTrigger …
  src/components/table/  DataTable
  src/components/tabs/   Tabs
  src/components/timeline/ Timeline, Roadmap
  src/components/upload/ FileDropzone, FileInput, FileUploadButton, useFileUploads, xhrUpload
  src/components/toast/  Toaster, toast
  src/components/typography/ Heading, Text, Lead, Link, Code, Kbd, Mark, Blockquote, List, Prose, Stat
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

## Accordion

```tsx
<Accordion type="single" collapsible defaultValue="refunds" variant="outline" linkToHash>
  <AccordionItem value="refunds" title="How do refunds work?">…</AccordionItem>
</Accordion>

<AccordionItem value="shipping" title="Delivery" status="complete" summary="Express · ₱350">…</AccordionItem>
<AccordionItem value="reminders" title="Reminders" action={<Switch … />}>…</AccordionItem>
```

`Accordion`: `type` (`single` `multiple`), `value` / `defaultValue` / `onValueChange`, `collapsible`,
`variant` (`separated` `outline` `flush`), `size`, `headingLevel`, `linkToHash`. `AccordionItem`:
`value`, `title`, `description`, `summary` (while closed), `icon`, `meta`, `action` (header
controls), `status` (`complete` `current` `error` `locked`), `disabled`, `keepMounted`.
`AccordionToggleAll`, `useAccordion()` → `{ open, toggle, expandAll, collapseAll }`. Closed
sections use `hidden="until-found"`, so Ctrl/⌘+F finds and opens them (Chrome/Edge).

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

## Avatar

```tsx
<Avatar src={user.avatarUrl} name="Maria Santos" status="online" />
<Avatar name="Dan Torres" />                              {/* initials, color from the name */}
<Avatar shape="square" icon="bi bi-building" name="Northwind" />
<AvatarGroup max={5} onOverflowClick={openMembers}>{…}</AvatarGroup>
<AvatarLabel src={…} name="Maria Santos" description="Product designer" end={<Pill>Admin</Pill>} />
<AvatarUpload name={user.name} value={user.avatarUrl} onChange={setFile} inputName="avatar" />
```

`Avatar`: `src`, `name`, `size` (`xs` `sm` `md` `lg` `xl` `2xl`), `shape` (`circle` `square`),
`status` (`online` `away` `busy` `offline`), `icon`, `badge`, `ring`, `decorative`, `fallback`.
`AvatarGroup`: `size`, `shape`, `max`, `spacing`, `onOverflowClick`. `AvatarLabel`: Avatar props
+ `description`, `end`. `AvatarUpload`: `value`, `onChange`, `name`, `size`, `shape`,
`maxSizeMB`, `accept`, `inputName`, `disabled`. `getInitials(name)` is exported too.

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

## Carousel

```tsx
<Carousel aria-label="Photos" indicators="thumbnails">
  <CarouselSlide label="Sagada" thumbnail={<img … />}><img … /></CarouselSlide>
</Carousel>

<Carousel aria-label="Plans" effect="coverflow" slidesPerView={{ base: 1.3, md: 2.4 }} defaultIndex={1} />
<Carousel aria-label="Highlights" indicators="stories" autoplay={4000} loop />
```

Native scroll snapping (real swipe momentum, trackpads, no scroll-jacking) plus mouse dragging
and keyboard. `Carousel`: `slidesPerView` (number or `{ base, sm, md, lg }` by container width;
fractions peek), `gap`, `peek`, `align` (`start` `center`), `effect` (`coverflow`), `loop`,
`autoplay` (ms; pauses on hover/touch/focus, hidden tab or off-screen; off with reduced motion;
pause button), `indicators` (`dots` `counter` `stories` `thumbnails` `none`), `controls`
(`overlay` `below` `none`), `defaultIndex`, `onSlideChange`; ref → `{ next, prev, goTo, index }`.
`CarouselSlide`: `label`, `thumbnail`.

## Checkbox, radio & switch

```tsx
<Checkbox label="Attach PDF" description="Adds the invoice as an attachment." />
<Checkbox label="All clients" checked={all} indeterminate={some && !all} onCheckedChange={toggleAll} />
<CheckboxGroup name="methods[]" options={[{ value: "card", label: "Card" }, …]} defaultValue={["card"]} />
<RadioGroup label="Send" defaultValue="now"><Radio value="now" label="Now" /><Radio value="draft" label="Save as draft" /></RadioGroup>
<Switch label="Weekly summary" onCheckedChange={(on) => api.save(on)} />   {/* spinner; flips back on failure */}
```

Real inputs underneath (keyboard, screen readers and form posts work natively). `Checkbox`:
`label`, `description`, `indeterminate`, `onCheckedChange`, `invalid`, `size` (`sm` `md`) + input
props. `CheckboxGroup`: `label`, `options`, `value` / `defaultValue` / `onValueChange`, `name`,
`orientation`. `RadioGroup`: `label`, `value` / `defaultValue` / `onValueChange`, `name`,
`orientation`, `size`, `disabled`, `invalid`, `required`; `Radio`: `value`, `label`, `description`.
`Switch`: `color` (`primary` `secondary` `tertiary` `success` `warning` `danger` `info` or any CSS
color; tokens `--ui-tone-secondary` / `--ui-tone-tertiary` + `-fg`), `colorForeground`, `variant` (`labelled` — the word in the pill, `mark` — × / ✓ on the knob, `liquid` —
blue floods from the knob), `label`, `description`, `onCheckedChange` (may return a Promise:
spinner, flips back on failure), `size`, `labelPosition`, `onLabel`, `offLabel`.

## Toast

```tsx
<Toaster position="bottom-right" />          {/* once, near the root */}

toast("Draft saved");
toast.success("Invoice sent", { description: "…" });
toast.promise(api.send(id), { loading: "Sending…", success: "Sent", error: (e) => e.message });
toast("Invoice deleted", { action: { label: "Undo", onClick: restore } });
```

`toast(title, options)` and `toast.success / error / warning / info / loading / promise / dismiss`.
Options: `id` (update in place), `description`, `action`, `duration`, `icon`, `dismissible`,
`onDismiss`. `Toaster`: `position`, `expand`, `visibleToasts`, `richColors`, `showTimer`, `hotkey`.
Stacks and spreads on hover, pauses while hovered/focused/hidden, swipe or Escape to dismiss.

## File upload

```tsx
<FileDropzone upload={xhrUpload("/api/receipts")} accept="image/*,.pdf" maxSize={10 * 1024 * 1024} maxFiles={6} />
<FileUploadButton upload={xhrUpload("/api/contracts")} accept=".pdf">Upload contract</FileUploadButton>
<FileInput name="resume" accept=".pdf" maxSize={5 * 1024 * 1024} />   {/* posts with the form */}
```

`FileDropzone`: `upload`, `accept`, `maxSize`, `maxFiles`, `multiple`, `concurrency`, `onChange`,
`onUploaded`, `title`, `hint`, `name`, `disabled`, `pasteable`, `size`. `FileUploadButton`: Button
props + `upload`, `accept`, `maxSize`, `onUploaded`, `onRemove`, `completeLabel`. `FileInput`:
native file-input props + `onFilesChange`, `buttonLabel`, `placeholder`, `size`, `rounded`,
`invalid`, `maxSize`, `clearable`. `xhrUpload(url, { fieldName, method, headers, data,
withCredentials, xsrfCookie })` gives real progress and reads Laravel's XSRF cookie and
validation errors. `useFileUploads(…)` and `FileList` for custom layouts.

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

## Pagination

```tsx
<Pagination page={page} pageCount={12} onPageChange={setPage} />
<Pagination page={p.current_page} pageCount={p.last_page} total={p.total} pageSize={p.per_page}
  getHref={(n) => `${p.path}?page=${n}`} linkComponent={Link} showSummary />
<LoadMore loaded={items.length} total={total} onLoadMore={fetchNext} auto />
```

`Pagination`: `page`, `pageCount` or `total` + `pageSize`, `onPageChange`, `getHref` +
`linkComponent` (real links), `siblingCount`, `boundaryCount`, `showFirstLast`, `variant`
(`numbers` `simple`), `responsive` (fits its own width), `showSummary`, `pageSizeOptions` +
`onPageSizeChange`, `showJump`, `size`, `labels`. Gaps jump five pages; the highlight slides.
`LoadMore`: `loaded`, `total`, `onLoadMore` (Promise → progress), `hasMore`, `auto` (infinite
scroll), `label`. `getPageItems(page, count, siblings, boundaries)` is exported too.

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

## Autocomplete

A text field that suggests as you type — the value is free text (use Select when it must be from a list).

```tsx
<Autocomplete value={city} onChange={setCity} suggestions={cities} />
<Autocomplete loadSuggestions={(q, { signal }) => api.searchClients(q, signal)} minLength={2} />
<Autocomplete type="search" recentKey="recent-searches" onSubmit={runSearch} suggestions={items} />
```

Props (plus Input's: `size`, `rounded`, icons, `clearable`, …): `value` / `defaultValue` / `onChange`
(string), `suggestions` (array of strings or `{ value, label, description, icon, group }`, or a
function of the query), `loadSuggestions`, `minLength`, `debounce`, `maxSuggestions`,
`inlineComplete` (faint completion; Tab/→ accepts), `onSelectSuggestion`, `onSubmit`, `recentKey`,
`maxRecent`, `emptyMessage`, `filter`.

## Slider

```tsx
<Slider value={fee} onChange={setFee} max={25} formatValue={(v) => `${v}%`} />
<Slider value={[5000, 60000]} onChange={setRange} max={100000} step={1000} minDistance={5000} />
<Slider min={1} max={10} marks color="secondary" onValueCommit={save} />
```

Press the thumb and it becomes a frosted glass lens with a glass value bubble above the finger;
drag past an end and it stretches, then springs back; crossing marks gives a haptic tick on
supporting phones. Props: `value` / `defaultValue` (number, or `[low, high]` for a range),
`onChange`, `onValueCommit` (on release), `min`, `max`, `step`, `marks` (`true`, values, or
`{ value, label }`), `formatValue`, `showValue` (`active` `always` `never`), `color` (Switch
palette or any CSS color), `size` (`sm` `md` `lg`), `disabled`, `minDistance`, `haptics`, `name`,
`thumbLabels`.

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

## Card

```tsx
<Card variant="outline" | "elevated" | "filled" | "ghost" padding="md">
  <CardMedia src={cover} ratio="16/9" />
  <CardHeader title="Website refresh" description="Due 30 September" action={<Button …/>} />
  <CardContent>…</CardContent>
  <CardFooter divided justify="between">…</CardFooter>
</Card>

// Whole card clickable; other buttons inside still work
<Card interactive><CardHeader><CardTitle><CardLink href="/posts/1">Title</CardLink></CardTitle></CardHeader></Card>

// Choices with real radios / checkboxes
<ChoiceCardGroup value={plan} onValueChange={setPlan} name="plan">
  <ChoiceCard value="team" title="Team" description="…" meta="₱990 / month" />
</ChoiceCardGroup>
```

`Card`: `variant`, `tone` (`default` `primary` `danger`), `orientation` (`vertical` `horizontal`,
wrap text in `CardBody`), `interactive`, `padding` (`none` `sm` `md` `lg`), `asChild`.
`CardHeader`: `title`, `description`, `action`, `icon`, `titleLevel`. `CardFooter`: `divided`,
`justify`. `CardMedia`: `src`, `alt`, `ratio`, `inset`. `ChoiceCardGroup`: `type`, `value` /
`defaultValue` / `onValueChange`, `name`, `columns`, `disabled`, `invalid`, `required`.
`ChoiceCard`: `value`, `title`, `description`, `icon`, `meta`, `badge`, `disabled`.
Token: `--radius-card`.

## Dashboard widgets

Dependency-free SVG widgets for KPI dashboards — one look, one palette (`--ui-chart-1…6`),
responsive, keyboard- and screen-reader-friendly.

```tsx
<DashboardGrid columns={4}>
  <KpiCard label="Revenue" value="₱318,400" change={8.2} sparkline={monthly} />
  <WidgetCard data-span="3" title="Revenue" action={<PeriodPicker />} loading={isLoading}>
    <AreaChart data={rows} index="month" series={[{ key: "invoiced" }, { key: "collected" }]}
      referenceLine={{ value: 280000, label: "Target" }} aria-label="Revenue by month" />
  </WidgetCard>
</DashboardGrid>
```

- `KpiCard`: `label`, `value`, `change`, `changeLabel`, `invertTrend`, `icon`, `sparkline`,
  `sparklineType`, `progress`, `href`, `loading`
- `LineChart` / `AreaChart` / `BarChart`: `data`, `index`, `series` (`key`, `label`, `color`),
  `height`, `formatValue`, `formatIndex`, `showLegend`, `showGrid`, `referenceLine`; line: `curve`,
  `dots`; bar: `stacked`. Crosshair tooltip, legend toggles, ← → to read points
- `DonutChart` (`data`, `size`, `thickness`, `centerLabel`, `legend`), `Gauge` (`value`, `max`,
  `target`, `bands`), `BarList` (`items`, `limit`), `CalendarHeatmap` (`data`, `weeks`),
  `Sparkline` (`data`, `type`)
- `WidgetCard`: `title`, `description`, `action`, `value`, `loading`, `empty`, `error`,
  `onRetry`, `footer`, `live`; `DashboardGrid`: `columns`, `animate`, children use
  `data-span="2|3|4|full"`; `LiveIndicator`: `updatedAt`, `paused`, `reconnecting`

**Animate on first load (optional):** `<DashboardGrid animate>` — widgets rise in one after another,
KPI numbers count up (pass `value` as a number with `formatValue`), charts draw in, donuts and
gauges sweep. Per-widget `animate` overrides it. Skipped with reduced motion.

**Live data:** just pass new data. Numbers roll and glow (green good / red bad), lines and bars
morph, donut and gauge sweep, BarList rows slide into their new order (`transition={false}` on a
chart turns it off). Works with polling, Laravel Echo (Reverb/Pusher) or Server-Sent Events.

## Dropdown menu

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild><Button trailingIcon="bi bi-chevron-down">Actions</Button></DropdownMenuTrigger>
  <DropdownMenuContent align="start">
    <DropdownMenuItem icon="bi bi-pencil" shortcut="⌘E" onSelect={edit}>Edit</DropdownMenuItem>
    <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem destructive onSelect={remove}>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

<SplitButton onClick={save} menu={<DropdownMenuItem onSelect={saveDraft}>Save as draft</DropdownMenuItem>}>Save</SplitButton>
```

`DropdownMenu`: `open` / `defaultOpen` / `onOpenChange`. `DropdownMenuContent`: `align`
(`start` `end`), `side` (`bottom` `top`, flips automatically), `matchTriggerWidth`.
`DropdownMenuItem`: `onSelect` (call `event.preventDefault()` to keep the menu open), `icon`,
`shortcut`, `description`, `destructive`, `disabled`, `inset`, `textValue`, `asChild`. Also
`DropdownMenuCheckboxItem` (`checked`, `onCheckedChange`), `DropdownMenuRadioGroup` +
`DropdownMenuRadioItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuGroup`.
`SplitButton`: Button props + `menu`, `menuLabel`, `align`.

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

## IconButton

The icon itself is the button. Press: the icon squishes and a ripple spreads; toggles swap to a
filled icon, pop and burst.

```tsx
<IconButton icon="bi bi-heart" pressedIcon="bi bi-heart-fill" tone="danger" label="Like"
  pressed={liked} onPressedChange={setLiked} />
<IconButton icon="bi bi-bell" label="Notifications" badge={3} />
<IconButton icon="bi bi-download" label="Download INV-1047" onClick={download} />   {/* Promise → spinner */}
```

Props: `icon`, `label` (required; spoken and tooltip), `variant` (`plain` `soft` `solid`), `tone`
(Switch palette or any CSS color), `size` (`xs`–`xl`; small ones get a 44px tap area on touch),
`shape` (`circle` `square`), `pressed` / `defaultPressed` / `onPressedChange`, `pressedIcon`,
`burst`, `badge` (number or dot), `loading`, `href`, `tooltip`, `disabled`.

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

## Table (DataTable)

```tsx
const columns: DataTableColumn<Invoice>[] = [
  { key: "no", header: "Invoice", sortable: true, primary: true },
  { key: "client", header: "Client", sortable: true, cell: (r) => r.client },
  { key: "issued", header: "Issued", hideOnMobile: true },
  { key: "amount", header: "Amount", sortable: true, align: "end", cell: (r) => peso(r.amount) },
];

<DataTable caption="Invoices" data={rows} columns={columns} rowKey="id"
  searchable selectable bulkActions={(rows, clear) => …} rowActions={(row) => <RowMenu row={row} />} />

// Server-side (e.g. a Laravel paginator)
<DataTable manual data={page.data} total={page.total} loading={loading} onQueryChange={fetchPage} … />
```

Columns: `key`, `header`, `accessor`, `cell`, `sortable`, `sortFn`, `align`, `width`, `primary`
(card title on mobile), `hideOnMobile`, `searchable`, `className`.
Table: `caption` (required, accessible name), `showCaption`, `searchable`, `searchPlaceholder`,
`pageSize` (0 = all), `pageSizeOptions`, `defaultSort`, `selectable`, `selected` /
`onSelectedChange`, `bulkActions`, `rowActions`, `onRowClick`, `toolbar`, `loading`,
`refreshIndicator` (`border` `bar` `shimmer` `none`), `onRefresh` (adds a refresh button; runs
until its Promise settles), `status` (`true` for automatic messages, your own text, or
`(state) => message`), `statusTone`, `error` (shown in the status line with Retry),
`lastUpdated`, `loadingOverlay` (`true` or a message), `overlayPosition` (`top` `center`),
`overlayIndicator`, `onCancelLoading`, `emptyState`, `density` (`comfortable` `compact`), `striped`, `mobile` (`cards` `scroll`),
`maxHeight`, `manual`, `total`, `onQueryChange`.
Narrow containers (under 40rem) switch to cards via a container query, so it adapts inside
sidebars and cards as well as on phones.

## Sidebar

```tsx
<SidebarProvider side="left" linkComponent={Link} persistKey="sidebar">
  <Sidebar>
    <SidebarHeader><Logo /></SidebarHeader>
    <SidebarContent>
      <SidebarGroup label="Workspace">
        <SidebarNav items={nav} activeHref={pathname} />
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter><AccountMenu /></SidebarFooter>
  </Sidebar>
  <SidebarInset>
    <header><SidebarTrigger /></header>
    …
  </SidebarInset>
</SidebarProvider>
```

Nav items: `{ label, href?, icon?, badge?, children?, defaultOpen?, disabled?, onSelect?, external?, id? }`
— `children` nest to any depth. Wide: full sidebar ↔ icon rail (submenus open as a flyout);
narrow: off-canvas drawer. Chosen by the layout's own width.
`SidebarProvider`: `side`, `defaultCollapsed`, `collapsed` / `onCollapsedChange`, `drawerBelow` (768),
`railBelow` (1024), `persistKey`, `shortcut` ("b" → Ctrl/⌘+B), `linkComponent`, `onNavigate`, `contained`.
`Sidebar`: `width`, `railWidth`. `SidebarNav`: `items`, `activeHref`, `matchNested`. `SidebarGroup`:
`label`, `action`. `useSidebar()` → `{ mode, collapsed, drawerOpen, toggle, setCollapsed, setDrawerOpen, side }`.

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

## Timeline

```tsx
<Timeline aria-label="Invoice activity" variant="feed" | "progress" layout="left" | "alternate">
  <TimelineGroup date={new Date()}>                               {/* "Today" */}
    <TimelineItem icon="bi bi-check-lg" tone="success" title="Payment received" time={at} />
    <TimelineItem avatar={<Avatar … />} title="Maria commented" time={at} card>…</TimelineItem>
    <TimelineCollapse>{quietItems}</TimelineCollapse>
  </TimelineGroup>
</Timeline>

<Roadmap aria-label="Roadmap" items={[{ label: "Q3 2026", title: "Mobile app", status: "current" }]} />
```

`Timeline`: `layout`, `variant`, `size` (`sm` `md`), `animated` (the thread draws itself on
scroll where supported). `TimelineGroup`: `label` or `date`. `TimelineItem`: `title`, `time`
(shown as "2 hours ago") or `timeLabel`, `icon`, `avatar`, `tone`, `status` (`past` `current`
`upcoming`), `meta`, `card`, `last`. `TimelineCollapse`: `label`, `defaultOpen`.
`Roadmap`: `items` (`label`, `title`, `description`, `status` `done`/`current`/`upcoming`,
`footer`), `itemWidth`. Helpers: `formatTimelineTime`, `formatTimelineDay`.

## Typography

```tsx
<Heading level={1} size="display">Get paid faster</Heading>
<Lead>Create, send and track invoices from one place.</Lead>
<Text size="sm" tone="muted" numeric>₱48,200.00</Text>
<Link href="https://laravel.com/docs">Laravel docs</Link>   {/* external: ↗, new tab */}
<Code>APP_ENV</Code> <Kbd keys={["⌘", "K"]} /> <Mark>match</Mark>
<Blockquote author="Maria Santos" source="Owner">…</Blockquote>
<List variant="check"><ListItem>Payment links</ListItem></List>
<Prose html={sanitizedHtml} />
<StatGroup divided><Stat label="Revenue" value="₱1.24M" change="12.5%" trend="up" /></StatGroup>
```

`Heading`: `level` (tag), `size` (`display` `h1`–`h6`), `tone`, `weight`, `align`, `truncate`,
`lineClamp`. `Text`: `as`, `size` (`xl` `lg` `md` `sm` `xs`), `tone` (`default` `muted` `subtle`
`primary` `success` `warning` `danger` `info` `inherit`), `weight`, `align`, `numeric`,
`truncate`, `lineClamp`. `Link`: `variant` (`inline` `subtle` `standalone`), `external`,
`asChild`. `Prose`: `size`, `html`. `Stat`: `label`, `value`, `change`, `trend`,
`invertTrend`, `description`, `size`. Set `--font-heading` for a separate heading font.

## Theme config (ui.theme.json)

Describe your brand once; every component follows.

```json
{
  "$schema": "./node_modules/@jm/ui/ui.theme.schema.json",
  "colors": { "primary": "#047857", "secondary": "#0e7490", "tertiary": "#b45309" },
  "fonts": { "sans": "\"DM Sans\", ui-sans-serif, system-ui, sans-serif", "googleFonts": ["DM Sans:wght@400..700"] },
  "radius": "sm",
  "density": "compact",
  "shadows": "subtle"
}
```

Settings: `colors` (`primary` `secondary` `tertiary` `success` `warning` `danger` `info` as a hex or
`{ light, dark, foreground, darkForeground }`; `background` `surface` `foreground` `muted` `border`),
`fonts` (`sans` `heading` `mono` `googleFonts`), `radius` (`none` `sm` `md` `lg` or exact values),
`density` (`compact` `comfortable` `spacious` or a multiplier), `shadows` (`none` `subtle` `default`
`strong`), `baseFontSize`. Hover, pressed-edge, readable text and dark-mode shades are derived
from each color.

**Build time** (recommended):

```bash
npx jm-ui init                                   # starter ui.theme.json
npx jm-ui theme ui.theme.json --out resources/css/ui-theme.css [--watch]
```

```css
@import "tailwindcss";
@import "@jm/ui/theme.css";
@import "./ui-theme.css";
```

**Runtime**: `<ThemeProvider theme={json} selector?>` (e.g. a theme per customer).
**From code**: `import { createThemeCss, validateTheme, defineTheme } from "@jm/ui/theme"`.

## Theming

Components only use semantic variables (`--ui-primary`, `--ui-border`, …). Override them in
your app to re-brand without rebuilding:

```css
:root { --ui-primary: #6d28d9; --ui-primary-hover: #5b21b6; --ui-primary-edge: #3b0764; }
```
