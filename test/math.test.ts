import { describe, it, expect, beforeEach } from 'vitest';
import { setupRegistry } from './helpers.js';

describe('math functions', () => {
  let registry = setupRegistry();

  beforeEach(() => {
    registry = setupRegistry();
  });

  it('math.clamp clamps value to range', () => {
    const fn = registry.functions.get('math.clamp')!;
    expect(fn([5, 0, 10])).toBe(5);
    expect(fn([-5, 0, 10])).toBe(0);
    expect(fn([15, 0, 10])).toBe(10);
  });

  it('math.clamp throws when min > max', () => {
    const fn = registry.functions.get('math.clamp')!;
    expect(() => fn([5, 10, 0])).toThrow();
  });

  it('math.round rounds to specified precision', () => {
    const fn = registry.functions.get('math.round')!;
    expect(fn([3.14159])).toBe(3);
    expect(fn([3.14159, 2])).toBe(3.14);
    expect(fn([3.14159, 3])).toBe(3.142);
  });

  it('math.random returns random number in range', () => {
    const fn = registry.functions.get('math.random')!;
    // Without args
    const r1 = fn([]);
    expect(typeof r1).toBe('number');
    expect(r1).toBeGreaterThanOrEqual(0);
    expect(r1).toBeLessThan(1);
    // With range
    const r2 = fn([1, 10]);
    expect(typeof r2).toBe('number');
    expect(r2).toBeGreaterThanOrEqual(1);
    expect(r2).toBeLessThanOrEqual(10);
  });

  it('math.random throws when min > max', () => {
    const fn = registry.functions.get('math.random')!;
    expect(() => fn([10, 5])).toThrow();
  });

  it('math.abs returns absolute value', () => {
    const fn = registry.functions.get('math.abs')!;
    expect(fn([-5])).toBe(5);
    expect(fn([5])).toBe(5);
  });

  it('math.sign returns sign of number', () => {
    const fn = registry.functions.get('math.sign')!;
    expect(fn([5])).toBe(1);
    expect(fn([-5])).toBe(-1);
    expect(fn([0])).toBe(0);
  });

  it('math.floor returns floor', () => {
    const fn = registry.functions.get('math.floor')!;
    expect(fn([3.7])).toBe(3);
    expect(fn([-3.7])).toBe(-4);
  });

  it('math.ceil returns ceiling', () => {
    const fn = registry.functions.get('math.ceil')!;
    expect(fn([3.2])).toBe(4);
    expect(fn([-3.2])).toBe(-3);
  });

  it('math.pow raises to power', () => {
    const fn = registry.functions.get('math.pow')!;
    expect(fn([2, 10])).toBe(1024);
    expect(fn([3, 2])).toBe(9);
  });

  it('math.sqrt returns square root', () => {
    const fn = registry.functions.get('math.sqrt')!;
    expect(fn([16])).toBe(4);
    expect(fn([2])).toBeCloseTo(1.41421356);
  });

  it('math.log returns natural logarithm', () => {
    const fn = registry.functions.get('math.log')!;
    expect(fn([Math.E])).toBe(1);
  });

  it('math.log10 returns base-10 logarithm', () => {
    const fn = registry.functions.get('math.log10')!;
    expect(fn([100])).toBe(2);
  });

  it('math.exp returns e^x', () => {
    const fn = registry.functions.get('math.exp')!;
    expect(fn([0])).toBe(1);
    expect(fn([1])).toBeCloseTo(2.71828);
  });

  it('math.min returns minimum of varargs', () => {
    const fn = registry.functions.get('math.min')!;
    expect(fn([3, 1, 2])).toBe(1);
    expect(fn([])).toBeNull();
  });

  it('math.max returns maximum of varargs', () => {
    const fn = registry.functions.get('math.max')!;
    expect(fn([3, 1, 2])).toBe(3);
    expect(fn([])).toBeNull();
  });

  it('math.e returns Euler number', () => {
    const fn = registry.functions.get('math.e')!;
    expect(fn([])).toBe(Math.E);
  });

  it('math.pi returns pi', () => {
    const fn = registry.functions.get('math.pi')!;
    expect(fn([])).toBe(Math.PI);
  });
});
