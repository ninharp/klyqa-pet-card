/** Formats an RGB triple as a `#rrggbb` hex string for `<input type="color">`. */
export function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Parses a `#rrggbb` hex string (as produced by `<input type="color">`) into an
 * RGB triple. Returns `null` for anything that isn't a well-formed 6-digit hex
 * colour, so callers can skip the service call rather than send `NaN` values.
 */
export function hexToRgb(hex: string): [number, number, number] | null {
  const match = /^#?([0-9a-fA-F]{6})$/.exec(hex);
  if (!match) return null;
  const value = match[1];
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return [r, g, b];
}
