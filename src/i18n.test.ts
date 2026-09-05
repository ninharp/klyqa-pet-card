import { describe, expect, it } from 'vitest';
import { resolveLang, t, tEnum } from './i18n';

describe('resolveLang', () => {
  it('maps de-* to de', () => {
    expect(resolveLang('de')).toBe('de');
    expect(resolveLang('de-DE')).toBe('de');
  });

  it('defaults to en for anything else', () => {
    expect(resolveLang('en')).toBe('en');
    expect(resolveLang('fr')).toBe('en');
    expect(resolveLang(undefined)).toBe('en');
  });
});

describe('t', () => {
  it('returns the UI string for a known key in both languages', () => {
    expect(t('en', 'unavailable')).toBe('Unavailable');
    expect(t('de', 'unavailable')).toBe('Nicht verfügbar');
  });

  it('falls back to the key itself when unknown', () => {
    expect(t('en', 'does_not_exist')).toBe('does_not_exist');
  });
});

describe('tEnum', () => {
  it('translates known enum values matching the integration option keys', () => {
    expect(tEnum('en', 'mode', 'fresh_water_24h')).toBe('24h fresh water');
    expect(tEnum('de', 'mode', 'fresh_water_24h')).toBe('24h Frischwasser');
    expect(tEnum('en', 'airQuality', 'heavily_polluted')).toBe('Heavily polluted');
    expect(tEnum('en', 'presetMode', 'standalone')).toBe('Standalone');
  });

  it('falls back to the raw value for unknown categories/values', () => {
    expect(tEnum('en', 'mode', 'unknown_value')).toBe('unknown_value');
    expect(tEnum('en', 'no_such_category', 'x')).toBe('x');
  });

  it('returns empty string for undefined value', () => {
    expect(tEnum('en', 'mode', undefined)).toBe('');
  });
});
