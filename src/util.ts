import type { FunctionRegistry } from 'gcyphrq';
import { isNumber, isString, isBoolean, isArray, isObject } from './helpers.js';

/** Register all util.* functions on the given registry. */
export function registerUtilFunctions(registry: FunctionRegistry): void {
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
    if (isNumber(val)) return Math.trunc(val as number);
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
}
