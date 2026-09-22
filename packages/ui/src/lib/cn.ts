import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge about our custom tokens so overrides resolve correctly.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: ["control", "control-sm", "control-lg"],
    },
  },
});

/** Merge class names, letting later Tailwind classes override earlier ones. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
