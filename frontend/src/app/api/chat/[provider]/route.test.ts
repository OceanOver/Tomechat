// @vitest-environment edge-runtime
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TOMECHAT_AUTH_HEADER } from '@/const/auth';
import { ModelRuntime } from '@/agent-runtime';
import { ChatErrorType } from '@/types/fetch';

import { getJWTPayload } from '../auth';
import AgentRuntime from './agentRuntime';
import { POST } from './route';

vi.mock('../auth', () => ({
  getJWTPayload: vi.fn(),
  checkAuthMethod: vi.fn(),
}));

// Mock request and response
let request: Request;
beforeEach(() => {
  request = new Request(new URL('https://test.com'), {
    headers: {
      [TOMECHAT_AUTH_HEADER]: 'Bearer some-valid-token',
    },
    method: 'POST',
    body: JSON.stringify({ model: 'test-model' }),
  });
});

afterEach(() => {
  // Clear mock call history
  vi.clearAllMocks();
});

describe('POST handler', () => {
  describe(' init chat model', () => {
    it('should initialize AgentRuntime correctly with valid authorization', async () => {
      const mockParams = { provider: 'test-provider' };

      // Mock the return values of getJWTPayload and initializeWithUserPayload
      vi.mocked(getJWTPayload).mockResolvedValue({
        accessCode: 'test-access-code',
        apiKey: 'test-api-key',
        azureApiVersion: 'v1',
        useAzure: true,
      });

      const mockRuntime: ModelRuntime = { baseURL: 'abc', chat: vi.fn() };

      const spy = vi
        .spyOn(AgentRuntime, 'initializeWithUserPayload')
        .mockResolvedValue(new AgentRuntime(mockRuntime));

      // Invoke the POST handler
      await POST(request as unknown as Request, { params: mockParams });

      // Verify the mocked functions were called correctly
      expect(getJWTPayload).toHaveBeenCalledWith('Bearer some-valid-token');
      expect(spy).toHaveBeenCalledWith('test-provider', expect.anything());
    });

    it('should return Unauthorized error when TOMECHAT_AUTH_HEADER is missing', async () => {
      const mockParams = { provider: 'test-provider' };
      const requestWithoutAuthHeader = new Request(new URL('https://test.com'), {
        method: 'POST',
        body: JSON.stringify({ model: 'test-model' }),
      });

      const response = await POST(requestWithoutAuthHeader, { params: mockParams });

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        body: {
          error: { errorType: 401 },
          provider: 'test-provider',
        },
        errorType: 401,
      });
    });
    it('should return InternalServerError error when throw a unknown error', async () => {
      const mockParams = { provider: 'test-provider' };
      vi.mocked(getJWTPayload).mockRejectedValueOnce(new Error('unknown error'));

      const response = await POST(request, { params: mockParams });

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        body: {
          error: {},
          provider: 'test-provider',
        },
        errorType: 500,
      });
    });
  });

  describe('chat', () => {
    it('should correctly handle chat completion with valid payload', async () => {
      const mockParams = { provider: 'test-provider' };
      const mockChatPayload = { message: 'Hello, world!' };
      request = new Request(new URL('https://test.com'), {
        headers: { [TOMECHAT_AUTH_HEADER]: 'Bearer some-valid-token' },
        method: 'POST',
        body: JSON.stringify(mockChatPayload),
      });

      const mockChatResponse: any = { success: true, message: 'Reply from agent' };

      vi.spyOn(AgentRuntime.prototype, 'chat').mockResolvedValue(mockChatResponse);

      const response = await POST(request as unknown as Request, { params: mockParams });

      expect(response).toEqual(mockChatResponse);
      expect(AgentRuntime.prototype.chat).toHaveBeenCalledWith(mockChatPayload);
    });

    it('should return an error response when chat completion fails', async () => {
      const mockParams = { provider: 'test-provider' };
      const mockChatPayload = { message: 'Hello, world!' };
      request = new Request(new URL('https://test.com'), {
        headers: { [TOMECHAT_AUTH_HEADER]: 'Bearer some-valid-token' },
        method: 'POST',
        body: JSON.stringify(mockChatPayload),
      });

      const mockErrorResponse = {
        errorType: ChatErrorType.InternalServerError,
        errorMessage: 'Something went wrong',
      };

      vi.spyOn(AgentRuntime.prototype, 'chat').mockRejectedValue(mockErrorResponse);

      const response = await POST(request, { params: mockParams });

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        body: {
          errorMessage: 'Something went wrong',
          error: {
            errorMessage: 'Something went wrong',
            errorType: 500,
          },
          provider: 'test-provider',
        },
        errorType: 500,
      });
    });
  });
});
