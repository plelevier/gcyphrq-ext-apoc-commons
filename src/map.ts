import type { FunctionRegistry } from 'gcyphrq';
import { validate } from 'gcyphrq';
import { isObject, isString } from './helpers.js';

/** Register all map.* functions on the given registry. */
export function registerMapFunctions(registry: FunctionRegistry): void {
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
}
