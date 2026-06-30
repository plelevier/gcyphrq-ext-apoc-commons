import type { FunctionRegistry } from 'gcyphrq';
import { validate } from 'gcyphrq';
import { isNumber, isArray, isString, isObject } from './helpers.js';

/** Register all coll.* functions on the given registry. */
export function registerCollFunctions(registry: FunctionRegistry): void {
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
    if (!isArray(list)) return [...args].flat(Infinity);
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
    if (sets.length === 0) return [...args];
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
}
