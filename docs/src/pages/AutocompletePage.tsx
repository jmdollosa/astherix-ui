import * as React from "react";
import { Autocomplete, Field, Text, type AutocompleteItem } from "@jm/ui";
import { PageHeader, Section } from "../components/Doc";

const cities = [
  "Manila", "Quezon City", "Makati", "Taguig", "Pasig", "Mandaluyong", "Caloocan", "Parañaque", "Las Piñas", "Marikina",
  "Cebu City", "Mandaue", "Lapu-Lapu", "Davao City", "Cagayan de Oro", "Iloilo City", "Bacolod", "Baguio", "Laoag",
  "Vigan", "Dagupan", "Angeles", "San Fernando", "Olongapo", "Batangas City", "Lipa", "Lucena", "Naga", "Legazpi",
  "Tacloban", "Zamboanga City", "General Santos", "Butuan", "Iligan", "Puerto Princesa", "Dumaguete", "Tagbilaran",
];

const clients = [
  { value: "Northwind Traders", description: "12 invoices · ₱312,400 billed", icon: "bi bi-building" },
  { value: "Blue Harbor Café", description: "8 invoices · ₱96,250 billed", icon: "bi bi-cup-hot" },
  { value: "Luzon Freight", description: "21 invoices · ₱1.2M billed", icon: "bi bi-truck" },
  { value: "Pixel & Pine", description: "4 invoices · ₱38,000 billed", icon: "bi bi-palette" },
  { value: "Mabuhay Tours", description: "6 invoices · ₱74,900 billed", icon: "bi bi-airplane" },
  { value: "Bayanihan Build", description: "15 invoices · ₱640,000 billed", icon: "bi bi-bricks" },
  { value: "Kape Kultura", description: "3 invoices · ₱21,300 billed", icon: "bi bi-cup" },
  { value: "Northgate Clinic", description: "9 invoices · ₱158,000 billed", icon: "bi bi-heart-pulse" },
];

// A pretend server: finds clients whose name contains the query, a little slowly.
async function searchClients(q: string, { signal }: { signal: AbortSignal }): Promise<AutocompleteItem[]> {
  await new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, 450);
    signal.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("aborted", "AbortError"));
    });
  });
  const n = q.toLowerCase();
  return clients.filter((c) => c.value.toLowerCase().includes(n));
}

const domains = ["gmail.com", "yahoo.com", "outlook.com", "icloud.com", "proton.me"];
function emailSuggestions(q: string): AutocompleteItem[] {
  const [name, typed = ""] = q.split("@");
  if (!name || !q.includes("@")) return [];
  return domains.filter((d) => d.startsWith(typed.toLowerCase())).map((d) => `${name}@${d}`);
}

const everything: AutocompleteItem[] = [
  ...clients.slice(0, 5).map((c) => ({ value: c.value, icon: c.icon, group: "Clients" })),
  ...["INV-1047", "INV-1046", "INV-1045", "INV-1040", "INV-1033"].map((v) => ({ value: v, icon: "bi bi-receipt", group: "Invoices" })),
  ...["Payment settings", "Reminder emails", "Team members", "Tax rates"].map((v) => ({ value: v, icon: "bi bi-gear", group: "Settings" })),
];

function Stack({ children }: { children: React.ReactNode }) {
  return <div className="grid w-full max-w-md gap-3">{children}</div>;
}

function CityDemo() {
  const [city, setCity] = React.useState("");
  return (
    <Stack>
      <Field label="City" description="Try “la”, “san” or “cag”, then press Tab to accept the faint completion.">
        <Autocomplete value={city} onChange={setCity} suggestions={cities} leadingIcon="bi bi-geo-alt" placeholder="Start typing a city" clearable />
      </Field>
      <Text size="sm" tone="muted">value = {JSON.stringify(city)}</Text>
    </Stack>
  );
}

function SearchDemo() {
  const [searched, setSearched] = React.useState("");
  return (
    <Stack>
      <Autocomplete
        type="search"
        aria-label="Search invoices, clients and settings"
        placeholder="Search…"
        leadingIcon="bi bi-search"
        rounded="full"
        suggestions={everything}
        recentKey="jm-ui-docs:recent-searches"
        onSubmit={setSearched}
        onSelectSuggestion={(it) => setSearched(it.value)}
        clearable
      />
      <Text size="sm" tone="muted">{searched ? `Searched for “${searched}”.` : "Search for something, then clear the field and click it again to see your recent searches."}</Text>
    </Stack>
  );
}

