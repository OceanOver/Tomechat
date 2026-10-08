import { afterEach, describe, expect, it, vi } from 'vitest';

import { ErrorResponse } from '@/types/fetch';

import { fetchSSE, getMessageError } from './fetch';

// Mock i18next
vi.mock('i18next', () => ({
  t: vi.fn((key) => `translated_${key}`),
}));

// Mock Response
const createMockResponse = (body: any, ok: boolean, status: number = 200) => ({
  ok,
  status,
  json: vi.fn(async () => body),
  clone: vi.fn(function () {
    // @ts-ignore
    return this;
  }),
  text: vi.fn(async () => JSON.stringify(body)),
  body: {
    getReader: () => {
      let done = false;
      return {
        read: () => {
          if (!done) {
            done = true;
            return Promise.resolve({
              value: new TextEncoder().encode(JSON.stringify(body)),
              done: false,
            });
          } else {
            return Promise.resolve({ done: true });
          }
        },
      };
    },
  },
});

// Restore all mocks after each test
afterEach(() => {
  vi.restoreAllMocks();
});

describe('getMessageError', () => {
  it('should handle business error correctly', async () => {
    const mockErrorResponse: ErrorResponse = {
      body: 'Error occurred',
      errorType: 'InvalidAccessCode',
    };
    const mockResponse = createMockResponse(mockErrorResponse, false, 400);

    const error = await getMessageError(mockResponse as any);

    expect(error).toEqual({
      body: mockErrorResponse.body,
      message: 'translated_response.InvalidAccessCode',
      type: mockErrorResponse.errorType,
    });
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('should handle regular error correctly', async () => {
    const mockResponse = createMockResponse({}, false, 500);
    mockResponse.json.mockImplementationOnce(() => {
      throw new Error('Failed to parse');
    });

    const error = await getMessageError(mockResponse as any);

    expect(error).toEqual({
      message: 'translated_response.500',
      type: 500,
    });
    expect(mockResponse.json).toHaveBeenCalled();
  });
});

describe('fetchSSE', () => {
  it('routes AbortError from fetch stage to onAbort instead of throwing', async () => {
    const abortError = new TypeError('The user aborted a request.');
    abortError.name = 'AbortError';

    const onAbort = vi.fn();
    const onFinish = vi.fn();

    await fetchSSE(vi.fn(async () => Promise.reject(abortError)), {
      onAbort,
      onFinish,
    } as any);

    expect(onAbort).toHaveBeenCalled();
    expect(onFinish).toHaveBeenCalledWith('', { type: 'abort' });
  });

  it('routes AbortError from stream reading to onAbort', async () => {
    const abortError = new TypeError('signal is aborted without reason');
    abortError.name = 'AbortError';

    const onAbort = vi.fn();
    const onFinish = vi.fn();

    await fetchSSE(
      vi.fn(async () => ({
        ok: true,
        clone: () => ({}),
        body: {
          getReader: () => ({
            read: () => Promise.reject(abortError),
          }),
        },
      })) as any,
      { onAbort, onFinish } as any,
    );

    expect(onAbort).toHaveBeenCalled();
    expect(onFinish).toHaveBeenCalledWith('', { type: 'abort' });
  });
});
