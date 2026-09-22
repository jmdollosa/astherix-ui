import * as React from "react";
import {
  Button,
  Field,
  Select,
  type SelectOption,
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ModalClose,
} from "@jm/ui";
import { PageHeader, Section } from "../components/Doc";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const Flag = ({ code }: { code: string }) => (
  <span aria-hidden="true" className="text-[1.05em] leading-none">
    {String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0)))}
  </span>
);

const countries: SelectOption[] = [
  ["PH", "Philippines"], ["AU", "Australia"], ["CA", "Canada"], ["DE", "Germany"], ["FR", "France"],
  ["ID", "Indonesia"], ["JP", "Japan"], ["KR", "South Korea"], ["MY", "Malaysia"], ["NZ", "New Zealand"],
  ["SG", "Singapore"], ["ES", "Spain"], ["TH", "Thailand"], ["GB", "United Kingdom"], ["US", "United States"],
  ["VN", "Vietnam"],
].map(([code, label]) => ({ value: code, label, icon: <Flag code={code} />, keywords: [code] }));

const skills: SelectOption[] = [
  "Laravel", "PHP", "React", "Next.js", "TypeScript", "Tailwind CSS", "Vue", "Node.js", "MySQL",
  "PostgreSQL", "Docker", "Flutter", "React Native", "Figma",
].map((s) => ({ value: s.toLowerCase().replace(/[^a-z0-9]+/g, "-"), label: s }));

const people: SelectOption[] = [
  { value: "maria", label: "Maria Santos", description: "Product designer", group: "Design" },
  { value: "leo", label: "Leo Garcia", description: "Brand designer", group: "Design" },
  { value: "ana", label: "Ana Reyes", description: "Frontend developer", group: "Engineering" },
  { value: "ben", label: "Ben Cruz", description: "Backend developer", group: "Engineering" },
  { value: "carla", label: "Carla Lim", description: "Mobile developer · on leave", group: "Engineering", disabled: true },
  { value: "dan", label: "Dan Torres", description: "QA engineer", group: "Engineering" },
  { value: "ella", label: "Ella Ramos", description: "Project manager", group: "Management" },
];

// A pretend server with 60 repositories.
const repos = [
  "astherix-ui", "astherix-api", "astherix-mobile", "billing-service", "customer-portal", "design-tokens",
  "docs-site", "email-templates", "inventory-app", "invoice-generator", "laravel-starter", "marketing-site",
  "next-dashboard", "notifications", "payments-gateway", "pos-terminal", "reports-engine", "school-portal",
  "shop-frontend", "support-desk", "theme-builder", "hr-portal", "clinic-booking", "delivery-tracker",
];
async function searchRepos(query: string): Promise<SelectOption[]> {
  await wait(500 + Math.random() * 400);
  const q = query.toLowerCase();
  return repos
    .filter((r) => r.includes(q))
    .slice(0, 8)
    .map((r) => ({ value: r, label: r, description: `jmdollosa/${r}`, icon: "bi bi-journal-code" }));
}

const initials = (name: string) => name.split(" ").map((p) => p[0]).join("");

/* ---------- demos ---------- */

function Stack({ children }: { children: React.ReactNode }) {
  return <div className="grid w-full max-w-sm gap-5">{children}</div>;
}

function SingleDemo() {
  const [country, setCountry] = React.useState<string | null>("PH");
  return (
    <Stack>
      <Field label="Country" description="Search by name or code, e.g. “jp”.">
        <Select options={countries} value={country} onChange={setCountry} placeholder="Choose a country" />
      </Field>
      <p className="text-sm text-fg-muted">value = {JSON.stringify(country)}</p>
    </Stack>
  );
}

function MultipleDemo() {
  const [value, setValue] = React.useState<string[]>(["laravel", "react"]);
  return (
    <Stack>
      <Field label="Skills" description="Pick up to 5.">
        <Select multiple options={skills} value={value} onChange={setValue} maxSelected={5} placeholder="Add skills" clearable />
      </Field>
      <p className="text-sm text-fg-muted">value = {JSON.stringify(value)}</p>
    </Stack>
  );
}

function CreatableDemo() {
  const [labels, setLabels] = React.useState<string[]>(["bug"]);
  const base: SelectOption[] = ["bug", "feature", "docs", "design", "urgent"].map((l) => ({ value: l, label: l }));
  return (
    <Stack>
      <Field label="Labels" description="Pick existing labels or type a new one and press Enter.">
        <Select
          multiple
          creatable
          options={base}
          value={labels}
          onChange={setLabels}
          placeholder="Add labels"
          searchPlaceholder="Search or add a label…"
          onCreateOption={async (text) => {
            await wait(400); // e.g. save it on the server
            return { value: text.toLowerCase(), label: text.toLowerCase() };
          }}
        />
      </Field>
    </Stack>
  );
}

