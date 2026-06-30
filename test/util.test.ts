import { describe, it, expect, beforeEach } from 'vitest';
import { setupRegistry } from './helpers.js';

describe('util functions', () => {
  let registry = setupRegistry();

  beforeEach(() => {
    registry = setupRegistry();
  });

  it('util.isNumber checks if value is a number', () => {
    const fn = registry.functions.get('util.isNumber')!;
    expect(fn([42])).toBe(true);
    expect(fn(['hello'])).toBe(false);
    expect(fn([])).toBe(false);
  });

  it('util.isString checks if value is a string', () => {
    const fn = registry.functions.get('util.isString')!;
    expect(fn(['hello'])).toBe(true);
    expect(fn([42])).toBe(false);
  });

  it('util.isBoolean checks if value is a boolean', () => {
    const fn = registry.functions.get('util.isBoolean')!;
    expect(fn([true])).toBe(true);
    expect(fn([1])).toBe(false);
  });

  it('util.isMap checks if value is an object', () => {
    const fn = registry.functions.get('util.isMap')!;
    expect(fn([{ a: 1 }])).toBe(true);
    expect(fn([[1, 2]])).toBe(false);
  });

  it('util.isList checks if value is an array', () => {
    const fn = registry.functions.get('util.isList')!;
    expect(fn([[1, 2]])).toBe(true);
    expect(fn([{ a: 1 }])).toBe(false);
  });

  it('util.toString converts value to string', () => {
    const fn = registry.functions.get('util.toString')!;
    expect(fn([42])).toBe('42');
    expect(fn([true])).toBe('true');
    expect(fn([null])).toBe('null');
  });

  it('util.toBoolean converts value to boolean', () => {
    const fn = registry.functions.get('util.toBoolean')!;
    expect(fn([true])).toBe(true);
    expect(fn(['yes'])).toBe(true);
    expect(fn(['1'])).toBe(true);
    expect(fn(['false'])).toBe(false);
    expect(fn([0])).toBe(false);
    expect(fn([1])).toBe(true);
  });

  it('util.toInteger converts value to integer', () => {
    const fn = registry.functions.get('util.toInteger')!;
    expect(fn(['42'])).toBe(42);
    expect(fn([3.7])).toBe(3);
    expect(fn([3.9])).toBe(3);
    expect(fn(['not-a-number'])).toBe(0);
    // truncates toward zero for negatives (consistent with parseInt behavior)
    expect(fn([-3.7])).toBe(-3);
    expect(fn([-3.9])).toBe(-3);
  });

  it('util.toFloat converts value to float', () => {
    const fn = registry.functions.get('util.toFloat')!;
    expect(fn(['3.14'])).toBe(3.14);
    expect(fn([3])).toBe(3);
    expect(fn(['not-a-number'])).toBe(0);
  });

  it('util.coalesce returns first non-null value', () => {
    const fn = registry.functions.get('util.coalesce')!;
    expect(fn([null, 'hello', 'world'])).toBe('hello');
    expect(fn([null, undefined, 42])).toBe(42);
    expect(fn([null, null])).toBeNull();
  });

  it('util.null returns null', () => {
    const fn = registry.functions.get('util.null')!;
    expect(fn([])).toBeNull();
  });
});
