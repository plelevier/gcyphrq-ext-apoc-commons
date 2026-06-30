import type { FunctionExtension, FunctionRegistry } from 'gcyphrq';
import { helpers, validate, FunctionError } from 'gcyphrq';

const { isString, isNumber, isBoolean, isArray, isObject, isDate } = helpers;

/**
 * Common APOC utility functions for gcyphrq.
 *
 * Mirrors the most-used functions from Neo4j's APOC library:
 * - text.*  — string manipulation
 * - coll.*  — collection operations
 * - map.*   — map operations
 * - math.*  — math utilities
 * - date.*  — date/time utilities
 *
 * All functions are registered under the "apoc" namespace (declared in
 * the extension manifest), so they are called as apoc.text.join(...),
 * apoc.coll.sort(...), etc.
 */
export default {
  register(registry: FunctionRegistry) {
    // ─── text.* ────────────────────────────────────────────────

    registry.addFunction('text.join', (args) => {
      const { sep, values } = validate(args, (v) => {
        v.minCount(2);
        v.arg(0, 'sep', isString);
        v.argsFrom(1, 'values');
      });
      return (values as unknown[]).map(String).join(sep as string);
    });

    registry.addFunction('text.capitalize', (args) => {
      const { str } = validate(args, (v) => {
        v.count(1);
        v.arg(0, 'str', isString);
      });
      const s = str as string;
      if (!s) return s;
      return s.charAt(0).toUpperCase() + s.slice(1);
    });

    registry.addFunction('text.replaceAll', (args) => {
      const { str, pattern, replacement } = validate(args, (v) => {
        v.count(3);
        v.arg(0, 'str', isString);
        v.arg(1, 'pattern');
        v.arg(2, 'replacement', isString);
      });
      const s = str as string;
      const repl = replacement as string;
      if (isString(pattern)) {
        return s.split(pattern).join(repl);
      }
      const re = pattern as RegExp;
      const flags = re.flags.includes('g') ? re.flags : re.flags + 'g';
      return s.replace(new RegExp(re.source, flags), repl);
    });

    registry.addFunction('text.substring', (args) => {
      const { str, start } = validate(args, (v) => {
        v.minCount(2);
        v.arg(0, 'str', isString);
        v.arg(1, 'start', isNumber);
      });
      const s = str as string;
      const startIdx = start as number;
      if (args.length === 3 && isNumber(args[2])) {
        return s.substring(startIdx, args[2] as number);
      }
      return s.substring(startIdx);
    });

    registry.addFunction('text.defaultIfBlank', (args) => {
      const { value, fallback } = validate(args, (v) => {
        v.minCount(1);
        v.arg(0, 'value', isString);
        v.argOptional(1, 'fallback', isString);
      });
      const s = value as string;
      return s.trim() || (fallback as string) || '';
    });

    registry.addFunction('text.split', (args) => {
      const { str, delimiter } = validate(args, (v) => {
        v.count(2);
        v.arg(0, 'str', isString);
        v.arg(1, 'delimiter', isString);
      });
      const s = str as string;
      const delim = delimiter as string;
      if (!delim) return [s];
      return s.split(delim);
    });

    registry.addFunction('text.repeat', (args) => {
      const { str, count } = validate(args, (v) => {
        v.count(2);
        v.arg(0, 'str', isString);
        v.arg(1, 'count', isNumber);
      });
      const n = Math.max(0, Math.floor(count as number));
      return (str as string).repeat(n);
    });

    registry.addFunction('text.toLowerCase', (args) => {
      const { str } = validate(args, (v) => {
        v.count(1);
        v.arg(0, 'str', isString);
      });
      return (str as string).toLowerCase();
    });

    registry.addFunction('text.toUpperCase', (args) => {
      const { str } = validate(args, (v) => {
        v.count(1);
        v.arg(0, 'str', isString);
      });
      return (str as string).toUpperCase();
    });

    registry.addFunction('text.trim', (args) => {
      const { str } = validate(args, (v) => {
        v.count(1);
        v.arg(0, 'str', isString);
      });
      return (str as string).trim();
    });

    // ─── coll.* ────────────────────────────────────────────────

    registry.addFunction('coll.sort', (args) => {
      if (args.length === 0) return [];
      const list = args[0];
      const values = isArray(list) ? [...(list as unknown[])] : [...args];
      // Use numeric comparison when all elements are numbers, otherwise lexicographic
      const allNumbers = values.every((v) => typeof v === 'number');
      return values.sort(allNumbers ? (a, b) => (a as number) - (b as number) : (a, b) => String(a).localeCompare(String(b)));
    });

    registry.addFunction('coll.reverse', (args) => {
      if (args.length === 0) return [];
      const list = args[0];
      if (isArray(list)) {
        return [...list].reverse();
      }
      return [...args].reverse();
    });

    registry.addFunction('coll.distinct', (args) => {
      if (args.length === 0) return [];
      const list = args[0];
      if (isArray(list)) {
        return [...new Set(list)];
      }
      return [...new Set(args)];
    });

    registry.addFunction('coll.flatten', (args) => {
      if (args.length === 0) return [];
      const list = args[0];
      if (!isArray(list)) return args;
      return (list as unknown[]).flat(Infinity);
    });

    registry.addFunction('coll.zip', (args) => {
      if (args.length < 2) return [];
      const lists = args.filter(isArray) as unknown[][];
      if (lists.length < 2) return [];
      const maxLen = Math.max(...lists.map((l) => l.length));
      const result: unknown[][] = [];
      for (let i = 0; i < maxLen; i++) {
        result.push(lists.map((l) => l[i] ?? null));
      }
      return result;
    });

    registry.addFunction('coll.union', (args) => {
      if (args.length === 0) return [];
      const sets = args.filter(isArray) as unknown[][];
      if (sets.length === 0) return args;
      return [...new Set(sets.flat())];
    });

    registry.addFunction('coll.intersection', (args) => {
      if (args.length === 0) return [];
      const sets = args.filter(isArray) as unknown[][];
      if (sets.length === 0) return [];
      if (sets.length === 1) return [...sets[0]];
      const first = new Set(sets[0]);
      return sets.slice(1).reduce((acc, set) => {
        return acc.filter((item) => new Set(set).has(item));
      }, [...first]);
    });

    registry.addFunction('coll.disjunction', (args) => {
      if (args.length < 2) return [];
      const sets = args.filter(isArray) as unknown[][];
      if (sets.length < 2) return [];
      // Count how many sets contain each item (not total occurrences)
      const setCounts = new Map<unknown, number>();
      for (const set of sets) {
        const uniqueInSet = new Set(set);
        for (const item of uniqueInSet) {
          setCounts.set(item, (setCounts.get(item) ?? 0) + 1);
        }
      }
      // Items in exactly one set, preserving first-seen order
      const all = sets.flat();
      const seen = new Set<unknown>();
      return all.filter((item) => {
        if (seen.has(item)) return false;
        seen.add(item);
        return (setCounts.get(item) ?? 0) === 1;
      });
    });

    registry.addFunction('coll.size', (args) => {
      if (args.length === 0) return 0;
      const list = args[0];
      if (isArray(list)) return (list as unknown[]).length;
      if (isString(list)) return (list as string).length;
      if (isObject(list)) return Object.keys(list as Record<string, unknown>).length;
      return 1;
    });

    registry.addFunction('coll.min', (args) => {
      if (args.length === 0) return null;
      const list = args[0];
      const values = isArray(list) ? (list as unknown[]) : args;
      const nums = values.filter(isNumber) as number[];
      return nums.length > 0 ? Math.min(...nums) : null;
    });

    registry.addFunction('coll.max', (args) => {
      if (args.length === 0) return null;
      const list = args[0];
      const values = isArray(list) ? (list as unknown[]) : args;
      const nums = values.filter(isNumber) as number[];
      return nums.length > 0 ? Math.max(...nums) : null;
    });

    registry.addFunction('coll.sum', (args) => {
      if (args.length === 0) return 0;
      const list = args[0];
      const values = isArray(list) ? (list as unknown[]) : args;
      const nums = values.filter(isNumber) as number[];
      return nums.reduce((a, b) => a + b, 0);
    });

    registry.addFunction('coll.avg', (args) => {
      if (args.length === 0) return null;
      const list = args[0];
      const values = isArray(list) ? (list as unknown[]) : args;
      const nums = values.filter(isNumber) as number[];
      return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
    });

    registry.addFunction('coll.contains', (args) => {
      const { list, item } = validate(args, (v) => {
        v.count(2);
        v.arg(0, 'list', isArray);
        v.arg(1, 'item');
      });
      return (list as unknown[]).includes(item);
    });

    registry.addFunction('coll.indexOf', (args) => {
      const { list, item } = validate(args, (v) => {
        v.count(2);
        v.arg(0, 'list', isArray);
        v.arg(1, 'item');
      });
      return (list as unknown[]).indexOf(item);
    });

    registry.addFunction('coll.tail', (args) => {
      if (args.length === 0) return [];
      const list = args[0];
      if (!isArray(list)) return args.slice(1);
      return (list as unknown[]).slice(1);
    });

    registry.addFunction('coll.head', (args) => {
      if (args.length === 0) return null;
      const list = args[0];
      if (!isArray(list)) return args[0];
      return (list as unknown[])[0] ?? null;
    });

    registry.addFunction('coll.page', (args) => {
      const { list, offset, size } = validate(args, (v) => {
        v.count(3);
        v.arg(0, 'list', isArray);
        v.arg(1, 'offset', isNumber);
        v.arg(2, 'size', isNumber);
      });
      const arr = list as unknown[];
      const start = Math.max(0, Math.floor(offset as number));
      const len = Math.max(0, Math.floor(size as number));
      return arr.slice(start, start + len);
    });

    // ─── map.* ─────────────────────────────────────────────────

    registry.addFunction('map.merge', (args) => {
      if (args.length === 0) return {};
      const maps = args.filter(isObject) as Record<string, unknown>[];
      return Object.assign({}, ...maps);
    });

    registry.addFunction('map.mergeMaps', (args) => {
      // Same as map.merge — alias for compatibility
      if (args.length === 0) return {};
      const maps = args.filter(isObject) as Record<string, unknown>[];
      return Object.assign({}, ...maps);
    });

    registry.addFunction('map.keys', (args) => {
      if (args.length === 0) return [];
      const map = args[0];
      if (!isObject(map)) return [];
      return Object.keys(map as Record<string, unknown>);
    });

    registry.addFunction('map.values', (args) => {
      if (args.length === 0) return [];
      const map = args[0];
      if (!isObject(map)) return [];
      return Object.values(map as Record<string, unknown>);
    });

    registry.addFunction('map.entries', (args) => {
      if (args.length === 0) return [];
      const map = args[0];
      if (!isObject(map)) return [];
      return Object.entries(map as Record<string, unknown>);
    });

    registry.addFunction('map.contains', (args) => {
      const { map, key } = validate(args, (v) => {
        v.count(2);
        v.arg(0, 'map', isObject);
        v.arg(1, 'key', isString);
      });
      return (key as string) in (map as Record<string, unknown>);
    });

    registry.addFunction('map.containsEntry', (args) => {
      const { map, key } = validate(args, (v) => {
        v.count(2);
        v.arg(0, 'map', isObject);
        v.arg(1, 'key', isString);
      });
      const obj = map as Record<string, unknown>;
      const k = key as string;
      return k in obj && obj[k] != null;
    });

    registry.addFunction('map.get', (args) => {
      const { map, key, fallback } = validate(args, (v) => {
        v.minCount(2);
        v.arg(0, 'map', isObject);
        v.arg(1, 'key', isString);
        v.argOptional(2, 'fallback');
      });
      const obj = map as Record<string, unknown>;
      const k = key as string;
      if (k in obj && obj[k] != null) return obj[k];
      return fallback ?? null;
    });

    registry.addFunction('map.put', (args) => {
      const { map, key, value } = validate(args, (v) => {
        v.count(3);
        v.arg(0, 'map', isObject);
        v.arg(1, 'key', isString);
        v.arg(2, 'value');
      });
      const k = key as string;
      return { ...(map as Record<string, unknown>), [k]: value };
    });

    registry.addFunction('map.remove', (args) => {
      const { map, key } = validate(args, (v) => {
        v.count(2);
        v.arg(0, 'map', isObject);
        v.arg(1, 'key', isString);
      });
      const k = key as string;
      const copy = { ...(map as Record<string, unknown>) };
      delete copy[k];
      return copy;
    });

    // ─── math.* ────────────────────────────────────────────────

    registry.addFunction('math.clamp', (args) => {
      const { value, min, max } = validate(args, (v) => {
        v.count(3);
        v.arg(0, 'value', isNumber);
        v.arg(1, 'min', isNumber);
        v.arg(2, 'max', isNumber);
      });
      const v = value as number;
      const lo = min as number;
      const hi = max as number;
      if (lo > hi) {
        throw new FunctionError('min must be <= max');
      }
      return Math.max(lo, Math.min(hi, v));
    });

    registry.addFunction('math.round', (args) => {
      const { value, precision } = validate(args, (v) => {
        v.minCount(1);
        v.arg(0, 'value', isNumber);
        v.argOptional(1, 'precision', isNumber);
      });
      const val = value as number;
      const p = precision != null ? (precision as number) : 0;
      const factor = Math.pow(10, p);
      return Math.round(val * factor) / factor;
    });

    registry.addFunction('math.random', (args) => {
      if (args.length === 0) return Math.random();
      const { min, max } = validate(args, (v) => {
        v.count(2);
        v.arg(0, 'min', isNumber);
        v.arg(1, 'max', isNumber);
      });
      return Math.floor(Math.random() * ((max as number) - (min as number) + 1)) + (min as number);
    });

    registry.addFunction('math.abs', (args) => {
      const { value } = validate(args, (v) => {
        v.count(1);
        v.arg(0, 'value', isNumber);
      });
      return Math.abs(value as number);
    });

    registry.addFunction('math.sign', (args) => {
      const { value } = validate(args, (v) => {
        v.count(1);
        v.arg(0, 'value', isNumber);
      });
      return Math.sign(value as number);
    });

    registry.addFunction('math.floor', (args) => {
      const { value } = validate(args, (v) => {
        v.count(1);
        v.arg(0, 'value', isNumber);
      });
      return Math.floor(value as number);
    });

    registry.addFunction('math.ceil', (args) => {
      const { value } = validate(args, (v) => {
        v.count(1);
        v.arg(0, 'value', isNumber);
      });
      return Math.ceil(value as number);
    });

    registry.addFunction('math.pow', (args) => {
      const { base, exponent } = validate(args, (v) => {
        v.count(2);
        v.arg(0, 'base', isNumber);
        v.arg(1, 'exponent', isNumber);
      });
      return Math.pow(base as number, exponent as number);
    });

    registry.addFunction('math.sqrt', (args) => {
      const { value } = validate(args, (v) => {
        v.count(1);
        v.arg(0, 'value', isNumber);
      });
      return Math.sqrt(value as number);
    });

    registry.addFunction('math.log', (args) => {
      const { value } = validate(args, (v) => {
        v.count(1);
        v.arg(0, 'value', isNumber);
      });
      return Math.log(value as number);
    });

    registry.addFunction('math.log10', (args) => {
      const { value } = validate(args, (v) => {
        v.count(1);
        v.arg(0, 'value', isNumber);
      });
      return Math.log10(value as number);
    });

    registry.addFunction('math.exp', (args) => {
      const { value } = validate(args, (v) => {
        v.count(1);
        v.arg(0, 'value', isNumber);
      });
      return Math.exp(value as number);
    });

    registry.addFunction('math.min', (args) => {
      if (args.length === 0) return null;
      const nums = args.filter(isNumber) as number[];
      return nums.length > 0 ? Math.min(...nums) : null;
    });

    registry.addFunction('math.max', (args) => {
      if (args.length === 0) return null;
      const nums = args.filter(isNumber) as number[];
      return nums.length > 0 ? Math.max(...nums) : null;
    });

    registry.addFunction('math.e', () => {
      return Math.E;
    });

    registry.addFunction('math.pi', () => {
      return Math.PI;
    });

    // ─── date.* ────────────────────────────────────────────────

    registry.addFunction('date.parse', (args) => {
      const { value } = validate(args, (v) => {
        v.minCount(1);
        v.arg(0, 'value', isString);
        v.argOptional(1, 'format', isString);
      });
      const s = value as string;
      const d = new Date(s);
      if (isNaN(d.getTime())) {
        throw new FunctionError(`Unable to parse date: "${s}"`);
      }
      return d;
    });

    registry.addFunction('date.format', (args) => {
      const { value, format } = validate(args, (v) => {
        v.minCount(2);
        v.arg(0, 'value');
        v.arg(1, 'format', isString);
      });
      let d: Date;
      if (isDate(value)) {
        d = value as Date;
      } else if (isNumber(value)) {
        d = new Date(value as number);
      } else if (isString(value)) {
        d = new Date(value as string);
      } else {
        throw new FunctionError('expected a date, timestamp, or date string');
      }
      if (isNaN(d.getTime())) {
        throw new FunctionError('invalid date value');
      }

      const fmt = format as string;
      // Use UTC methods to produce consistent output regardless of local timezone
      const Y = String(d.getUTCFullYear());
      const M = String(d.getUTCMonth() + 1).padStart(2, '0');
      const D = String(d.getUTCDate()).padStart(2, '0');
      const H = String(d.getUTCHours()).padStart(2, '0');
      const m = String(d.getUTCMinutes()).padStart(2, '0');
      const s = String(d.getUTCSeconds()).padStart(2, '0');
      const ms = String(d.getUTCMilliseconds()).padStart(3, '0');
      const hour12 = (d.getUTCHours() % 12) || 12;
      const h12 = String(hour12).padStart(2, '0');
      const ampm = d.getUTCHours() >= 12 ? 'PM' : 'AM';

      return fmt
        .replace('yyyy', Y)
        .replace('yy', Y.slice(-2))
        .replace('MM', M)
        .replace('dd', D)
        .replace('HH', H)
        .replace('mm', m)
        .replace('ss', s)
        .replace('SSS', ms)
        .replace(/\ba\b/g, ampm)
        .replace('hh', h12);
    });

    registry.addFunction('date.now', () => {
      return Date.now();
    });

    registry.addFunction('date.toString', (args) => {
      const { value } = validate(args, (v) => {
        v.count(1);
        v.arg(0, 'value');
      });
      let d: Date;
      if (isDate(value)) {
        d = value as Date;
      } else if (isNumber(value)) {
        d = new Date(value as number);
      } else if (isString(value)) {
        d = new Date(value as string);
      } else {
        throw new FunctionError('expected a date, timestamp, or date string');
      }
      if (isNaN(d.getTime())) {
        throw new FunctionError('invalid date value');
      }
      return d.toISOString();
    });

    registry.addFunction('date.diff', (args) => {
      const { from, to, unit } = validate(args, (v) => {
        v.countRange(2, 3);
        v.arg(0, 'from');
        v.arg(1, 'to');
        v.argOptional(2, 'unit', isString);
      });

      const parseDate = (val: unknown): Date => {
        if (isDate(val)) return val as Date;
        if (isNumber(val)) return new Date(val as number);
        if (isString(val)) {
          const d = new Date(val as string);
          if (isNaN(d.getTime())) throw new FunctionError(`Unable to parse date: "${val}"`);
          return d;
        }
        throw new FunctionError('expected a date, timestamp, or date string');
      };

      const d1 = parseDate(from);
      const d2 = parseDate(to);
      const diffMs = d2.getTime() - d1.getTime();

      const u = (unit as string) || 'milliseconds';
      switch (u) {
        case 'milliseconds': return diffMs;
        case 'seconds': return Math.floor(diffMs / 1000);
        case 'minutes': return Math.floor(diffMs / 60000);
        case 'hours': return Math.floor(diffMs / 3600000);
        case 'days': return Math.floor(diffMs / 86400000);
        case 'weeks': return Math.floor(diffMs / 604800000);
        case 'months':
          return (d2.getUTCFullYear() - d1.getUTCFullYear()) * 12 + (d2.getUTCMonth() - d1.getUTCMonth());
        case 'years':
          return d2.getUTCFullYear() - d1.getUTCFullYear();
        default:
          throw new FunctionError(`Unknown date unit: "${u}". Supported: milliseconds, seconds, minutes, hours, days, weeks, months, years`);
      }
    });

    // ─── util.* ────────────────────────────────────────────────

    registry.addFunction('util.isNumber', (args) => {
      if (args.length === 0) return false;
      return isNumber(args[0]);
    });

    registry.addFunction('util.isString', (args) => {
      if (args.length === 0) return false;
      return isString(args[0]);
    });

    registry.addFunction('util.isBoolean', (args) => {
      if (args.length === 0) return false;
      return isBoolean(args[0]);
    });

    registry.addFunction('util.isMap', (args) => {
      if (args.length === 0) return false;
      return isObject(args[0]);
    });

    registry.addFunction('util.isList', (args) => {
      if (args.length === 0) return false;
      return isArray(args[0]);
    });

    registry.addFunction('util.toString', (args) => {
      if (args.length === 0) return '';
      return String(args[0]);
    });

    registry.addFunction('util.toBoolean', (args) => {
      if (args.length === 0) return false;
      const val = args[0];
      if (isBoolean(val)) return val;
      if (isString(val)) {
        const lower = (val as string).toLowerCase();
        return lower === 'true' || lower === 'yes' || lower === '1';
      }
      if (isNumber(val)) return (val as number) !== 0;
      return false;
    });

    registry.addFunction('util.toInteger', (args) => {
      if (args.length === 0) return 0;
      const val = args[0];
      if (isNumber(val)) return Math.floor(val as number);
      if (isString(val)) {
        const parsed = parseInt(val as string, 10);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    });

    registry.addFunction('util.toFloat', (args) => {
      if (args.length === 0) return 0;
      const val = args[0];
      if (isNumber(val)) return val as number;
      if (isString(val)) {
        const parsed = parseFloat(val as string);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    });

    registry.addFunction('util.coalesce', (args) => {
      if (args.length === 0) return null;
      for (const arg of args) {
        if (arg != null) return arg;
      }
      return null;
    });

    registry.addFunction('util.null', () => {
      return null;
    });

    // ─── Aggregations ──────────────────────────────────────────

    registry.addAggregation('aggregation.avgOrNull', (values) => {
      const nums = values.filter(isNumber) as number[];
      return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
    });

    registry.addAggregation('aggregation.collectDistinct', (values) => {
      return [...new Set(values)];
    });

    registry.addAggregation('aggregation.minOrNull', (values) => {
      const nums = values.filter(isNumber) as number[];
      return nums.length > 0 ? Math.min(...nums) : null;
    });

    registry.addAggregation('aggregation.maxOrNull', (values) => {
      const nums = values.filter(isNumber) as number[];
      return nums.length > 0 ? Math.max(...nums) : null;
    });
  },
} satisfies FunctionExtension;
