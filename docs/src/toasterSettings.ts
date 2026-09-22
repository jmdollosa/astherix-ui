import * as React from "react";
import type { ToasterPosition } from "@jm/ui";

// Lets the Toast page change the guide's single Toaster.
type Settings = { position: ToasterPosition; richColors: boolean; expand: boolean };
let settings: Settings = { position: "bottom-right", richColors: false, expand: false };
const subs = new Set<(s: Settings) => void>();

export function useToasterSettings() {
  const [s, setS] = React.useState(settings);
  React.useEffect(() => {
    subs.add(setS);
    return () => {
      subs.delete(setS);
    };
  }, []);
  return {
    ...s,
    set: (patch: Partial<Settings>) => {
      settings = { ...settings, ...patch };
      subs.forEach((f) => f(settings));
    },
  };
}
