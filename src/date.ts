import type { FunctionRegistry } from 'gcyphrq';
import { validate, FunctionError } from 'gcyphrq';
import { isString, isNumber, isDate } from './helpers.js';
import { parseDateWithFormat } from './helpers.js';

/** Register all date.* functions on the given registry. */
export function registerDateFunctions(registry: FunctionRegistry): void {
  registry.addFunction('date.parse', (args) => {
    const { value } = validate(args, (v) => {
      v.minCount(1);
      v.arg(0, 'value', isString);
      v.argOptional(1, 'format', isString);
    });
    const s = value as string;
    const fmt = args[1] as string | undefined;
    const d = fmt ? parseDateWithFormat(s, fmt) : new Date(s);
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

    // Token-based replacement with word-boundary checks
    // (like Java SimpleDateFormat: tokens only match when not surrounded by word chars)
    const FORMAT_TOKENS: readonly { pat: string; value: string }[] = [
      { pat: 'yyyy', value: Y },
      { pat: 'yy', value: Y.slice(-2) },
      { pat: 'MM', value: M },
      { pat: 'dd', value: D },
      { pat: 'HH', value: H },
      { pat: 'hh', value: h12 },
      { pat: 'mm', value: m },
      { pat: 'ss', value: s },
      { pat: 'SSS', value: ms },
      { pat: 'SS', value: ms.slice(0, 2) },
      { pat: 'S', value: ms.slice(0, 1) },
      { pat: 'a', value: ampm },
    ];

    const isWordChar = (c: string) => /[a-zA-Z0-9_]/.test(c);

    let result = '';
    let i = 0;
    while (i < fmt.length) {
      let matched = false;
      for (const tok of FORMAT_TOKENS) {
        if (fmt.startsWith(tok.pat, i)) {
          // Only match if not surrounded by word characters
          const beforeOk = i === 0 || !isWordChar(fmt[i - 1]);
          const afterOk = i + tok.pat.length >= fmt.length || !isWordChar(fmt[i + tok.pat.length]);
          if (beforeOk && afterOk) {
            result += tok.value;
            i += tok.pat.length;
            matched = true;
            break;
          }
        }
      }
      if (!matched) {
        result += fmt[i];
        i++;
      }
    }
    return result;
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
}
