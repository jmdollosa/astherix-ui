import * as React from "react";
import { useEditor, useEditorState, EditorContent, type Editor as TiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder, CharacterCount } from "@tiptap/extensions";
import { cn } from "../../lib/cn";
import { Button } from "../button/Button";
import { Input } from "../input/Input";
import { useField, useFieldControlProps } from "../input/Field";
import { controlFrame, type ControlRounded } from "../input/controlStyles";

/*
 * Editor — a basic rich-text (WYSIWYG) editor built on Tiptap (ProseMirror).
 * It edits and returns HTML. Formatting shortcuts work as expected (Ctrl/⌘+B, I, U, K…),
 * and Markdown-style typing too: "## " starts a heading, "- " a list, "> " a quote.
 *
 * Imported from "@jm/ui/editor" so apps that don't use it don't load Tiptap.
 */

export type EditorTool =
  | "paragraph"
  | "heading2"
  | "heading3"
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "code"
  | "link"
  | "bulletList"
  | "orderedList"
  | "blockquote"
  | "horizontalRule"
  | "undo"
  | "redo"
  | "|";

export const defaultTools: EditorTool[] = [
  "paragraph",
  "heading2",
  "heading3",
  "|",
  "bold",
  "italic",
  "underline",
  "strike",
  "code",
  "|",
  "link",
  "bulletList",
  "orderedList",
  "blockquote",
  "|",
  "undo",
  "redo",
];

export interface EditorProps {
  /** Controlled HTML value. */
  value?: string;
  /** Starting HTML when uncontrolled. */
  defaultValue?: string;
  /** Called with the new HTML on every change. An empty editor gives "". */
  onChange?: (html: string) => void;
  placeholder?: string;
  /** Which toolbar buttons to show, in order. "|" adds a divider. */
  toolbar?: EditorTool[];
  /** Hard limit on characters. Shows a counter. */
  maxLength?: number;
  /** Show the character count (always shown with maxLength). */
  showCount?: boolean;
  /** Minimum height of the writing area, e.g. "8rem". Default "9rem". */
  minHeight?: string;
  /** Maximum height before the writing area scrolls, e.g. "24rem". */
  maxHeight?: string;
  rounded?: Exclude<ControlRounded, "full">;
  invalid?: boolean;
  disabled?: boolean;
  /** Read-only: formatted text, no toolbar, no editing. */
  readOnly?: boolean;
  /** Adds a hidden input with this name holding the HTML, for normal form posts. */
  name?: string;
  id?: string;
  autoFocus?: boolean;
  /** Get the underlying Tiptap editor, e.g. to run commands or read JSON. */
  onReady?: (editor: TiptapEditor) => void;
  className?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

/* ---------- icons ---------- */

const svg = (children: React.ReactNode) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
const icons = {
  link: svg(<><path d="M8.5 11.5a3 3 0 0 0 4.2 0l2.6-2.6a3 3 0 0 0-4.2-4.2l-.9.9" /><path d="M11.5 8.5a3 3 0 0 0-4.2 0l-2.6 2.6a3 3 0 0 0 4.2 4.2l.9-.9" /></>),
  bulletList: svg(<><path d="M8 5.5h8M8 10h8M8 14.5h8" /><circle cx="4.2" cy="5.5" r=".9" fill="currentColor" /><circle cx="4.2" cy="10" r=".9" fill="currentColor" /><circle cx="4.2" cy="14.5" r=".9" fill="currentColor" /></>),
  orderedList: svg(<><path d="M8.5 5.5h7.5M8.5 10h7.5M8.5 14.5h7.5" /><path d="M3.5 4.5l1-.5v3" strokeWidth={1.3} /><path d="M3.3 11.9c.1-.6.6-.9 1.1-.9.6 0 1 .4 1 .9 0 .8-2.1 1.5-2.1 2.6h2.2" strokeWidth={1.3} /></>),
  blockquote: svg(<><path d="M4 5.5v9" strokeWidth={2} /><path d="M8 7h8M8 10h8M8 13h5" /></>),
  horizontalRule: svg(<path d="M3.5 10h13" />),
  undo: svg(<><path d="M7.5 5L4 8.5 7.5 12" /><path d="M4.5 8.5H12a4 4 0 0 1 0 8H9" /></>),
  redo: svg(<><path d="M12.5 5L16 8.5 12.5 12" /><path d="M15.5 8.5H8a4 4 0 0 0 0 8h3" /></>),
  code: svg(<><path d="M7 6.5L3.5 10 7 13.5" /><path d="M13 6.5l3.5 3.5-3.5 3.5" /></>),
};
const Glyph = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span aria-hidden="true" className={cn("text-[0.95rem] leading-none", className)}>
    {children}
  </span>
);

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const mod = isMac ? "⌘" : "Ctrl+";

