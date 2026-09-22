import * as React from "react";
import { IconButton, Avatar, Text, toast } from "@jm/ui";
import { PageHeader, Section } from "../components/Doc";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function PostDemo() {
  const [liked, setLiked] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const likes = 128 + (liked ? 1 : 0);
  return (
    <article className="grid w-full max-w-sm gap-3 rounded-card border border-border bg-surface p-4">
      <header className="flex items-center gap-3">
        <Avatar name="Maria Santos" size="sm" decorative />
        <div className="grid min-w-0 flex-1 leading-tight">
          <span className="text-sm font-medium">Maria Santos</span>
          <span className="text-xs text-fg-muted">2 hours ago</span>
        </div>
        <IconButton icon="bi bi-three-dots" label="More options" size="sm" />
      </header>
      <p className="text-sm leading-relaxed">Just sent my 100th invoice this year 🎉 The reminders feature alone saved me hours of awkward follow-ups.</p>
      <footer className="-ms-2 flex items-center gap-1">
        <IconButton icon="bi bi-heart" pressedIcon="bi bi-heart-fill" tone="danger" label="Like" pressed={liked} onPressedChange={setLiked} />
        <span className="w-8 text-sm tabular-nums text-fg-muted" aria-live="polite">{likes}</span>
        <IconButton icon="bi bi-chat" label="Comment" />
        <IconButton icon="bi bi-send" label="Share" onClick={() => toast("Link copied")} />
        <span className="flex-1" />
        <IconButton icon="bi bi-bookmark" pressedIcon="bi bi-bookmark-fill" tone="primary" label="Save post" pressed={saved} onPressedChange={(v) => { setSaved(v); toast(v ? "Saved to your list" : "Removed from saved"); }} />
      </footer>
    </article>
  );
}

function RowDemo() {
  return (
    <ul className="grid w-full max-w-lg divide-y divide-border rounded-card border border-border bg-surface">
      {[["INV-1047", "Northwind Traders", "₱48,200"], ["INV-1046", "Blue Harbor Café", "₱12,750"], ["INV-1045", "Luzon Freight", "₱96,000"]].map(([no, client, amt]) => (
        <li key={no} className="group/row flex items-center gap-3 px-3 py-2 text-sm">
          <span className="w-20 font-mono text-[0.8125rem] text-fg-muted">{no}</span>
          <span className="min-w-0 flex-1 truncate">{client}</span>
          <span className="tabular-nums">{amt}</span>
          <span className="flex">
            <IconButton icon="bi bi-download" label={`Download ${no}`} size="sm" onClick={() => wait(1200).then(() => toast.success(`${no}.pdf downloaded`))} />
            <IconButton icon="bi bi-pencil" label={`Edit ${no}`} size="sm" />
            <IconButton icon="bi bi-trash" label={`Delete ${no}`} size="sm" tone="danger" onClick={() => toast(`${no} deleted`, { action: { label: "Undo", onClick: () => undefined } })} />
          </span>
        </li>
      ))}
    </ul>
  );
}

