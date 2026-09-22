import * as React from "react";
import { cn } from "../../lib/cn";
import { renderIcon, type IconInput } from "../button/Button";

/*
 * Avatar — a person's (or team's) picture, with friendly fallbacks: initials in a color
 * picked from their name, or an icon. Plus AvatarGroup (overlapping stack with "+3"),
 * AvatarLabel (avatar with name and details) and AvatarUpload (choose and preview a photo).
 */

const sizes = { xs: 20, sm: 28, md: 36, lg: 48, xl: 64, "2xl": 96 } as const;
export type AvatarSize = keyof typeof sizes;
export type AvatarStatus = "online" | "away" | "busy" | "offline";

const statusColor: Record<AvatarStatus, string> = {
  online: "bg-success",
  away: "bg-warning",
  busy: "bg-danger",
  offline: "bg-surface shadow-[inset_0_0_0_2px_var(--color-fg-muted)]",
};
const statusWord: Record<AvatarStatus, string> = { online: "online", away: "away", busy: "busy", offline: "offline" };

/** "Maria Santos" → "MS", "cher" → "C". */
export function getInitials(name = "") {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "";
  const first = Array.from(words[0])[0] ?? "";
  const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/** The same name always gets the same hue. */
function hueFor(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  const hues = [8, 28, 45, 145, 170, 195, 215, 250, 275, 330];
  return hues[h % hues.length];
}

type GroupContextValue = { size: AvatarSize; shape: "circle" | "square" } | null;
const GroupContext = React.createContext<GroupContextValue>(null);

/* ---------- Avatar ---------- */

export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Image URL. If it's missing or fails to load, the fallback shows. */
  src?: string | null;
  /** The person's name: used for the alt text, initials and color. */
  name?: string;
  size?: AvatarSize;
  /** "circle" for people, "square" (rounded) for teams, companies and projects. */
  shape?: "circle" | "square";
  /** Presence dot in the corner. */
  status?: AvatarStatus;
  /** Shown when there's no image and no name (or instead of initials). */
  icon?: IconInput;
  /** Small content in the top corner, e.g. an unread count. */
  badge?: React.ReactNode;
  /** A ring around it, e.g. to mark the selected person. */
  ring?: boolean;
  /** Hide from screen readers when the name is already written next to it. */
  decorative?: boolean;
  /** Custom fallback content (overrides initials and icon). */
  fallback?: React.ReactNode;
}

const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="translate-y-[8%]">
    <circle cx="12" cy="8" r="4.2" />
    <path d="M3.5 21c.7-4.4 4.2-7 8.5-7s7.8 2.6 8.5 7z" />
  </svg>
);

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  (
    { src, name = "", size: sizeProp, shape: shapeProp, status, icon, badge, ring, decorative, fallback, className, style, ...props },
    ref
  ) => {
    const group = React.useContext(GroupContext);
    const size = sizeProp ?? group?.size ?? "md";
    const shape = shapeProp ?? group?.shape ?? "circle";
    const px = sizes[size];

    const [loaded, setLoaded] = React.useState<"loading" | "ok" | "error">(src ? "loading" : "error");
    React.useEffect(() => setLoaded(src ? "loading" : "error"), [src]);

    const initials = getInitials(name);
    const showImage = !!src && loaded !== "error";
    const label = [name || "Unknown user", status && `(${statusWord[status]})`].filter(Boolean).join(" ");
    const radius = shape === "circle" ? "rounded-full" : px >= 48 ? "rounded-[22%]" : "rounded-[25%]";

    return (
      <span
        ref={ref}
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : label}
        aria-hidden={decorative || undefined}
        className={cn("relative inline-flex shrink-0 align-middle", className)}
        style={{ width: px, height: px, ...style }}
        {...props}
      >
        <span
          className={cn(
            "grid size-full select-none place-items-center overflow-hidden font-semibold leading-none",
            radius,
            !showImage || loaded !== "ok" ? (initials && !icon && !fallback ? "ui-avatar-initials" : "bg-secondary-hover text-fg-muted") : "",
            ring && "ring-2 ring-primary ring-offset-2 ring-offset-[color:var(--av-ring,var(--color-surface))]",
            // A hairline edge so light photos don't blend into the page.
            showImage && "shadow-[inset_0_0_0_1px_rgb(0_0_0/0.06)]"
          )}
          style={{ ["--av-h" as string]: hueFor(name || "?"), fontSize: Math.max(8, Math.round(px * (initials.length > 1 ? 0.38 : 0.44))) }}
        >
          {(!showImage || loaded !== "ok") && (
            <span aria-hidden="true" className="col-start-1 row-start-1 grid size-full place-items-center [&>i]:text-[0.95em] [&>svg]:size-[58%]">
              {fallback ?? (icon ? renderIcon(icon) : initials || <PersonIcon />)}
            </span>
          )}
          {showImage && (
            <img
              src={src!}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              onLoad={() => setLoaded("ok")}
              onError={() => setLoaded("error")}
              className={cn(
                "col-start-1 row-start-1 size-full object-cover transition-opacity duration-200",
                loaded === "ok" ? "opacity-100" : "opacity-0"
              )}
            />
          )}
        </span>

        {status && (
          <span
            aria-hidden="true"
            className={cn(
              "absolute bottom-0 end-0 rounded-full ring-2 ring-[color:var(--av-ring,var(--color-surface))]",
              statusColor[status],
              shape === "square" && "-bottom-[6%] -end-[6%]"
            )}
            style={{ width: Math.max(7, px * 0.27), height: Math.max(7, px * 0.27) }}
          />
        )}
        {badge !== undefined && badge !== null && badge !== false && (
          <span
            className={cn(
              "absolute -end-1 -top-1 grid min-w-[1.25rem] place-items-center rounded-full bg-danger px-1 text-[0.6875rem] font-semibold leading-5 text-danger-fg tabular-nums",
              "ring-2 ring-[color:var(--av-ring,var(--color-surface))]"
            )}
          >
            {badge}
          </span>
        )}
      </span>
    );
  }
);
Avatar.displayName = "Avatar";

