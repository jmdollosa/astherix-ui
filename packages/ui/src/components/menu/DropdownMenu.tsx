import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/cn";
import { Button, renderIcon, type ButtonProps, type IconInput } from "../button/Button";

/*
 * DropdownMenu — a button that opens a list of actions (the WAI-ARIA "menu button"
 * pattern). Items can be plain actions, links, checkboxes or radio choices, grouped
 * with labels and separators. SplitButton pairs a main action with a menu of related ones.
 *
 * Keyboard: Enter / Space / ↓ opens (↑ opens at the last item); ↑ ↓ Home End move;
 * type a letter to jump; Enter or Space picks; Escape closes and returns focus.
 * The menu is positioned with `position: fixed` inside the component's DOM, so it
 * also works inside a Modal.
 */

type MenuContextValue = {
  open: boolean;
  setOpen: (open: boolean, focusTrigger?: boolean) => void;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  contentId: string;
  triggerId: string;
  openFocus: React.MutableRefObject<"first" | "last" | "content">;
};
const MenuContext = React.createContext<MenuContextValue | null>(null);
function useMenu(component: string) {
  const ctx = React.useContext(MenuContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <DropdownMenu>.`);
  return ctx;
}

/* ---------- root ---------- */

export interface DropdownMenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function DropdownMenu({ open: openProp, defaultOpen = false, onOpenChange, children }: DropdownMenuProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : uncontrolled;
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const openFocus = React.useRef<"first" | "last" | "content">("content");
  const id = React.useId();
  const cb = React.useRef(onOpenChange);
  cb.current = onOpenChange;

  const setOpen = React.useCallback(
    (next: boolean, focusTrigger = false) => {
      if (!controlled) setUncontrolled(next);
      cb.current?.(next);
      if (!next && focusTrigger) requestAnimationFrame(() => triggerRef.current?.focus());
    },
    [controlled]
  );

  return (
    <MenuContext.Provider value={{ open, setOpen, triggerRef, contentId: `${id}-menu`, triggerId: `${id}-trigger`, openFocus }}>
      <div className="relative inline-flex">{children}</div>
    </MenuContext.Provider>
  );
}

/* ---------- trigger ---------- */

export interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Use your own button: <DropdownMenuTrigger asChild><Button>Options</Button></DropdownMenuTrigger> */
  asChild?: boolean;
}

export const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ asChild, onClick, onKeyDown, ...props }, ref) => {
    const menu = useMenu("DropdownMenuTrigger");
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={(node: HTMLButtonElement | null) => {
          menu.triggerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        id={menu.triggerId}
        type={asChild ? undefined : "button"}
        aria-haspopup="menu"
        aria-expanded={menu.open}
        aria-controls={menu.open ? menu.contentId : undefined}
        data-state={menu.open ? "open" : "closed"}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(e);
          if (e.defaultPrevented) return;
          // A click from the keyboard (Enter/Space) moves focus to the first item.
          menu.openFocus.current = e.detail === 0 ? "first" : "content";
          menu.setOpen(!menu.open);
        }}
        onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
          onKeyDown?.(e);
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            menu.openFocus.current = e.key === "ArrowDown" ? "first" : "last";
            menu.setOpen(true);
          }
        }}
        {...props}
      />
    );
  }
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

/* ---------- content ---------- */

export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Line up the menu with the trigger's start (left) or end (right) edge. */
  align?: "start" | "end";
  /** Open below (default) or above; it flips automatically when there's no room. */
  side?: "bottom" | "top";
  /** Match the trigger's width at least. */
  matchTriggerWidth?: boolean;
}

const ITEM_SELECTOR = '[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]';

export const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ align = "start", side = "bottom", matchTriggerWidth = false, className, style, children, ...props }, ref) => {
    const menu = useMenu("DropdownMenuContent");
    const contentRef = React.useRef<HTMLDivElement | null>(null);
    const [pos, setPos] = React.useState<React.CSSProperties>({ visibility: "hidden" });
    const [placedSide, setPlacedSide] = React.useState<"bottom" | "top">(side);
    const typeahead = React.useRef({ text: "", timer: 0 });

    const items = () =>
      Array.from(contentRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? []).filter(
        (el) => el.getAttribute("aria-disabled") !== "true"
      );

    const place = React.useCallback(() => {
      const t = menu.triggerRef.current;
      const c = contentRef.current;
      if (!t || !c) return;
      const r = t.getBoundingClientRect();
      const h = c.offsetHeight;
      const w = Math.max(c.offsetWidth, matchTriggerWidth ? r.width : 0);
      const below = window.innerHeight - r.bottom - 8;
      const above = r.top - 8;
      const up = side === "top" ? above >= h || above > below : below < h && above > below;
      let left = align === "end" ? r.right - w : r.left;
      left = Math.max(8, Math.min(left, window.innerWidth - w - 8)); // stay on screen
      setPlacedSide(up ? "top" : "bottom");
      setPos({
        position: "fixed",
        left,
        ...(up ? { bottom: window.innerHeight - r.top + 6 } : { top: r.bottom + 6 }),
        minWidth: matchTriggerWidth ? r.width : undefined,
        maxHeight: Math.max(160, (up ? above : below) - 6),
      });
    }, [align, side, matchTriggerWidth, menu.triggerRef]);

    React.useLayoutEffect(() => {
      if (!menu.open) return;
      place();
      window.addEventListener("resize", place);
      window.addEventListener("scroll", place, true);
      return () => {
        window.removeEventListener("resize", place);
        window.removeEventListener("scroll", place, true);
      };
    }, [menu.open, place]);

    // Move focus into the menu when it opens.
    React.useEffect(() => {
      if (!menu.open) return;
      const list = items();
      const target = menu.openFocus.current;
      if (target === "first") list[0]?.focus();
      else if (target === "last") list[list.length - 1]?.focus();
      else contentRef.current?.focus({ preventScroll: true });
      menu.openFocus.current = "content";
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [menu.open]);

    // Close on a click outside (the trigger toggles itself).
    React.useEffect(() => {
      if (!menu.open) return;
      const onDown = (e: PointerEvent) => {
        const target = e.target as Node;
        if (contentRef.current?.contains(target) || menu.triggerRef.current?.contains(target)) return;
        menu.setOpen(false);
      };
      document.addEventListener("pointerdown", onDown);
      return () => document.removeEventListener("pointerdown", onDown);
    }, [menu]);

    if (!menu.open) return null;

    const onKeyDown = (e: React.KeyboardEvent) => {
      const list = items();
      const i = list.indexOf(document.activeElement as HTMLElement);
      const go = (n: number) => {
        e.preventDefault();
        list[(n + list.length) % list.length]?.focus();
      };
      switch (e.key) {
        case "ArrowDown":
          return go(i < 0 ? 0 : i + 1);
        case "ArrowUp":
          return go(i < 0 ? list.length - 1 : i - 1);
        case "Home":
          return go(0);
        case "End":
          return go(list.length - 1);
        case "Escape":
          e.preventDefault();
          e.stopPropagation(); // don't also close a surrounding Modal
          menu.setOpen(false, true);
          return;
        case "Tab":
          e.preventDefault();
          menu.setOpen(false, true);
          return;
        default:
          // Type-ahead: jump to the next item whose text starts with what's typed.
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const t = typeahead.current;
            window.clearTimeout(t.timer);
            t.text += e.key.toLowerCase();
            t.timer = window.setTimeout(() => (t.text = ""), 600);
            const start = t.text.length === 1 ? i + 1 : Math.max(i, 0);
            for (let k = 0; k < list.length; k++) {
              const el = list[(start + k) % list.length];
              if ((el.dataset.textValue ?? el.textContent ?? "").trim().toLowerCase().startsWith(t.text)) {
                el.focus();
                break;
              }
            }
          }
      }
    };

    return (
      <div
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        id={menu.contentId}
        role="menu"
        aria-labelledby={menu.triggerId}
        aria-orientation="vertical"
        tabIndex={-1}
        data-side={placedSide}
        onKeyDown={onKeyDown}
        style={{ ...pos, ...style }}
        className={cn(
          "z-[60] min-w-48 max-w-[min(20rem,calc(100vw-1rem))] overflow-y-auto overscroll-contain rounded-control-lg border border-border bg-surface p-1 text-fg outline-none",
          "shadow-[var(--ui-shadow-lg)]",
          "data-[side=bottom]:animate-[ui-menu-down_140ms_cubic-bezier(0.2,0.9,0.3,1)] data-[side=top]:animate-[ui-menu-up_140ms_cubic-bezier(0.2,0.9,0.3,1)]",
          "motion-reduce:animate-[ui-fade-in_120ms_ease-out]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DropdownMenuContent.displayName = "DropdownMenuContent";

/* ---------- items ---------- */

const itemClass = (destructive?: boolean, inset?: boolean) =>
  cn(
    "relative flex w-full cursor-pointer select-none items-center gap-2.5 rounded-control-sm px-2.5 py-2 text-left text-sm text-fg outline-none",
    "focus:bg-secondary-hover data-[disabled]:cursor-not-allowed data-[disabled]:opacity-45 data-[disabled]:focus:bg-transparent",
    "[&>i]:text-[1.05em] [&>i]:text-fg-muted [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-fg-muted",
    destructive && "text-danger focus:bg-[color:color-mix(in_srgb,var(--color-danger)_10%,transparent)] [&>i]:text-danger [&>svg]:text-danger",
    inset && "ps-8"
  );

type ItemBase = {
  /** Called when the item is picked. Call event.preventDefault() to keep the menu open. */
  onSelect?: (event: Event) => void;
  disabled?: boolean;
  icon?: IconInput;
  /** A keyboard shortcut shown at the right, e.g. "⌘D". Purely a hint; wire the keys yourself. */
  shortcut?: string;
  /** A second line of smaller text. */
  description?: React.ReactNode;
  /** Styles the item in red, for actions like Delete. */
  destructive?: boolean;
  /** Line the text up with items that have icons. */
  inset?: boolean;
  /** Text used for type-ahead when the label isn't plain text. */
  textValue?: string;
};

function useSelect(onSelect: ItemBase["onSelect"], disabled?: boolean, keepOpen = false) {
  const menu = useMenu("DropdownMenuItem");
  return (e: React.SyntheticEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    const event = new Event("select", { cancelable: true });
    onSelect?.(event);
    if (!event.defaultPrevented && !keepOpen) menu.setOpen(false, true);
  };
}

function ItemInner({ icon, children, description, shortcut, end }: Pick<ItemBase, "icon" | "shortcut" | "description"> & { children: React.ReactNode; end?: React.ReactNode }) {
  return (
    <>
      {renderIcon(icon)}
      <span className="min-w-0 flex-1">
        <span className="block truncate">{children}</span>
        {description && <span className="block truncate text-xs text-fg-muted">{description}</span>}
      </span>
      {shortcut && <span className="ms-4 shrink-0 text-xs tracking-wide text-fg-muted">{shortcut}</span>}
      {end}
    </>
  );
}

export interface DropdownMenuItemProps extends ItemBase, Omit<React.HTMLAttributes<HTMLElement>, "onSelect"> {
  /** Render your own element, e.g. a link: <DropdownMenuItem asChild><a href="/settings">Settings</a></DropdownMenuItem> */
  asChild?: boolean;
}

export const DropdownMenuItem = React.forwardRef<HTMLElement, DropdownMenuItemProps>(
  ({ onSelect, disabled, icon, shortcut, description, destructive, inset, textValue, asChild, className, children, onClick, onKeyDown, ...props }, ref) => {
    const select = useSelect(onSelect, disabled);
    const Comp: React.ElementType = asChild ? Slot : "div";
    const inner = asChild ? children : <ItemInner icon={icon} shortcut={shortcut} description={description}>{children}</ItemInner>;
    return (
      <Comp
        ref={ref as React.Ref<HTMLDivElement>}
        role="menuitem"
        tabIndex={-1}
        aria-disabled={disabled || undefined}
        data-disabled={disabled ? "" : undefined}
        data-text-value={textValue}
        className={cn(itemClass(destructive, inset), className)}
        onPointerMove={(e: React.PointerEvent<HTMLElement>) => !disabled && e.currentTarget.focus({ preventScroll: true })}
        onClick={(e: React.MouseEvent<HTMLElement>) => {
          onClick?.(e);
          select(e);
        }}
        onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
          onKeyDown?.(e);
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (asChild && !disabled) (e.currentTarget as HTMLElement).click(); // follow the link
            else select(e);
          }
        }}
        {...props}
      >
        {inner}
      </Comp>
    );
  }
);
DropdownMenuItem.displayName = "DropdownMenuItem";

const CheckMark = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="absolute start-2.5 size-4 text-primary">
    <path d="M4.5 10.5l3.5 3.5 7.5-8" />
  </svg>
);

export interface DropdownMenuCheckboxItemProps extends Omit<ItemBase, "destructive" | "inset" | "icon">, Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Close the menu after toggling. Default false, so several can be changed at once. */
  closeOnSelect?: boolean;
}

export function DropdownMenuCheckboxItem({ checked, onCheckedChange, closeOnSelect = false, onSelect, disabled, shortcut, description, textValue, className, children, ...props }: DropdownMenuCheckboxItemProps) {
  const select = useSelect((e) => {
    onSelect?.(e);
    if (!e.defaultPrevented) onCheckedChange?.(!checked);
  }, disabled, !closeOnSelect);
  return (
    <div
      role="menuitemcheckbox"
      aria-checked={checked}
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      data-disabled={disabled ? "" : undefined}
      data-text-value={textValue}
      className={cn(itemClass(false, true), className)}
      onPointerMove={(e) => !disabled && e.currentTarget.focus({ preventScroll: true })}
      onClick={select}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          select(e);
        }
      }}
      {...props}
    >
      {checked && <CheckMark />}
      <ItemInner shortcut={shortcut} description={description}>{children}</ItemInner>
    </div>
  );
}

const RadioContext = React.createContext<{ value: string | null; onValueChange?: (v: string) => void; closeOnSelect: boolean } | null>(null);

export interface DropdownMenuRadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string | null;
  onValueChange?: (value: string) => void;
  /** Close the menu after choosing. Default true. */
  closeOnSelect?: boolean;
}

export function DropdownMenuRadioGroup({ value, onValueChange, closeOnSelect = true, ...props }: DropdownMenuRadioGroupProps) {
  return (
    <RadioContext.Provider value={{ value, onValueChange, closeOnSelect }}>
      <div role="group" {...props} />
    </RadioContext.Provider>
  );
}

export interface DropdownMenuRadioItemProps extends Omit<ItemBase, "destructive" | "inset" | "icon">, Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  value: string;
}

export function DropdownMenuRadioItem({ value, onSelect, disabled, shortcut, description, textValue, className, children, ...props }: DropdownMenuRadioItemProps) {
  const group = React.useContext(RadioContext);
  if (!group) throw new Error("<DropdownMenuRadioItem> must be used inside <DropdownMenuRadioGroup>.");
  const checked = group.value === value;
  const select = useSelect((e) => {
    onSelect?.(e);
    if (!e.defaultPrevented) group.onValueChange?.(value);
  }, disabled, !group.closeOnSelect);
  return (
    <div
      role="menuitemradio"
      aria-checked={checked}
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      data-disabled={disabled ? "" : undefined}
      data-text-value={textValue}
      className={cn(itemClass(false, true), className)}
      onPointerMove={(e) => !disabled && e.currentTarget.focus({ preventScroll: true })}
      onClick={select}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          select(e);
        }
      }}
      {...props}
    >
      {checked && <span aria-hidden="true" className="absolute start-3.5 size-1.5 rounded-full bg-primary" />}
      <ItemInner shortcut={shortcut} description={description}>{children}</ItemInner>
    </div>
  );
}

/** A small heading for a group of items. */
export function DropdownMenuLabel({ className, inset, ...props }: React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }) {
  return <div role="presentation" className={cn("px-2.5 pb-1 pt-2 text-xs font-medium text-fg-muted", inset && "ps-8", className)} {...props} />;
}

export function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div role="separator" aria-orientation="horizontal" className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />;
}

/** Groups related items (optionally under a DropdownMenuLabel). */
export function DropdownMenuGroup(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div role="group" {...props} />;
}

/* ---------- SplitButton ---------- */

export interface SplitButtonProps extends Omit<ButtonProps, "iconOnly" | "asChild"> {
  /** The menu items (DropdownMenuItem, separators…). */
  menu: React.ReactNode;
  /** Accessible label for the arrow button. Default "More options". */
  menuLabel?: string;
  align?: "start" | "end";
}

/** A main action with an attached arrow that opens related actions. */
export function SplitButton({ menu, menuLabel = "More options", align = "end", variant = "primary", size, rounded, raised, shadow, disabled, className, ...props }: SplitButtonProps) {
  const shared = { variant, size, rounded, raised, shadow, disabled };
  return (
    <div role="group" className={cn("inline-flex", className)}>
      <Button {...shared} {...props} className="rounded-e-none" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            {...shared}
            iconOnly
            aria-label={menuLabel}
            className={cn(
              "rounded-s-none",
              // A thin divider between the two halves.
              variant === "secondary" ? "-ms-px" : "border-s border-s-[color:color-mix(in_srgb,currentColor_28%,transparent)]"
            )}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5.5 8l4.5 4.5L14.5 8" />
            </svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align}>{menu}</DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
