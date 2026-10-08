// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

import { JWTPayload } from '@/const/auth';
import { TomechatAI } from '@/agent-runtime';

import AgentRuntime from './agentRuntime';

// Mock dependencies
vi.mock('@/config/server', () => ({
  getServerConfig: vi.fn(() => ({
    TOMECHAT_PROXY_URL: 'http://localhost:7861/v1',
  })),
}));

describe('AgentRuntime', () => {
  it('should initialize TomechatAI with server config endpoint', async () => {
    const jwtPayload: JWTPayload = {};
    const runtime = await AgentRuntime.initializeWithUserPayload('Tomechat', jwtPayload);

    expect(runtime).toBeInstanceOf(AgentRuntime);
    expect(runtime['_runtime']).toBeInstanceOf(TomechatAI);
    expect(runtime['_runtime'].baseURL).toBe('http://localhost:7861/v1');
  });

  it('should prefer endpoint from user payload', async () => {
    const jwtPayload: JWTPayload = { endpoint: 'http://user-endpoint:7861/v1' };
    const runtime = await AgentRuntime.initializeWithUserPayload('Tomechat', jwtPayload);

    expect(runtime['_runtime'].baseURL).toBe('http://user-endpoint:7861/v1');
  });

  describe('AgentRuntime chat method', () => {
    it('should run correctly', async () => {
      const jwtPayload: JWTPayload = { endpoint: 'http://user-endpoint:7861/v1' };
      const runtime = await AgentRuntime.initializeWithUserPayload('Tomechat', jwtPayload);

      const payload = {
        messages: [{ role: 'user' as const, content: 'Hello, world!' }],
        model: 'chatglm3-6b',
        temperature: 0,
      };

      vi.spyOn(TomechatAI.prototype, 'chat').mockResolvedValue(new Response(''));

      await runtime.chat(payload);
    });
  });
});
