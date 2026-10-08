import { describe, expect, it, vi } from 'vitest';

import { getClientConfig } from '../client';

// Reset process.env before each test
vi.stubGlobal('process', {
  ...process, // keep the original process object
  env: { ...process.env }, // clone env vars so tests can mutate safely
});

describe('getClientConfig', () => {
  it('should correctly reflect boolean values for i18n debug flags', () => {
    process.env.NEXT_PUBLIC_I18N_DEBUG = '1';
    process.env.NEXT_PUBLIC_I18N_DEBUG_BROWSER = '1';
    process.env.NEXT_PUBLIC_I18N_DEBUG_SERVER = '1';

    const config = getClientConfig();
    expect(config.I18N_DEBUG).toBe(true);
    expect(config.I18N_DEBUG_BROWSER).toBe(true);
    expect(config.I18N_DEBUG_SERVER).toBe(true);
  });

  it('should correctly handle falsy values for i18n debug flags', () => {
    process.env.NEXT_PUBLIC_I18N_DEBUG = '0';
    process.env.NEXT_PUBLIC_I18N_DEBUG_BROWSER = '0';
    process.env.NEXT_PUBLIC_I18N_DEBUG_SERVER = '0';

    const config = getClientConfig();
    expect(config.I18N_DEBUG).toBe(false);
    expect(config.I18N_DEBUG_BROWSER).toBe(false);
    expect(config.I18N_DEBUG_SERVER).toBe(false);
  });
});
