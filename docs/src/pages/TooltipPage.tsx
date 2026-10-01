import * as React from "react";
import {
  Button,
  Tooltip,
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
} from "@astherix/ui";
import { PageHeader, Section } from "../components/Doc";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const mod = isMac ? "⌘" : "Ctrl";

export function TooltipPage() {
  return (
    <>
      <PageHeader
        title="Tooltip"
        intro="A short hint for an element — the name of an icon-only button, a keyboard shortcut, the full text of something cut short. It shows on hover and on keyboard focus, and never on touch screens, so don't put anything there people need."
        importLine={`import { Tooltip } from "@astherix/ui";`}
      />

      <Section
        title="Icon buttons"
        desc="The common case. Move along the row: once one tooltip is showing, the next appears at once."
        code={`
<Tooltip content="Archive">
  <Button variant="ghost" iconOnly icon="bi bi-archive" aria-label="Archive" />
</Tooltip>`}
      >
        <div className="flex gap-1">
          {[
            ["bi bi-reply", "Reply"],
            ["bi bi-forward", "Forward"],
            ["bi bi-archive", "Archive"],
            ["bi bi-trash3", "Delete"],
          ].map(([icon, label]) => (
            <Tooltip key={label} content={label}>
              <Button variant="ghost" iconOnly icon={icon} aria-label={label} />
            </Tooltip>
          ))}
        </div>
      </Section>

      <Section
        title="Shortcuts and sides"
        desc={<>Tooltips can hold a little formatting, such as a shortcut. <code>side</code> picks where it goes; it flips when there's no room.</>}
        code={`
<Tooltip side="bottom" content={<>Save draft <span className="opacity-60">${mod === "⌘" ? "⌘S" : "Ctrl+S"}</span></>}>
  <Button variant="secondary">Save draft</Button>
</Tooltip>`}
      >
        <div className="flex flex-wrap gap-2">
          {(["top", "right", "bottom", "left"] as const).map((side) => (
            <Tooltip
              key={side}
              side={side}
              content={
                <span className="flex items-center gap-2">
                  Save draft <span className="opacity-60">{mod === "⌘" ? "⌘S" : "Ctrl+S"}</span>
                </span>
              }
            >
              <Button variant="secondary">{side}</Button>
            </Tooltip>
          ))}
        </div>
      </Section>

      <Section
        title="Truncated text"
        desc={<>Show the full text only when it's cut off: measure it and pass <code>disabled</code> when it fits.</>}
        code={`
<Tooltip content={client.name} disabled={!isTruncated}>
  <span tabIndex={0} className="block max-w-40 truncate">{client.name}</span>
</Tooltip>`}
      >
        <TruncatedDemo />
      </Section>

      <Section
        title="Inside a modal"
        desc="Tooltips use the browser's top layer, so they show above modals, drawers and boxes with overflow hidden — no z-index settings needed."
        code={`
<ModalContent>
  <Tooltip content="Copy invoice link">
    <Button iconOnly icon="bi bi-link-45deg" aria-label="Copy link" />
  </Tooltip>
</ModalContent>`}
      >
        <Modal>
          <ModalTrigger asChild>
            <Button variant="secondary">Open a modal</Button>
          </ModalTrigger>
          <ModalContent size="sm">
            <ModalHeader>
              <ModalTitle>Share INV-1047</ModalTitle>
            </ModalHeader>
            <ModalBody className="flex gap-1 pb-6">
              <Tooltip content="Copy invoice link">
                <Button variant="secondary" iconOnly icon="bi bi-link-45deg" aria-label="Copy link" />
              </Tooltip>
              <Tooltip content="Email to client">
                <Button variant="secondary" iconOnly icon="bi bi-envelope" aria-label="Email" />
              </Tooltip>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Section>

      <Section
        title="Accessibility"
        desc="The tooltip is linked to its element, so screen readers read it with the element. Disabled buttons don't receive hover or focus — wrap them in a focusable span, or explain why next to the button instead."
        code={`
// Default: read after the element's own name ("Save draft, Command S")
<Tooltip content="⌘S">…</Tooltip>

// The tooltip *is* the name (an icon-only control with no aria-label)
<Tooltip as="label" content="Archive"><button>…</button></Tooltip>

// Wait longer (or less) before it shows. Keyboard focus shows it at once.
<Tooltip delay={800} content="…">…</Tooltip>`}
      >
        <ul className="grid gap-1.5 text-sm text-fg-muted">
          <li>Escape hides it without moving focus.</li>
          <li>The pointer can move onto the tooltip, so it can be read at high zoom.</li>
          <li>A mouse click doesn't pop it up; keyboard focus does.</li>
        </ul>
      </Section>
    </>
  );
}

function TruncatedDemo() {
  const names = ["Blue Harbor Café", "Northwind Traders International Holdings, Inc."];
  return (
    <ul className="grid w-56 gap-1 rounded-card border border-border bg-surface p-2 text-sm">
      {names.map((n) => (
        <TruncatedName key={n} name={n} />
      ))}
    </ul>
  );
}

function TruncatedName({ name }: { name: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [cut, setCut] = React.useState(false);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (el) setCut(el.scrollWidth > el.clientWidth);
  }, [name]);
  return (
    <li className="rounded-control px-2 py-1.5">
      <Tooltip content={name} disabled={!cut}>
        <span ref={ref} tabIndex={cut ? 0 : undefined} className="block truncate rounded-control-sm focus-visible:outline-2 focus-visible:outline-ring">
          {name}
        </span>
      </Tooltip>
    </li>
  );
}
