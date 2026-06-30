import { helpers } from 'gcyphrq';

const { isString, isNumber, isBoolean, isArray, isObject, isDate } = helpers;

export { isString, isNumber, isBoolean, isArray, isObject, isDate };

/**
 * Parse a date string using a format pattern.
 * Supports: yyyy, yy, MM, dd, HH, mm, ss, SSS, SS, S, a, hh.
 * Returns a UTC Date.
 */
export function parseDateWithFormat(str: string, fmt: string): Date {
  // Token definitions — order matters (longer tokens first)
  const TOKENS: readonly { pat: string; regex: string; field: string }[] = [
    { pat: 'yyyy', regex: '(\\d{4})', field: 'year' },
    { pat: 'yy', regex: '(\\d{2})', field: 'year2' },
    { pat: 'MM', regex: '(\\d{2})', field: 'month' },
    { pat: 'dd', regex: '(\\d{2})', field: 'day' },
    { pat: 'HH', regex: '(\\d{2})', field: 'hour24' },
    { pat: 'mm', regex: '(\\d{2})', field: 'minute' },
    { pat: 'ss', regex: '(\\d{2})', field: 'second' },
    { pat: 'SSS', regex: '(\\d{3})', field: 'ms' },
    { pat: 'SS', regex: '(\\d{2})', field: 'ms2' },
    { pat: 'S', regex: '(\\d)', field: 'ms1' },
    { pat: 'hh', regex: '(\\d{2})', field: 'hour12' },
    { pat: 'a', regex: '(AM|PM)', field: 'ampm' },
  ];

  const isWordChar = (c: string) => /[a-zA-Z0-9_]/.test(c);

  // Walk the format string to build regex and ordered field list
  let regex = '';
  const fields: string[] = [];
  let i = 0;
  while (i < fmt.length) {
    let matched = false;
    for (const tok of TOKENS) {
      if (fmt.startsWith(tok.pat, i)) {
        // Only match if not surrounded by word characters
        const beforeOk = i === 0 || !isWordChar(fmt[i - 1]);
        const afterOk = i + tok.pat.length >= fmt.length || !isWordChar(fmt[i + tok.pat.length]);
        if (beforeOk && afterOk) {
          regex += tok.regex;
          fields.push(tok.field);
          i += tok.pat.length;
          matched = true;
          break;
        }
      }
    }
    if (!matched) {
      // Escape literal characters for regex
      regex += fmt[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      i++;
    }
  }

  const re = new RegExp(`^${regex}$`, 'i');
  const match = str.match(re);
  if (!match) return new Date(NaN);

  let year = 1970, month = 0, day = 1;
  let hours = 0, minutes = 0, seconds = 0, milliseconds = 0;
  let isPM = false;

  for (let j = 0; j < fields.length; j++) {
    const val = match[j + 1];
    if (!val) continue;
    switch (fields[j]) {
      case 'year': year = parseInt(val, 10); break;
      case 'year2': {
        const y = parseInt(val, 10);
        year = y > 50 ? y + 1900 : y + 2000;
        break;
      }
      case 'month': month = parseInt(val, 10) - 1; break;
      case 'day': day = parseInt(val, 10); break;
      case 'hour24': hours = parseInt(val, 10); break;
      case 'hour12': hours = parseInt(val, 10); break;
      case 'minute': minutes = parseInt(val, 10); break;
      case 'second': seconds = parseInt(val, 10); break;
      case 'ms': milliseconds = parseInt(val, 10); break;
      case 'ms2': milliseconds = parseInt(val + '0', 10); break;
      case 'ms1': milliseconds = parseInt(val + '00', 10); break;
      case 'ampm': isPM = val.toUpperCase() === 'PM'; break;
    }
  }

  // Apply AM/PM to 12-hour clock
  if (isPM && hours < 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;

  return new Date(Date.UTC(year, month, day, hours, minutes, seconds, milliseconds));
}
