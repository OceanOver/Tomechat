import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../_auth', () => ({
  createHeaderWithAuth: vi.fn(async (h) => h),
}));

import { chatService } from '../chat';

const fetchMock = vi.fn(
  async (_input: RequestInfo | URL, _init?: RequestInit) =>
    new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } }),
);
vi.stubGlobal('fetch', fetchMock);

describe('chatService.getChatCompletion knowledge_base passthrough', () => {
  beforeEach(() => {
    fetchMock.mockClear();
  });

  it('带 knowledge_base_name 时透传到请求体', async () => {
    await chatService.getChatCompletion({
      messages: [{ content: '你好', role: 'user' }],
      model: 'test-model',
      knowledge_base_name: '测试知识库',
    });

    const body = JSON.parse(fetchMock.mock.calls[0]![1]!.body as string);
    expect(body.knowledge_base_name).toBe('测试知识库');
  });

  it('不传时请求体不含该字段', async () => {
    await chatService.getChatCompletion({
      messages: [{ content: '你好', role: 'user' }],
      model: 'test-model',
    });

    const body = JSON.parse(fetchMock.mock.calls[0]![1]!.body as string);
    expect('knowledge_base_name' in body).toBe(false);
  });
});

describe('chatService.getChatCompletion search_engine passthrough', () => {
  beforeEach(() => {
    fetchMock.mockClear();
  });

  it('search_engine: true 时透传到请求体', async () => {
    await chatService.getChatCompletion({
      messages: [{ content: '你好', role: 'user' }],
      model: 'test-model',
      search_engine: true,
    });

    const body = JSON.parse(fetchMock.mock.calls[0]![1]!.body as string);
    expect(body.search_engine).toBe(true);
  });

  it('不传时请求体不含该字段', async () => {
    await chatService.getChatCompletion({
      messages: [{ content: '你好', role: 'user' }],
      model: 'test-model',
    });

    const body = JSON.parse(fetchMock.mock.calls[0]![1]!.body as string);
    expect('search_engine' in body).toBe(false);
  });
});
