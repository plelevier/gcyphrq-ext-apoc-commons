import { describe, it, expect, beforeEach } from 'vitest';
import { setupRegistry } from './helpers.js';

describe('map functions', () => {
  let registry = setupRegistry();

  beforeEach(() => {
    registry = setupRegistry();
  });

  it('map.merge merges multiple maps', () => {
    const fn = registry.functions.get('map.merge')!;
    expect(fn([{ a: 1 }, { b: 2 }])).toEqual({ a: 1, b: 2 });
    expect(fn([{ a: 1 }, { a: 2, b: 3 }])).toEqual({ a: 2, b: 3 });
    expect(fn([])).toEqual({});
  });

  it('map.mergeMaps is an alias for map.merge', () => {
    const fn = registry.functions.get('map.mergeMaps')!;
    expect(fn([{ a: 1 }, { b: 2 }])).toEqual({ a: 1, b: 2 });
  });

  it('map.keys returns map keys', () => {
    const fn = registry.functions.get('map.keys')!;
    expect(fn([{ a: 1, b: 2, c: 3 }])).toEqual(['a', 'b', 'c']);
    expect(fn([{}])).toEqual([]);
  });

  it('map.values returns map values', () => {
    const fn = registry.functions.get('map.values')!;
    expect(fn([{ a: 1, b: 2 }])).toEqual([1, 2]);
  });

  it('map.entries returns key-value pairs', () => {
    const fn = registry.functions.get('map.entries')!;
    expect(fn([{ a: 1, b: 2 }])).toEqual([['a', 1], ['b', 2]]);
  });

  it('map.contains checks for key presence', () => {
    const fn = registry.functions.get('map.contains')!;
    expect(fn([{ a: 1, b: 2 }, 'a'])).toBe(true);
    expect(fn([{ a: 1, b: 2 }, 'c'])).toBe(false);
    expect(fn([{ a: null }, 'a'])).toBe(true); // key exists even if value is null
  });

  it('map.containsEntry checks for key with non-null value', () => {
    const fn = registry.functions.get('map.containsEntry')!;
    expect(fn([{ a: 1 }, 'a'])).toBe(true);
    expect(fn([{ a: null }, 'a'])).toBe(false); // value is null
    expect(fn([{ a: 1 }, 'b'])).toBe(false);
  });

  it('map.get retrieves a value with optional fallback', () => {
    const fn = registry.functions.get('map.get')!;
    expect(fn([{ a: 1 }, 'a'])).toBe(1);
    expect(fn([{ a: 1 }, 'b'])).toBeNull();
    expect(fn([{ a: 1 }, 'b', 'default'])).toBe('default');
    expect(fn([{ a: null }, 'a', 'default'])).toBe('default');
  });

  it('map.put adds a key-value pair', () => {
    const fn = registry.functions.get('map.put')!;
    expect(fn([{ a: 1 }, 'b', 2])).toEqual({ a: 1, b: 2 });
    expect(fn([{ a: 1 }, 'a', 3])).toEqual({ a: 3 });
  });

  it('map.remove removes a key', () => {
    const fn = registry.functions.get('map.remove')!;
    expect(fn([{ a: 1, b: 2 }, 'a'])).toEqual({ b: 2 });
  });
});
