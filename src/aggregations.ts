import type { FunctionRegistry } from 'gcyphrq';
import { isNumber } from './helpers.js';

/** Register all aggregation.* functions on the given registry. */
export function registerAggregations(registry: FunctionRegistry): void {
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
}
