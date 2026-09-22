import * as React from "react";
import {
  Button,
  Modal,
  ModalTrigger,
  ModalClose,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  useModal,
} from "@jm/ui";
import { PageHeader, Section } from "../components/Doc";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// A plain text field for the demos (an Input component is coming later).
function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = React.useId();
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <input
        id={id}
        className="h-10 rounded-control border border-border-strong bg-surface px-3 text-[0.9375rem] text-fg outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        {...props}
      />
    </div>
  );
}

/* ---------- demos ---------- */

function BasicDemo() {
  return (
    <Modal>
      <ModalTrigger asChild>
        <Button leadingIcon="bi bi-pencil">Rename project</Button>
      </ModalTrigger>
      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>Rename project</ModalTitle>
          <ModalDescription>The new name shows up for everyone on the team.</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <Field label="Project name" defaultValue="Website refresh" autoFocus />
        </ModalBody>
        <ModalFooter>
          <ModalClose asChild>
            <Button variant="ghost">Cancel</Button>
          </ModalClose>
          <ModalClose asChild>
            <Button>Save name</Button>
          </ModalClose>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function ProgrammaticDemo() {
  const session = useModal();
  const [seconds, setSeconds] = React.useState<number | null>(null);

  const simulate = () => {
    setSeconds(2);
    const tick = setInterval(() => setSeconds((s) => (s && s > 1 ? s - 1 : null)), 1000);
    setTimeout(() => {
      clearInterval(tick);
      setSeconds(null);
      session.open();
    }, 2000);
  };

  return (
    <>
      <Button variant="secondary" onClick={simulate} disabled={seconds !== null}>
        {seconds !== null ? `Opening in ${seconds}…` : "Simulate session timeout"}
      </Button>

      <Modal {...session.modalProps}>
        <ModalContent size="sm">
          <ModalHeader>
            <ModalTitle>Your session is about to end</ModalTitle>
            <ModalDescription>You've been inactive for a while. Stay signed in to keep your unsaved changes.</ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="ghost" onClick={session.close}>Sign out</Button>
            <Button onClick={session.close} autoFocus>Stay signed in</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function ConfirmDemo() {
  const confirm = useModal();
  const [deleting, setDeleting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const remove = async () => {
    setDeleting(true);
    await wait(1600); // your API call
    setDeleting(false);
    setDone(true);
    confirm.close();
  };

  return (
    <>
      <Button variant="danger" leadingIcon="bi bi-trash3" onClick={() => { setDone(false); confirm.open(); }}>
        Delete project
      </Button>
      {done && <p className="text-sm text-fg-muted" role="status">Project deleted.</p>}

      <Modal {...confirm.modalProps}>
        <ModalContent size="sm" dismissible={!deleting}>
          <ModalHeader>
            <ModalTitle>Delete "Website refresh"?</ModalTitle>
            <ModalDescription>Its 14 pages and all uploaded files will be removed. This can't be undone.</ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="ghost" onClick={confirm.close} disabled={deleting}>Keep project</Button>
            <Button variant="danger" onClick={remove} loading={deleting} spinnerPlacement="start" loadingLabel="Deleting…">
              Delete project
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function ControlledDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>Invite people</Button>
      <p className="text-sm text-fg-muted">open = {String(open)}</p>
      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent size="sm">
          <ModalHeader>
            <ModalTitle>Invite people</ModalTitle>
            <ModalDescription>They'll get an email with a link to join this workspace.</ModalDescription>
          </ModalHeader>
          <ModalBody>
            <Field label="Email addresses" placeholder="ana@example.com, ben@example.com" autoFocus />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => wait(1200).then(() => setOpen(false))} spinnerPlacement="start" loadingLabel="Sending…">
              Send invites
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function SizesDemo() {
  const sizes = [
    ["sm", "Small"],
    ["md", "Medium"],
    ["lg", "Large"],
    ["xl", "Extra large"],
  ] as const;
  return (
    <>
      {sizes.map(([size, label]) => (
        <Modal key={size}>
          <ModalTrigger asChild>
            <Button variant="secondary">{label}</Button>
          </ModalTrigger>
          <ModalContent size={size}>
            <ModalHeader>
              <ModalTitle>{label} modal</ModalTitle>
              <ModalDescription>size="{size}"</ModalDescription>
            </ModalHeader>
            <ModalBody>
              <p className="text-fg-muted">
                Pick the smallest size that fits the content. Short confirmations suit small; forms suit medium; tables
                and previews suit large or extra large.
              </p>
            </ModalBody>
            <ModalFooter>
              <ModalClose asChild>
                <Button>Done</Button>
              </ModalClose>
            </ModalFooter>
          </ModalContent>
        </Modal>
      ))}
    </>
  );
}

function LongContentDemo() {
  return (
    <Modal>
      <ModalTrigger asChild>
        <Button variant="secondary" leadingIcon="bi bi-file-text">Read the terms</Button>
      </ModalTrigger>
      <ModalContent size="lg">
        <ModalHeader>
          <ModalTitle>Terms of service</ModalTitle>
          <ModalDescription>Last updated 1 September 2026</ModalDescription>
        </ModalHeader>
        <ModalBody className="grid gap-3 text-fg-muted">
          {Array.from({ length: 12 }, (_, i) => (
            <p key={i}>
              {i + 1}. These terms cover how you may use the service, what we do with the content you upload, and what
              happens if either of us ends the agreement. Read them in full before accepting.
            </p>
          ))}
        </ModalBody>
        <ModalFooter>
          <ModalClose asChild>
            <Button variant="ghost">Decline</Button>
          </ModalClose>
          <ModalClose asChild>
            <Button>Accept</Button>
          </ModalClose>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function RequiredChoiceDemo() {
  const cookies = useModal();
  const [choice, setChoice] = React.useState("");
  const pick = (value: string) => {
    setChoice(value);
    cookies.close();
  };
  return (
    <>
      <Button variant="secondary" onClick={cookies.open}>Show cookie choice</Button>
      {choice && <p className="text-sm text-fg-muted" role="status">You chose: {choice}.</p>}
      <Modal {...cookies.modalProps}>
        <ModalContent size="sm" dismissible={false}>
          <ModalHeader>
            <ModalTitle>Choose your cookie settings</ModalTitle>
            <ModalDescription>We use cookies to keep you signed in and to measure which pages people use.</ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="secondary" onClick={() => pick("essential only")}>Essential only</Button>
            <Button onClick={() => pick("all cookies")}>Allow all</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

/* ---------- page ---------- */

export function ModalPage() {
  return (
    <>
      <PageHeader
        title="Modal"
        intro="Asks for focused attention: a decision, a short form, or something that must be read before moving on. The page behind it can't be used until the modal closes, so keep modals for moments that need that."
        importLine={`import {
  Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle,
  ModalDescription, ModalBody, ModalFooter, ModalClose, useModal,
} from "@jm/ui";`}
      />

      <Section
        title="Open with a button"
        desc={
          <>
            Wrap any button in <code className="font-mono text-[0.8125rem]">ModalTrigger</code>. Close with{" "}
            <code className="font-mono text-[0.8125rem]">ModalClose</code>, the × button, Escape, or a click on the
            backdrop.
          </>
        }
        code={`
<Modal>
  <ModalTrigger asChild>
    <Button leadingIcon="bi bi-pencil">Rename project</Button>
  </ModalTrigger>

  <ModalContent size="sm">
    <ModalHeader>
      <ModalTitle>Rename project</ModalTitle>
      <ModalDescription>The new name shows up for everyone on the team.</ModalDescription>
    </ModalHeader>
    <ModalBody>
      <label htmlFor="name">Project name</label>
      <input id="name" defaultValue="Website refresh" autoFocus />
    </ModalBody>
    <ModalFooter>
      <ModalClose asChild><Button variant="ghost">Cancel</Button></ModalClose>
      <Button onClick={save}>Save name</Button>
    </ModalFooter>
  </ModalContent>
</Modal>`}
      >
        <BasicDemo />
      </Section>

      <Section
        title="Open from code"
        desc={
          <>
            Define the modal once, then open it from anywhere with{" "}
            <code className="font-mono text-[0.8125rem]">useModal()</code> — after a timer, a failed request, or a
            websocket message. No trigger button needed.
          </>
        }
        code={`
function App() {
  const session = useModal();

  useEffect(() => {
    const onIdle = () => session.open();
    idleTimer.on("warning", onIdle);
    return () => idleTimer.off("warning", onIdle);
  }, []);

  return (
    <Modal {...session.modalProps}>
      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>Your session is about to end</ModalTitle>
          <ModalDescription>Stay signed in to keep your unsaved changes.</ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button variant="ghost" onClick={signOut}>Sign out</Button>
          <Button onClick={session.close} autoFocus>Stay signed in</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// useModal() returns { isOpen, open, close, toggle, modalProps }`}
      >
        <ProgrammaticDemo />
      </Section>

      <Section
        title="Controlled"
        desc={
          <>
            Or hold the state yourself with <code className="font-mono text-[0.8125rem]">open</code> and{" "}
            <code className="font-mono text-[0.8125rem]">onOpenChange</code>, e.g. to open a modal from a URL
            parameter.
          </>
        }
        code={`
const [open, setOpen] = useState(searchParams.has("invite"));

<Button onClick={() => setOpen(true)}>Invite people</Button>

<Modal open={open} onOpenChange={setOpen}>
  <ModalContent size="sm">
    …
    <ModalFooter>
      <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      <Button onClick={() => sendInvites().then(() => setOpen(false))}>Send invites</Button>
    </ModalFooter>
  </ModalContent>
</Modal>`}
      >
        <ControlledDemo />
      </Section>

      <Section
        title="Confirm and wait"
        desc="For destructive actions. While the request runs, the button shows a spinner and the modal can't be dismissed, so the person can't close it halfway through."
        code={`
const confirm = useModal();
const [deleting, setDeleting] = useState(false);

async function remove() {
  setDeleting(true);
  await api.deleteProject(id);
  setDeleting(false);
  confirm.close();
}

<Modal {...confirm.modalProps}>
  <ModalContent size="sm" dismissible={!deleting}>
    <ModalHeader>
      <ModalTitle>Delete "Website refresh"?</ModalTitle>
      <ModalDescription>Its 14 pages and all uploaded files will be removed. This can't be undone.</ModalDescription>
    </ModalHeader>
    <ModalFooter>
      <Button variant="ghost" onClick={confirm.close} disabled={deleting}>Keep project</Button>
      <Button variant="danger" onClick={remove} loading={deleting}
        spinnerPlacement="start" loadingLabel="Deleting…">
        Delete project
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>`}
      >
        <ConfirmDemo />
      </Section>

      <Section
        title="Sizes"
        desc="Small for confirmations, medium (the default) for forms, large and extra large for tables and previews. On phones every size fills the width."
        code={`
<ModalContent size="sm">…</ModalContent>
<ModalContent size="md">…</ModalContent>   {/* default */}
<ModalContent size="lg">…</ModalContent>
<ModalContent size="xl">…</ModalContent>`}
      >
        <SizesDemo />
      </Section>

      <Section
        title="Long content"
        desc="When the content is taller than the screen, the modal scrolls as a whole and the page behind it stays put."
        code={`
<ModalContent size="lg">
  <ModalHeader>…</ModalHeader>
  <ModalBody>{longTerms}</ModalBody>
  <ModalFooter>…</ModalFooter>
</ModalContent>`}
      >
        <LongContentDemo />
      </Section>

      <Section
        title="Required choice"
        desc={
          <>
            With <code className="font-mono text-[0.8125rem]">dismissible={"{false}"}</code>, Escape and backdrop clicks
            do nothing and the × is hidden. The person has to pick one of the actions. Use sparingly.
          </>
        }
        code={`
<ModalContent size="sm" dismissible={false}>
  <ModalHeader>
    <ModalTitle>Choose your cookie settings</ModalTitle>
  </ModalHeader>
  <ModalFooter>
    <Button variant="secondary" onClick={() => choose("essential")}>Essential only</Button>
    <Button onClick={() => choose("all")}>Allow all</Button>
  </ModalFooter>
</ModalContent>`}
      >
        <RequiredChoiceDemo />
      </Section>

      <Section
        title="Accessibility"
        desc="Built on the native dialog element, so screen readers announce it as a dialog and the page behind it is unreachable."
        code={`
// Focus moves into the modal on open (use autoFocus to pick the element)
// and returns to the button that opened it on close.
// ModalTitle and ModalDescription are announced automatically.

// Without a visible title, label the modal yourself:
<ModalContent aria-label="Image preview">…</ModalContent>`}
      >
        <ul className="grid gap-1.5 text-sm text-fg-muted">
          <li>Escape closes it (unless it's not dismissible).</li>
          <li>Tab stays inside the modal while it's open.</li>
          <li>The page doesn't scroll behind it.</li>
          <li>With reduced motion on, it fades instead of moving.</li>
        </ul>
      </Section>
    </>
  );
}
