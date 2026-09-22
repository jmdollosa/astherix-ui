import * as React from "react";
import { Pagination, LoadMore, Text, PillGroup, PillOption, Avatar, Pill } from "@jm/ui";
import { PageHeader, Section } from "../components/Doc";

function BasicDemo() {
  const [page, setPage] = React.useState(6);
  return (
    <div className="grid w-full gap-3">
      <Pagination page={page} pageCount={12} onPageChange={setPage} />
      <Text size="sm" tone="muted" className="text-center">page = {page}</Text>
    </div>
  );
}

const clients = ["Northwind Traders", "Blue Harbor Café", "Luzon Freight", "Pixel & Pine", "Mabuhay Tours", "Bayanihan Build", "Kape Kultura", "Northgate Clinic"];

function FullDemo() {
  const [page, setPage] = React.useState(3);
  const [size, setSize] = React.useState(10);
  const total = 470;
  const pages = Math.ceil(total / size);
  const from = (page - 1) * size;
  return (
    <div className="grid w-full gap-4">
      <ul className="grid divide-y divide-border rounded-card border border-border bg-surface">
        {Array.from({ length: Math.min(3, total - from) }, (_, i) => {
          const n = from + i + 1;
          return (
            <li key={n} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              <span className="w-20 font-mono text-[0.8125rem] text-fg-muted">INV-{1000 + n}</span>
              <span className="min-w-0 flex-1 truncate">{clients[n % clients.length]}</span>
              <Pill size="sm" tone={n % 4 === 0 ? "danger" : "success"} dot>{n % 4 === 0 ? "Overdue" : "Paid"}</Pill>
            </li>
          );
        })}
        <li className="px-4 py-2 text-center text-xs text-fg-muted">… and {Math.min(size, total - from) - 3} more on this page</li>
      </ul>
      <Pagination
        page={Math.min(page, pages)}
        total={total}
        pageSize={size}
        onPageChange={setPage}
        showSummary
        showFirstLast
        pageSizeOptions={[10, 25, 50]}
        onPageSizeChange={(s) => {
          // Keep the first visible row on screen when the page size changes.
          setPage(Math.floor(from / s) + 1);
          setSize(s);
        }}
        showJump
      />
    </div>
  );
}

function ResponsiveDemo() {
  const [w, setW] = React.useState<string | null>("full");
  const [page, setPage] = React.useState(8);
  const widths: Record<string, string> = { full: "100%", medium: "400px", small: "280px" };
  return (
    <div className="grid w-full gap-4">
      <PillGroup value={w} onValueChange={setW} size="sm" aria-label="Width">
        <PillOption value="full">Wide</PillOption>
        <PillOption value="medium">400px</PillOption>
        <PillOption value="small">280px</PillOption>
      </PillGroup>
      <div className="rounded-card border border-dashed border-border-strong p-3 transition-[width] duration-300" style={{ width: widths[w ?? "full"], maxWidth: "100%" }}>
        <Pagination page={page} pageCount={20} onPageChange={setPage} />
      </div>
    </div>
  );
}

function FeedDemo() {
  const [count, setCount] = React.useState(6);
  const [auto, setAuto] = React.useState(false);
  const total = 23;
  const people = ["Maria Santos", "Jose Rizal", "Ana Cruz", "Paolo Reyes", "Liza Soberano", "Mark Dizon", "Carla Lim", "Ben Tan", "Joy Garcia", "Rico Blanco"];
  return (
    <div className="grid w-full max-w-md gap-3">
      <label className="flex items-center gap-2 text-sm text-fg-muted">
        <input type="checkbox" className="size-4 accent-[color:var(--color-primary)]" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
        Load automatically when you scroll to the end
      </label>
      <ul className="grid max-h-80 gap-2 overflow-y-auto rounded-card border border-border bg-surface p-3">
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <Avatar name={people[i % people.length]} size="sm" decorative />
            <span className="min-w-0 flex-1 truncate">
              <span className="font-medium">{people[i % people.length]}</span> paid INV-{1047 - i}
            </span>
            <span className="text-xs text-fg-muted">{i + 1}h ago</span>
          </li>
        ))}
        <li>
          <LoadMore
            loaded={count}
            total={total}
            auto={auto}
            onLoadMore={() => new Promise<void>((r) => setTimeout(() => (setCount((c) => Math.min(total, c + 6)), r()), 900))}
          />
        </li>
      </ul>
      <button type="button" className="justify-self-start text-sm text-primary underline underline-offset-2" onClick={() => setCount(6)}>
        Reset
      </button>
    </div>
  );
}