/* ---------- link helpers ---------- */

function normalizeUrl(raw: string) {
  const url = raw.trim();
  if (!url) return "";
  if (/^(javascript|data|vbscript):/i.test(url)) return ""; // never allow script URLs
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(url)) return url;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url)) return `mailto:${url}`;
  return `https://${url}`;
}

/* ---------- component ---------- */

export const Editor = React.forwardRef<HTMLDivElement, EditorProps>(function Editor(
  {
    value,
    defaultValue = "",
    onChange,
    placeholder = "Start writing…",
    toolbar = defaultTools,
    maxLength,
    showCount = false,
    minHeight = "9rem",
    maxHeight,
    rounded = "md",
    invalid: invalidProp,
    disabled: disabledProp,
    readOnly = false,
    name,
    id,
    autoFocus = false,
    onReady,
    className,
    "aria-label": ariaLabel,
    "aria-describedby": describedBy,
  },
  ref
) {
  const field = useField();
  const countId = React.useId();
  const { invalid, ...control } = useFieldControlProps({
    id,
    invalid: invalidProp,
    disabled: disabledProp,
    "aria-describedby": [describedBy, showCount || maxLength ? countId : undefined].filter(Boolean).join(" ") || undefined,
  });
  const disabled = !!control.disabled;
  const editable = !disabled && !readOnly;

  const [html, setHtml] = React.useState(value ?? defaultValue);
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    // Render on the client only; avoids hydration mismatches in Next.js.
    immediatelyRender: false,
    editable,
    autofocus: autoFocus ? "end" : false,
    content: value ?? defaultValue,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
        // Keeps the HTML clean (no empty <p> added after headings, quotes and lists).
        trailingNode: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
        },
      }),
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: maxLength ?? null }),
    ],
    editorProps: {
      // useEditor re-applies these options on every render, so ARIA stays current.
      attributes: {
        role: "textbox",
        "aria-multiline": "true",
        class: "ui-prose ui-editor-content outline-none",
        ...(control.id ? { id: control.id } : {}),
        ...(ariaLabel ? { "aria-label": ariaLabel } : field?.labelId ? { "aria-labelledby": field.labelId } : {}),
        ...(control["aria-describedby"] ? { "aria-describedby": control["aria-describedby"] } : {}),
        ...(invalid ? { "aria-invalid": "true" } : {}),
        ...(readOnly ? { "aria-readonly": "true" } : {}),
        ...(disabled ? { "aria-disabled": "true" } : {}),
      },
    },
    onUpdate: ({ editor }) => {
      const next = editor.isEmpty ? "" : editor.getHTML();
      setHtml(next);
      onChangeRef.current?.(next);
    },
  });

  React.useEffect(() => {
    editor?.setEditable(editable);
  }, [editor, editable]);

  // Controlled: apply outside changes without losing the cursor on our own updates.
  React.useEffect(() => {
    if (!editor || value === undefined) return;
    const current = editor.isEmpty ? "" : editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "", { emitUpdate: false });
      setHtml(value);
    }
  }, [editor, value]);

  React.useEffect(() => {
    if (editor) onReady?.(editor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            paragraph: e.isActive("paragraph"),
            heading2: e.isActive("heading", { level: 2 }),
            heading3: e.isActive("heading", { level: 3 }),
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            underline: e.isActive("underline"),
            strike: e.isActive("strike"),
            code: e.isActive("code"),
            link: e.isActive("link"),
            bulletList: e.isActive("bulletList"),
            orderedList: e.isActive("orderedList"),
            blockquote: e.isActive("blockquote"),
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
            characters: e.storage.characterCount?.characters?.() ?? 0,
          }
        : null,
  });

  /* ----- link editing ----- */
  const [linkOpen, setLinkOpen] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState("");
  const openLink = React.useCallback(() => {
    if (!editor) return;
    setLinkUrl(editor.getAttributes("link").href ?? "");
    setLinkOpen(true);
  }, [editor]);
  const applyLink = () => {
    if (!editor) return;
    const href = normalizeUrl(linkUrl);
    const chain = editor.chain().focus().extendMarkRange("link");
    if (href) chain.setLink({ href }).run();
    else chain.unsetLink().run();
    setLinkOpen(false);
  };
  const removeLink = () => {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkOpen(false);
  };

  // Ctrl/⌘+K opens the link box.
  React.useEffect(() => {
    if (!editor || !editable) return;
    const dom = editor.view.dom as HTMLElement;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openLink();
      }
    };
    dom.addEventListener("keydown", onKey);
    return () => dom.removeEventListener("keydown", onKey);
  }, [editor, editable, openLink]);

  /* ----- toolbar ----- */
  type ToolDef = { label: string; shortcut?: string; content: React.ReactNode; active?: boolean; disabled?: boolean; run: () => void };
  const tools: Record<Exclude<EditorTool, "|">, ToolDef> = {
    paragraph: { label: "Normal text", content: <Glyph>¶</Glyph>, active: state?.paragraph, run: () => editor?.chain().focus().setParagraph().run() },
    heading2: { label: "Heading", content: <Glyph className="text-[0.8125rem] font-semibold">H2</Glyph>, active: state?.heading2, run: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
    heading3: { label: "Subheading", content: <Glyph className="text-[0.8125rem] font-semibold">H3</Glyph>, active: state?.heading3, run: () => editor?.chain().focus().toggleHeading({ level: 3 }).run() },
    bold: { label: "Bold", shortcut: `${mod}B`, content: <Glyph className="font-bold">B</Glyph>, active: state?.bold, run: () => editor?.chain().focus().toggleBold().run() },
    italic: { label: "Italic", shortcut: `${mod}I`, content: <Glyph className="font-serif italic">I</Glyph>, active: state?.italic, run: () => editor?.chain().focus().toggleItalic().run() },
    underline: { label: "Underline", shortcut: `${mod}U`, content: <Glyph className="underline underline-offset-2">U</Glyph>, active: state?.underline, run: () => editor?.chain().focus().toggleUnderline().run() },
    strike: { label: "Strikethrough", content: <Glyph className="line-through">S</Glyph>, active: state?.strike, run: () => editor?.chain().focus().toggleStrike().run() },
    code: { label: "Inline code", shortcut: `${mod}E`, content: icons.code, active: state?.code, run: () => editor?.chain().focus().toggleCode().run() },
    link: { label: state?.link ? "Edit link" : "Add link", shortcut: `${mod}K`, content: icons.link, active: state?.link || linkOpen, run: openLink },
    bulletList: { label: "Bulleted list", content: icons.bulletList, active: state?.bulletList, run: () => editor?.chain().focus().toggleBulletList().run() },
    orderedList: { label: "Numbered list", content: icons.orderedList, active: state?.orderedList, run: () => editor?.chain().focus().toggleOrderedList().run() },
    blockquote: { label: "Quote", content: icons.blockquote, active: state?.blockquote, run: () => editor?.chain().focus().toggleBlockquote().run() },
    horizontalRule: { label: "Divider line", content: icons.horizontalRule, run: () => editor?.chain().focus().setHorizontalRule().run() },
    undo: { label: "Undo", shortcut: `${mod}Z`, content: icons.undo, disabled: !state?.canUndo, run: () => editor?.chain().focus().undo().run() },
    redo: { label: "Redo", shortcut: isMac ? "⇧⌘Z" : "Ctrl+Y", content: icons.redo, disabled: !state?.canRedo, run: () => editor?.chain().focus().redo().run() },
  };

  // Roving focus: one Tab stop for the toolbar, arrow keys move between buttons.
  const buttonRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const [focusIndex, setFocusIndex] = React.useState(0);
  const buttons = toolbar.filter((t): t is Exclude<EditorTool, "|"> => t !== "|");
  const onToolbarKey = (e: React.KeyboardEvent) => {
    const last = buttons.length - 1;
    let next = focusIndex;
    if (e.key === "ArrowRight") next = focusIndex >= last ? 0 : focusIndex + 1;
    else if (e.key === "ArrowLeft") next = focusIndex <= 0 ? last : focusIndex - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else return;
    e.preventDefault();
    setFocusIndex(next);
    buttonRefs.current[next]?.focus();
  };

  const count = state?.characters ?? 0;
  let buttonIndex = -1;

  return (
    <div ref={ref} className={cn("grid w-full gap-1", className)}>
      <div
        data-invalid={invalid ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        data-readonly={readOnly ? "" : undefined}
        className={cn(controlFrame({ rounded }), "flex-col")}
      >
        {!readOnly && buttons.length > 0 && (
          <div
            role="toolbar"
            aria-label="Formatting"
            aria-controls={control.id}
            onKeyDown={onToolbarKey}
            className="flex flex-wrap items-center gap-0.5 border-b border-border px-1.5 py-1"
          >
            {toolbar.map((tool, i) => {
              if (tool === "|") return <span key={`sep-${i}`} aria-hidden="true" className="mx-1 h-5 w-px bg-border" />;
              const def = tools[tool];
              const index = ++buttonIndex;
              return (
                <button
                  key={tool}
                  ref={(el) => {
                    buttonRefs.current[index] = el;
                  }}
                  type="button"
                  tabIndex={index === focusIndex ? 0 : -1}
                  aria-label={def.label}
                  aria-pressed={def.active === undefined ? undefined : !!def.active}
                  title={def.shortcut ? `${def.label} (${def.shortcut})` : def.label}
                  disabled={disabled || !editor || def.disabled}
                  onMouseDown={(e) => e.preventDefault() /* keep the text selection */}
                  onFocus={() => setFocusIndex(index)}
                  onClick={def.run}
                  className={cn(
                    "grid size-8 cursor-pointer place-items-center rounded-control-sm text-fg-muted transition-colors duration-75",
                    "hover:bg-secondary-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-ring",
                    "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
                    "[&_svg]:size-[1.125rem]",
                    def.active && "bg-primary/12 text-primary hover:bg-primary/18 hover:text-primary"
                  )}
                >
                  {def.content}
                </button>
              );
            })}
          </div>
        )}

        {linkOpen && (
          <div className="flex flex-wrap items-center gap-2 border-b border-border bg-secondary-hover/40 px-2.5 py-2">
            <Input
              size="sm"
              autoFocus
              aria-label="Link address"
              placeholder="example.com or https://…"
              leadingIcon={icons.link}
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  e.stopPropagation();
                  setLinkOpen(false);
                  editor?.commands.focus();
                }
              }}
              frameClassName="flex-1 min-w-48"
            />
            <div className="flex gap-1.5">
              {state?.link && (
                <Button size="sm" variant="ghost" onClick={removeLink}>
                  Remove
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => { setLinkOpen(false); editor?.commands.focus(); }}>
                Cancel
              </Button>
              <Button size="sm" onClick={applyLink}>
                {state?.link ? "Update link" : "Add link"}
              </Button>
            </div>
          </div>
        )}

        <EditorContent
          editor={editor}
          onClick={() => editor && !editor.isFocused && editable && editor.commands.focus()}
          className={cn("cursor-text overflow-y-auto px-3.5 py-3", disabled && "cursor-not-allowed", readOnly && "cursor-auto")}
          style={{ minHeight, maxHeight }}
        />
      </div>

      {(showCount || maxLength !== undefined) && (
        <p
          id={countId}
          className={cn(
            "justify-self-end text-xs tabular-nums text-fg-muted",
            maxLength !== undefined && count >= maxLength * 0.9 && "text-fg",
            maxLength !== undefined && count >= maxLength && "text-danger"
          )}
        >
          {maxLength !== undefined ? `${count} / ${maxLength}` : `${count} characters`}
        </p>
      )}

      {name && <input type="hidden" name={name} value={html} />}
    </div>
  );
});

export type { TiptapEditor };
