import * as React from "react";
import {
  FileDropzone,
  FileInput,
  FileUploadButton,
  Field,
  Button,
  Text,
  type UploadFn,
  type UploadItem,
} from "@jm/ui";
import { PageHeader, Section } from "../components/Doc";

/*
 * The docs can't send files anywhere, so this pretend upload moves the progress along
 * at a realistic pace for the file's size. Real apps use xhrUpload("/api/uploads").
 */
function makeFakeUpload(shouldFail: () => boolean): UploadFn {
  return (file, { onProgress, signal }) =>
    new Promise((resolve, reject) => {
      const fail = shouldFail();
      const bytesPerTick = 180_000 + Math.random() * 260_000; // roughly 1.5–3.5 MB/s
      let sent = 0;
      const total = Math.max(file.size, 400_000);
      const timer = setInterval(() => {
        sent += bytesPerTick;
        const pct = Math.min(100, (sent / total) * 100);
        onProgress(pct);
        if (fail && pct > 55) {
          clearInterval(timer);
          reject(new Error("The server stopped responding. Try again."));
        } else if (pct >= 100) {
          clearInterval(timer);
          resolve({ id: Math.random().toString(36).slice(2), url: `/storage/uploads/${encodeURIComponent(file.name)}` });
        }
      }, 120);
      signal.addEventListener("abort", () => {
        clearInterval(timer);
        reject(new DOMException("Upload cancelled", "AbortError"));
      });
    });
}

function useFailToggle() {
  const [fail, setFail] = React.useState(false);
  const ref = React.useRef(fail);
  ref.current = fail;
  const toggle = (
    <label className="flex items-center gap-2 text-sm text-fg-muted">
      <input type="checkbox" className="size-4 accent-[color:var(--color-danger)]" checked={fail} onChange={(e) => setFail(e.target.checked)} />
      Make uploads fail halfway
    </label>
  );
  return { shouldFail: () => ref.current, toggle };
}

function DropzoneDemo() {
  const { shouldFail, toggle } = useFailToggle();
  const upload = React.useMemo(() => makeFakeUpload(shouldFail), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [done, setDone] = React.useState(0);
  return (
    <div className="grid w-full max-w-lg gap-4">
      {toggle}
      <Field label="Receipts" description="Attach the receipts for this expense claim.">
        <FileDropzone
          upload={upload}
          accept="image/*,.pdf"
          maxSize={10 * 1024 * 1024}
          maxFiles={6}
          onUploaded={() => setDone((n) => n + 1)}
        />
      </Field>
      <Text size="sm" tone="muted" role="status">{done ? `${done} file${done === 1 ? "" : "s"} uploaded so far.` : "\u00a0"}</Text>
    </div>
  );
}

function ButtonDemo() {
  const { shouldFail, toggle } = useFailToggle();
  const upload = React.useMemo(() => makeFakeUpload(shouldFail), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [last, setLast] = React.useState<UploadItem | null>(null);
  return (
    <div className="grid w-full gap-4">
      {toggle}
      <div className="flex flex-wrap items-start gap-6">
        <FileUploadButton upload={upload} accept=".pdf,.docx" maxSize={20 * 1024 * 1024} onUploaded={setLast} onRemove={() => setLast(null)}>
          Upload contract
        </FileUploadButton>
        <FileUploadButton upload={upload} accept="image/*" variant="primary" leadingIcon="bi bi-image">
          Upload logo
        </FileUploadButton>
      </div>
      {last && (
        <Text size="sm" tone="muted">
          Server response: <code className="font-mono text-[0.8125rem]">{JSON.stringify(last.response)}</code>
        </Text>
      )}
    </div>
  );
}

function InputDemo() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [sent, setSent] = React.useState("");
  return (
    <form
      className="grid w-full max-w-md gap-5 rounded-card border border-border bg-surface p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const names = [...data.getAll("resume"), ...data.getAll("samples[]")]
          .filter((v): v is File => v instanceof File && v.size > 0)
          .map((f) => f.name);
        setSent(names.length ? `Would send: ${names.join(", ")}` : "No files chosen yet.");
      }}
    >
      <Field label="Résumé" description="PDF, up to 5 MB." required>
        <FileInput name="resume" accept=".pdf" maxSize={5 * 1024 * 1024} onFilesChange={setFiles} />
      </Field>
      <Field label="Work samples" optional>
        <FileInput name="samples[]" multiple accept="image/*,.pdf" size="sm" />
      </Field>
      <Field label="Signed NDA" disabled>
        <FileInput name="nda" />
      </Field>
      <div className="flex items-center justify-between gap-3">
        <Text size="sm" tone="muted" role="status">{sent || (files[0] ? `Chosen: ${files[0].name}` : "\u00a0")}</Text>
        <Button type="submit">Apply</Button>
      </div>
    </form>
  );
}

