import { describe, it, expect, beforeEach } from 'vitest';
import { setupRegistry } from './helpers.js';

describe('text functions', () => {
  let registry = setupRegistry();

  beforeEach(() => {
    registry = setupRegistry();
  });

  it('text.join joins values with separator', () => {
    const fn = registry.functions.get('text.join')!;
    expect(fn([', ', 'a', 'b', 'c'])).toBe('a, b, c');
    expect(fn(['-', 'hello', 'world'])).toBe('hello-world');
  });

  it('text.capitalize capitalizes first letter', () => {
    const fn = registry.functions.get('text.capitalize')!;
    expect(fn(['hello'])).toBe('Hello');
    expect(fn([''])).toBe('');
    expect(fn(['already'])).toBe('Already');
  });

  it('text.replaceAll replaces all occurrences', () => {
    const fn = registry.functions.get('text.replaceAll')!;
    expect(fn(['hello world', 'o', '0'])).toBe('hell0 w0rld');
    expect(fn(['a b c', ' ', '-'])).toBe('a-b-c');
  });

  it('text.replaceAll works with RegExp pattern', () => {
    const fn = registry.functions.get('text.replaceAll')!;
    expect(fn(['hello world', /o/g, '0'])).toBe('hell0 w0rld');
    // Without 'g' flag, should still replace all (auto-adds g)
    expect(fn(['hello world', /o/, '0'])).toBe('hell0 w0rld');
    expect(fn(['ABCabc', /[a-z]/g, 'X'])).toBe('ABCXXX');
  });

  it('text.substring extracts substring', () => {
    const fn = registry.functions.get('text.substring')!;
    expect(fn(['hello world', 6])).toBe('world');
    expect(fn(['hello world', 0, 5])).toBe('hello');
    expect(fn(['hello', 2, 4])).toBe('ll');
  });

  it('text.defaultIfBlank returns fallback for blank strings', () => {
    const fn = registry.functions.get('text.defaultIfBlank')!;
    expect(fn(['  ', 'fallback'])).toBe('fallback');
    expect(fn(['hello'])).toBe('hello');
    expect(fn(['  ', 'default', 'extra'])).toBe('default');
    expect(fn(['hello', 'fallback'])).toBe('hello');
  });

  it('text.split splits string by delimiter', () => {
    const fn = registry.functions.get('text.split')!;
    expect(fn(['a,b,c', ','])).toEqual(['a', 'b', 'c']);
    expect(fn(['hello world', ' '])).toEqual(['hello', 'world']);
    expect(fn(['hello', ''])).toEqual(['hello']);
  });

  it('text.repeat repeats string n times', () => {
    const fn = registry.functions.get('text.repeat')!;
    expect(fn(['ab', 3])).toBe('ababab');
    expect(fn(['x', 0])).toBe('');
    expect(fn(['hi', 1])).toBe('hi');
  });

  it('text.toLowerCase converts to lowercase', () => {
    const fn = registry.functions.get('text.toLowerCase')!;
    expect(fn(['HELLO'])).toBe('hello');
    expect(fn(['Hello World'])).toBe('hello world');
  });

  it('text.toUpperCase converts to uppercase', () => {
    const fn = registry.functions.get('text.toUpperCase')!;
    expect(fn(['hello'])).toBe('HELLO');
    expect(fn(['Hello World'])).toBe('HELLO WORLD');
  });

  it('text.trim removes whitespace', () => {
    const fn = registry.functions.get('text.trim')!;
    expect(fn(['  hello  '])).toBe('hello');
    expect(fn(['hello'])).toBe('hello');
  });
});
