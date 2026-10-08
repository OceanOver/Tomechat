import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { chatService } from '@/services/chat';
import { ChatMessage } from '@/types/message';

vi.mock('../_auth', () => ({
  createHeaderWithAuth: vi.fn().mockResolvedValue({ 'Content-Type': 'application/json' }),
}));

const root = process.cwd();

describe('Agent, plugin, tool and market removal', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('ok')));
  });

  it('does not expose removed Next.js entrypoints', () => {
    const removedPaths = [
      'src/app/market',
      'src/app/api/market',
      'src/app/api/plugin',
      'src/app/settings/agent',
      'src/features/ChatInput/ActionBar/Tools',
      'src/features/MobileTabBar',
    ];

    expect(removedPaths.filter((path) => existsSync(resolve(root, path)))).toEqual([]);
  });

  it.each([
    {
      messages: [
        { content: 'first question', role: 'user' },
        { content: '{"legacy":"result"}', role: 'function' },
        { content: 'continue the conversation', role: 'user' },
      ],
      name: 'continuing a conversation',
    },
    {
      messages: [
        { content: 'first question', role: 'user' },
        { content: 'legacy function result', role: 'function' },
      ],
      name: 'regenerating from historical context',
    },
  ])('sends safe ordinary chat payload when $name', async ({ messages }) => {
    await chatService.createAssistantMessage({
      messages: messages as ChatMessage[],
      model: 'test-model',
      plugins: ['legacy-plugin'],
      tool_choice: 'auto',
      tools: [{ function: { name: 'legacy_tool' }, type: 'function' }],
    } as any);

    expect(fetch).toHaveBeenCalledOnce();
    const request = vi.mocked(fetch).mock.calls[0][1];
    const body = JSON.parse(String(request?.body));

    expect(body).not.toHaveProperty('plugins');
    expect(body).not.toHaveProperty('tool_choice');
    expect(body).not.toHaveProperty('tools');
    expect(body.messages).toContainEqual({
      content: messages[1].content,
      role: 'assistant',
    });
    expect(body.messages.some((message: { role: string }) => message.role === 'function')).toBe(
      false,
    );
  });

  it('keeps chat and knowledge navigation visible', () => {
    const desktop = readFileSync(resolve(root, 'src/features/SideBar/TopActions.tsx'), 'utf8');

    expect(desktop).toContain("href={'/chat'}");
    expect(desktop).toContain("href={'/knowledge'}");
  });
});
