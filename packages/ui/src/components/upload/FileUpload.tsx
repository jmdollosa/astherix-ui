import * as React from "react";
import { cn } from "../../lib/cn";
import { Button, type ButtonProps } from "../button/Button";
import { useField, useFieldControlProps } from "../input/Field";
import { controlFrame, type ControlRounded } from "../input/controlStyles";
import {
  useFileUploads,
  formatBytes,
  describeAccept,
  type UploadFn,
  type UploadItem,
  type UseFileUploadsOptions,
} from "./useFileUploads";

/*
 * File upload, three ways:
 *   FileDropzone      drag and drop (or click, or paste) — with a list of files and their progress
 *   FileInput         a redesigned <input type="file"> field for forms
 *   FileUploadButton  a button that picks a file, then shows its name, progress % and "Upload complete"
 * All share the same engine (useFileUploads) and upload with your function — xhrUpload(url) for most APIs.
 */

/* ---------- icons ---------- */

const I = ({ d, className }: { d: string | string[]; className?: string }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
    {(Array.isArray(d) ? d : [d]).map((p) => (
      <path key={p} d={p} />
    ))}
  </svg>
);
const icons = {
  upload: ["M10 13V3.5", "M6 7l4-4 4 4", "M3.5 12.5v2a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-2"],
  file: ["M11.5 2.5H6a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 6 17.5h8a1.5 1.5 0 0 0 1.5-1.5V6.5z", "M11.5 2.5v4h4"],
  check: "M4.5 10.5l3.5 3.5 7.5-8",
  x: ["M6 6l8 8", "M14 6l-8 8"],
  retry: ["M16 10a6 6 0 1 1-1.8-4.3", "M16 3.5v3.3h-3.3"],
  alert: ["M10 6.5v4.5", "M10 13.8v.01", "M10 2.5l7.5 13H2.5z"],
};

function fileKind(file: File) {
  const n = file.name.toLowerCase();
  if (file.type.startsWith("image/")) return "IMG";
  if (n.endsWith(".pdf")) return "PDF";
  if (/\.(xlsx?|csv|numbers)$/.test(n)) return "XLS";
  if (/\.(docx?|rtf|odt|pages)$/.test(n)) return "DOC";
  if (/\.(zip|rar|7z|gz)$/.test(n)) return "ZIP";
  if (file.type.startsWith("video/")) return "VID";
  if (file.type.startsWith("audio/")) return "AUD";
  return (n.split(".").pop() ?? "FILE").slice(0, 4).toUpperCase();
}
const kindColor: Record<string, string> = {
  PDF: "text-danger",
  XLS: "text-success",
  DOC: "text-info",
  ZIP: "text-warning",
};

/** "a-very-long-file-name-2026.pdf" → "a-very-long-fi…2026.pdf" — keeps the extension visible. */
function middleTruncate(name: string, max = 34) {
  if (name.length <= max) return name;
  const dot = name.lastIndexOf(".");
  const tail = dot > 0 && name.length - dot <= 8 ? name.slice(dot - 4) : name.slice(-8);
  return `${name.slice(0, max - tail.length - 1)}…${tail}`;
}

/* ---------- FileList ---------- */

export interface FileListProps extends React.HTMLAttributes<HTMLUListElement> {
  items: UploadItem[];
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
  onRemove?: (id: string) => void;
}

/** The list of files with thumbnail, size, progress and actions. Used by FileDropzone; usable on its own. */
export function FileList({ items, onCancel, onRetry, onRemove, className, ...props }: FileListProps) {
  if (!items.length) return null;
  return (
    <ul className={cn("grid gap-2", className)} {...props}>
      {items.map((it) => (
        <FileRow key={it.id} item={it} onCancel={onCancel} onRetry={onRetry} onRemove={onRemove} />
      ))}
    </ul>
  );
}

