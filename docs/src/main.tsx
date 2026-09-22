import * as React from "react";
import { createRoot } from "react-dom/client";
import { Button } from "@jm/ui";
import { GettingStarted } from "./pages/GettingStarted";
import { ButtonPage } from "./pages/ButtonPage";
import { ModalPage } from "./pages/ModalPage";
import { InputPage } from "./pages/InputPage";
import { TextareaPage } from "./pages/TextareaPage";
import { SelectPage } from "./pages/SelectPage";
import { EditorPage } from "./pages/EditorPage";
import { TabsPage } from "./pages/TabsPage";
import { PillsPage } from "./pages/PillsPage";
import { ActivityPage } from "./pages/ActivityPage";
import { TypographyPage } from "./pages/TypographyPage";
import { AvatarPage } from "./pages/AvatarPage";
import { CardPage } from "./pages/CardPage";
import { DropdownPage } from "./pages/DropdownPage";
import { TablePage } from "./pages/TablePage";
import { TimelinePage } from "./pages/TimelinePage";

// Add each new component page here; the nav and routing pick it up automatically.
const pages = [
  { path: "getting-started", title: "Getting started", group: "Guide", Page: GettingStarted },
  { path: "activity", title: "Activity indicators", group: "Components", Page: ActivityPage },
  { path: "avatar", title: "Avatar", group: "Components", Page: AvatarPage },
  { path: "button", title: "Button", group: "Components", Page: ButtonPage },
  { path: "card", title: "Card", group: "Components", Page: CardPage },
  { path: "dropdown", title: "Dropdown menu", group: "Components", Page: DropdownPage },
  { path: "editor", title: "Editor", group: "Components", Page: EditorPage },
  { path: "input", title: "Input", group: "Components", Page: InputPage },
  { path: "modal", title: "Modal", group: "Components", Page: ModalPage },
  { path: "pills", title: "Pills", group: "Components", Page: PillsPage },
  { path: "select", title: "Select", group: "Components", Page: SelectPage },
  { path: "table", title: "Table", group: "Components", Page: TablePage },
  { path: "tabs", title: "Tabs", group: "Components", Page: TabsPage },
  { path: "textarea", title: "Textarea", group: "Components", Page: TextareaPage },
  { path: "timeline", title: "Timeline", group: "Components", Page: TimelinePage },
  { path: "typography", title: "Typography", group: "Components", Page: TypographyPage },
];

const VERSION = "0.22.0";

function useHashRoute() {
  const read = () => window.location.hash.replace(/^#\/?/, "") || pages[0].path;
  const [route, setRoute] = React.useState(read);
  React.useEffect(() => {
    const onChange = () => {
      setRoute(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

const svg = (paths: string[]) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {paths.map((d) => <path key={d} d={d} />)}
  </svg>
);
const MoonIcon = () => svg(["M15.5 12.2A6 6 0 0 1 7.8 4.5a6 6 0 1 0 7.7 7.7z"]);
const SunIcon = () => svg(["M10 3v1.5", "M10 15.5V17", "M3 10h1.5", "M15.5 10H17", "M5 5l1 1", "M14 14l1 1", "M5 15l1-1", "M14 6l1-1", "M13 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"]);

function Nav({ route, onNavigate }: { route: string; onNavigate?: () => void }) {
  const groups = [...new Set(pages.map((p) => p.group))];
  return (
    <nav aria-label="Documentation" className="grid gap-6">
      {groups.map((g) => (
        <div key={g}>
          <p className="px-3 text-[0.8125rem] font-medium text-fg-muted">{g}</p>
          <ul className="mt-1.5 grid gap-0.5">
            {pages.filter((p) => p.group === g).map((p) => {
              const active = p.path === route;
              return (
                <li key={p.path}>
                  <a
                    href={`#/${p.path}`}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={
                      "block rounded-control px-3 py-1.5 text-[0.9375rem] focus-visible:outline-2 focus-visible:outline-ring " +
                      (active ? "bg-secondary-hover font-medium text-fg" : "text-fg-muted hover:text-fg")
                    }
                  >
                    {p.title}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function App() {
  const route = useHashRoute();
  const current = pages.find((p) => p.path === route) ?? pages[0];
  const [dark, setDark] = React.useState(() => document.documentElement.classList.contains("dark"));
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);
  React.useEffect(() => {
    document.title = `${current.title} · @jm/ui`;
  }, [current]);

  const themeButton = (
    <Button variant="ghost" iconOnly aria-label={dark ? "Use light theme" : "Use dark theme"} onClick={() => setDark((d) => !d)}>
      {dark ? <SunIcon /> : <MoonIcon />}
    </Button>
  );

  return (
    <div className="mx-auto max-w-6xl md:grid md:grid-cols-[13rem_minmax(0,1fr)] md:gap-10 md:px-8">
      {/* Mobile top bar */}
      <div className="sticky top-[env(safe-area-inset-top,0px)] z-10 flex items-center justify-between border-b border-border bg-bg px-5 py-2.5 md:hidden">
        <a href="#/getting-started" className="font-semibold tracking-[-0.01em]">@jm/ui</a>
        <div className="flex items-center gap-1">
          {themeButton}
          <Button
            variant="secondary"
            size="sm"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            trailingIcon={menuOpen ? "bi bi-x-lg" : "bi bi-list"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {current.title}
          </Button>
        </div>
      </div>
      {menuOpen && (
        <div id="mobile-nav" className="border-b border-border bg-bg px-2 py-4 md:hidden">
          <Nav route={current.path} onNavigate={() => setMenuOpen(false)} />
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:block">
        <div className="sticky top-0 flex max-h-screen flex-col gap-8 overflow-y-auto pb-10 pt-10">
          <div className="flex items-center justify-between px-3">
            <div>
              <a href="#/getting-started" className="font-semibold tracking-[-0.01em]">@jm/ui</a>
              <p className="text-[0.8125rem] text-fg-muted">Version {VERSION}</p>
            </div>
            {themeButton}
          </div>
          <Nav route={current.path} />
        </div>
      </aside>

      <main className="min-w-0 px-5 pb-20 pt-8 md:px-0 md:pt-10">
        <current.Page />
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
