import { describe, it, expect, beforeEach } from 'vitest';
import commonsExtension from '../src/index.js';

/** Build a minimal mock registry for testing. */
function createMockRegistry() {
  const functions = new Map<string, (args: unknown[]) => unknown>();
  const aggregations = new Map<string, (values: unknown[]) => unknown>();
  return {
    addFunction(name: string, fn: (args: unknown[]) => unknown) {
      functions.set(name, fn);
    },
    addAggregation(name: string, fn: (values: unknown[]) => unknown) {
      aggregations.set(name, fn);
    },
    functions,
    aggregations,
  };
}

describe('apoc-commons extension', () => {
  let registry: ReturnType<typeof createMockRegistry>;

  beforeEach(() => {
    registry = createMockRegistry();
    commonsExtension.register(registry);
  });

  // ─── text.* ──────────────────────────────────────────────────

  describe('text functions', () => {
    it('text.join joins values with separator', () => {
      const fn = registry.functions.get('text.join')!;
      expect(fn([', ', 'a', 'b', 'c'])).toBe('a, b, c');
      expect(fn(['-', 'hello', 'world'])).toBe('hello-world');
    });

    it('text.capitalize capitalizes first letter', () => {
      const fn = registry.functions.get('text.capitalize')!;
      expect(fn(['hello'])).toBe('Hello');
      expect(fn([''])).toBe('');
      expect(fn(['already'])).toBe('Already');
    });

    it('text.replaceAll replaces all occurrences', () => {
      const fn = registry.functions.get('text.replaceAll')!;
      expect(fn(['hello world', 'o', '0'])).toBe('hell0 w0rld');
      expect(fn(['a b c', ' ', '-'])).toBe('a-b-c');
    });

    it('text.replaceAll works with RegExp pattern', () => {
      const fn = registry.functions.get('text.replaceAll')!;
      expect(fn(['hello world', /o/g, '0'])).toBe('hell0 w0rld');
      // Without 'g' flag, should still replace all (auto-adds g)
      expect(fn(['hello world', /o/, '0'])).toBe('hell0 w0rld');
      expect(fn(['ABCabc', /[a-z]/g, 'X'])).toBe('ABCXXX');
    });

    it('text.substring extracts substring', () => {
      const fn = registry.functions.get('text.substring')!;
      expect(fn(['hello world', 6])).toBe('world');
      expect(fn(['hello world', 0, 5])).toBe('hello');
      expect(fn(['hello', 2, 4])).toBe('ll');
    });

    it('text.defaultIfBlank returns fallback for blank strings', () => {
      const fn = registry.functions.get('text.defaultIfBlank')!;
      expect(fn(['  ', 'fallback'])).toBe('fallback');
      expect(fn(['hello'])).toBe('hello');
      expect(fn(['  ', 'default', 'extra'])).toBe('default');
      expect(fn(['hello', 'fallback'])).toBe('hello');
    });

    it('text.split splits string by delimiter', () => {
      const fn = registry.functions.get('text.split')!;
      expect(fn(['a,b,c', ','])).toEqual(['a', 'b', 'c']);
      expect(fn(['hello world', ' '])).toEqual(['hello', 'world']);
      expect(fn(['hello', ''])).toEqual(['hello']);
    });

    it('text.repeat repeats string n times', () => {
      const fn = registry.functions.get('text.repeat')!;
      expect(fn(['ab', 3])).toBe('ababab');
      expect(fn(['x', 0])).toBe('');
      expect(fn(['hi', 1])).toBe('hi');
    });

    it('text.toLowerCase converts to lowercase', () => {
      const fn = registry.functions.get('text.toLowerCase')!;
      expect(fn(['HELLO'])).toBe('hello');
      expect(fn(['Hello World'])).toBe('hello world');
    });

    it('text.toUpperCase converts to uppercase', () => {
      const fn = registry.functions.get('text.toUpperCase')!;
      expect(fn(['hello'])).toBe('HELLO');
      expect(fn(['Hello World'])).toBe('HELLO WORLD');
    });

    it('text.trim removes whitespace', () => {
      const fn = registry.functions.get('text.trim')!;
      expect(fn(['  hello  '])).toBe('hello');
      expect(fn(['hello'])).toBe('hello');
    });
  });

  // ─── coll.* ──────────────────────────────────────────────────

  describe('collection functions', () => {
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

  // ─── map.* ───────────────────────────────────────────────────

  describe('map functions', () => {
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

  // ─── math.* ──────────────────────────────────────────────────

  describe('math functions', () => {
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

  // ─── date.* ──────────────────────────────────────────────────

  describe('date functions', () => {
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

    it('date.format formats a date', () => {
      const fn = registry.functions.get('date.format')!;
      const d = new Date('2024-01-15T10:30:45.123Z');
      expect(fn([d, 'yyyy-MM-dd'])).toBe('2024-01-15');
      expect(fn([d, 'yyyy-MM-dd HH:mm:ss'])).toBe('2024-01-15 10:30:45');
      expect(fn([d, 'MM/dd/yyyy'])).toBe('01/15/2024');
    });

    it('date.format handles AM/PM token without matching literal text', () => {
      const fn = registry.functions.get('date.format')!;
      const d = new Date('2024-01-15T10:30:00.000Z');
      expect(fn([d, 'yyyy-MM-dd a'])).toBe('2024-01-15 AM');
      expect(fn([d, 'a yyyy-MM-dd'])).toBe('AM 2024-01-15');
      // The 'a' in 'at' should NOT be replaced
      expect(fn([d, 'yyyy-MM-dd at HH:mm'])).toBe('2024-01-15 at 10:30');
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

  // ─── util.* ──────────────────────────────────────────────────

  describe('util functions', () => {
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
      expect(fn(['not-a-number'])).toBe(0);
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

  // ─── Aggregations ────────────────────────────────────────────

  describe('aggregation functions', () => {
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

  // ─── Registration ────────────────────────────────────────────

  describe('registration', () => {
    it('registers all expected function names', () => {
      const expected = [
        // text
        'text.join', 'text.capitalize', 'text.replaceAll', 'text.substring',
        'text.defaultIfBlank', 'text.split', 'text.repeat', 'text.toLowerCase',
        'text.toUpperCase', 'text.trim',
        // coll
        'coll.sort', 'coll.reverse', 'coll.distinct', 'coll.flatten', 'coll.zip',
        'coll.union', 'coll.intersection', 'coll.disjunction', 'coll.size',
        'coll.min', 'coll.max', 'coll.sum', 'coll.avg', 'coll.contains',
        'coll.indexOf', 'coll.tail', 'coll.head', 'coll.page',
        // map
        'map.merge', 'map.mergeMaps', 'map.keys', 'map.values', 'map.entries',
        'map.contains', 'map.containsEntry', 'map.get', 'map.put', 'map.remove',
        // math
        'math.clamp', 'math.round', 'math.random', 'math.abs', 'math.sign',
        'math.floor', 'math.ceil', 'math.pow', 'math.sqrt', 'math.log',
        'math.log10', 'math.exp', 'math.min', 'math.max', 'math.e', 'math.pi',
        // date
        'date.parse', 'date.format', 'date.now', 'date.toString', 'date.diff',
        // util
        'util.isNumber', 'util.isString', 'util.isBoolean', 'util.isMap',
        'util.isList', 'util.toString', 'util.toBoolean', 'util.toInteger',
        'util.toFloat', 'util.coalesce', 'util.null',
      ];

      for (const name of expected) {
        expect(registry.functions.has(name), `Expected ${name} to be registered`).toBe(true);
      }
    });

    it('registers all expected aggregation names', () => {
      const expected = [
        'aggregation.avgOrNull',
        'aggregation.collectDistinct',
        'aggregation.minOrNull',
        'aggregation.maxOrNull',
      ];

      for (const name of expected) {
        expect(registry.aggregations.has(name), `Expected ${name} to be registered`).toBe(true);
      }
    });
  });
});
