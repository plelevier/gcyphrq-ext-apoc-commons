import type { FunctionRegistry } from 'gcyphrq';
import { validate, FunctionError } from 'gcyphrq';
import { isNumber } from './helpers.js';

/** Register all math.* functions on the given registry. */
export function registerMathFunctions(registry: FunctionRegistry): void {
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
    const lo = min as number;
    const hi = max as number;
    if (lo > hi) {
      throw new FunctionError('min must be <= max');
    }
    return Math.floor(Math.random() * (hi - lo + 1)) + lo;
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
}
