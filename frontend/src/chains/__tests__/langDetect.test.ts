import { describe, expect, it } from 'vitest';

import { ChatStreamPayload } from '@/types/openai/chat';

import { chainLangDetect } from '../langDetect';

describe('chainLangDetect', () => {
  it('should return a payload with the correct structure and embedded user content', () => {
    const userContent = 'Hola';

    const expectedPayload: Partial<ChatStreamPayload> = {
      messages: [
        {
          content:
            '你是一名精通全世界语言的语言专家，你需要识别用户输入的内容，以国际标准 locale 进行输出',
          role: 'system',
        },
        {
          content: '{你好}',
          role: 'user',
        },
        {
          content: 'zh-CN',
          role: 'assistant',
        },
        {
          content: '{hello}',
          role: 'user',
        },
        {
          content: 'en-US',
          role: 'assistant',
        },
        {
          content: `{${userContent}}`,
          role: 'user',
        },
      ],
    };

    const result = chainLangDetect(userContent);

    expect(result).toEqual(expectedPayload);
  });
});
