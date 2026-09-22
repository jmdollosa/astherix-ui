import * as React from "react";
import {
  Button,
  Avatar,
  AvatarLabel,
  Text,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  SplitButton,
} from "@jm/ui";
import { PageHeader, Section } from "../components/Doc";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const mod = isMac ? "⌘" : "Ctrl+";

function Log({ text }: { text: string }) {
  return <Text size="sm" tone="muted" role="status">{text || "\u00a0"}</Text>;
}

function BasicDemo() {
  const [last, setLast] = React.useState("");
  return (
    <div className="grid gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" trailingIcon="bi bi-chevron-down">Actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem icon="bi bi-pencil" shortcut={`${mod}E`} onSelect={() => setLast("Edit")}>Edit</DropdownMenuItem>
          <DropdownMenuItem icon="bi bi-copy" shortcut={`${mod}D`} onSelect={() => setLast("Duplicate")}>Duplicate</DropdownMenuItem>
          <DropdownMenuItem icon="bi bi-archive" onSelect={() => setLast("Archive")}>Archive</DropdownMenuItem>
          <DropdownMenuItem icon="bi bi-share" disabled>Share (needs a paid plan)</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem icon="bi bi-trash3" destructive onSelect={() => setLast("Delete")}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Log text={last && `You chose: ${last}`} />
    </div>
  );
}

const rows = [
  { no: "INV-1042", client: "Northwind Traders", amount: "₱48,200.00" },
  { no: "INV-1041", client: "Blue Harbor Café", amount: "₱12,750.00" },
  { no: "INV-1040", client: "Luzon Freight", amount: "₱96,000.00" },
];

function RowActionsDemo() {
  const [last, setLast] = React.useState("");
  return (
    <div className="grid w-full gap-3">
      <ul className="w-full max-w-lg divide-y divide-border rounded-card border border-border bg-surface text-sm">
        {rows.map((r) => (
          <li key={r.no} className="flex items-center gap-3 px-4 py-2.5">
            <span className="w-20 tabular-nums text-fg-muted">{r.no}</span>
            <span className="flex-1 truncate">{r.client}</span>
            <span className="tabular-nums">{r.amount}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" iconOnly icon="bi bi-three-dots" aria-label={`Actions for ${r.no}`} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem icon="bi bi-eye" onSelect={() => setLast(`View ${r.no}`)}>View</DropdownMenuItem>
                <DropdownMenuItem icon="bi bi-download" onSelect={() => setLast(`Download ${r.no}`)}>Download PDF</DropdownMenuItem>
                <DropdownMenuItem icon="bi bi-bell" onSelect={() => setLast(`Remind ${r.client}`)}>Send reminder</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem icon="bi bi-x-circle" destructive onSelect={() => setLast(`Void ${r.no}`)}>Void invoice</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        ))}
      </ul>
      <Log text={last} />
    </div>
  );
}

function ViewOptionsDemo() {
  const [cols, setCols] = React.useState({ client: true, amount: true, due: false, status: true });
  const [sort, setSort] = React.useState<string | null>("newest");
  const toggle = (k: keyof typeof cols) => (v: boolean) => setCols((c) => ({ ...c, [k]: v }));
  return (
    <div className="grid gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm" leadingIcon="bi bi-sliders">View</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Show columns</DropdownMenuLabel>
          <DropdownMenuCheckboxItem checked={cols.client} onCheckedChange={toggle("client")}>Client</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={cols.amount} onCheckedChange={toggle("amount")}>Amount</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={cols.due} onCheckedChange={toggle("due")}>Due date</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={cols.status} onCheckedChange={toggle("status")}>Status</DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
            <DropdownMenuRadioItem value="newest">Newest first</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="oldest">Oldest first</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="amount">Largest amount</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Log text={`Columns: ${Object.entries(cols).filter(([, v]) => v).map(([k]) => k).join(", ")} · Sort: ${sort}`} />
    </div>
  );
}

function AccountDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" aria-label="Account menu">
        <Avatar name="JM" status="online" decorative />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-60">
        <div className="px-2.5 py-2">
          <AvatarLabel name="JM" description="jm@example.com" size="sm" />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <a href="#/dropdown">Profile</a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="#/dropdown">Billing</a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="#/dropdown">Settings</a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
        <DropdownMenuItem description="Owner · 4 members" icon="bi bi-building">Astherix Software</DropdownMenuItem>
        <DropdownMenuItem description="Member · 12 members" icon="bi bi-cup-hot">Blue Harbor Café</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon="bi bi-box-arrow-right">Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SplitDemo() {
  const [status, setStatus] = React.useState("");
  const act = (label: string) => async () => {
    setStatus(`${label}…`);
    await wait(900);
    setStatus(`${label} — done.`);
  };
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <SplitButton
          onClick={act("Saved")}
          spinnerPlacement="start"
          loadingLabel="Saving…"
          menuLabel="More save options"
          menu={
            <>
              <DropdownMenuItem icon="bi bi-file-earmark" onSelect={act("Saved as draft")}>Save as draft</DropdownMenuItem>
              <DropdownMenuItem icon="bi bi-send" onSelect={act("Saved and sent")}>Save and send</DropdownMenuItem>
              <DropdownMenuItem icon="bi bi-calendar-event" onSelect={act("Scheduled")}>Schedule send…</DropdownMenuItem>
            </>
          }
        >
          Save
        </SplitButton>
        <SplitButton
          variant="secondary"
          leadingIcon="bi bi-download"
          onClick={act("Exported CSV")}
          menuLabel="More export formats"
          menu={
            <>
              <DropdownMenuItem onSelect={act("Exported Excel")}>Excel (.xlsx)</DropdownMenuItem>
              <DropdownMenuItem onSelect={act("Exported PDF")}>PDF</DropdownMenuItem>
            </>
          }
        >
          Export CSV
        </SplitButton>
      </div>
      <Log text={status} />
    </div>
  );
}

