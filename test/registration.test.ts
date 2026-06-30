import { describe, it, expect, beforeEach } from 'vitest';
import { setupRegistry } from './helpers.js';

describe('registration', () => {
  let registry = setupRegistry();

  beforeEach(() => {
    registry = setupRegistry();
  });

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
