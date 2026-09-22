import * as React from "react";
import { Button, Field, Input, Textarea, Tabs, TabList, Tab, TabPanel } from "@jm/ui";
import { PageHeader, Section } from "../components/Doc";

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-control border border-border bg-surface p-4 text-sm leading-relaxed text-fg-muted">{children}</div>;
}

const Count = ({ n }: { n: number }) => (
  <span className="rounded-full bg-secondary-hover px-1.5 text-[0.6875rem] font-medium tabular-nums text-fg-muted">{n}</span>
);

/* ---------- demos ---------- */

function BasicTabs({ variant }: { variant: "line" | "enclosed" | "pills" }) {
  return (
    <Tabs defaultValue="overview" variant={variant} className="w-full">
      <TabList aria-label="Project">
        <Tab value="overview">Overview</Tab>
        <Tab value="activity">Activity</Tab>
        <Tab value="settings">Settings</Tab>
        <Tab value="billing" disabled>Billing</Tab>
      </TabList>
      <TabPanel value="overview"><Panel>A summary of the project: goals, owners and deadlines.</Panel></TabPanel>
      <TabPanel value="activity"><Panel>Recent changes, comments and deployments.</Panel></TabPanel>
      <TabPanel value="settings"><Panel>Name, visibility and integrations.</Panel></TabPanel>
      <TabPanel value="billing"><Panel>Billing is managed by your organization's owner.</Panel></TabPanel>
    </Tabs>
  );
}

type Doc = { id: string; name: string; body: string };
let docCounter = 4;

function DocumentTabsDemo() {
  const [docs, setDocs] = React.useState<Doc[]>([
    { id: "d1", name: "Meeting notes", body: "Agenda: launch date, pricing page, support rota." },
    { id: "d2", name: "Roadmap", body: "Q4: payments, reports, mobile app beta." },
    { id: "d3", name: "Ideas", body: "Dark mode for invoices. Bulk export." },
  ]);
  const [active, setActive] = React.useState<string | null>("d1");
  const byId = Object.fromEntries(docs.map((d) => [d.id, d]));

  return (
    <Tabs value={active} onValueChange={setActive} variant="enclosed" className="w-full">
      <TabList
        aria-label="Open documents"
        onReorder={(ids) => setDocs(ids.map((id) => byId[id]))}
        onRename={(id, name) => setDocs((ds) => ds.map((d) => (d.id === id ? { ...d, name } : d)))}
        onClose={(id) => setDocs((ds) => ds.filter((d) => d.id !== id))}
        onAdd={() => {
          const id = `d${docCounter++}`;
          setDocs((ds) => [...ds, { id, name: "Untitled", body: "" }]);
          return id;
        }}
        addLabel="New document"
        renameOnAdd
      >
        {docs.map((d) => (
          <Tab key={d.id} value={d.id} icon="bi bi-file-earmark-text">
            {d.name}
          </Tab>
        ))}
      </TabList>
      {docs.map((d) => (
        <TabPanel key={d.id} value={d.id} keepMounted>
          <Textarea
            aria-label={`${d.name} contents`}
            value={d.body}
            onChange={(e) => setDocs((ds) => ds.map((x) => (x.id === d.id ? { ...x, body: e.target.value } : x)))}
            autoResize
            minRows={4}
            placeholder="Start writing…"
          />
        </TabPanel>
      ))}
      {docs.length === 0 && (
        <Panel>No documents open. Use the + button to create one.</Panel>
      )}
    </Tabs>
  );
}

function VerticalSettingsDemo() {
  return (
    <Tabs defaultValue="profile" orientation="vertical" className="w-full">
      <TabList aria-label="Settings">
        <Tab value="profile" icon="bi bi-person">Profile</Tab>
        <Tab value="notifications" icon="bi bi-bell" badge={<Count n={3} />}>Notifications</Tab>
        <Tab value="security" icon="bi bi-shield-lock">Security</Tab>
        <Tab value="billing" icon="bi bi-credit-card" disabled>Billing</Tab>
      </TabList>
      <TabPanel value="profile">
        <div className="grid max-w-sm gap-4">
          <Field label="Display name"><Input defaultValue="JM" /></Field>
          <Field label="Bio" optional><Textarea minRows={2} /></Field>
          <div><Button>Save profile</Button></div>
        </div>
      </TabPanel>
      <TabPanel value="notifications"><Panel>You have 3 unread notification settings to review.</Panel></TabPanel>
      <TabPanel value="security"><Panel>Password, two-factor authentication and active sessions.</Panel></TabPanel>
    </Tabs>
  );
}