export function PaginationPage() {
  return (
    <>
      <PageHeader
        title="Pagination"
        intro="Move between pages of results. The highlight slides from page to page, gaps (…) are shortcuts that jump five pages, and it fits itself to the space it has — down to “Page 3 of 12” on a narrow phone. For feeds, LoadMore adds more items in place instead."
        importLine={`import { Pagination, LoadMore } from "@jm/ui";`}
      />

      <Section
        title="Pages"
        desc="The number of slots stays the same as you move, so the buttons don't jump around under your cursor. Hover a gap to see it's a shortcut: it moves five pages."
        code={`
const [page, setPage] = useState(1);

<Pagination page={page} pageCount={12} onPageChange={setPage} />`}
      >
        <BasicDemo />
      </Section>

      <Section
        title="Under a list"
        desc="With total and pageSize it can show “21–30 of 470”, offer a page-size picker, a “Go to page” box, and first/last buttons."
        code={`
<Pagination
  page={page}
  total={470}
  pageSize={pageSize}
  onPageChange={setPage}
  showSummary
  showFirstLast
  pageSizeOptions={[10, 25, 50]}
  onPageSizeChange={setPageSize}
  showJump
/>`}
      >
        <FullDemo />
      </Section>

      <Section
        title="Fits any width"
        desc="It measures its own space: wide shows Previous/Next with words; narrower drops the words and neighbouring pages; very narrow becomes “Page 8 of 20” with arrows. Turn it off with responsive={false}, or always use variant=&quot;simple&quot;."
        code={`
<Pagination page={page} pageCount={20} onPageChange={setPage} />   {/* adapts */}
<Pagination variant="simple" … />                                   {/* always ‹ Page 8 of 20 › */}`}
      >
        <ResponsiveDemo />
      </Section>

      <Section
        title="As links"
        desc="Give getHref and pages become real links — search engines can follow them, and people can open a page in a new tab. Pass your router's Link for navigation without a full reload."
        code={`
// Next.js (the page number lives in the URL)
import Link from "next/link";

<Pagination
  page={Number(searchParams.page ?? 1)}
  total={invoices.total}
  pageSize={25}
  getHref={(p) => \`/invoices?page=\${p}\`}
  linkComponent={Link}
/>

// Laravel + Inertia, with a paginator from ->paginate(25)
import { Link } from "@inertiajs/react";

<Pagination
  page={invoices.current_page}
  pageCount={invoices.last_page}
  total={invoices.total}
  pageSize={invoices.per_page}
  getHref={(p) => \`\${invoices.path}?page=\${p}\`}
  linkComponent={Link}
  showSummary
/>`}
      >
        <Text size="sm" tone="muted">Laravel's paginator already has everything Pagination needs: current_page, last_page, total and per_page.</Text>
      </Section>

      <Section
        title="Load more"
        desc="For feeds and activity, add items in place: “Showing 12 of 23” with a progress line and a button that shows progress while it loads. Turn on auto to load as the person reaches the end (infinite scroll)."
        code={`
<LoadMore
  loaded={items.length}
  total={total}
  onLoadMore={() => fetchNextPage()}   // a Promise: the button shows progress
  auto                                // load when scrolled into view
/>`}
      >
        <FeedDemo />
      </Section>

      <Section
        title="Accessibility and languages"
        desc="It's a labelled navigation landmark, the current page is marked, and arrows and gaps have spoken labels. Every word can be replaced."
        code={`
<Pagination
  labels={{ previous: "Nakaraan", next: "Susunod", page: "Pahina", of: "ng", nav: "Mga pahina" }}
  size="sm"
  …
/>`}
      >
        <Pagination page={2} pageCount={9} size="sm" labels={{ previous: "Nakaraan", next: "Susunod", page: "Pahina", of: "ng", nav: "Mga pahina" }} />
      </Section>
    </>
  );
}
