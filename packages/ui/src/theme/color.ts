/*
 * Small color helpers (no dependencies): parse hex, convert to OKLCH to lighten/darken
 * evenly across hues, back to hex (staying inside sRGB), and WCAG contrast.
 */

export type RGB = [number, number, number]; // 0–1
export type OKLCH = [number, number, number]; // L 0–1, C, H degrees

export function parseHex(hex: string): RGB | null {
  const m = hex.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as RGB;
}

export function toHex([r, g, b]: RGB) {
  return "#" + [r, g, b].map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0")).join("");
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function rgbToOklch(rgb: RGB): OKLCH {
  const [r, g, b] = rgb.map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(A, B), ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360];
}

function oklchToRgbUnclamped([L, C, H]: OKLCH): RGB {
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

/** OKLCH → sRGB, reducing chroma until it fits (keeps lightness and hue). */
export function oklchToRgb([L, C, H]: OKLCH): RGB {
  let c = C;
  for (let i = 0; i < 24; i++) {
    const rgb = oklchToRgbUnclamped([L, c, H]);
    if (rgb.every((v) => v >= -0.0005 && v <= 1.0005)) return rgb;
    c *= 0.9;
  }
  return oklchToRgbUnclamped([L, 0, H]);
}

export function luminance(rgb: RGB) {
  const [r, g, b] = rgb.map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: RGB, b: RGB) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** Shift lightness (in OKLCH, so every hue changes evenly) and optionally scale chroma. */
export function adjust(hex: string, dL: number, chroma = 1) {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  const [L, C, H] = rgbToOklch(rgb);
  return toHex(oklchToRgb([Math.min(0.98, Math.max(0.05, L + dL)), C * chroma, H]));
}

export function lightness(hex: string) {
  const rgb = parseHex(hex);
  return rgb ? rgbToOklch(rgb)[0] : 0.5;
}

/** Pick readable text for a background: white, or a near-black tinted with the same hue. */
export function readableOn(hex: string) {
  const rgb = parseHex(hex);
  if (!rgb) return "#ffffff";
  const white: RGB = [1, 1, 1];
  const [, C, H] = rgbToOklch(rgb);
  const darkHex = toHex(oklchToRgb([0.2, Math.min(C, 0.06), H]));
  return contrast(rgb, white) >= 4.5 || contrast(rgb, white) >= contrast(rgb, parseHex(darkHex)!) ? "#ffffff" : darkHex;
}
