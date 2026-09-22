import * as React from "react";
import {
  DataTable,
  type DataTableColumn,
  type DataTableQuery,
  Button,
  Pill,
  Avatar,
  Text,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@jm/ui";
import { PageHeader, Section } from "../components/Doc";

type Invoice = { id: number; no: string; client: string; issued: string; due: string; amount: number; status: "paid" | "due" | "overdue" | "draft" };

const clients = ["Northwind Traders", "Blue Harbor Café", "Luzon Freight", "Pixel & Pine", "Sari-Sari Co", "Mabuhay Tours", "Ilocos Weaves", "Bayanihan Build", "Kape Kultura", "Pinoy Print Shop"];
const statuses: Invoice["status"][] = ["paid", "paid", "due", "overdue", "draft", "paid", "due"];
const invoices: Invoice[] = Array.from({ length: 47 }, (_, i) => {
  const d = new Date(2026, 8, 20 - i * 2);
  const due = new Date(d.getTime() + 14 * 86400000);
  return {
    id: i + 1,
    no: `INV-${1047 - i}`,
    client: clients[(i * 7) % clients.length],
    issued: d.toISOString().slice(0, 10),
    due: due.toISOString().slice(0, 10),
    amount: Math.round(((i * 7919) % 90000) + 2500),
    status: statuses[i % statuses.length],
  };
});

const peso = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
const date = (s: string) => new Date(s + "T00:00:00").toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
const statusPill: Record<Invoice["status"], [string, "success" | "warning" | "danger" | "neutral"]> = {
  paid: ["Paid", "success"],
  due: ["Due", "warning"],
  overdue: ["Overdue", "danger"],
  draft: ["Draft", "neutral"],
};

const columns: DataTableColumn<Invoice>[] = [
  { key: "no", header: "Invoice", sortable: true, primary: true, width: "8rem", cell: (r) => <span className="font-medium tabular-nums">{r.no}</span> },
  {
    key: "client",
    header: "Client",
    sortable: true,
    cell: (r) => (
      <span className="inline-flex items-center gap-2.5">
        <Avatar name={r.client} size="xs" shape="square" decorative />
        <span className="truncate">{r.client}</span>
      </span>
    ),
  },
  { key: "issued", header: "Issued", sortable: true, cell: (r) => <span className="tabular-nums text-fg-muted">{date(r.issued)}</span>, hideOnMobile: true },
  { key: "due", header: "Due", sortable: true, cell: (r) => <span className="tabular-nums">{date(r.due)}</span> },
  { key: "amount", header: "Amount", sortable: true, align: "end", cell: (r) => <span className="tabular-nums">{peso(r.amount)}</span> },
  {
    key: "status",
    header: "Status",
    sortable: true,
    accessor: (r) => statusPill[r.status][0],
    cell: (r) => <Pill size="sm" tone={statusPill[r.status][1]} dot>{statusPill[r.status][0]}</Pill>,
  },
];

function RowMenu({ row, onAction }: { row: Invoice; onAction: (t: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" iconOnly icon="bi bi-three-dots" aria-label={`Actions for ${row.no}`} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem icon="bi bi-eye" onSelect={() => onAction(`Viewing ${row.no}`)}>View</DropdownMenuItem>
        <DropdownMenuItem icon="bi bi-download" onSelect={() => onAction(`Downloading ${row.no}`)}>Download PDF</DropdownMenuItem>
        <DropdownMenuItem icon="bi bi-bell" disabled={row.status === "paid"} onSelect={() => onAction(`Reminder sent to ${row.client}`)}>
          Send reminder
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon="bi bi-x-circle" destructive onSelect={() => onAction(`Voided ${row.no}`)}>Void invoice</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FullDemo() {
  const [message, setMessage] = React.useState("");
  return (
    <div className="grid w-full gap-2">
      <DataTable
        caption="Invoices"
        data={invoices}
        columns={columns}
        rowKey="id"
        searchable
        searchPlaceholder="Search invoices…"
        defaultSort={{ key: "no", direction: "desc" }}
        selectable
        bulkActions={(rows, clear) => (
          <>
            <Button size="sm" variant="secondary" leadingIcon="bi bi-download" onClick={() => setMessage(`Downloading ${rows.length} PDFs`)}>Download</Button>
            <Button size="sm" variant="secondary" leadingIcon="bi bi-bell" onClick={() => { setMessage(`Reminders sent for ${rows.length} invoices`); clear(); }}>
              Send reminders
            </Button>
          </>
        )}
        rowActions={(row) => <RowMenu row={row} onAction={setMessage} />}
        toolbar={<Button size="sm" leadingIcon="bi bi-plus-lg">New invoice</Button>}
      />
      <Text size="sm" tone="muted" role="status">{message || "\u00a0"}</Text>
    </div>
  );
}

// A pretend server: sorts, searches and pages, like a Laravel paginator.
async function fetchInvoices(q: DataTableQuery) {
  await new Promise((r) => setTimeout(r, 650));
  let rows = invoices.filter((r) => !q.search || `${r.no} ${r.client}`.toLowerCase().includes(q.search.toLowerCase()));
  if (q.sort) {
    const { key, direction } = q.sort;
    rows = [...rows].sort((a, b) => {
      const x = a[key as keyof Invoice];
      const y = b[key as keyof Invoice];
      return (x < y ? -1 : x > y ? 1 : 0) * (direction === "asc" ? 1 : -1);
    });
  }
  return { data: rows.slice((q.page - 1) * q.pageSize, q.page * q.pageSize), total: rows.length };
}

function ServerDemo() {
  const [rows, setRows] = React.useState<Invoice[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const req = React.useRef(0);
  const load = React.useCallback(async (q: DataTableQuery) => {
    const id = ++req.current;
    setLoading(true);
    const res = await fetchInvoices(q);
    if (id !== req.current) return; // an older request finished late
    setRows(res.data);
    setTotal(res.total);
    setLoading(false);
  }, []);
  return (
    <DataTable
      caption="Invoices from the server"
      manual
      data={rows}
      total={total}
      loading={loading}
      onQueryChange={load}
      columns={columns.filter((c) => c.key !== "issued")}
      rowKey="id"
      searchable
      pageSize={5}
      pageSizeOptions={[5, 10, 20]}
      density="compact"
    />
  );
}

export function TablePage() {
  const [empty, setEmpty] = React.useState(false);
  return (
    <>
      <PageHeader
        title="Table"
        intro="A light DataTable: sort, search, page, select rows and act on them. On narrow screens each row becomes a readable card instead of a squeezed grid — or the table scrolls sideways with its first column pinned."
        importLine={`import { DataTable, type DataTableColumn } from "@jm/ui";`}
      />

      <Section
        title="Everything on"
        desc="Search matches any column; click a header to sort (again to reverse, a third time to clear). Tick rows to see the bulk actions bar. Each row has its own menu. Narrow your window to see the card layout."
        code={`
const columns: DataTableColumn<Invoice>[] = [
  { key: "no", header: "Invoice", sortable: true, primary: true },
  { key: "client", header: "Client", sortable: true,
    cell: (r) => <><Avatar name={r.client} size="xs" decorative /> {r.client}</> },
  { key: "issued", header: "Issued", sortable: true, hideOnMobile: true },
  { key: "amount", header: "Amount", sortable: true, align: "end", cell: (r) => peso(r.amount) },
  { key: "status", header: "Status", sortable: true,
    cell: (r) => <Pill size="sm" tone={tone[r.status]} dot>{label[r.status]}</Pill> },
];

<DataTable
  caption="Invoices"
  data={invoices}
  columns={columns}
  rowKey="id"
  searchable
  defaultSort={{ key: "no", direction: "desc" }}
  selectable
  bulkActions={(rows, clear) => <Button onClick={() => remind(rows)}>Send reminders</Button>}
  rowActions={(row) => <RowMenu row={row} />}
  toolbar={<Button leadingIcon="bi bi-plus-lg">New invoice</Button>}
/>`}
      >
        <FullDemo />
      </Section>

      <Section
        title="On a phone"
        desc="Below about 640px of available width, rows turn into cards: the primary column becomes the title, the rest become “Label  value” lines, and the row menu sits in the corner. It responds to the table's own container, so a table in a narrow sidebar gets cards too — like this preview."
        code={`
// Default: rows become cards when the container is narrow
<DataTable mobile="cards" … />

// Pick the card title, and leave less important columns out
{ key: "no", header: "Invoice", primary: true }
{ key: "issued", header: "Issued", hideOnMobile: true }`}
      >
        <div className="mx-auto w-full max-w-[24rem] rounded-[1.75rem] border-[6px] border-fg/85 bg-bg p-2 shadow-[var(--ui-shadow-lg)]">
          <DataTable caption="Invoices (phone preview)" data={invoices.slice(0, 12)} columns={columns} rowKey="id" pageSize={4} selectable rowActions={(row) => <RowMenu row={row} onAction={() => {}} />} />
        </div>
      </Section>

      <Section
        title="Or scroll sideways"
        desc={'With mobile="scroll" the table keeps its grid on narrow screens and scrolls horizontally, with the first column pinned so you always know which row you\'re on. Good for number-heavy tables people compare across.'}
        code={`<DataTable mobile="scroll" … />`}
      >
        <div className="w-full max-w-[24rem]">
          <DataTable caption="Invoices (scrolling)" data={invoices.slice(0, 6)} columns={columns} rowKey="id" mobile="scroll" pageSize={0} density="compact" />
        </div>
      </Section>

      <Section
        title="Data from your server"
        desc="With manual, the table only shows the rows you pass. onQueryChange tells you the page, page size, sort and search (debounced) to fetch; total drives the page count. Stale responses are easy to ignore, as in the example."
        code={`
const [rows, setRows] = useState([]);
const [total, setTotal] = useState(0);
const [loading, setLoading] = useState(true);

<DataTable
  manual
  data={rows}
  total={total}
  loading={loading}
  onQueryChange={async ({ page, pageSize, sort, search }) => {
    setLoading(true);
    const res = await fetch(\`/api/invoices?page=\${page}&per_page=\${pageSize}&sort=\${sort?.key ?? ""}&dir=\${sort?.direction ?? ""}&q=\${search}\`);
    const json = await res.json();           // a Laravel paginator
    setRows(json.data);
    setTotal(json.total);
    setLoading(false);
  }}
  …
/>

// Laravel
return Invoice::query()
  ->when($request->q, fn ($q, $s) => $q->where('no', 'like', "%$s%"))
  ->when($request->sort, fn ($q, $col) => $q->orderBy($col, $request->dir ?: 'asc'))
  ->paginate($request->per_page ?? 10);`}
      >
        <div className="w-full">
          <ServerDemo />
        </div>
      </Section>

      <Section
        title="Empty, loading and density"
        desc="While the first page loads, skeleton rows keep the layout steady; later loads dim the current rows. An empty table (or a search with no results) explains itself — pass emptyState for your own message. density=&quot;compact&quot; and striped suit long lists."
        code={`
<DataTable loading={isLoading} … />

<DataTable
  emptyState={<EmptyInvoices onCreate={openNewInvoice} />}
  density="compact"
  striped
  …
/>`}
      >
        <div className="grid w-full gap-4">
          <div>
            <Button size="sm" variant="secondary" onClick={() => setEmpty((e) => !e)}>
              {empty ? "Show rows" : "Show empty state"}
            </Button>
          </div>
          <DataTable
            caption="Recent payments"
            data={empty ? [] : invoices.filter((i) => i.status === "paid").slice(0, 6)}
            columns={columns.filter((c) => ["no", "client", "amount"].includes(c.key))}
            rowKey="id"
            pageSize={0}
            density="compact"
            striped
            emptyState={
              <div className="grid justify-items-center gap-2 py-10 text-center">
                <p className="font-medium">No payments yet</p>
                <p className="text-sm text-fg-muted">Payments show up here as soon as a client pays an invoice.</p>
                <Button size="sm" leadingIcon="bi bi-send">Send an invoice</Button>
              </div>
            }
          />
        </div>
      </Section>

      <Section
        title="Accessibility"
        desc="It stays a real table for screen readers in every layout, including the card view."
        code={`
<DataTable caption="Invoices" … />   // names the table; sort order is announced with it

// Sortable headers are buttons with aria-sort on the column
// Checkboxes are labelled "Select INV-1047" and "Select all rows on this page"
// The "1–10 of 47" count is announced when it changes`}
      >
        <Text size="sm" tone="muted">Tab through the first table to try the headers, checkboxes and row menus.</Text>
      </Section>
    </>
  );
}