export function UploadPage() {
  return (
    <>
      <PageHeader
        title="File upload"
        intro="Three ways to add files: a dropzone for several at once, a redesigned file field for forms, and a button that uploads one file and shows its progress. They share one engine — checks, progress, cancel, retry — and upload with any endpoint."
        importLine={`import { FileDropzone, FileInput, FileUploadButton, xhrUpload } from "@jm/ui";`}
      />

      <Section
        title="Dropzone"
        desc="Drag files in, click to choose, or paste an image. Each file gets a thumbnail, its own progress, and Cancel, Retry or Remove. Files of the wrong type or size are explained, not silently dropped. (Uploads here are simulated.)"
        code={`
<Field label="Receipts" description="Attach the receipts for this expense claim.">
  <FileDropzone
    upload={xhrUpload("/api/receipts")}
    accept="image/*,.pdf"
    maxSize={10 * 1024 * 1024}        // 10 MB
    maxFiles={6}
    onUploaded={(item) => addReceipt(item.response)}
  />
</Field>`}
      >
        <DropzoneDemo />
      </Section>

      <Section
        title="Upload button"
        desc="A button that picks one file and uploads it straight away. While it runs you see the name, a ring filling up and the percentage; then “Upload complete” with Replace and Remove. Errors offer Retry. Try the failure toggle too."
        code={`
<FileUploadButton
  upload={xhrUpload("/api/contracts")}
  accept=".pdf,.docx"
  maxSize={20 * 1024 * 1024}
  onUploaded={(item) => setContractId(item.response.id)}
  onRemove={() => setContractId(null)}
>
  Upload contract
</FileUploadButton>`}
      >
        <ButtonDemo />
      </Section>

      <Section
        title="File field"
        desc="A redesigned file input for ordinary forms: a “Choose file” button joined to the file name, in the same frame as the other fields. It's a real file input, so the file is posted with the form — no upload code needed."
        code={`
<form method="post" action="/applications" encType="multipart/form-data">
  <Field label="Résumé" description="PDF, up to 5 MB." required>
    <FileInput name="resume" accept=".pdf" maxSize={5 * 1024 * 1024} />
  </Field>
  <Field label="Work samples" optional>
    <FileInput name="samples[]" multiple accept="image/*,.pdf" size="sm" />
  </Field>
  <Button type="submit">Apply</Button>
</form>`}
      >
        <InputDemo />
      </Section>

      <Section
        title="Uploading to Laravel"
        desc="xhrUpload sends the file with real upload progress (fetch can't report it), includes Laravel's XSRF cookie as a header, and turns validation errors into the message shown on the file."
        code={`
// React
<FileDropzone upload={xhrUpload("/api/receipts", { fieldName: "file", data: { claim_id: String(claim.id) } })} />

// routes/api.php
Route::post('/receipts', function (Request $request) {
    $request->validate(['file' => ['required', 'file', 'mimes:jpg,png,pdf', 'max:10240']]);
    $path = $request->file('file')->store('receipts');
    return ['id' => Receipt::create(['path' => $path])->id, 'url' => Storage::url($path)];
});

// A 422 like {"errors": {"file": ["The file must not be greater than 10240 kilobytes."]}}
// shows as that message on the file, with Retry.

// Your own endpoint or storage (e.g. S3 presigned URLs): write an UploadFn
const upload: UploadFn = (file, { onProgress, signal }) => { … return promise; };`}
      >
        <Text size="sm" tone="muted">The same upload function works with all three components.</Text>
      </Section>

      <Section
        title="Build your own"
        desc="useFileUploads is the engine behind all three — use it for a custom layout, like an avatar grid or a chat attachment tray."
        code={`
const { items, rejections, addFiles, cancel, retry, remove } = useFileUploads({
  upload: xhrUpload("/api/attachments"),
  accept: "image/*",
  maxSize: 5 * 1024 * 1024,
});

// items: [{ id, file, status: "queued" | "uploading" | "done" | "error" | "cancelled",
//           progress, error, response, previewUrl }]
<FileList items={items} onCancel={cancel} onRetry={retry} onRemove={remove} />`}
      >
        <Text size="sm" tone="muted">Screen readers hear when each file finishes or fails; progress bars report their value.</Text>
      </Section>
    </>
  );
}
