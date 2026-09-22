import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { Button } from "../button/Button";

/*
 * Modal is built on the native <dialog> element opened with showModal(). That gives us,
 * for free: the top layer (no z-index fights), an inert background, Escape handling,
 * and focus moving into the dialog. On top of that we add open/close animation,
 * scroll locking, backdrop clicks, focus return, and a React-friendly API.
 */

/* ---------- context ---------- */

type ModalContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
  hasDescription: boolean;
  setHasDescription: (value: boolean) => void;
};

const ModalContext = React.createContext<ModalContextValue | null>(null);

function useModalContext(component: string) {
  const ctx = React.useContext(ModalContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Modal>.`);
  return ctx;
}

/* ---------- Modal (root) ---------- */

export interface ModalProps {
  /** Controlled open state. Pair with `onOpenChange`. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called whenever the modal asks to open or close (trigger, close button, Escape, backdrop). */
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Modal({ open: openProp, defaultOpen = false, onOpenChange, children }: ModalProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : uncontrolledOpen;
  const onOpenChangeRef = React.useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!controlled) setUncontrolledOpen(next);
      onOpenChangeRef.current?.(next);
    },
    [controlled]
  );

  const id = React.useId();
  const [hasDescription, setHasDescription] = React.useState(false);
  const value = React.useMemo(
    () => ({
      open,
      setOpen,
      titleId: `${id}-title`,
      descriptionId: `${id}-description`,
      hasDescription,
      setHasDescription,
    }),
    [open, setOpen, id, hasDescription]
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

/* ---------- useModal: open and close from code ---------- */

/**
 * Open and close a modal from anywhere in your component.
 *
 *   const confirm = useModal();
 *   <Modal {...confirm.modalProps}>…</Modal>
 *   confirm.open();
 */
export function useModal(initialOpen = false) {
  const [isOpen, setIsOpen] = React.useState(initialOpen);
  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen((v) => !v), []);
  return {
    isOpen,
    open,
    close,
    toggle,
    /** Spread onto <Modal>. */
    modalProps: { open: isOpen, onOpenChange: setIsOpen },
  };
}

/* ---------- Trigger and Close ---------- */

type ButtonLikeProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Merge behavior into your own element, e.g. <ModalTrigger asChild><Button>…</Button></ModalTrigger>. */
  asChild?: boolean;
};

export const ModalTrigger = React.forwardRef<HTMLButtonElement, ButtonLikeProps>(
  ({ asChild, onClick, ...props }, ref) => {
    const { open, setOpen } = useModalContext("ModalTrigger");
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : "button"}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          if (!event.defaultPrevented) setOpen(true);
        }}
        {...props}
      />
    );
  }
);
ModalTrigger.displayName = "ModalTrigger";

export const ModalClose = React.forwardRef<HTMLButtonElement, ButtonLikeProps>(
  ({ asChild, onClick, ...props }, ref) => {
    const { setOpen } = useModalContext("ModalClose");
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : "button"}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          if (!event.defaultPrevented) setOpen(false);
        }}
        {...props}
      />
    );
  }
);
ModalClose.displayName = "ModalClose";

/* ---------- scroll lock (shared by stacked modals) ---------- */

let lockCount = 0;
let saved: { overflow: string; paddingRight: string } | null = null;

function lockScroll() {
  if (lockCount++ > 0) return;
  const root = document.documentElement;
  const scrollbar = window.innerWidth - root.clientWidth;
  saved = { overflow: root.style.overflow, paddingRight: document.body.style.paddingRight };
  root.style.overflow = "hidden";
  // Keep the page from shifting sideways when the scrollbar disappears.
  if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
}

function unlockScroll() {
  if (lockCount === 0 || --lockCount > 0 || !saved) return;
  document.documentElement.style.overflow = saved.overflow;
  document.body.style.paddingRight = saved.paddingRight;
  saved = null;
}

/* ---------- ModalContent ---------- */

/*
 * Backdrop styles. Each reads a theme token, with a literal fallback for browsers
 * where ::backdrop doesn't inherit custom properties yet.
 */
const backdropClasses = {
  default: "backdrop:bg-[var(--ui-backdrop,rgb(18_20_24/0.5))]",
  dark: "backdrop:bg-[var(--ui-backdrop-dark,rgb(8_10_13/0.82))]",
  blur: "backdrop:bg-[var(--ui-backdrop-blur,rgb(18_20_24/0.22))] backdrop:backdrop-blur-[var(--ui-backdrop-blur-radius,8px)]",
  solid: "backdrop:bg-[var(--ui-backdrop-solid,#f6f7f9)]",
} as const;

export type ModalBackdrop = keyof typeof backdropClasses;

/** Must match the closing animation length below. */
const CLOSE_MS = 140;

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export const modalPanelVariants = cva(
  [
    "relative my-auto w-full rounded-modal border border-border bg-surface text-fg outline-none",
    "shadow-[var(--ui-shadow-modal)]",
    "data-[state=open]:animate-[ui-modal-in_200ms_cubic-bezier(0.2,0.9,0.3,1)]",
    "data-[state=closing]:animate-[ui-modal-out_140ms_ease-in_forwards]",
    "motion-reduce:data-[state=open]:animate-[ui-fade-in_140ms_ease-out]",
    "motion-reduce:data-[state=closing]:animate-[ui-fade-out_140ms_ease-in_forwards]",
  ],
  {
    variants: {
      size: {
        sm: "max-w-sm",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        // Covers the whole screen, edge to edge.
        full: "my-0 min-h-full max-w-none rounded-none border-0",
      },
    },
    defaultVariants: { size: "md" },
  }
);

export interface ModalContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalPanelVariants> {
  /**
   * Whether Escape, a backdrop click and the × button close the modal. Set false
   * while something is saving, or when the person must choose an action.
   */
  dismissible?: boolean;
  /**
   * How the page behind the modal is covered.
   * - "default": dimmed
   * - "dark": heavily darkened
   * - "blur": lightly dimmed and blurred
   * - "solid": fully covered with the page background color, so nothing behind shows
   */
  backdrop?: ModalBackdrop;
  /** Show the × button in the top-right corner. */
  showCloseButton?: boolean;
  /** Accessible label for the × button. */
  closeLabel?: string;
}

const XIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" aria-hidden="true">
    <path d="M5.5 5.5l9 9M14.5 5.5l-9 9" />
  </svg>
);

export const ModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
  (
    {
      className,
      size,
      backdrop = "default",
      dismissible = true,
      showCloseButton = true,
      closeLabel = "Close",
      children,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const { open, setOpen, titleId, descriptionId, hasDescription } = useModalContext("ModalContent");
    const dialogRef = React.useRef<HTMLDialogElement>(null);
    const returnFocusRef = React.useRef<HTMLElement | null>(null);
    const pressedBackdrop = React.useRef(false);
    const [phase, setPhase] = React.useState<"open" | "closed">("closed");

    const panelRef = React.useRef<HTMLDivElement | null>(null);
    const setPanelRef = (node: HTMLDivElement | null) => {
      panelRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    // Opening: showModal() first, then render the content into the open dialog, so
    // autoFocus works. Closing: play the exit animation, then close().
    useIsomorphicLayoutEffect(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      if (open) {
        if (!dialog.open) {
          returnFocusRef.current = document.activeElement as HTMLElement | null;
          dialog.showModal();
          lockScroll();
        }
        setPhase("open");
        return;
      }
      if (!dialog.open) {
        setPhase("closed");
        return;
      }
      const timer = window.setTimeout(() => {
        dialog.close();
        unlockScroll();
        setPhase("closed");
        const target = returnFocusRef.current;
        if (target && target.isConnected) target.focus();
      }, CLOSE_MS);
      return () => window.clearTimeout(timer);
    }, [open]);

    const state = open ? (phase === "open" ? "open" : "opening") : phase === "open" ? "closing" : "closed";

    // Once the content is in: if nothing inside took focus (no autoFocus), focus the
    // first focusable element, or the panel itself.
    React.useEffect(() => {
      if (state !== "open") return;
      const panel = panelRef.current;
      if (!panel || panel.contains(document.activeElement)) return;
      const first = panel.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? panel).focus();
    }, [state]);

    // If the component unmounts while open, release the page.
    React.useEffect(
      () => () => {
        if (dialogRef.current?.open) {
          dialogRef.current.close();
          unlockScroll();
        }
      },
      []
    );

    return (
      <dialog
        ref={dialogRef}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : titleId}
        aria-describedby={hasDescription ? descriptionId : undefined}
        data-state={state}
        className={cn(
          // The dialog fills the viewport so clicks outside the panel land on it (= backdrop).
          "fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto overscroll-contain",
          "bg-transparent p-4 text-fg sm:p-6 open:flex open:flex-col open:items-center",
          size === "full" && "p-0 sm:p-0",
          backdropClasses[backdrop],
          "data-[state=open]:backdrop:animate-[ui-fade-in_200ms_ease-out]",
          "data-[state=closing]:backdrop:animate-[ui-fade-out_140ms_ease-in_forwards]"
        )}
        onCancel={(event) => {
          // Escape. We close it ourselves so the exit animation can play.
          event.preventDefault();
          if (dismissible) setOpen(false);
        }}
        onClose={() => {
          // Closed by the browser directly (e.g. a <form method="dialog">).
          if (open) {
            unlockScroll();
            setPhase("closed");
            setOpen(false);
          }
        }}
        onPointerDown={(event) => {
          pressedBackdrop.current = event.target === event.currentTarget;
        }}
        onClick={(event) => {
          // Only a press that starts and ends on the backdrop closes the modal,
          // so selecting text and releasing outside the panel doesn't.
          if (dismissible && pressedBackdrop.current && event.target === event.currentTarget) setOpen(false);
          pressedBackdrop.current = false;
        }}
      >
        {(state === "open" || state === "closing") && (
          <div
            ref={setPanelRef}
            tabIndex={-1}
            data-state={state}
            className={cn(modalPanelVariants({ size }), className)}
            {...props}
          >
            {children}
            {/* After the content in the DOM, so focus starts on the content, not on ×. */}
            {showCloseButton && dismissible && (
              <div className="absolute right-3 top-3">
                <Button variant="ghost" size="sm" iconOnly aria-label={closeLabel} onClick={() => setOpen(false)}>
                  <XIcon />
                </Button>
              </div>
            )}
          </div>
        )}
      </dialog>
    );
  }
);
ModalContent.displayName = "ModalContent";

/* ---------- layout pieces ---------- */

export const ModalHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("grid gap-1.5 px-6 pb-2 pr-14 pt-6", className)} {...props} />
  )
);
ModalHeader.displayName = "ModalHeader";

export const ModalTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    const { titleId } = useModalContext("ModalTitle");
    return (
      <h2
        ref={ref}
        id={titleId}
        className={cn("text-lg font-semibold leading-snug tracking-[-0.01em]", className)}
        {...props}
      />
    );
  }
);
ModalTitle.displayName = "ModalTitle";

export const ModalDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { descriptionId, setHasDescription } = useModalContext("ModalDescription");
    React.useEffect(() => {
      setHasDescription(true);
      return () => setHasDescription(false);
    }, [setHasDescription]);
    return (
      <p ref={ref} id={descriptionId} className={cn("text-sm leading-relaxed text-fg-muted", className)} {...props} />
    );
  }
);
ModalDescription.displayName = "ModalDescription";

export const ModalBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-6 py-3 text-[0.9375rem] leading-relaxed", className)} {...props} />
  )
);
ModalBody.displayName = "ModalBody";

export const ModalFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // Phones: full-width buttons, main action on top. Wider: right-aligned row.
        "flex flex-col-reverse gap-2 px-6 pb-6 pt-4 max-sm:*:w-full sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
);
ModalFooter.displayName = "ModalFooter";
