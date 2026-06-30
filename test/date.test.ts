import { describe, it, expect, beforeEach } from 'vitest';
import { setupRegistry } from './helpers.js';

describe('date functions', () => {
  let registry = setupRegistry();

  beforeEach(() => {
    registry = setupRegistry();
  });

  it('date.parse parses ISO date strings', () => {
    const fn = registry.functions.get('date.parse')!;
    const result = fn(['2024-01-15T10:30:00Z']);
    expect(result).toBeInstanceOf(Date);
    expect((result as Date).getFullYear()).toBe(2024);
    expect((result as Date).getMonth()).toBe(0);
    expect((result as Date).getDate()).toBe(15);
  });

  it('date.parse throws on invalid date', () => {
    const fn = registry.functions.get('date.parse')!;
    expect(() => fn(['not-a-date'])).toThrow();
  });

  it('date.parse uses format argument to parse custom date strings', () => {
    const fn = registry.functions.get('date.parse')!;
    let result = fn(['2024-01-15', 'yyyy-MM-dd']);
    expect(result).toBeInstanceOf(Date);
    expect((result as Date).getUTCFullYear()).toBe(2024);
    expect((result as Date).getUTCMonth()).toBe(0);
    expect((result as Date).getUTCDate()).toBe(15);

    result = fn(['15/01/2024 10:30:45', 'dd/MM/yyyy HH:mm:ss']);
    expect((result as Date).getUTCDate()).toBe(15);
    expect((result as Date).getUTCHours()).toBe(10);
    expect((result as Date).getUTCMinutes()).toBe(30);
    expect((result as Date).getUTCSeconds()).toBe(45);

    // 12-hour clock with AM
    result = fn(['01/15/2024 02:30 AM', 'MM/dd/yyyy hh:mm a']);
    expect((result as Date).getUTCHours()).toBe(2);

    // 12-hour clock with PM
    result = fn(['01/15/2024 02:30 PM', 'MM/dd/yyyy hh:mm a']);
    expect((result as Date).getUTCHours()).toBe(14);

    // Two-digit year
    result = fn(['24-01-15', 'yy-MM-dd']);
    expect((result as Date).getUTCFullYear()).toBe(2024);
  });

  it('date.parse ignores token patterns inside literal text (word boundaries)', () => {
    const fn = registry.functions.get('date.parse')!;
    // 'mm' inside 'common' is literal, not a token
    const result = fn(['common-01-2024', 'common-MM-yyyy']);
    expect((result as Date).getUTCMonth()).toBe(0);
    expect((result as Date).getUTCFullYear()).toBe(2024);
  });

  it('date.format formats a date', () => {
    const fn = registry.functions.get('date.format')!;
    const d = new Date('2024-01-15T10:30:45.123Z');
    expect(fn([d, 'yyyy-MM-dd'])).toBe('2024-01-15');
    expect(fn([d, 'yyyy-MM-dd HH:mm:ss'])).toBe('2024-01-15 10:30:45');
    expect(fn([d, 'MM/dd/yyyy'])).toBe('01/15/2024');
  });

  it('date.format supports SS and S millisecond variants', () => {
    const fn = registry.functions.get('date.format')!;
    const d = new Date('2024-01-15T10:30:45.123Z');
    expect(fn([d, 'SSS'])).toBe('123');
    expect(fn([d, 'SS'])).toBe('12');
    expect(fn([d, 'S'])).toBe('1');
    expect(fn([d, 'yyyy-MM-dd HH:mm:ss.SSS'])).toBe('2024-01-15 10:30:45.123');
  });

  it('date.format handles AM/PM token and literal text correctly', () => {
    const fn = registry.functions.get('date.format')!;
    const d = new Date('2024-01-15T10:30:00.000Z');
    expect(fn([d, 'yyyy-MM-dd a'])).toBe('2024-01-15 AM');
    expect(fn([d, 'a yyyy-MM-dd'])).toBe('AM 2024-01-15');
    // Token letters inside words are NOT replaced (word-boundary check)
    expect(fn([d, 'yyyy-MM-dd at HH:mm'])).toBe('2024-01-15 at 10:30');
    // Literal text between tokens is preserved
    expect(fn([d, 'yyyy-MM-dd | HH:mm | a'])).toBe('2024-01-15 | 10:30 | AM');
    // Token letters inside literal words are NOT replaced
    expect(fn([d, 'common-MM-yyyy'])).toBe('common-01-2024');
    expect(fn([d, 'seconds-ss-end'])).toBe('seconds-00-end');
  });

  it('date.format accepts timestamp', () => {
    const fn = registry.functions.get('date.format')!;
    const ts = new Date('2024-01-15T00:00:00Z').getTime();
    expect(fn([ts, 'yyyy-MM-dd'])).toBe('2024-01-15');
  });

  it('date.now returns current timestamp', () => {
    const fn = registry.functions.get('date.now')!;
    const result = fn([]);
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThan(Date.now() - 1000);
  });

  it('date.toString returns ISO string', () => {
    const fn = registry.functions.get('date.toString')!;
    const d = new Date('2024-01-15T10:30:00Z');
    expect(fn([d])).toBe('2024-01-15T10:30:00.000Z');
  });

  it('date.diff computes difference between dates', () => {
    const fn = registry.functions.get('date.diff')!;
    const d1 = '2024-01-01T00:00:00Z';
    const d2 = '2024-01-08T00:00:00Z';
    expect(fn([d1, d2, 'days'])).toBe(7);
    expect(fn([d1, d2, 'weeks'])).toBe(1);
    expect(fn([d1, d2, 'hours'])).toBe(7 * 24);
    expect(fn([d1, d2, 'years'])).toBe(0);
    // Default unit is milliseconds
    expect(fn([d1, d2])).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('date.diff throws on unknown unit', () => {
    const fn = registry.functions.get('date.diff')!;
    expect(() => fn(['2024-01-01', '2024-01-08', 'invalid'])).toThrow();
  });

  it('date.diff uses UTC for months/years', () => {
    const fn = registry.functions.get('date.diff')!;
    const d1 = '2023-12-15T00:00:00Z';
    const d2 = '2024-01-15T00:00:00Z';
    expect(fn([d1, d2, 'months'])).toBe(1);
    expect(fn([d1, d2, 'years'])).toBe(1);
  });
});
