import OpenAI, { ClientOptions } from 'openai';

import { AgentRuntimeErrorType } from '../error';
import { ChatCompetitionOptions, ChatStreamPayload, ModelRuntime, ModelProvider } from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { desensitizeUrl } from '../utils/desensitizeUrl';
import { handleOpenAIError } from '../utils/handleOpenAIError';
import { Stream } from 'openai/streaming';

const DEFAULT_BASE_URL = 'http://localhost:7861/v1';
// const DEFAULT_BASE_URL = 'https://beige-points-count.loca.lt/v1';


export class TomechatAI implements ModelRuntime {
  private client: OpenAI;

  baseURL: string;

  constructor({ apiKey = 'Tomechat', baseURL = DEFAULT_BASE_URL, ...res }: ClientOptions) {
    if (!baseURL) throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidTomechatArgs);

    this.client = new OpenAI({ apiKey, baseURL, ...res });
    this.baseURL = baseURL;
  }

  async chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions) {

    try {
      const response = await this.client.chat.completions.create(
        payload as unknown as (OpenAI.ChatCompletionCreateParamsStreaming | OpenAI.ChatCompletionCreateParamsNonStreaming),
      );

      if (TomechatAI.isStream(response)) {

        const [prod, debug] = response.tee();

        if (process.env.DEBUG_OLLAMA_CHAT_COMPLETION === '1') {
          debugStream(debug.toReadableStream()).catch(console.error);
        }

        return new Response(TomechatAI.toTextStream(prod), {
          headers: options?.headers,
        });
      } else {

        if (process.env.DEBUG_OLLAMA_CHAT_COMPLETION === '1') {
          console.debug(JSON.stringify(response));
        }

        const stream = TomechatAI.createChatCompletionStream(response?.choices[0].message.content || '');

        return new Response(stream);
      }
    } catch (error) {
      let desensitizedEndpoint = this.baseURL;

      if (this.baseURL !== DEFAULT_BASE_URL) {
        desensitizedEndpoint = desensitizeUrl(this.baseURL);
      }

      if ('status' in (error as any)) {
        switch ((error as Response).status) {
          case 401: {
            throw AgentRuntimeError.chat({
              endpoint: desensitizedEndpoint,
              error: error as any,
              errorType: AgentRuntimeErrorType.InvalidTomechatArgs,
              provider: ModelProvider.Tomechat,
            });
          }

          default: {
            break;
          }
        }
      }

      const { errorResult, RuntimeError } = handleOpenAIError(error);

      const errorType = RuntimeError || AgentRuntimeErrorType.TomechatBizError;

      throw AgentRuntimeError.chat({
        endpoint: desensitizedEndpoint,
        error: errorResult,
        errorType,
        provider: ModelProvider.Tomechat,
      });
    }
  }

  static isStream(obj: unknown): obj is Stream<OpenAI.Chat.Completions.ChatCompletionChunk> {
    return typeof Stream !== 'undefined' && (obj instanceof Stream || obj instanceof ReadableStream);
  }

  /**
   * Convert an OpenAI chunk stream into a UTF-8 plain-text delta stream
   * (replaces the Vercel ai package's OpenAIStream + StreamingTextResponse)
   */
  static toTextStream(
    chunkStream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk> | ReadableStream,
  ): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();
    const extract = (chunk: OpenAI.Chat.Completions.ChatCompletionChunk): string =>
      chunk.choices?.[0]?.delta?.content || '';

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          if (chunkStream instanceof ReadableStream) {
            const reader = chunkStream.getReader();
            for (;;) {
              const { done, value } = await reader.read();
              if (done) break;
              const delta = extract(value);
              if (delta) controller.enqueue(encoder.encode(delta));
            }
          } else {
            for await (const chunk of chunkStream) {
              const delta = extract(chunk);
              if (delta) controller.enqueue(encoder.encode(delta));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
      // When generation is stopped client-side, cancel the upstream OpenAI stream so the backend stops generating
      async cancel() {
        if (chunkStream instanceof ReadableStream) {
          await chunkStream.cancel();
        } else if (chunkStream instanceof Stream) {
          chunkStream.controller.abort();
        }
      },
    });
  }


  // Create a single-chunk UTF-8 text stream
  static createChatCompletionStream(text: string): ReadableStream<Uint8Array> {

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(text));
        controller.close();
      },
    });

    return stream;
  }

}