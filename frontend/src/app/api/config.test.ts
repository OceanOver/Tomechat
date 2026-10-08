import { describe, expect, it, vi } from 'vitest';

import { getPreferredRegion } from './config';

// Stub the global process object to safely mock environment variables
vi.stubGlobal('process', {
  ...process, // Preserve the original process object
  env: { ...process.env }, // Clone the environment variables object for modification
});

describe('getPreferredRegion', () => {
  beforeEach(() => {
    // Reset environment variables before each test case
    vi.restoreAllMocks();
  });

  it('returns default value when get config error', () => {
    const originalProcess = global.process;
    const originalError = console.error;
    // @ts-ignore
    global.process = undefined;
    console.error = () => {};

    const preferredRegion = getPreferredRegion();
    expect(preferredRegion).toBe('auto');

    global.process = originalProcess;
    console.error = originalError;
  });

  it('return default value when no region is configured', () => {
    const preferredRegion = getPreferredRegion();
    expect(preferredRegion).toBe('auto');
  });
});
