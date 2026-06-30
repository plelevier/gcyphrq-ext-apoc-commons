import type { FunctionExtension, FunctionRegistry } from 'gcyphrq';
import { registerTextFunctions } from './text.js';
import { registerCollFunctions } from './coll.js';
import { registerMapFunctions } from './map.js';
import { registerMathFunctions } from './math.js';
import { registerDateFunctions } from './date.js';
import { registerUtilFunctions } from './util.js';
import { registerAggregations } from './aggregations.js';

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
    registerTextFunctions(registry);
    registerCollFunctions(registry);
    registerMapFunctions(registry);
    registerMathFunctions(registry);
    registerDateFunctions(registry);
    registerUtilFunctions(registry);
    registerAggregations(registry);
  },
} satisfies FunctionExtension;