function VerticalEditableDemo() {
  const [pages, setPages] = React.useState([
    { id: "p1", name: "Home" },
    { id: "p2", name: "About us" },
    { id: "p3", name: "Pricing" },
    { id: "p4", name: "Contact" },
  ]);
  const [active, setActive] = React.useState<string | null>("p1");
  const [n, setN] = React.useState(5);
  const byId = Object.fromEntries(pages.map((p) => [p.id, p]));
  return (
    <Tabs value={active} onValueChange={setActive} orientation="vertical" variant="pills" className="w-full">
      <TabList
        aria-label="Site pages"
        onReorder={(ids) => setPages(ids.map((id) => byId[id]))}
        onRename={(id, name) => setPages((ps) => ps.map((p) => (p.id === id ? { ...p, name } : p)))}
        onAdd={() => {
          const id = `p${n}`;
          setN(n + 1);
          setPages((ps) => [...ps, { id, name: "New page" }]);
          return id;
        }}
        addLabel="Add page"
        renameOnAdd
      >
        {pages.map((p, i) => (
          <Tab key={p.id} value={p.id} renamable={i !== 0}>
            {p.name}
          </Tab>
        ))}
      </TabList>
      {pages.map((p, i) => (
        <TabPanel key={p.id} value={p.id}>
          <Panel>
            <span className="font-medium text-fg">{p.name}</span> is page {i + 1} in the site menu.{" "}
            {i === 0 ? "The home page can be moved but not renamed." : "Drag it to change the menu order."}
          </Panel>
        </TabPanel>
      ))}
    </Tabs>
  );
}

/* ---------- page ---------- */

