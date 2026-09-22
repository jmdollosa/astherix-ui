import * as React from "react";

/*
 * The upload engine shared by FileDropzone and FileUploadButton (and exported for custom UIs):
 * checks files against accept / maxSize / maxFiles, keeps a list with status and progress,
 * uploads with your function (a few at a time), and supports cancel, retry and remove.
 */

export type UploadStatus = "selected" | "queued" | "uploading" | "done" | "error" | "cancelled";

export interface UploadItem {
  id: string;
  file: File;
  status: UploadStatus;
  /** 0–100 */
  progress: number;
  error?: string;
  /** Whatever your upload function resolved with (e.g. the server's JSON). */
  response?: unknown;
  /** An object URL for image previews. */
  previewUrl?: string;
}

/** Upload one file. Call onProgress(0–100) as it goes, and stop when signal aborts. */
export type UploadFn = (file: File, ctx: { onProgress: (percent: number) => void; signal: AbortSignal }) => Promise<unknown>;

export interface UseFileUploadsOptions {
  /** Your upload function (see xhrUpload). Without it, files are only selected. */
  upload?: UploadFn;
  /** Same format as <input accept>: "image/*,.pdf". */
  accept?: string;
  /** Largest file in bytes. */
  maxSize?: number;
  /** Most files in the list at once. */
  maxFiles?: number;
  multiple?: boolean;
  /** How many upload at the same time. Default 3. */
  concurrency?: number;
  /** Called whenever the list changes. */
  onChange?: (items: UploadItem[]) => void;
  /** Called when one file finishes uploading. */
  onUploaded?: (item: UploadItem) => void;
}

/* ---------- helpers ---------- */

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}

/** Turn an accept string into friendly words: "image/*,.pdf" → "images or PDF". */
export function describeAccept(accept?: string) {
  if (!accept) return "";
  const parts = accept
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      if (p === "image/*") return "images";
      if (p === "video/*") return "videos";
      if (p === "audio/*") return "audio";
      if (p.startsWith(".")) return p.slice(1).toUpperCase();
      const sub = p.split("/")[1];
      return sub ? sub.toUpperCase().replace("JPEG", "JPG").replace("SVG+XML", "SVG") : p;
    });
  const unique = Array.from(new Set(parts));
  return unique.length > 1 ? `${unique.slice(0, -1).join(", ")} or ${unique[unique.length - 1]}` : unique[0];
}

export function fileMatchesAccept(file: File, accept?: string) {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) => {
      if (rule.startsWith(".")) return name.endsWith(rule);
      if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
      return type === rule;
    });
}

let counter = 0;
const newId = () => `u${Date.now().toString(36)}${(counter++).toString(36)}`;

/* ---------- xhrUpload ---------- */

export interface XhrUploadOptions {
  /** Form field name for the file. Default "file". */
  fieldName?: string;
  method?: "POST" | "PUT";
  headers?: Record<string, string>;
  /** Extra form fields sent with each file. */
  data?: Record<string, string>;
  /** Send cookies. Default true. */
  withCredentials?: boolean;
  /** Read this cookie and send it as X-XSRF-TOKEN (Laravel). Default "XSRF-TOKEN"; false to skip. */
  xsrfCookie?: string | false;
}

/**
 * An UploadFn for a plain HTTP endpoint, with real upload progress (fetch can't report it).
 * Laravel-friendly: sends the XSRF cookie as a header and turns validation errors into messages.
 */
export function xhrUpload(url: string, options: XhrUploadOptions = {}): UploadFn {
  const { fieldName = "file", method = "POST", headers = {}, data = {}, withCredentials = true, xsrfCookie = "XSRF-TOKEN" } = options;
  return (file, { onProgress, signal }) =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.withCredentials = withCredentials;
      xhr.setRequestHeader("Accept", "application/json");
      xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      if (xsrfCookie && typeof document !== "undefined") {
        const m = document.cookie.match(new RegExp(`(?:^|; )${xsrfCookie}=([^;]*)`));
        if (m) xhr.setRequestHeader("X-XSRF-TOKEN", decodeURIComponent(m[1]));
      }
      for (const [k, v] of Object.entries(headers)) xhr.setRequestHeader(k, v);
      xhr.upload.onprogress = (e) => e.lengthComputable && onProgress((e.loaded / e.total) * 100);
      xhr.onload = () => {
        let body: unknown = xhr.responseText;
        try {
          body = JSON.parse(xhr.responseText);
        } catch {
          /* not JSON */
        }
        if (xhr.status >= 200 && xhr.status < 300) return resolve(body);
        const b = body as { message?: string; errors?: Record<string, string[]> } | null;
        const first = b?.errors ? Object.values(b.errors)[0]?.[0] : undefined;
        reject(new Error(first ?? b?.message ?? `Upload failed (${xhr.status}).`));
      };
      xhr.onerror = () => reject(new Error("Couldn't reach the server. Check your connection and try again."));
      xhr.onabort = () => reject(new DOMException("Upload cancelled", "AbortError"));
      signal.addEventListener("abort", () => xhr.abort());
      const form = new FormData();
      for (const [k, v] of Object.entries(data)) form.append(k, v);
      form.append(fieldName, file);
      xhr.send(form);
    });
}