function FormDemo() {
  const [result, setResult] = React.useState("");
  const [error, setError] = React.useState<string>();
  return (
    <form
      className="grid w-full max-w-sm gap-5 rounded-[0.625rem] border border-border bg-surface p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        if (!data.get("assignee")) {
          setError("Choose who should handle this ticket.");
          setResult("");
          return;
        }
        setError(undefined);
        await wait(700);
        setResult(new URLSearchParams(data as unknown as Record<string, string>).toString());
      }}
    >
      <Field label="Assignee" error={error} required>
        <Select name="assignee" options={people} onChange={() => setError(undefined)} placeholder="Choose a person" />
      </Field>
      <Field label="Watchers" optional>
        <Select name="watchers" multiple options={people} placeholder="Add people" />
      </Field>
      <Button type="submit" spinnerPlacement="start" loadingLabel="Creating…">Create ticket</Button>
      {result && <p role="status" className="break-all text-sm text-fg-muted">Sent: {result}</p>}
    </form>
  );
}

/* ---------- page ---------- */

export function SelectPage() {
  return (
    <>
      <PageHeader
        title="Select"
        intro="A dropdown for choosing from a list, in the spirit of Select2: type to search, pick one or many, group options, load them from a server, or add new ones. Works with the keyboard and screen readers."
        importLine={`import { Field, Select } from "@jm/ui";`}
      />

      <Section
        title="Search and pick one"
        desc="Open it and start typing to filter. Matches ignore case and accents, and the matching part is highlighted. You can also focus it and just start typing."
        code={`
const countries = [
  { value: "PH", label: "Philippines", icon: <Flag code="PH" />, keywords: ["PH"] },
  { value: "JP", label: "Japan", icon: <Flag code="JP" />, keywords: ["JP"] },
  …
];

const [country, setCountry] = useState<string | null>("PH");

<Field label="Country">
  <Select options={countries} value={country} onChange={setCountry}
    placeholder="Choose a country" />
</Field>`}
      >
        <SingleDemo />
      </Section>

      <Section
        title="Pick many"
        desc="With multiple, choices show as chips. Remove one with its ×, or press Backspace. maxSelected sets a limit."
        code={`
const [skills, setSkills] = useState(["laravel", "react"]);

<Select
  multiple
  options={skillOptions}
  value={skills}
  onChange={setSkills}
  maxSelected={5}
  clearable
  placeholder="Add skills"
/>`}
      >
        <MultipleDemo />
      </Section>

      <Section
        title="Groups and descriptions"
        desc="Give options a group to list them under a heading, and a description for a second line — it's searched too. Disabled options can't be picked."
        code={`
const people = [
  { value: "maria", label: "Maria Santos", description: "Product designer", group: "Design" },
  { value: "ana", label: "Ana Reyes", description: "Frontend developer", group: "Engineering" },
  { value: "carla", label: "Carla Lim", description: "On leave", group: "Engineering", disabled: true },
  …
];

<Field label="Reviewer">
  <Select options={people} placeholder="Choose a reviewer" />
</Field>`}
      >
        <Stack>
          <Field label="Reviewer">
            <Select options={people} placeholder="Choose a reviewer" />
          </Field>
        </Stack>
      </Section>

      <Section
        title="Load from a server"
        desc="Pass loadOptions to search on the server as the person types. Requests are debounced, and slow earlier responses never overwrite newer ones."
        code={`
<Field label="Repository">
  <Select
    minSearchLength={2}
    loadOptions={async (query) => {
      const res = await fetch(\`/api/repos?search=\${encodeURIComponent(query)}\`);
      const repos = await res.json();
      return repos.map((r) => ({ value: r.id, label: r.name, description: r.full_name }));
    }}
    placeholder="Search repositories"
  />
</Field>

// Laravel route
Route::get('/api/repos', fn (Request $r) =>
  Repo::where('name', 'like', "%{$r->search}%")->limit(8)->get());`}
      >
        <Stack>
          <Field label="Repository" description="Try “portal” or “app”.">
            <Select minSearchLength={2} loadOptions={searchRepos} placeholder="Search repositories" searchPlaceholder="Type to search…" />
          </Field>
        </Stack>
      </Section>

      <Section
        title="Add new options"
        desc="With creatable, typing something that isn't in the list offers to add it. onCreateOption can save it first — the spinner shows while it does."
        code={`
<Select
  multiple
  creatable
  options={labels}
  value={selected}
  onChange={setSelected}
  onCreateOption={async (text) => {
    const label = await api.createLabel(text);
    return { value: label.id, label: label.name };
  }}
/>`}
      >
        <CreatableDemo />
      </Section>

      <Section
        title="Without search"
        desc="For short lists, turn the search off. Typing a letter still jumps to the first option that starts with it."
        code={`
<Select
  searchable={false}
  defaultValue="newest"
  options={[
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
    { value: "name", label: "Name, A to Z" },
  ]}
  aria-label="Sort by"
/>`}
      >
        <Stack>
          <Select
            searchable={false}
            defaultValue="newest"
            aria-label="Sort by"
            options={[
              { value: "newest", label: "Newest first", icon: "bi bi-sort-down" },
              { value: "oldest", label: "Oldest first", icon: "bi bi-sort-up" },
              { value: "name", label: "Name, A to Z", icon: "bi bi-sort-alpha-down" },
              { value: "size", label: "Size, largest first", icon: "bi bi-sort-numeric-down-alt" },
            ]}
          />
        </Stack>
      </Section>

      <Section
        title="Custom option layout"
        desc="renderOption lets you design the rows yourself — avatars, badges, prices — while search, keyboard and selection keep working."
        code={`
<Select
  options={people}
  renderOption={(person, { selected }) => (
    <>
      <Avatar name={person.label} />
      <span className="flex-1">
        <span className={selected ? "font-medium" : ""}>{person.label}</span>
        <span className="block text-xs text-fg-muted">{person.description}</span>
      </span>
    </>
  )}
/>`}
      >
        <Stack>
          <Field label="Owner">
            <Select
              options={people}
              placeholder="Choose an owner"
              renderOption={(p, { selected }) => (
                <>
                  <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    {initials(p.label)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={selected ? "block font-medium" : "block"}>{p.label}</span>
                    <span className="block truncate text-xs text-fg-muted">{p.description}</span>
                  </span>
                </>
              )}
            />
          </Field>
        </Stack>
      </Section>

      <Section
        title="Sizes, corners and states"
        desc="The same size and rounded options as Input and Button, with the same error and disabled styles."
        code={`
<Select size="sm" options={options} />
<Select size="lg" rounded="full" options={options} />

<Field label="Department" error="Choose a department.">
  <Select options={departments} />
</Field>
<Field label="Office" disabled>
  <Select options={offices} defaultValue="mnl" />
</Field>`}
      >
        <Stack>
          <Select size="sm" options={countries} placeholder="Small" aria-label="Small example" />
          <Select size="lg" rounded="full" options={countries} placeholder="Large, pill" aria-label="Large example" />
          <Field label="Department" error="Choose a department.">
            <Select options={[{ value: "eng", label: "Engineering" }, { value: "design", label: "Design" }]} />
          </Field>
          <Field label="Office" disabled>
            <Select options={[{ value: "mnl", label: "Manila" }]} defaultValue="mnl" />
          </Field>
        </Stack>
      </Section>

      <Section
        title="In a form"
        desc="Give it a name and the value is sent with the form like a native select — one field per choice for multiple. Submit without an assignee to see the error."
        code={`
<form action="/tickets" method="post">
  <Field label="Assignee" required>
    <Select name="assignee" options={people} />
  </Field>
  <Field label="Watchers" optional>
    <Select name="watchers[]" multiple options={people} />   {/* Laravel array */}
  </Field>
  <Button type="submit">Create ticket</Button>
</form>

// Inertia
<Select value={form.data.assignee} onChange={(v) => form.setData("assignee", v)} … />`}
      >
        <FormDemo />
      </Section>

      <Section
        title="Inside a modal"
        desc="The dropdown floats above the modal and flips upward when there isn't room below. Escape closes the dropdown first, then the modal."
        code={`
<ModalContent>
  <ModalBody>
    <Field label="Move to project">
      <Select options={projects} />
    </Field>
  </ModalBody>
</ModalContent>`}
      >
        <Modal>
          <ModalTrigger asChild>
            <Button variant="secondary" leadingIcon="bi bi-folder-symlink">Move file</Button>
          </ModalTrigger>
          <ModalContent size="sm">
            <ModalHeader>
              <ModalTitle>Move “Q3 report.pdf”</ModalTitle>
              <ModalDescription>Everyone with access to the project will see it.</ModalDescription>
            </ModalHeader>
            <ModalBody>
              <Field label="Move to project">
                <Select options={repos.slice(0, 12).map((r) => ({ value: r, label: r, icon: "bi bi-folder" }))} placeholder="Choose a project" />
              </Field>
            </ModalBody>
            <ModalFooter>
              <ModalClose asChild><Button variant="ghost">Cancel</Button></ModalClose>
              <ModalClose asChild><Button>Move file</Button></ModalClose>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Section>

      <Section
        title="Keyboard"
        desc="Everything works without a mouse."
        code={`
Enter, Space, ↓   open
Type a letter     open and search
↑ ↓  Home  End    move through options
Enter             choose (toggle with multiple)
Backspace         remove the last chip (multiple)
Escape            close
Tab               close and move on`}
      >
        <p className="text-sm text-fg-muted">Focus any select above and try it.</p>
      </Section>
    </>
  );
}
