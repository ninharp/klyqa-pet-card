import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineElement } from './define';

/**
 * The suite runs in plain node, so there is no `customElements` registry. A minimal
 * fake is enough here: `defineElement` only ever asks whether a name is taken and
 * registers it if not.
 */
function fakeRegistry(): { get: ReturnType<typeof vi.fn>; define: ReturnType<typeof vi.fn> } {
  const registered = new Map<string, unknown>();
  return {
    get: vi.fn((name: string) => registered.get(name)),
    define: vi.fn((name: string, ctor: unknown) => {
      if (registered.has(name)) throw new Error(`the name "${name}" has already been used`);
      registered.set(name, ctor);
    }),
  };
}

function useRegistry(): ReturnType<typeof fakeRegistry> {
  const registry = fakeRegistry();
  vi.stubGlobal('customElements', registry);
  return registry;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

class First {}
class Second {}

describe('defineElement', () => {
  it('registers a name that is still free', () => {
    const registry = useRegistry();
    defineElement('klyqa-test-fresh', First as unknown as CustomElementConstructor);
    expect(registry.define).toHaveBeenCalledWith('klyqa-test-fresh', First);
  });

  it('does not throw when the name is already taken', () => {
    const registry = useRegistry();
    defineElement('klyqa-test-twice', First as unknown as CustomElementConstructor);
    expect(() =>
      defineElement('klyqa-test-twice', Second as unknown as CustomElementConstructor),
    ).not.toThrow();
    expect(registry.define).toHaveBeenCalledTimes(1);
    expect(registry.get('klyqa-test-twice')).toBe(First);
  });
});
