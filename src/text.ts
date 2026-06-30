import type { FunctionRegistry } from 'gcyphrq';
import { validate } from 'gcyphrq';
import { isString, isNumber } from './helpers.js';

/** Register all text.* functions on the given registry. */
export function registerTextFunctions(registry: FunctionRegistry): void {
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
}