function ServerDemo() {
  const [picked, setPicked] = React.useState("");
  return (
    <Stack>
      <Field label="Bill to" description="Type a client's name — or anything, for a new client.">
        <Autocomplete
          loadSuggestions={searchClients}
          minLength={2}
          onSelectSuggestion={(it) => setPicked(it.value)}
          onChange={() => setPicked("")}
          placeholder="Client name"
          emptyMessage="No saved client with that name — it'll be added as new."
        />
      </Field>
      <Text size="sm" tone="muted">{picked ? `Existing client: ${picked}` : "\u00a0"}</Text>
    </Stack>
  );
}

export function AutocompletePage() {
  return (
    <>
      <PageHeader
        title="Autocomplete"
        intro="A text field that suggests as you type. People can always type their own answer — suggestions are shortcuts, not rules. When the answer must come from a list (a country, an assignee), use Select instead."
        importLine={`import { Autocomplete, Field } from "@jm/ui";`}
      />

      <Section
        title="Suggestions as you type"
        desc="Matches rank the way people expect: names that start with what you typed first, then words inside names. The matching part is highlighted, and the rest of the best match appears faintly in the field — Tab or → accepts it."
        code={`
const [city, setCity] = useState("");

<Field label="City">
  <Autocomplete
    value={city}
    onChange={setCity}           // free text
    suggestions={cities}         // strings, or { value, label, description, icon, group }
    leadingIcon="bi bi-geo-alt"
    clearable
  />
</Field>`}
      >
        <CityDemo />
      </Section>

      <Section
        title="Search with recent searches"
        desc="onSubmit runs when Enter is pressed on your own text. With recentKey, submitted and picked values are remembered in the browser and offered when the field is empty — each can be removed, or clear them all. Suggestions can be grouped."
        code={`
<Autocomplete
  type="search"
  aria-label="Search"
  leadingIcon="bi bi-search"
  rounded="full"
  suggestions={[
    { value: "Northwind Traders", icon: "bi bi-building", group: "Clients" },
    { value: "INV-1047", icon: "bi bi-receipt", group: "Invoices" },
    …
  ]}
  recentKey="recent-searches"
  onSubmit={(q) => router.get("/search", { q })}
  onSelectSuggestion={(item) => router.visit(urlFor(item))}
/>`}
      >
        <SearchDemo />
      </Section>

      <Section
        title="Suggestions from your server"
        desc="loadSuggestions fetches as the person types — debounced, with the previous request cancelled, so slow replies never overwrite newer ones. Suggestions can carry a description and an icon."
        code={`
<Autocomplete
  minLength={2}
  loadSuggestions={async (q, { signal }) => {
    const res = await fetch(\`/api/clients?search=\${encodeURIComponent(q)}\`, { signal });
    const clients = await res.json();
    return clients.map((c) => ({ value: c.name, description: \`\${c.invoices_count} invoices\` }));
  }}
  onSelectSuggestion={(item) => fillClientDetails(item.value)}
  emptyMessage="No saved client with that name — it'll be added as new."
/>

// Laravel
Route::get('/api/clients', fn (Request $r) =>
  Client::where('name', 'like', "%{$r->search}%")->withCount('invoices')->limit(8)->get());`}
      >
        <ServerDemo />
      </Section>

      <Section
        title="Suggestions from a function"
        desc="Pass a function to build suggestions from what's typed — like finishing an email address once the @ is typed."
        code={`
const domains = ["gmail.com", "yahoo.com", "outlook.com", "icloud.com"];

<Autocomplete
  type="email"
  suggestions={(q) => {
    const [name, typed = ""] = q.split("@");
    if (!q.includes("@")) return [];
    return domains.filter((d) => d.startsWith(typed)).map((d) => \`\${name}@\${d}\`);
  }}
/>`}
      >
        <Stack>
          <Field label="Email" description="Type “ana@g”.">
            <Autocomplete type="email" suggestions={emailSuggestions} leadingIcon="bi bi-envelope" placeholder="you@example.com" />
          </Field>
        </Stack>
      </Section>

      <Section
        title="Autocomplete or Select?"
        desc="They look alike but answer different questions."
        code={`
Autocomplete   the answer is free text; suggestions help
               → search boxes, addresses, cities, names with free entry, email

Select         the answer must be one of the options
               → country, assignee, status, category`}
      >
        <Text size="sm" tone="muted">If typing an answer that isn't in the list would be a mistake, use Select.</Text>
      </Section>

      <Section
        title="Keyboard"
        desc="The standard combobox pattern with an editable field, so screen readers announce suggestions and how many there are."
        code={`
Type               suggestions appear
↓ ↑                move through suggestions
Enter              pick the highlighted one — or submit your own text
Tab  →             accept the faint inline completion
Escape             close the list (in a search box, again to clear it)
Shift + Delete     remove a highlighted recent search`}
      >
        <Text size="sm" tone="muted">Try it in any field above.</Text>
      </Section>
    </>
  );
}