/* ---------- AvatarGroup ---------- */

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: AvatarSize;
  shape?: "circle" | "square";
  /** Show at most this many; the rest become a "+N" avatar. */
  max?: number;
  /** How much they overlap. */
  spacing?: "tight" | "normal" | "loose";
  /** Called when the "+N" avatar is clicked, e.g. to open the full list. */
  onOverflowClick?: () => void;
}

export function AvatarGroup({
  size = "md",
  shape = "circle",
  max,
  spacing = "normal",
  onOverflowClick,
  className,
  children,
  "aria-label": ariaLabel,
  ...props
}: AvatarGroupProps) {
  const items = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<AvatarProps>[];
  const visible = max !== undefined && items.length > max ? items.slice(0, Math.max(1, max - 1)) : items;
  const hidden = items.slice(visible.length);
  const px = sizes[size];
  const overlap = Math.round(px * (spacing === "tight" ? 0.38 : spacing === "loose" ? 0.12 : 0.26));
  const hiddenNames = hidden.map((a) => a.props.name).filter(Boolean).join(", ");
  const radius = shape === "circle" ? "rounded-full" : "rounded-[25%]";

  const overflowClass = cn(
    "relative grid shrink-0 place-items-center bg-secondary-hover font-semibold text-fg-muted tabular-nums",
    "ring-2 ring-[color:var(--av-ring,var(--color-surface))]",
    radius
  );
  const overflowStyle = { width: px, height: px, marginInlineStart: -overlap, fontSize: Math.max(9, Math.round(px * 0.34)) };

  return (
    <GroupContext.Provider value={{ size, shape }}>
      <div
        role="group"
        aria-label={ariaLabel ?? `${items.length} people`}
        className={cn("flex items-center", className)}
        {...props}
      >
        {visible.map((child, i) => (
          <span
            key={child.key ?? i}
            className={cn("relative inline-flex ring-2 ring-[color:var(--av-ring,var(--color-surface))]", radius)}
            style={{ marginInlineStart: i === 0 ? 0 : -overlap }}
          >
            {child}
          </span>
        ))}
        {hidden.length > 0 &&
          (onOverflowClick ? (
            <button
              type="button"
              onClick={onOverflowClick}
              title={hiddenNames}
              aria-label={`${hidden.length} more: ${hiddenNames}`}
              className={cn(overflowClass, "cursor-pointer hover:bg-border hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring")}
              style={overflowStyle}
            >
              +{hidden.length}
            </button>
          ) : (
            <span role="img" title={hiddenNames} aria-label={`${hidden.length} more: ${hiddenNames}`} className={overflowClass} style={overflowStyle}>
              +{hidden.length}
            </span>
          ))}
      </div>
    </GroupContext.Provider>
  );
}

/* ---------- AvatarLabel ---------- */

export interface AvatarLabelProps extends Omit<AvatarProps, "decorative"> {
  /** A second line, e.g. a role or email. */
  description?: React.ReactNode;
  /** Something at the end, e.g. a Pill or a button. */
  end?: React.ReactNode;
}

