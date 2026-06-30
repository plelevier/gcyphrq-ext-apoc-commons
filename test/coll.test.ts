import { describe, it, expect, beforeEach } from 'vitest';
import { setupRegistry } from './helpers.js';

describe('collection functions', () => {
  let registry = setupRegistry();

  beforeEach(() => {
    registry = setupRegistry();
  });

  it('coll.sort sorts a list', () => {
    const fn = registry.functions.get('coll.sort')!;
    expect(fn([[3, 1, 2]])).toEqual([1, 2, 3]);
    expect(fn([['c', 'a', 'b']])).toEqual(['a', 'b', 'c']);
    expect(fn([])).toEqual([]);
    // Varargs mode
    expect(fn([3, 1, 2])).toEqual([1, 2, 3]);
  });

  it('coll.sort uses numeric comparison for numbers', () => {
    const fn = registry.functions.get('coll.sort')!;
    expect(fn([[10, 2, 1, 100, 20]])).toEqual([1, 2, 10, 20, 100]);
  });

  it('coll.reverse reverses a list', () => {
    const fn = registry.functions.get('coll.reverse')!;
    expect(fn([[1, 2, 3]])).toEqual([3, 2, 1]);
    expect(fn([])).toEqual([]);
  });

  it('coll.distinct removes duplicates', () => {
    const fn = registry.functions.get('coll.distinct')!;
    expect(fn([[1, 2, 1, 3, 2]])).toEqual([1, 2, 3]);
    expect(fn([[1, 1, 1]])).toEqual([1]);
  });

  it('coll.flatten flattens nested arrays', () => {
    const fn = registry.functions.get('coll.flatten')!;
    const nested = [1, [2, [3, [4]]]];
    expect(fn([nested])).toEqual([1, 2, 3, 4]);
    expect(fn([[]])).toEqual([]);
  });

  it('coll.zip combines lists element-wise', () => {
    const fn = registry.functions.get('coll.zip')!;
    expect(fn([[1, 2, 3], ['a', 'b', 'c']])).toEqual([
      [1, 'a'],
      [2, 'b'],
      [3, 'c'],
    ]);
    // Different lengths — shorter list gets null
    expect(fn([[1, 2], ['a', 'b', 'c']])).toEqual([
      [1, 'a'],
      [2, 'b'],
      [null, 'c'],
    ]);
  });

  it('coll.union returns unique items from all lists', () => {
    const fn = registry.functions.get('coll.union')!;
    expect(fn([[1, 2], [2, 3]])).toEqual([1, 2, 3]);
  });

  it('coll.intersection returns common items', () => {
    const fn = registry.functions.get('coll.intersection')!;
    expect(fn([[1, 2, 3], [2, 3, 4]])).toEqual([2, 3]);
    expect(fn([[1, 2], [3, 4]])).toEqual([]);
  });

  it('coll.disjunction returns items in exactly one list', () => {
    const fn = registry.functions.get('coll.disjunction')!;
    expect(fn([[1, 2], [2, 3]])).toEqual([1, 3]);
  });

  it('coll.disjunction handles duplicates within a single set', () => {
    const fn = registry.functions.get('coll.disjunction')!;
    // '2' appears twice in first set but only in 1 set total → should be excluded (in both)
    // '1' appears in only first set → included
    // '3' appears in only second set → included
    expect(fn([[1, 2, 2], [2, 3]])).toEqual([1, 3]);
    // Item in only one set even with duplicates
    expect(fn([[1, 1, 1], [2]])).toEqual([1, 2]);
  });

  it('coll.size returns the size of a collection', () => {
    const fn = registry.functions.get('coll.size')!;
    expect(fn([[1, 2, 3]])).toBe(3);
    expect(fn(['hello'])).toBe(5);
    expect(fn([{ a: 1, b: 2 }])).toBe(2);
  });

  it('coll.min returns minimum value', () => {
    const fn = registry.functions.get('coll.min')!;
    expect(fn([[3, 1, 2]])).toBe(1);
    expect(fn([[]])).toBeNull();
  });

  it('coll.max returns maximum value', () => {
    const fn = registry.functions.get('coll.max')!;
    expect(fn([[3, 1, 2]])).toBe(3);
    expect(fn([[]])).toBeNull();
  });

  it('coll.sum returns sum of values', () => {
    const fn = registry.functions.get('coll.sum')!;
    expect(fn([[1, 2, 3]])).toBe(6);
    expect(fn([[]])).toBe(0);
  });

  it('coll.avg returns average of values', () => {
    const fn = registry.functions.get('coll.avg')!;
    expect(fn([[1, 2, 3, 4, 5]])).toBe(3);
    expect(fn([[]])).toBeNull();
  });

  it('coll.contains checks membership', () => {
    const fn = registry.functions.get('coll.contains')!;
    expect(fn([[1, 2, 3], 2])).toBe(true);
    expect(fn([[1, 2, 3], 4])).toBe(false);
  });

  it('coll.indexOf returns index of item', () => {
    const fn = registry.functions.get('coll.indexOf')!;
    expect(fn([[1, 2, 3], 2])).toBe(1);
    expect(fn([[1, 2, 3], 4])).toBe(-1);
  });

  it('coll.tail returns all but first element', () => {
    const fn = registry.functions.get('coll.tail')!;
    expect(fn([[1, 2, 3]])).toEqual([2, 3]);
    expect(fn([[1]])).toEqual([]);
  });

  it('coll.head returns first element', () => {
    const fn = registry.functions.get('coll.head')!;
    expect(fn([[1, 2, 3]])).toBe(1);
    expect(fn([[]])).toBeNull();
  });

  it('coll.page returns a slice of a list', () => {
    const fn = registry.functions.get('coll.page')!;
    expect(fn([[1, 2, 3, 4, 5], 0, 2])).toEqual([1, 2]);
    expect(fn([[1, 2, 3, 4, 5], 2, 2])).toEqual([3, 4]);
    expect(fn([[1, 2], 0, 5])).toEqual([1, 2]);
  });
});
