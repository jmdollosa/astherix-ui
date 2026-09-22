import * as React from "react";
import { createThemeCss, getFontsHref, type ThemeConfig } from "../../theme/index";

export interface ThemeProviderProps {
  /** Your theme — e.g. `import theme from "./ui.theme.json"`, or one loaded from an API. */
  theme: ThemeConfig;
  /**
   * Where the theme applies. Default ":root" (the whole page). Use a selector such as
   * "[data-theme-scope=preview]" to theme only part of the page.
   */
  selector?: string;
  /** Nonce for a strict Content-Security-Policy. */
  nonce?: string;
  children?: React.ReactNode;
}

/**
 * Applies a theme config at runtime by writing its CSS variables into the page.
 * For a theme that never changes, prefer the build step (`jm-ui theme`) — it needs no JavaScript.
 */
export function ThemeProvider({ theme, selector, nonce, children }: ThemeProviderProps) {
  const css = React.useMemo(() => createThemeCss(theme, { selector }), [theme, selector]);
  const fonts = getFontsHref(theme);
  return (
    <>
      {fonts && <link rel="stylesheet" href={fonts} />}
      <style data-jm-ui-theme="" nonce={nonce} dangerouslySetInnerHTML={{ __html: css }} />
      {children}
    </>
  );
}
