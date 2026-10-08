// @vitest-environment node
import OpenAI from 'openai';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as debugStreamModule from '../utils/debugStream';
import { TomechatAI } from './index';

const provider = 'knowledge';
const defaultBaseURL = 'http://localhost:7861/v1';
const bizErrorType = 'knowledgeBizError';
const invalidErrorType = 'InvalidKnowledgeArgs';

// Mock the console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

let instance: TomechatAI;

beforeEach(() => {
  instance = new TomechatAI({ apiKey: 'knowledge', baseURL: defaultBaseURL });

  // Use vi.spyOn to mock the chat.completions.create method
  vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
    new ReadableStream() as any,
  );
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('TomechatAI', () => {

  describe('init', ()=>{
    it('should init with default baseURL', () => {
      expect(instance.baseURL).toBe(defaultBaseURL);
    });
  })

  describe('chat', () => {
    it('should return a streaming text Response on successful API call', async () => {
      // Arrange
      const mockStream = new ReadableStream();
      const mockResponse = Promise.resolve(mockStream);

      (instance['client'].chat.completions.create as Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'gpt-3.5-turbo',
        temperature: 0,
      });

      // Assert
      expect(result).toBeInstanceOf(Response);
    });

    it('should stream plain text deltas extracted from chat completion chunks', async () => {
      // Arrange: a ReadableStream emitting OpenAI-style chunks
      const makeChunk = (content?: string) => ({
        id: 'chatcmpl-test',
        object: 'chat.completion.chunk',
        created: 1711794745,
        model: 'gpt-3.5-turbo',
        choices: [{ index: 0, delta: content ? { content } : {}, finish_reason: null }],
      });
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(makeChunk('你好，'));
          controller.enqueue(makeChunk(undefined)); // no content delta → skipped
          controller.enqueue(makeChunk('世界！'));
          controller.close();
        },
      });

      (instance['client'].chat.completions.create as Mock).mockResolvedValue(mockStream);

      // Act
      const result = await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'gpt-3.5-turbo',
        temperature: 0,
      });

      // Assert: body is plain text deltas, no SSE protocol wrapping
      const text = await result.text();
      expect(text).toBe('你好，世界！');
    });

    it('should return a streaming text Response on successful API call', async () => {
      // Arrange
      const mockResponse = Promise.resolve({
        "id": "chatcmpl-98QIb3NiYLYlRTB6t0VrJ0wntNW6K",
        "object": "chat.completion",
        "created": 1711794745,
        "model": "gpt-3.5-turbo-0125",
        "choices": [
          {
            "index": 0,
            "message": {
              "role": "assistant",
              "content": "你好！有什么可以帮助你的吗？"
            },
            "logprobs": null,
            "finish_reason": "stop"
          }
        ],
        "usage": {
          "prompt_tokens": 9,
          "completion_tokens": 17,
          "total_tokens": 26
        },
        "system_fingerprint": "fp_b28b39ffa8"
      });

      (instance['client'].chat.completions.create as Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'gpt-3.5-turbo',
        stream: false,
        temperature: 0,
      });

      // Assert
      expect(result).toBeInstanceOf(Response);
    });
  })


});