export function IconButtonPage() {
  const [star, setStar] = React.useState(true);
  return (
    <>
      <PageHeader
        title="Icon button"
        intro="When the icon itself is the button — like, save, share, delete. Press it and the icon squishes while a ripple spreads out from it; as a toggle, it swaps to a filled icon and pops with a little burst. (For an icon inside a button-shaped box, use Button with iconOnly.)"
        importLine={`import { IconButton } from "@jm/ui";`}
      />

      <Section
        title="In a post"
        desc="Try Like and Save: the outline icon becomes filled, pops, and throws a small burst of particles. Press and hold any icon to feel it squish. Share shows a toast."
        code={`
<IconButton
  icon="bi bi-heart"
  pressedIcon="bi bi-heart-fill"
  tone="danger"
  label="Like"
  pressed={liked}
  onPressedChange={setLiked}
/>
<IconButton icon="bi bi-send" label="Share" onClick={share} />`}
      >
        <PostDemo />
      </Section>

      <Section
        title="Row actions"
        desc="Plain icons keep dense lists calm: a soft halo appears on hover. Download returns a Promise, so a spinner shows until it's done. Each button's label names its row, so screen readers say “Delete INV-1047”, not just “Delete”."
        code={`
<IconButton icon="bi bi-download" label={\`Download \${no}\`} size="sm" onClick={() => api.download(no)} />  // a Promise → spinner
<IconButton icon="bi bi-trash" label={\`Delete \${no}\`} size="sm" tone="danger" onClick={remove} />`}
      >
        <RowDemo />
      </Section>

      <Section
        title="Looks and colors"
        desc="plain (just the icon), soft (a tinted circle) or solid — in the same colors as Switch and Slider, or any CSS color. Square corners too."
        code={`
<IconButton variant="plain" tone="primary" icon="bi bi-lightning-charge" label="Quick action" />
<IconButton variant="soft" tone="success" icon="bi bi-check-lg" label="Approve" />
<IconButton variant="solid" tone="danger" icon="bi bi-trash" label="Delete" />
<IconButton variant="soft" tone="#7c3aed" shape="square" icon="bi bi-magic" label="Enhance" />`}
      >
        <div className="grid gap-4">
          {(["plain", "soft", "solid"] as const).map((v) => (
            <div key={v} className="flex flex-wrap items-center gap-3">
              <span className="w-12 text-xs text-fg-muted">{v}</span>
              <IconButton variant={v} icon="bi bi-house" label="Home" />
              <IconButton variant={v} tone="primary" icon="bi bi-lightning-charge" label="Quick action" />
              <IconButton variant={v} tone="secondary" icon="bi bi-check-lg" label="Approve" />
              <IconButton variant={v} tone="tertiary" icon="bi bi-fire" label="Trending" />
              <IconButton variant={v} tone="danger" icon="bi bi-trash" label="Delete" />
              <IconButton variant={v} tone="#7c3aed" shape="square" icon="bi bi-magic" label="Enhance" />
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Toggles"
        desc="Anything on/off: pass pressed (or defaultPressed) and it becomes a toggle button — screen readers hear “pressed” or “not pressed”. pressedIcon swaps the icon while it's on."
        code={`
<IconButton icon="bi bi-star" pressedIcon="bi bi-star-fill" tone="warning" label="Star" pressed={starred} onPressedChange={setStarred} />
<IconButton icon="bi bi-pin-angle" pressedIcon="bi bi-pin-angle-fill" label="Pin" defaultPressed={false} />
<IconButton icon="bi bi-mic-mute" pressedIcon="bi bi-mic" variant="soft" label="Microphone" defaultPressed />
<IconButton … burst={false} />   // no particles`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <IconButton icon="bi bi-star" pressedIcon="bi bi-star-fill" tone="warning" label="Star" pressed={star} onPressedChange={setStar} size="lg" />
          <IconButton icon="bi bi-pin-angle" pressedIcon="bi bi-pin-angle-fill" tone="primary" label="Pin" defaultPressed={false} size="lg" />
          <IconButton icon="bi bi-bell-slash" pressedIcon="bi bi-bell" tone="primary" variant="soft" label="Notifications" defaultPressed size="lg" />
          <IconButton icon="bi bi-mic-mute" pressedIcon="bi bi-mic" tone="success" variant="soft" label="Microphone" defaultPressed={false} size="lg" burst={false} />
          <IconButton icon="bi bi-eye-slash" pressedIcon="bi bi-eye" label="Show amounts" defaultPressed size="lg" burst={false} />
        </div>
      </Section>

      <Section
        title="Badges and sizes"
        desc="A count or a dot in the corner — the count is part of the spoken label (“Notifications, 3 new”). Five sizes; on touch screens the small ones still get a finger-sized tap area."
        code={`
<IconButton icon="bi bi-bell" label="Notifications" badge={3} />
<IconButton icon="bi bi-envelope" label="Messages" badge={120} />   // 99+
<IconButton icon="bi bi-chat-dots" label="Chat" badge />            // a dot
<IconButton size="xs" … />  // xs sm md lg xl`}
      >
        <div className="grid gap-5">
          <div className="flex items-center gap-4">
            <IconButton icon="bi bi-bell" label="Notifications" badge={3} />
            <IconButton icon="bi bi-envelope" label="Messages" badge={120} />
            <IconButton icon="bi bi-chat-dots" label="Chat" badge />
            <IconButton icon="bi bi-cart3" label="Cart" badge={2} variant="soft" tone="primary" />
          </div>
          <div className="flex items-end gap-3">
            {(["xs", "sm", "md", "lg", "xl"] as const).map((s) => (
              <div key={s} className="grid justify-items-center gap-1">
                <IconButton size={s} variant="soft" tone="primary" icon="bi bi-heart" pressedIcon="bi bi-heart-fill" label={`Like (${s})`} defaultPressed={false} />
                <Text size="xs" tone="muted">{s}</Text>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section
        title="Links, states and accessibility"
        desc="Give it href to make it a link. label is required — it's the only text screen readers get, and it doubles as a tooltip. Enter and Space press it with the same ripple as a tap."
        code={`
<IconButton href="/settings" icon="bi bi-gear" label="Settings" />
<IconButton icon="bi bi-trash" label="Delete" disabled />
<IconButton icon="bi bi-cloud-upload" label="Sync" loading />
<IconButton icon="…" label="…" tooltip={false} />   // no tooltip`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <IconButton href="#/iconbutton" icon="bi bi-gear" label="Settings" />
          <IconButton icon="bi bi-trash" label="Delete" tone="danger" disabled />
          <IconButton icon="bi bi-cloud-upload" label="Sync" loading variant="soft" tone="primary" />
          <IconButton icon="bi bi-arrow-repeat" label="Refresh" onClick={() => wait(1500)} />
        </div>
      </Section>
    </>
  );
}