/** An avatar with the name (and a detail) beside it — for lists, comments and menus. */
export function AvatarLabel({ name = "", description, end, size = "md", className, ...avatarProps }: AvatarLabelProps) {
  const small = size === "xs" || size === "sm";
  return (
    <div className={cn("flex min-w-0 items-center", small ? "gap-2" : "gap-3", className)}>
      <Avatar name={name} size={size} decorative {...avatarProps} />
      <div className="min-w-0 flex-1">
        <p className={cn("truncate font-medium text-fg", small ? "text-[0.8125rem]" : size === "xl" || size === "2xl" ? "text-base" : "text-sm")}>
          {name}
          {avatarProps.status && <span className="sr-only"> ({statusWord[avatarProps.status]})</span>}
        </p>
        {description && <p className={cn("truncate text-fg-muted", small ? "text-xs" : "text-[0.8125rem]")}>{description}</p>}
      </div>
      {end}
    </div>
  );
}

/* ---------- AvatarUpload ---------- */

export interface AvatarUploadProps {
  /** Current picture URL (e.g. from the server). */
  value?: string | null;
  /** Called with the chosen file, or null when removed. */
  onChange?: (file: File | null) => void;
  /** The person's name, for the fallback initials. */
  name?: string;
  size?: "lg" | "xl" | "2xl";
  shape?: "circle" | "square";
  /** Largest file allowed, in MB. Default 5. */
  maxSizeMB?: number;
  accept?: string;
  /** Adds a file input with this name so the photo is sent with a normal form. */
  inputName?: string;
  disabled?: boolean;
  className?: string;
}

/** Choose, preview and remove a profile photo — by clicking or dropping an image on it. */
export function AvatarUpload({
  value = null,
  onChange,
  name = "",
  size = "xl",
  shape = "circle",
  maxSizeMB = 5,
  accept = "image/png, image/jpeg, image/webp, image/gif",
  inputName,
  disabled = false,
  className,
}: AvatarUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | null>(value);
  const [error, setError] = React.useState<string>();
  const [dragging, setDragging] = React.useState(false);
  const errorId = React.useId();

  React.useEffect(() => setPreview(value), [value]);
  // Free the preview URL when it's replaced or the component goes away.
  React.useEffect(() => () => {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
  }, [preview]);

  /** Check and use a file. Returns false (and shows why) if it isn't usable. */
  const take = (file: File | undefined | null): boolean => {
    if (!file) return false;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file — PNG, JPG, WebP or GIF.");
      return false;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Choose an image under ${maxSizeMB} MB. This one is ${(file.size / 1024 / 1024).toFixed(1)} MB.`);
      return false;
    }
    setError(undefined);
    setPreview(URL.createObjectURL(file));
    onChange?.(file);
    return true;
  };

  const remove = () => {
    setPreview(null);
    setError(undefined);
    if (inputRef.current) inputRef.current.value = "";
    onChange?.(null);
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (disabled) return;
          const files = e.dataTransfer.files;
          if (!take(files?.[0])) return;
          // Put the dropped file in the input too, so a normal form post includes it.
          try {
            if (inputRef.current) inputRef.current.files = files;
          } catch {
            /* older browsers */
          }
        }}
        aria-label={preview ? "Change photo" : "Upload photo"}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "group relative shrink-0 cursor-pointer outline-none disabled:cursor-not-allowed disabled:opacity-60",
          shape === "circle" ? "rounded-full" : "rounded-[22%]",
          "focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          dragging && "ring-3 ring-primary ring-offset-2 ring-offset-bg"
        )}
      >
        <Avatar src={preview} name={name} size={size} shape={shape} decorative />
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 grid place-items-center bg-black/45 text-white opacity-0 transition-opacity duration-150",
            shape === "circle" ? "rounded-full" : "rounded-[22%]",
            "group-hover:opacity-100 group-focus-visible:opacity-100",
            dragging && "opacity-100"
          )}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="size-[34%]">
            <path d="M4 8.5A2 2 0 0 1 6 6.5h1.8L9.3 4.5h5.4l1.5 2H18a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
            <circle cx="12" cy="12.5" r="3.4" />
          </svg>
        </span>
      </button>
      <div className="grid gap-1.5">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="cursor-pointer text-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            {preview ? "Change photo" : "Upload photo"}
          </button>
          {preview && !disabled && (
            <>
              <span aria-hidden="true" className="text-fg-muted">·</span>
              <button type="button" onClick={remove} className="cursor-pointer text-sm font-medium text-fg-muted hover:text-danger hover:underline">
                Remove
              </button>
            </>
          )}
        </div>
        <p className="text-xs text-fg-muted">PNG, JPG, WebP or GIF, up to {maxSizeMB} MB. You can also drop an image on the picture.</p>
        {error && (
          <p id={errorId} role="alert" className="text-[0.8125rem] text-danger">
            {error}
          </p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        name={inputName}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={(e) => {
          if (!take(e.target.files?.[0])) e.target.value = "";
        }}
      />
    </div>
  );
}
