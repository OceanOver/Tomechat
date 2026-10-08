import { describe, expect, it, vi } from 'vitest';

import { ChatAgentConfig } from '@/types/agent';
import { ChatMessage } from '@/types/message';
import { OpenAIChatMessage } from '@/types/openai/chat';
import * as tokenizerObj from '@/utils/tokenizer';

import { chatHelpers } from './helpers';

// Token counting is delegated to the tokenizer; approximate with string length here.
vi.mock('@/utils/tokenizer', () => ({
  encodeAsync: vi.fn((text) => Promise.resolve(text.length)),
}));

describe('chatHelpers', () => {
  describe('getMessagesTokenCount', () => {
    it('counts tokens across a list of messages', async () => {
      const messages = [{ content: 'Hello' }, { content: 'World' }] as OpenAIChatMessage[];
      await expect(chatHelpers.getMessagesTokenCount(messages)).resolves.toBe(
        'HelloWorld'.length,
      );
    });

    it('gives 0 when there are no messages', async () => {
      await expect(chatHelpers.getMessagesTokenCount([])).resolves.toBe(0);
    });

    it('ignores messages with empty content', async () => {
      const messages = [
        { content: 'Hello' },
        { content: '' },
        { content: 'World' },
      ] as OpenAIChatMessage[];
      await expect(chatHelpers.getMessagesTokenCount(messages)).resolves.toBe(
        'HelloWorld'.length,
      );
    });

    it('propagates tokenizer failures', async () => {
      vi.spyOn(tokenizerObj, 'encodeAsync').mockRejectedValue(new Error('Test error'));
      await expect(
        chatHelpers.getMessagesTokenCount([{ content: 'Hello' }] as OpenAIChatMessage[]),
      ).rejects.toThrow('Test error');
    });
  });

  describe('getMessageById', () => {
    const messages = [
      { id: '1', content: 'Hello' },
      { id: '2', content: 'World' },
    ] as ChatMessage[];

    it('locates the message with the given id', () => {
      expect(chatHelpers.getMessageById(messages, '1')).toEqual({ id: '1', content: 'Hello' });
    });

    it('gives undefined when the id does not exist', () => {
      expect(chatHelpers.getMessageById(messages, '3')).toBeUndefined();
    });

    it('gives undefined when there are no messages at all', () => {
      expect(chatHelpers.getMessageById([], '1')).toBeUndefined();
    });
  });

  describe('getSlicedMessagesWithConfig', () => {
    const messages = [
      { id: '1', content: 'First' },
      { id: '2', content: 'Second' },
      { id: '3', content: 'Third' },
    ] as ChatMessage[];

    it('keeps everything when history truncation is off', () => {
      const config = { enableHistoryCount: false, historyCount: 0 } as ChatAgentConfig;
      expect(chatHelpers.getSlicedMessagesWithConfig(messages, config)).toEqual(messages);
    });

    it('keeps only the trailing N messages when historyCount is set', () => {
      const config = { enableHistoryCount: true, historyCount: 2 } as ChatAgentConfig;
      expect(chatHelpers.getSlicedMessagesWithConfig(messages, config)).toEqual([
        { id: '2', content: 'Second' },
        { id: '3', content: 'Third' },
      ]);
    });

    it('gives nothing when historyCount is negative', () => {
      const config = { enableHistoryCount: true, historyCount: -1 } as ChatAgentConfig;
      expect(chatHelpers.getSlicedMessagesWithConfig(messages, config)).toEqual([]);
    });

    it('keeps everything when historyCount exceeds the message count', () => {
      const config = { enableHistoryCount: true, historyCount: 5 } as ChatAgentConfig;
      expect(chatHelpers.getSlicedMessagesWithConfig(messages, config)).toEqual(messages);
    });

    it('gives nothing when the input is empty', () => {
      const config = { enableHistoryCount: true, historyCount: 2 } as ChatAgentConfig;
      expect(chatHelpers.getSlicedMessagesWithConfig([], config)).toEqual([]);
    });
  });
});
