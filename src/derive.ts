import type { HassEntity } from './ha-types';

/** True when the entity exists and is not in the `unavailable` state. */
export function isAvailable(state: HassEntity | undefined): boolean {
  return state !== undefined && state.state !== 'unavailable';
}

const AQI_COLORS: Record<string, string> = {
  excellent: 'var(--success-color, #4caf50)',
  good: 'var(--success-color, #8bc34a)',
  slightly_polluted: 'var(--warning-color, #ff9800)',
  heavily_polluted: 'var(--error-color, #f44336)',
};

/** CSS colour (HA theme variable with fallback) for a PURIFIER_AQI_GRADES value. */
export function aqiColor(grade: string | undefined): string {
  if (!grade) return 'var(--secondary-text-color)';
  return AQI_COLORS[grade] ?? 'var(--secondary-text-color)';
}

/**
 * Visual-only fill percentage for a tank bar: `value` relative to the larger
 * of `otherValue` and `maxMl` (default 1600 ml), clamped to 0-100.
 */
export function tankPercent(value: number, otherValue: number, maxMl = 1600): number {
  const denom = Math.max(otherValue, maxMl, 1);
  const pct = (value / denom) * 100;
  return Math.min(100, Math.max(0, Math.round(pct)));
}

/** Splits a duration given in minutes into whole days and remaining hours. */
export function minutesToDaysHours(minutes: number): { days: number; hours: number } {
  const totalHours = Math.floor(minutes / 60);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return { days, hours };
}

/** Looks up a human label for an enum value, falling back to the raw value. */
export function enumLabel(labels: Record<string, string>, value: string | undefined): string {
  if (value === undefined) return '';
  return labels[value] ?? value;
}

/** Rounds a numeric sensor state for display, or returns undefined if not a number. */
export function numericState(state: HassEntity | undefined): number | undefined {
  if (!state) return undefined;
  const value = Number(state.state);
  return Number.isFinite(value) ? value : undefined;
}
