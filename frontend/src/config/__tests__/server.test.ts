import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getServerConfig } from '../server';

// Stub the global process object to safely mock environment variables
vi.stubGlobal('process', {
  ...process, // Preserve the original process object
  env: { ...process.env }, // Clone the environment variables object for modification
});

describe('getServerConfig', () => {
  beforeEach(() => {
    // Reset environment variables before each test case
    vi.restoreAllMocks();
  });

  it('throws an error if process is undefined', () => {
    const originalProcess = global.process;
    // To simulate the error condition, temporarily set the global process to `undefined`,
    // @ts-ignore
    global.process = undefined;

    expect(() => getServerConfig()).toThrow(
      '[Server Config] you are importing a server-only module outside of server',
    );

    global.process = originalProcess; // Restore the original process object
  });

  it('returns default TOMECHAT_PROXY_URL when no environment variable is set', () => {
    const config = getServerConfig();
    expect(config.TOMECHAT_PROXY_URL).toBe('');
  });

  it('returns custom TOMECHAT_PROXY_URL when environment variable is set', () => {
    process.env.TOMECHAT_PROXY_URL = 'http://localhost:7861/v1';
    const config = getServerConfig();
    expect(config.TOMECHAT_PROXY_URL).toBe('http://localhost:7861/v1');
  });

  it('returns default IMGUR_CLIENT_ID when no environment variable is set', () => {
    const config = getServerConfig();
    expect(config.IMGUR_CLIENT_ID).toBe('e415f320d6e24f9');
  });

  it('returns custom IMGUR_CLIENT_ID when environment variable is set', () => {
    process.env.IMGUR_CLIENT_ID = 'custom-client-id';
    const config = getServerConfig();
    expect(config.IMGUR_CLIENT_ID).toBe('custom-client-id');
  });
});
