import * as React from "react";
import { cn } from "../../lib/cn";
import {
  DialogSurface,
  Modal,
  ModalClose,
  ModalDescription,
  ModalTitle,
  ModalTrigger,
  useModal,
  type DialogSurfaceProps,
  type ModalProps,
} from "../modal/Modal";

/*
 * Drawer — a panel that slides in from an edge of the screen: navigation on phones,
 * filters, a record's details, a cart. It's a Modal underneath (same <dialog>, focus
 * handling, scroll lock, Escape and backdrop clicks), so the trigger, close, title and
 * description parts are the Modal ones under Drawer names.
 *
 *   <Drawer>
 *     <DrawerTrigger asChild><Button iconOnly icon="bi bi-list" aria-label="Menu" /></DrawerTrigger>
 *     <DrawerContent side="left">
 *       <DrawerHeader><DrawerTitle>Menu</DrawerTitle></DrawerHeader>
 *       <DrawerBody>…</DrawerBody>
 *     </DrawerContent>
 *   </Drawer>
 */

export type DrawerProps = ModalProps;
export const Drawer = Modal;
export const DrawerTrigger = ModalTrigger;
export const DrawerClose = ModalClose;
export const DrawerTitle = ModalTitle;
export const DrawerDescription = ModalDescription;
/** Open and close a drawer from code: `const nav = useDrawer(); <Drawer {...nav.drawerProps}>`. */
export function useDrawer(initialOpen = false) {
  const { modalProps, ...rest } = useModal(initialOpen);
  return { ...rest, drawerProps: modalProps };
}

export type DrawerSide = "left" | "right" | "top" | "bottom";

export interface DrawerContentProps extends DialogSurfaceProps {
  /** The edge it slides in from. Default "right"; "left" suits navigation, "bottom" suits phones. */
  side?: DrawerSide;
  /**
   * How far it reaches into the screen: the width for left/right, the height for
   * top/bottom. It never covers the whole screen, so the backdrop stays tappable.
   */
  size?: "sm" | "md" | "lg";
}

const placement: Record<DrawerSide, string> = {
  left: "open:justify-start",
  right: "open:justify-end",
  top: "open:flex-col open:justify-start",
  bottom: "open:flex-col open:justify-end",
};

const panelSide: Record<DrawerSide, string> = {
  left: "h-full border-r [--ui-drawer-from:translateX(-100%)]",
  right: "h-full border-l [--ui-drawer-from:translateX(100%)]",
  top: "w-full border-b [--ui-drawer-from:translateY(-100%)]",
  bottom: "w-full border-t rounded-t-modal [--ui-drawer-from:translateY(100%)]",
};

const reach: Record<"x" | "y", Record<"sm" | "md" | "lg", string>> = {
  x: { sm: "w-[min(18rem,calc(100%-3rem))]", md: "w-[min(24rem,calc(100%-3rem))]", lg: "w-[min(36rem,calc(100%-3rem))]" },
  y: { sm: "max-h-[40dvh]", md: "max-h-[65dvh]", lg: "max-h-[85dvh]" },
};

export const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(
  ({ side = "right", size = "md", className, ...props }, ref) => (
    <DialogSurface
      ref={ref}
      component="DrawerContent"
      dialogClassName={cn("overflow-hidden p-0 open:flex", placement[side])}
      panelClassName={cn(
        "relative flex flex-col overflow-y-auto overscroll-contain border-border bg-surface text-fg outline-none",
        "shadow-[var(--ui-shadow-modal)]",
        panelSide[side],
        reach[side === "left" || side === "right" ? "x" : "y"][size],
        "data-[state=open]:animate-[ui-drawer-in_260ms_cubic-bezier(0.2,0.9,0.3,1)]",
        "data-[state=closing]:animate-[ui-drawer-out_140ms_ease-in_forwards]",
        "motion-reduce:data-[state=open]:animate-[ui-fade-in_140ms_ease-out]",
        "motion-reduce:data-[state=closing]:animate-[ui-fade-out_140ms_ease-in_forwards]",
        // Keep content clear of notches and the home indicator.
        "pb-[env(safe-area-inset-bottom)]",
        className
      )}
      {...props}
    />
  )
);
DrawerContent.displayName = "DrawerContent";

export const DrawerHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("grid gap-1.5 px-5 pb-2 pr-14 pt-5", className)} {...props} />
  )
);
DrawerHeader.displayName = "DrawerHeader";

export const DrawerBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-1 px-5 py-3 text-[0.9375rem] leading-relaxed", className)} {...props} />
  )
);
DrawerBody.displayName = "DrawerBody";

export const DrawerFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mt-auto flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  )
);
DrawerFooter.displayName = "DrawerFooter";
