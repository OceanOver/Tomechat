import { describe, expect, it } from 'vitest';

import { pathString } from './url';

describe('pathString', () => {
  it('returns the path untouched when no query or hash is given', () => {
    expect(pathString('/home')).toBe('/home');
  });

  it('appends the query string', () => {
    expect(pathString('/home', { search: 'id=1&name=test' })).toBe('/home?id=1&name=test');
  });

  it('appends the hash with or without the leading #', () => {
    expect(pathString('/home', { hash: 'top' })).toBe('/home#top');
    expect(pathString('/home', { hash: '#hash=abc' })).toBe('/home#hash=abc');
  });

  it('normalizes relative paths against the site root', () => {
    expect(pathString('./home')).toBe('/home');
  });

  it('keeps absolute paths as-is', () => {
    expect(pathString('https://www.example.com/home')).toBe('https://www.example.com/home');
  });

  it('upgrades protocol-relative hosts to https', () => {
    expect(pathString('//www.example.com/home')).toBe('https://www.example.com/home');
    expect(pathString('//www.example.com:8080/home')).toBe('https://www.example.com:8080/home');
  });

  it('percent-encodes non-ASCII path segments', () => {
    expect(pathString('/home/测试')).toBe('/home/%E6%B5%8B%E8%AF%95');
  });
});
