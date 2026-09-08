import { describe, expect, it } from 'vitest';
import { resolveNavigationPath } from './actions';

describe('resolveNavigationPath', () => {
  it('defaults to the device detail page when unset', () => {
    expect(resolveNavigationPath(undefined, 'abc123')).toBe('/config/devices/device/abc123');
  });

  it('defaults to the device detail page for action "default"', () => {
    expect(resolveNavigationPath({ action: 'default' }, 'abc123')).toBe(
      '/config/devices/device/abc123',
    );
  });

  it('uses navigation_path when given', () => {
    expect(resolveNavigationPath({ action: 'navigate', navigation_path: '/lovelace/0' }, 'abc123')).toBe(
      '/lovelace/0',
    );
  });
});