export function TabsPage() {
  return (
    <>
      <PageHeader
        title="Tabs"
        intro="Switch between related views without leaving the page. Tabs can run across the top or down the side, and can be moved, renamed, added and closed when people manage their own set — like documents or pages."
        importLine={`import { Tabs, TabList, Tab, TabPanel } from "@jm/ui";`}
      />

      <Section
        title="Basic"
        desc="Each Tab has a value that matches a TabPanel. Disabled tabs are skipped by the keyboard and can't be selected."
        code={`
<Tabs defaultValue="overview">
  <TabList aria-label="Project">
    <Tab value="overview">Overview</Tab>
    <Tab value="activity">Activity</Tab>
    <Tab value="settings">Settings</Tab>
    <Tab value="billing" disabled>Billing</Tab>
  </TabList>
  <TabPanel value="overview">…</TabPanel>
  <TabPanel value="activity">…</TabPanel>
  <TabPanel value="settings">…</TabPanel>
</Tabs>`}
      >
        <BasicTabs variant="line" />
      </Section>

      <Section
        title="Styles"
        desc={'"line" (the default) underlines the active tab, "enclosed" looks like folder tabs, and "pills" works as a segmented control.'}
        code={`
<Tabs variant="line">…</Tabs>
<Tabs variant="enclosed">…</Tabs>
<Tabs variant="pills">…</Tabs>`}
      >
        <div className="grid w-full gap-8">
          <BasicTabs variant="enclosed" />
          <BasicTabs variant="pills" />
        </div>
      </Section>

      <Section
        title="Vertical"
        desc="orientation=&quot;vertical&quot; puts the tabs in a column beside the panel — good for settings pages. The up and down arrow keys move between tabs."
        code={`
<Tabs defaultValue="profile" orientation="vertical">
  <TabList aria-label="Settings">
    <Tab value="profile" icon="bi bi-person">Profile</Tab>
    <Tab value="notifications" icon="bi bi-bell" badge={<Count n={3} />}>
      Notifications
    </Tab>
    <Tab value="security" icon="bi bi-shield-lock">Security</Tab>
    <Tab value="billing" icon="bi bi-credit-card" disabled>Billing</Tab>
  </TabList>
  <TabPanel value="profile">…</TabPanel>
  …
</Tabs>`}
      >
        <VerticalSettingsDemo />
      </Section>

      <Section
        title="Move, rename, add and close"
        desc={
          <>
            Drag a tab to move it (or press Alt + ← / →). Double-click or press F2 to rename. Use + to add one — it
            starts in rename mode — and × or Delete to close. You keep the tabs in your own state; the component tells
            you what changed.
          </>
        }
        code={`
const [docs, setDocs] = useState([{ id: "d1", name: "Meeting notes" }, …]);
const [active, setActive] = useState("d1");
const byId = Object.fromEntries(docs.map((d) => [d.id, d]));

<Tabs value={active} onValueChange={setActive} variant="enclosed">
  <TabList
    aria-label="Open documents"
    onReorder={(ids) => setDocs(ids.map((id) => byId[id]))}
    onRename={(id, name) => setDocs((ds) => ds.map((d) => d.id === id ? { ...d, name } : d))}
    onClose={(id) => setDocs((ds) => ds.filter((d) => d.id !== id))}
    onAdd={() => {
      const id = crypto.randomUUID();
      setDocs((ds) => [...ds, { id, name: "Untitled" }]);
      return id;               // selects and focuses the new tab
    }}
    renameOnAdd
    addLabel="New document"
  >
    {docs.map((d) => <Tab key={d.id} value={d.id}>{d.name}</Tab>)}
  </TabList>
  {docs.map((d) => <TabPanel key={d.id} value={d.id} keepMounted>…</TabPanel>)}
</Tabs>`}
      >
        <DocumentTabsDemo />
      </Section>

      <Section
        title="Vertical and editable"
        desc={
          <>
            Every feature works vertically too — drag up and down, or Alt + ↑ / ↓. Opt single tabs out with{" "}
            <code className="font-mono text-[0.8125rem]">renamable={"{false}"}</code> or{" "}
            <code className="font-mono text-[0.8125rem]">closable={"{false}"}</code>. On touch screens, press and hold
            a tab briefly, then drag.
          </>
        }
        code={`
<Tabs value={active} onValueChange={setActive} orientation="vertical" variant="pills">
  <TabList aria-label="Site pages" onReorder={…} onRename={…} onAdd={…} renameOnAdd addLabel="Add page">
    {pages.map((p, i) => (
      <Tab key={p.id} value={p.id} renamable={i !== 0}>{p.name}</Tab>
    ))}
  </TabList>
  …
</Tabs>`}
      >
        <VerticalEditableDemo />
      </Section>

      <Section
        title="Keep panel state"
        desc={
          <>
            Hidden panels are removed by default. Add <code className="font-mono text-[0.8125rem]">keepMounted</code> to
            keep them — and what's typed in them — while another tab is open. With{" "}
            <code className="font-mono text-[0.8125rem]">activation="manual"</code>, arrow keys move focus and Enter or
            Space opens the tab, which suits panels that are slow to load.
          </>
        }
        code={`
<Tabs defaultValue="details" activation="manual">
  <TabList aria-label="New product">…</TabList>
  <TabPanel value="details" keepMounted>…form…</TabPanel>
  <TabPanel value="pricing" keepMounted>…form…</TabPanel>
</Tabs>`}
      >
        <Tabs defaultValue="details" activation="manual" size="sm" className="w-full max-w-md">
          <TabList aria-label="New product">
            <Tab value="details">Details</Tab>
            <Tab value="pricing">Pricing</Tab>
          </TabList>
          <TabPanel value="details" keepMounted>
            <Field label="Product name"><Input placeholder="Type, then switch tabs" /></Field>
          </TabPanel>
          <TabPanel value="pricing" keepMounted>
            <Field label="Price"><Input prefix="₱" type="number" placeholder="0.00" /></Field>
          </TabPanel>
        </Tabs>
      </Section>

      <Section
        title="Keyboard"
        desc="The whole tab list is a single Tab stop, as screen-reader users expect. Moves, renames and closes are announced."
        code={`
← →  (↑ ↓ vertical)   move between tabs
Home  End             first / last tab
Enter  Space          open the tab (manual activation)
Alt + ← →  (↑ ↓)      move the tab           with onReorder
F2  or double-click   rename                 with onRename
Delete                close                  with onClose`}
      >
        <p className="text-sm text-fg-muted">Try it on the document tabs above.</p>
      </Section>
    </>
  );
}