/* ---------- the hook ---------- */

export function useFileUploads({
  upload,
  accept,
  maxSize,
  maxFiles,
  multiple = true,
  concurrency = 3,
  onChange,
  onUploaded,
}: UseFileUploadsOptions = {}) {
  const [items, setItemsState] = React.useState<UploadItem[]>([]);
  const [rejections, setRejections] = React.useState<string[]>([]);
  const itemsRef = React.useRef(items);
  const controllers = React.useRef(new Map<string, AbortController>());
  const cb = React.useRef({ onChange, onUploaded, upload });
  cb.current = { onChange, onUploaded, upload };

  const setItems = React.useCallback((update: (prev: UploadItem[]) => UploadItem[]) => {
    setItemsState((prev) => {
      const next = update(prev);
      itemsRef.current = next;
      cb.current.onChange?.(next);
      return next;
    });
  }, []);
  const patch = React.useCallback(
    (id: string, changes: Partial<UploadItem>) => setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...changes } : it))),
    [setItems]
  );

  const start = React.useCallback(
    (item: UploadItem) => {
      const fn = cb.current.upload;
      if (!fn || controllers.current.has(item.id)) return; // already running
      const controller = new AbortController();
      controllers.current.set(item.id, controller);
      patch(item.id, { status: "uploading", progress: 0, error: undefined });
      let last = 0;
      fn(item.file, {
        signal: controller.signal,
        onProgress: (p) => {
          const pct = Math.max(0, Math.min(99, Math.round(p)));
          if (pct !== last) {
            last = pct;
            patch(item.id, { progress: pct });
          }
        },
      }).then(
        (response) => {
          controllers.current.delete(item.id);
          patch(item.id, { status: "done", progress: 100, response });
          const done = itemsRef.current.find((i) => i.id === item.id);
          if (done) cb.current.onUploaded?.({ ...done, status: "done", progress: 100, response });
        },
        (err: unknown) => {
          controllers.current.delete(item.id);
          if (controller.signal.aborted || (err instanceof DOMException && err.name === "AbortError")) {
            patch(item.id, { status: "cancelled" });
          } else {
            patch(item.id, { status: "error", error: err instanceof Error ? err.message : "Upload failed. Try again." });
          }
        }
      );
    },
    [patch]
  );

  // Start queued uploads as slots free up.
  React.useEffect(() => {
    if (!upload) return;
    const running = items.filter((i) => i.status === "uploading").length;
    const queued = items.filter((i) => i.status === "queued");
    queued.slice(0, Math.max(0, concurrency - running)).forEach(start);
  }, [items, upload, concurrency, start]);

  /** Add files (from a picker, a drop or a paste). Invalid ones are listed in `rejections`. */
  const addFiles = React.useCallback(
    (list: FileList | File[]) => {
      const files = Array.from(list);
      const problems: string[] = [];
      const accepted: UploadItem[] = [];
      const room = maxFiles !== undefined ? maxFiles - (multiple ? itemsRef.current.length : 0) : Infinity;
      for (const file of multiple ? files : files.slice(0, 1)) {
        if (!fileMatchesAccept(file, accept)) {
          problems.push(`${file.name} isn't an accepted file type. Use ${describeAccept(accept)}.`);
        } else if (maxSize !== undefined && file.size > maxSize) {
          problems.push(`${file.name} is ${formatBytes(file.size)}. The limit is ${formatBytes(maxSize)}.`);
        } else if (accepted.length >= room) {
          problems.push(`You can add up to ${maxFiles} file${maxFiles === 1 ? "" : "s"}. ${file.name} wasn't added.`);
        } else {
          accepted.push({
            id: newId(),
            file,
            status: upload ? "queued" : "selected",
            progress: 0,
            previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
          });
        }
      }
      setRejections(problems);
      if (accepted.length) setItems((prev) => (multiple ? [...prev, ...accepted] : accepted));
      return accepted;
    },
    [accept, maxSize, maxFiles, multiple, upload, setItems]
  );

  const cancel = React.useCallback((id: string) => controllers.current.get(id)?.abort(), []);
  const retry = React.useCallback((id: string) => patch(id, { status: "queued", progress: 0, error: undefined }), [patch]);
  const remove = React.useCallback(
    (id: string) => {
      controllers.current.get(id)?.abort();
      setItems((prev) => {
        const gone = prev.find((i) => i.id === id);
        if (gone?.previewUrl) URL.revokeObjectURL(gone.previewUrl);
        return prev.filter((i) => i.id !== id);
      });
    },
    [setItems]
  );
  const clear = React.useCallback(() => {
    controllers.current.forEach((c) => c.abort());
    setItems((prev) => {
      prev.forEach((i) => i.previewUrl && URL.revokeObjectURL(i.previewUrl));
      return [];
    });
    setRejections([]);
  }, [setItems]);

  // Clean up on unmount.
  React.useEffect(
    () => () => {
      controllers.current.forEach((c) => c.abort());
      itemsRef.current.forEach((i) => i.previewUrl && URL.revokeObjectURL(i.previewUrl));
    },
    []
  );

  return { items, rejections, addFiles, cancel, retry, remove, clear, dismissRejections: () => setRejections([]) };
}