export function DropdownPage() {
  return (
    <>
      <PageHeader
        title="Dropdown menu"
        intro="A button that opens a short list of actions. Use it to tidy away secondary actions — row options, account menus, view settings — and SplitButton when one action is the usual choice but others are close by."
        importLine={`import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup, SplitButton,
} from "@jm/ui";`}
      />

      <Section
        title="Basic"
        desc="Any button can open the menu. Items can have icons and shortcut hints; disabled items stay visible but can't be picked, and destructive ones are red. The menu closes after a choice and puts focus back on the button."
        code={`
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="secondary" trailingIcon="bi bi-chevron-down">Actions</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem icon="bi bi-pencil" shortcut="⌘E" onSelect={edit}>Edit</DropdownMenuItem>
    <DropdownMenuItem icon="bi bi-copy" shortcut="⌘D" onSelect={duplicate}>Duplicate</DropdownMenuItem>
    <DropdownMenuItem icon="bi bi-share" disabled>Share</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem icon="bi bi-trash3" destructive onSelect={remove}>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
      >
        <BasicDemo />
      </Section>

      <Section
        title="Row actions"
        desc={'An icon-only "…" button keeps lists and tables clean. align="end" lines the menu up with the button\'s right edge; it flips upward near the bottom of the screen.'}
        code={`
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="sm" iconOnly icon="bi bi-three-dots" aria-label={\`Actions for \${invoice.no}\`} />
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem icon="bi bi-eye">View</DropdownMenuItem>
    <DropdownMenuItem icon="bi bi-download">Download PDF</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem icon="bi bi-x-circle" destructive>Void invoice</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
      >
        <RowActionsDemo />
      </Section>

      <Section
        title="Checkboxes and choices"
        desc="Checkbox items toggle and keep the menu open, so several can be changed at once. Radio items pick one of a set. Labels name each group."
        code={`
<DropdownMenuContent>
  <DropdownMenuLabel>Show columns</DropdownMenuLabel>
  <DropdownMenuCheckboxItem checked={cols.client} onCheckedChange={(v) => …}>Client</DropdownMenuCheckboxItem>
  <DropdownMenuCheckboxItem checked={cols.due} onCheckedChange={(v) => …}>Due date</DropdownMenuCheckboxItem>
  <DropdownMenuSeparator />
  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
  <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
    <DropdownMenuRadioItem value="newest">Newest first</DropdownMenuRadioItem>
    <DropdownMenuRadioItem value="oldest">Oldest first</DropdownMenuRadioItem>
  </DropdownMenuRadioGroup>
</DropdownMenuContent>`}
      >
        <ViewOptionsDemo />
      </Section>

      <Section
        title="Account menu"
        desc="The trigger can be anything clickable — here an avatar. Items can be links (with asChild, including Next.js and Inertia links) and have a second line of description."
        code={`
<DropdownMenu>
  <DropdownMenuTrigger aria-label="Account menu">
    <Avatar name={user.name} src={user.avatar} decorative />
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
    <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
    <DropdownMenuItem description="Owner · 4 members">Astherix Software</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem icon="bi bi-box-arrow-right" onSelect={signOut}>Sign out</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
      >
        <AccountDemo />
      </Section>

      <Section
        title="Split button"
        desc="The main action on the left; related actions behind the arrow. It takes every Button prop — variants, sizes, icons, and the loading behavior (try Save)."
        code={`
<SplitButton
  onClick={save}                         // returns a Promise → spinner until it's done
  spinnerPlacement="start"
  loadingLabel="Saving…"
  menuLabel="More save options"
  menu={
    <>
      <DropdownMenuItem onSelect={saveDraft}>Save as draft</DropdownMenuItem>
      <DropdownMenuItem onSelect={saveAndSend}>Save and send</DropdownMenuItem>
    </>
  }
>
  Save
</SplitButton>`}
      >
        <SplitDemo />
      </Section>

      <Section
        title="Keyboard"
        desc="Follows the standard menu button pattern, so it works the way screen-reader and keyboard users expect."
        code={`
Enter  Space  ↓     open, first item focused
↑                   open, last item focused
↑ ↓  Home  End      move between items
a–z                 jump to an item by its first letters
Enter  Space        choose (toggle for checkboxes)
Escape  Tab         close and return to the button`}
      >
        <Text size="sm" tone="muted">Tab to any menu button above and try it.</Text>
      </Section>
    </>
  );
}
