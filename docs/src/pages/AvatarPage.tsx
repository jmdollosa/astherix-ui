import * as React from "react";
import {
  Avatar,
  AvatarGroup,
  AvatarLabel,
  AvatarUpload,
  Pill,
  Button,
  Field,
  Input,
  type AvatarSize,
} from "@jm/ui";
import { PageHeader, Section } from "../components/Doc";

/*
 * Illustrated portraits as inline SVG — the published docs can't load remote images,
 * and illustrations avoid using real people's photos.
 */
function portrait(bg: [string, string], skin: string, hair: string, shirt: string, style: 0 | 1 | 2 = 0) {
  const hairPath =
    style === 0
      ? `<path d="M30 44c0-13 9-22 20-22s20 9 20 22c-3-6-9-9-20-9s-17 3-20 9z" fill="${hair}"/>`
      : style === 1
        ? `<path d="M28 50c-2-18 8-29 22-29s24 11 22 29c-2-10-4-14-7-16-6 4-24 4-30 0-3 2-5 6-7 16z" fill="${hair}"/><path d="M28 48c0 14 2 24 6 30h-8c-3-8-3-20 2-30zM72 48c0 14-2 24-6 30h8c3-8 3-20-2-30z" fill="${hair}"/>`
        : `<circle cx="50" cy="30" r="9" fill="${hair}"/><path d="M31 45c0-12 8-20 19-20s19 8 19 20c-4-5-10-8-19-8s-15 3-19 8z" fill="${hair}"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient></defs><rect width="100" height="100" fill="url(#g)"/><path d="M18 100c2-17 15-27 32-27s30 10 32 27z" fill="${shirt}"/><rect x="43" y="58" width="14" height="16" rx="6" fill="${skin}"/><ellipse cx="50" cy="47" rx="17" ry="19" fill="${skin}"/>${hairPath}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const people = [
  { name: "Maria Santos", role: "Product designer", src: portrait(["#fde6d8", "#f7c8b0"], "#c98d6b", "#2b1d16", "#3b6fd8", 1), status: "online" },
  { name: "Leo Garcia", role: "Brand designer", src: portrait(["#dcefe6", "#b9ddcc"], "#a86f4f", "#1a1411", "#1f7a55", 0), status: "away" },
  { name: "Ana Reyes", role: "Frontend developer", src: portrait(["#e6e3fb", "#cbc5f4"], "#e0b196", "#5a3522", "#6d4ad6", 2), status: "busy" },
  { name: "Ben Cruz", role: "Backend developer", src: portrait(["#fbeecb", "#f4dc97"], "#8d5a3d", "#171210", "#b45309", 0), status: "offline" },
  { name: "Carla Lim", role: "Mobile developer", src: portrait(["#dff0fb", "#b8dcf4"], "#f1c7a8", "#1c1715", "#0369a1", 1), status: "online" },
  { name: "Dan Torres", role: "QA engineer", src: null, status: "online" },
  { name: "Ella Ramos", role: "Project manager", src: null, status: "away" },
  { name: "Francis Uy", role: "DevOps engineer", src: null, status: "offline" },
] as const;

const Row = ({ children }: { children: React.ReactNode }) => <div className="flex flex-wrap items-center gap-4">{children}</div>;

function OverflowDemo() {
  const [showAll, setShowAll] = React.useState(false);
  return (
    <div className="grid gap-4">
      <AvatarGroup max={5} aria-label="Project members" onOverflowClick={() => setShowAll((s) => !s)}>
        {people.map((p) => <Avatar key={p.name} src={p.src} name={p.name} />)}
      </AvatarGroup>
      {showAll && (
        <div className="grid w-full max-w-sm gap-3 rounded-control-lg border border-border bg-surface p-4">
          {people.map((p) => <AvatarLabel key={p.name} src={p.src} name={p.name} description={p.role} size="sm" />)}
        </div>
      )}
    </div>
  );
}

function ProfileDemo() {
  const [file, setFile] = React.useState<File | null>(null);
  const [saved, setSaved] = React.useState(false);
  return (
    <form
      className="grid w-full max-w-md gap-5 rounded-control-lg border border-border bg-surface p-5"
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(true);
      }}
    >
      <AvatarUpload name="Maria Santos" value={people[0].src} onChange={(f) => { setFile(f); setSaved(false); }} inputName="avatar" />
      <Field label="Display name">
        <Input defaultValue="Maria Santos" />
      </Field>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-fg-muted" role="status">
          {saved ? "Profile saved." : file ? `New photo: ${file.name}` : "\u00a0"}
        </p>
        <Button type="submit">Save profile</Button>
      </div>
    </form>
  );
}

export function AvatarPage() {
  return (
    <>
      <PageHeader
        title="Avatar"
        intro="A picture for a person, team or company — with friendly fallbacks when there's no photo. Includes stacked groups, name labels, and a photo uploader for profile pages."
        importLine={`import { Avatar, AvatarGroup, AvatarLabel, AvatarUpload } from "@jm/ui";`}
      />

      <Section
        title="Photo and fallbacks"
        desc="If there's no photo — or it fails to load — the avatar shows the person's initials in a soft color picked from their name. The same name always gets the same color. Without a name, it shows a person icon."
        code={`
<Avatar src={user.avatarUrl} name="Maria Santos" />
<Avatar name="Dan Torres" />                        {/* initials: DT */}
<Avatar src="/broken.jpg" name="Ella Ramos" />      {/* falls back to ER */}
<Avatar />                                          {/* person icon */}
<Avatar icon="bi bi-building" name="Northwind" shape="square" />`}
      >
        <Row>
          <Avatar src={people[0].src} name="Maria Santos" size="lg" />
          <Avatar name="Dan Torres" size="lg" />
          <Avatar src="/does-not-exist.jpg" name="Ella Ramos" size="lg" />
          <Avatar size="lg" />
          <Avatar icon="bi bi-building" name="Northwind" shape="square" size="lg" />
        </Row>
      </Section>

      <Section
        title="Sizes"
        desc="From xs (20px) for dense lists to 2xl (96px) for profile headers."
        code={`
<Avatar size="xs" … />  <Avatar size="sm" … />  <Avatar size="md" … />
<Avatar size="lg" … />  <Avatar size="xl" … />  <Avatar size="2xl" … />`}
      >
        <Row>
          {(["xs", "sm", "md", "lg", "xl", "2xl"] as AvatarSize[]).map((s, i) => (
            <Avatar key={s} size={s} src={i % 2 ? null : people[2].src} name="Ana Reyes" />
          ))}
        </Row>
      </Section>

      <Section
        title="Initial colors"
        desc="Ten soft hues, chosen from the name, tuned for both light and dark mode."
        code={`
<Avatar name="Francis Uy" />
<Avatar name="Grace Tan" />
…`}
      >
        <Row>
          {["Francis Uy", "Grace Tan", "Hannah Co", "Ivan Dela Cruz", "Jun Mendoza", "Kim Navarro", "Lara Villanueva", "Miguel Bautista", "Nina Aquino", "Oscar Reyes"].map((n) => (
            <Avatar key={n} name={n} />
          ))}
        </Row>
      </Section>

      <Section
        title="Teams and companies"
        desc={'shape="square" gives rounded corners — a common way to tell organizations apart from people.'}
        code={`
<Avatar shape="square" name="Astherix" src={logoUrl} />
<Avatar shape="square" name="Blue Harbor Café" />`}
      >
        <Row>
          <Avatar shape="square" size="lg" name="Astherix Software" />
          <Avatar shape="square" size="lg" name="Blue Harbor Café" />
          <Avatar shape="square" size="lg" icon="bi bi-truck" name="Luzon Freight" />
          <Avatar shape="square" size="lg" src={people[4].src} name="Carla Lim" />
        </Row>
      </Section>

      <Section
        title="Status, badges and rings"
        desc="A presence dot shows who's around; a badge shows a count; a ring marks the selected person. Status is read out with the name, e.g. “Maria Santos (online)”."
        code={`
<Avatar name="Maria Santos" src={…} status="online" />
<Avatar name="Leo Garcia" src={…} status="away" />
<Avatar name="Ana Reyes" src={…} status="busy" />
<Avatar name="Ben Cruz" src={…} status="offline" />
<Avatar name="Carla Lim" src={…} badge={3} />
<Avatar name="Dan Torres" ring />`}
      >
        <Row>
          {people.slice(0, 4).map((p) => (
            <Avatar key={p.name} src={p.src} name={p.name} status={p.status} size="lg" />
          ))}
          <Avatar src={people[4].src} name="Carla Lim" badge={3} size="lg" />
          <Avatar name="Dan Torres" ring size="lg" />
        </Row>
      </Section>

      <Section
        title="Groups"
        desc="AvatarGroup overlaps avatars and turns the rest into “+N” (its names are in the tooltip and read by screen readers). Click the +N below to see everyone."
        code={`
<AvatarGroup max={5} aria-label="Project members" onOverflowClick={openMembers}>
  {members.map((m) => <Avatar key={m.id} src={m.avatar} name={m.name} />)}
</AvatarGroup>

<AvatarGroup size="sm" spacing="tight">…</AvatarGroup>`}
      >
        <div className="grid gap-5">
          <OverflowDemo />
          <AvatarGroup size="sm" spacing="tight" aria-label="Reviewers">
            {people.slice(0, 4).map((p) => <Avatar key={p.name} src={p.src} name={p.name} />)}
          </AvatarGroup>
          <AvatarGroup size="lg" max={4} shape="square" aria-label="Client companies">
            {["Northwind Traders", "Blue Harbor Café", "Luzon Freight", "Pixel & Pine", "Sari-Sari Co"].map((n) => <Avatar key={n} name={n} />)}
          </AvatarGroup>
        </div>
      </Section>

      <Section
        title="With a name"
        desc="AvatarLabel puts the name and a detail beside the avatar — for member lists, comments and menus. Add something at the end, like a role pill."
        code={`
<AvatarLabel
  src={member.avatar}
  name="Maria Santos"
  description="Product designer"
  status="online"
  end={<Pill size="sm">Admin</Pill>}
/>`}
      >
        <ul className="w-full max-w-md divide-y divide-border rounded-control-lg border border-border bg-surface">
          {people.slice(0, 5).map((p, i) => (
            <li key={p.name} className="px-4 py-3">
              <AvatarLabel
                src={p.src}
                name={p.name}
                description={p.role}
                status={p.status}
                end={i === 0 ? <Pill size="sm" tone="primary">Admin</Pill> : i === 3 ? <Pill size="sm">Invited</Pill> : undefined}
              />
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Upload a photo"
        desc="AvatarUpload lets people pick a photo — or drop one on the picture — and see it right away. It checks the type and size, and can post the file with a normal form."
        code={`
<AvatarUpload
  name={user.name}
  value={user.avatarUrl}
  onChange={(file) => setAvatar(file)}   // File, or null when removed
  maxSizeMB={5}
  inputName="avatar"                      // for a normal form post
/>

// Inertia: form.setData("avatar", file); form.post("/profile", { forceFormData: true })`}
      >
        <ProfileDemo />
      </Section>
    </>
  );
}
