import { describe, expect, it } from 'vitest';
import {
  aqiColor,
  enumLabel,
  isAvailable,
  minutesToDaysHours,
  numericState,
  tankPercent,
} from './derive';
import type { HassEntity } from './ha-types';

function state(value: string, attributes: Record<string, unknown> = {}): HassEntity {
  return { entity_id: 'sensor.x', state: value, attributes, last_changed: '', last_updated: '' };
}

describe('isAvailable', () => {
  it('is false when the entity is missing', () => {
    expect(isAvailable(undefined)).toBe(false);
  });

  it('is false when unavailable', () => {
    expect(isAvailable(state('unavailable'))).toBe(false);
  });

  it('is true otherwise, including "unknown"', () => {
    expect(isAvailable(state('22'))).toBe(true);
    expect(isAvailable(state('unknown'))).toBe(true);
  });
});

describe('aqiColor', () => {
  it('maps known grades to theme colours', () => {
    expect(aqiColor('excellent')).toContain('--success-color');
    expect(aqiColor('good')).toContain('--success-color');
    expect(aqiColor('slightly_polluted')).toContain('--warning-color');
    expect(aqiColor('heavily_polluted')).toContain('--error-color');
  });

  it('falls back for unknown/undefined grades', () => {
    expect(aqiColor(undefined)).toContain('--secondary-text-color');
    expect(aqiColor('nope')).toContain('--secondary-text-color');
  });
});

describe('tankPercent', () => {
  it('is 100 when the value equals the configured max', () => {
    expect(tankPercent(1600, 0)).toBe(100);
  });

  it('scales relative to the larger of otherValue and maxMl', () => {
    expect(tankPercent(800, 0, 1600)).toBe(50);
    expect(tankPercent(1600, 3200, 1600)).toBe(50);
  });

  it('clamps to [0, 100]', () => {
    expect(tankPercent(-10, 0)).toBe(0);
    expect(tankPercent(5000, 0, 1600)).toBe(100);
  });
});

describe('minutesToDaysHours', () => {
  it('splits minutes into days and hours', () => {
    expect(minutesToDaysHours(0)).toEqual({ days: 0, hours: 0 });
    expect(minutesToDaysHours(90)).toEqual({ days: 0, hours: 1 });
    expect(minutesToDaysHours(60 * 30)).toEqual({ days: 1, hours: 6 });
  });
});

describe('enumLabel', () => {
  const labels = { sensing: 'Sensing' };

  it('looks up a known value', () => {
    expect(enumLabel(labels, 'sensing')).toBe('Sensing');
  });

  it('falls back to the raw value when unknown', () => {
    expect(enumLabel(labels, 'mystery')).toBe('mystery');
  });

  it('returns empty string for undefined', () => {
    expect(enumLabel(labels, undefined)).toBe('');
  });
});

describe('numericState', () => {
  it('parses a numeric state', () => {
    expect(numericState(state('22.5'))).toBe(22.5);
  });

  it('returns undefined for missing or non-numeric state', () => {
    expect(numericState(undefined)).toBeUndefined();
    expect(numericState(state('unavailable'))).toBeUndefined();
  });
});
