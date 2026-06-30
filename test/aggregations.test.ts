import { describe, it, expect, beforeEach } from 'vitest';
import { setupRegistry } from './helpers.js';

describe('aggregation functions', () => {
  let registry = setupRegistry();

  beforeEach(() => {
    registry = setupRegistry();
  });

  it('aggregation.avgOrNull computes average or null', () => {
    const fn = registry.aggregations.get('aggregation.avgOrNull')!;
    expect(fn([1, 2, 3, 4, 5])).toBe(3);
    expect(fn([])).toBeNull();
    expect(fn([10, 20])).toBe(15);
  });

  it('aggregation.collectDistinct collects unique values', () => {
    const fn = registry.aggregations.get('aggregation.collectDistinct')!;
    expect(fn([1, 2, 1, 3, 2])).toEqual([1, 2, 3]);
    expect(fn([])).toEqual([]);
  });

  it('aggregation.minOrNull finds minimum or null', () => {
    const fn = registry.aggregations.get('aggregation.minOrNull')!;
    expect(fn([3, 1, 2])).toBe(1);
    expect(fn([])).toBeNull();
  });

  it('aggregation.maxOrNull finds maximum or null', () => {
    const fn = registry.aggregations.get('aggregation.maxOrNull')!;
    expect(fn([3, 1, 2])).toBe(3);
    expect(fn([])).toBeNull();
  });
});