function Thumb({ item, size = 40 }: { item: UploadItem; size?: number }) {
  const kind = fileKind(item.file);
  return item.previewUrl ? (
    <img src={item.previewUrl} alt="" className="shrink-0 rounded-control object-cover shadow-[inset_0_0_0_1px_rgb(0_0_0/0.06)]" style={{ width: size, height: size }} />
  ) : (
    <span className="relative grid shrink-0 place-items-center rounded-control bg-secondary-hover text-fg-muted" style={{ width: size, height: size }}>
      <I d={icons.file} className="size-[62%]" />
      <span className={cn("absolute bottom-[18%] rounded-[3px] bg-surface px-0.5 text-[0.5rem] font-bold leading-tight tracking-wide", kindColor[kind] ?? "text-fg-muted")}>
        {kind}
      </span>
    </span>
  );
}

function IconAction({ label, d, onClick, danger }: { label: string; d: string | string[]; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "grid size-7 shrink-0 cursor-pointer place-items-center rounded-control-sm text-fg-muted hover:bg-secondary-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-ring",
        danger && "hover:text-danger"
      )}
    >
      <I d={d} className="size-4" />
    </button>
  );
}

function FileRow({ item, onCancel, onRetry, onRemove }: { item: UploadItem } & Pick<FileListProps, "onCancel" | "onRetry" | "onRemove">) {
  const { file, status, progress, error } = item;
  const busy = status === "uploading" || status === "queued";
  return (
    <li
      className={cn(
        "relative flex items-center gap-3 overflow-hidden rounded-control-lg border bg-surface p-2.5 pe-2 animate-[ui-menu-down_160ms_ease-out]",
        status === "error" ? "border-[color:color-mix(in_srgb,var(--color-danger)_45%,transparent)]" : "border-border"
      )}
    >
      <Thumb item={item} />
      <div className="grid min-w-0 flex-1 gap-1">
        <div className="flex items-baseline gap-2">
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-fg" title={file.name}>
            {middleTruncate(file.name)}
          </span>
          <span className={cn("shrink-0 text-xs tabular-nums", status === "done" ? "text-success" : status === "error" ? "text-danger" : "text-fg-muted")}>
            {status === "uploading" && `${progress}%`}
            {status === "queued" && "Waiting…"}
            {status === "done" && (
              <span className="inline-flex items-center gap-1">
                <I d={icons.check} className="size-3.5" />
                Uploaded
              </span>
            )}
            {status === "cancelled" && "Cancelled"}
            {status === "error" && "Failed"}
            {status === "selected" && formatBytes(file.size)}
          </span>
        </div>
        {busy ? (
          <div
            role="progressbar"
            aria-label={`Uploading ${file.name}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="h-1.5 overflow-hidden rounded-full bg-secondary-hover"
          >
            <div className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out" style={{ width: `${Math.max(status === "queued" ? 0 : 3, progress)}%` }} />
          </div>
        ) : (
          <span className={cn("truncate text-xs", status === "error" ? "text-danger" : "text-fg-muted")}>
            {status === "error" ? error : status === "selected" ? file.type || "File" : formatBytes(file.size)}
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center">
        {busy && onCancel && <IconAction label={`Cancel upload of ${file.name}`} d={icons.x} onClick={() => onCancel(item.id)} />}
        {(status === "error" || status === "cancelled") && onRetry && <IconAction label={`Retry ${file.name}`} d={icons.retry} onClick={() => onRetry(item.id)} />}
        {!busy && onRemove && <IconAction label={`Remove ${file.name}`} d={icons.x} onClick={() => onRemove(item.id)} danger />}
      </div>
      {/* A soft sweep on the row while it uploads */}
      {status === "uploading" && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 start-0 bg-[color:color-mix(in_srgb,var(--color-primary)_5%,transparent)] transition-[width] duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      )}
    </li>
  );
}

/* ---------- shared: announcements ---------- */

function useAnnouncer(items: UploadItem[]) {
  const [message, setMessage] = React.useState("");
  const prev = React.useRef(new Map<string, string>());
  React.useEffect(() => {
    for (const it of items) {
      const before = prev.current.get(it.id);
      if (before !== it.status) {
        if (it.status === "done") setMessage(`${it.file.name} uploaded.`);
        else if (it.status === "error") setMessage(`${it.file.name} failed to upload. ${it.error ?? ""}`);
      }
      prev.current.set(it.id, it.status);
    }
  }, [items]);
  return <span className="sr-only" aria-live="polite">{message}</span>;
}

function Rejections({ messages, onDismiss }: { messages: string[]; onDismiss: () => void }) {
  if (!messages.length) return null;
  return (
    <div role="alert" className="flex items-start gap-2 rounded-control-lg border border-[color:color-mix(in_srgb,var(--color-danger)_40%,transparent)] bg-[color:color-mix(in_srgb,var(--color-danger)_6%,var(--color-surface))] px-3 py-2.5 text-[0.8125rem] text-danger">
      <I d={icons.alert} className="mt-px size-4 shrink-0" />
      <ul className="grid flex-1 gap-0.5">
        {messages.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
      <button type="button" aria-label="Dismiss" onClick={onDismiss} className="-m-1 grid size-6 cursor-pointer place-items-center rounded-control-sm hover:bg-[color:color-mix(in_srgb,var(--color-danger)_12%,transparent)]">
        <I d={icons.x} className="size-3.5" />
      </button>
    </div>
  );
}

/** Keep the hidden <input> holding the selected files, so a normal form post includes them. */
function syncInput(input: HTMLInputElement | null, items: UploadItem[]) {
  if (!input || typeof DataTransfer === "undefined") return;
  try {
    const dt = new DataTransfer();
    items.forEach((i) => dt.items.add(i.file));
    input.files = dt.files;
  } catch {
    /* older browsers */
  }
}

/* ---------- FileDropzone ---------- */

export interface FileDropzoneProps extends Omit<UseFileUploadsOptions, "onChange"> {
  /** Called with the current list (files, statuses, server responses). */
  onChange?: (items: UploadItem[]) => void;
  /** Main line of text. */
  title?: React.ReactNode;
  /** Hint under it. Generated from accept and maxSize if you leave it out. */
  hint?: React.ReactNode;
  /** Adds a hidden file input with this name, for a normal form post (without upload). */
  name?: string;
  disabled?: boolean;
  /** Also accept files pasted with Ctrl/⌘+V while the dropzone is focused. Default true. */
  pasteable?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  id?: string;
}

export function FileDropzone({
  title,
  hint,
  name,
  disabled = false,
  pasteable = true,
  size = "md",
  className,
  id,
  multiple = true,
  ...options
}: FileDropzoneProps) {
  const field = useField();
  const control = useFieldControlProps({ id, disabled });
  const off = !!control.disabled;
  const { items, rejections, addFiles, cancel, retry, remove, dismissRejections } = useFileUploads({ ...options, multiple });
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const depth = React.useRef(0);
  const hintId = React.useId();
  const announcer = useAnnouncer(items);

  React.useEffect(() => {
    if (name) syncInput(inputRef.current, items);
  }, [items, name]);

  const autoHint =
    hint ??
    [options.accept && describeAccept(options.accept), options.maxSize && `up to ${formatBytes(options.maxSize)}${multiple ? " each" : ""}`, options.maxFiles && multiple && `${options.maxFiles} files max`]
      .filter(Boolean)
      .join(" · ");

  const open = () => !off && inputRef.current?.click();

  return (
    <div className={cn("grid gap-3", className)}>
      <div
        id={control.id}
        role="button"
        tabIndex={off ? -1 : 0}
        aria-disabled={off || undefined}
        aria-labelledby={field?.labelId}
        aria-describedby={[autoHint ? hintId : undefined, control["aria-describedby"]].filter(Boolean).join(" ") || undefined}
        onClick={open}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
          }
        }}
        onPaste={(e) => {
          if (!pasteable || off || !e.clipboardData.files.length) return;
          e.preventDefault();
          addFiles(e.clipboardData.files);
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          if (off) return;
          depth.current++;
          setDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => {
          depth.current = Math.max(0, depth.current - 1);
          if (depth.current === 0) setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          depth.current = 0;
          setDragging(false);
          if (!off && e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "group/drop relative grid cursor-pointer justify-items-center gap-2 rounded-card border-2 border-dashed text-center outline-none transition-[border-color,background-color] duration-150",
          size === "sm" ? "px-4 py-5" : size === "lg" ? "px-6 py-12" : "px-5 py-8",
          "border-border-strong bg-surface hover:border-fg-muted/60 hover:bg-secondary-hover/40",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25",
          dragging && "border-primary bg-[color:color-mix(in_srgb,var(--color-primary)_6%,var(--color-surface))] hover:border-primary",
          control["aria-invalid"] && "border-danger",
          off && "cursor-not-allowed opacity-55 hover:border-border-strong hover:bg-surface"
        )}
      >
        <span
          className={cn(
            "grid place-items-center rounded-full bg-secondary-hover text-fg-muted transition-transform duration-200",
            size === "sm" ? "size-9" : "size-11",
            dragging && "-translate-y-1 scale-110 bg-primary text-primary-fg motion-reduce:translate-y-0 motion-reduce:scale-100"
          )}
        >
          <I d={icons.upload} className={size === "sm" ? "size-4" : "size-5"} />
        </span>
        <p className="text-sm text-fg">
          {dragging ? (
            <span className="font-medium">Drop to add {multiple ? "files" : "the file"}</span>
          ) : (
            title ?? (
              <>
                <span className="font-medium text-primary underline-offset-2 group-hover/drop:underline">Choose {multiple ? "files" : "a file"}</span> or drag {multiple ? "them" : "it"} here
              </>
            )
          )}
        </p>
        {autoHint && (
          <p id={hintId} className="text-xs text-fg-muted">
            {autoHint}
            {pasteable && <span className="hidden sm:inline"> · or paste</span>}
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept={options.accept}
          multiple={multiple}
          disabled={off}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            if (!name) e.target.value = ""; // allow picking the same file again
          }}
        />
      </div>
      <Rejections messages={rejections} onDismiss={dismissRejections} />
      <FileList items={items} onCancel={cancel} onRetry={retry} onRemove={remove} aria-label="Selected files" />
      {announcer}
    </div>
  );
}

/* ---------- FileInput ---------- */

export interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "onChange" | "value" | "defaultValue"> {
  /** Called with the chosen files (empty when cleared). */
  onFilesChange?: (files: File[]) => void;
  /** Text on the button part. */
  buttonLabel?: string;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  rounded?: Exclude<ControlRounded, "full">;
  invalid?: boolean;
  /** Largest file in bytes; bigger files are refused with a message. */
  maxSize?: number;
  /** Show a × to clear the choice. Default true. */
  clearable?: boolean;
}

/** A redesigned <input type="file">: a "Choose file" button joined to the file name, in the same frame as Input. */
export const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      onFilesChange,
      buttonLabel,
      placeholder,
      size = "md",
      rounded = "md",
      invalid: invalidProp,
      maxSize,
      clearable = true,
      multiple,
      accept,
      id,
      disabled,
      required,
      className,
      "aria-describedby": describedBy,
      ...props
    },
    ref
  ) => {
    const errId = React.useId();
    const [files, setFiles] = React.useState<File[]>([]);
    const [problem, setProblem] = React.useState<string>();
    const { invalid, ...control } = useFieldControlProps({
      id,
      invalid: invalidProp,
      disabled,
      required,
      "aria-describedby": [describedBy, problem ? errId : undefined].filter(Boolean).join(" ") || undefined,
    });
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const setRefs = (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    const label = files.length === 0 ? (placeholder ?? (multiple ? "No files chosen" : "No file chosen")) : files.length === 1 ? files[0].name : `${files.length} files`;
    const h = size === "sm" ? "h-8 text-sm" : size === "lg" ? "h-12 text-base" : "h-10 text-[0.9375rem]";

    return (
      <div className={cn("grid gap-1", className)}>
        <label
          data-invalid={invalid || problem ? "" : undefined}
          data-disabled={control.disabled ? "" : undefined}
          className={cn(controlFrame({ rounded }), h, "cursor-pointer items-stretch overflow-hidden p-0", control.disabled && "cursor-not-allowed")}
        >
          <span
            className={cn(
              "flex shrink-0 items-center gap-1.5 border-e border-border-strong bg-secondary-hover font-medium text-fg transition-colors",
              size === "sm" ? "px-2.5 text-[0.8125rem]" : "px-3.5 text-sm",
              "[label:hover_&]:bg-border/70"
            )}
          >
            <I d={icons.upload} className="size-4 text-fg-muted" />
            {buttonLabel ?? (multiple ? "Choose files" : "Choose file")}
          </span>
          <span className={cn("flex min-w-0 flex-1 items-center gap-2 px-3", files.length ? "text-fg" : "text-fg-muted/80")} title={files.map((f) => f.name).join("\n")}>
            <span className="truncate">{files.length === 1 ? middleTruncate(label, 40) : label}</span>
            {files.length === 1 && <span className="shrink-0 text-xs tabular-nums text-fg-muted">{formatBytes(files[0].size)}</span>}
          </span>
          <input
            ref={setRefs}
            type="file"
            multiple={multiple}
            accept={accept}
            className="sr-only"
            {...control}
            onChange={(e) => {
              const picked = Array.from(e.target.files ?? []);
              const tooBig = maxSize ? picked.find((f) => f.size > maxSize) : undefined;
              if (tooBig) {
                setProblem(`${tooBig.name} is ${formatBytes(tooBig.size)}. Choose a file under ${formatBytes(maxSize!)}.`);
                e.target.value = "";
                setFiles([]);
                onFilesChange?.([]);
                return;
              }
              setProblem(undefined);
              setFiles(picked);
              onFilesChange?.(picked);
            }}
            {...props}
          />
          {clearable && files.length > 0 && !control.disabled && (
            <button
              type="button"
              aria-label="Clear file"
              onClick={(e) => {
                e.preventDefault();
                if (inputRef.current) inputRef.current.value = "";
                setFiles([]);
                setProblem(undefined);
                onFilesChange?.([]);
                inputRef.current?.focus();
              }}
              className="me-1.5 grid size-7 shrink-0 cursor-pointer place-items-center self-center rounded-control-sm text-fg-muted hover:bg-secondary-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-ring"
            >
              <I d={icons.x} className="size-4" />
            </button>
          )}
        </label>
        {problem && (
          <p id={errId} role="alert" className="text-[0.8125rem] text-danger">
            {problem}
          </p>
        )}
      </div>
    );
  }
);
FileInput.displayName = "FileInput";

/* ---------- FileUploadButton ---------- */

export interface FileUploadButtonProps extends Omit<ButtonProps, "onChange" | "onClick" | "children"> {
  /** Uploads the chosen file. Use xhrUpload(url) for most endpoints. */
  upload: UploadFn;
  accept?: string;
  maxSize?: number;
  /** Button text. */
  children?: React.ReactNode;
  /** Called when the upload finishes, with the server's response. */
  onUploaded?: (item: UploadItem) => void;
  /** Called when the file is removed after uploading. */
  onRemove?: () => void;
  /** Text once done. Default "Upload complete". */
  completeLabel?: string;
}

/** A button that picks one file, then shows its name, progress %, and "Upload complete" when done. */
export function FileUploadButton({
  upload,
  accept,
  maxSize,
  children = "Upload file",
  onUploaded,
  onRemove,
  completeLabel = "Upload complete",
  variant = "secondary",
  leadingIcon,
  className,
  ...buttonProps
}: FileUploadButtonProps) {
  const { items, rejections, addFiles, cancel, retry, remove, dismissRejections } = useFileUploads({ upload, accept, maxSize, multiple: false, onUploaded });
  const inputRef = React.useRef<HTMLInputElement>(null);
  const item = items[items.length - 1];
  const announcer = useAnnouncer(items);
  const pick = () => inputRef.current?.click();

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      tabIndex={-1}
      aria-hidden="true"
      className="sr-only"
      onChange={(e) => {
        if (e.target.files?.length) addFiles(e.target.files);
        e.target.value = "";
      }}
    />
  );

  if (!item || item.status === "cancelled") {
    return (
      <div className={cn("grid justify-items-start gap-2", className)}>
        <Button variant={variant} leadingIcon={leadingIcon ?? <I d={icons.upload} />} onClick={pick} {...buttonProps}>
          {children}
        </Button>
        {item?.status === "cancelled" && <p className="text-xs text-fg-muted">Upload cancelled.</p>}
        <Rejections messages={rejections} onDismiss={dismissRejections} />
        {input}
        {announcer}
      </div>
    );
  }

  const { file, status, progress, error } = item;
  const busy = status === "uploading" || status === "queued";
  return (
    <div className={cn("grid w-full max-w-sm gap-2", className)}>
      <div
        className={cn(
          "relative flex items-center gap-3 overflow-hidden rounded-control-lg border bg-surface px-3 py-2.5",
          status === "done" ? "border-[color:color-mix(in_srgb,var(--color-success)_45%,transparent)]" : status === "error" ? "border-[color:color-mix(in_srgb,var(--color-danger)_45%,transparent)]" : "border-border"
        )}
      >
        {busy && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 start-0 bg-[color:color-mix(in_srgb,var(--color-primary)_7%,transparent)] transition-[width] duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        )}
        <span
          className={cn(
            "relative grid size-9 shrink-0 place-items-center rounded-full",
            status === "done" ? "bg-success text-success-fg" : status === "error" ? "bg-danger text-danger-fg" : "bg-secondary-hover text-fg-muted"
          )}
        >
          {status === "done" ? (
            <I d={icons.check} className="size-4 [stroke-width:2.4]" />
          ) : status === "error" ? (
            <I d={icons.alert} className="size-4" />
          ) : (
            <svg viewBox="0 0 36 36" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
              <circle cx="18" cy="18" r="16" fill="none" stroke="var(--color-border)" strokeWidth="2.5" />
              <circle cx="18" cy="18" r="16" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" pathLength={100} strokeDasharray="100" strokeDashoffset={100 - progress} className="transition-[stroke-dashoffset] duration-200" />
            </svg>
          )}
          {busy && <span className="relative text-[0.625rem] font-semibold tabular-nums text-fg">{progress}</span>}
        </span>
        <div className="relative grid min-w-0 flex-1">
          <span className="truncate text-sm font-medium text-fg" title={file.name}>
            {middleTruncate(file.name, 30)}
          </span>
          <span className={cn("truncate text-xs tabular-nums", status === "done" ? "text-success" : status === "error" ? "text-danger" : "text-fg-muted")}>
            {busy && (
              <span role="progressbar" aria-label={`Uploading ${file.name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                Uploading… {progress}% of {formatBytes(file.size)}
              </span>
            )}
            {status === "done" && `${completeLabel} · ${formatBytes(file.size)}`}
            {status === "error" && error}
          </span>
        </div>
        <div className="relative flex shrink-0 items-center gap-0.5">
          {busy && <IconAction label={`Cancel upload of ${file.name}`} d={icons.x} onClick={() => cancel(item.id)} />}
          {status === "error" && <IconAction label={`Retry ${file.name}`} d={icons.retry} onClick={() => retry(item.id)} />}
          {status === "done" && (
            <button type="button" onClick={pick} className="cursor-pointer rounded-control-sm px-2 py-1 text-xs font-medium text-primary hover:bg-secondary-hover">
              Replace
            </button>
          )}
          {!busy && (
            <IconAction
              label={`Remove ${file.name}`}
              d={icons.x}
              danger
              onClick={() => {
                remove(item.id);
                onRemove?.();
              }}
            />
          )}
        </div>
      </div>
      <Rejections messages={rejections} onDismiss={dismissRejections} />
      {input}
      {announcer}
    </div>
  );
}
