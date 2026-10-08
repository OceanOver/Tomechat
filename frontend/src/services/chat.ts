import { merge } from 'lodash-es';

import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { ModelProvider } from '@/agent-runtime';
import { filesSelectors, useFileStore } from '@/store/file';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors } from '@/store/global/selectors';
import { ChatMessage } from '@/types/message';
import type { ChatStreamPayload, OpenAIChatMessage } from '@/types/openai/chat';
import { UserMessageContentPart } from '@/types/openai/chat';
import { FetchSSEOptions, OnFinishHandler, fetchSSE } from '@/utils/fetch';

import { createHeaderWithAuth } from './_auth';
import { API_ENDPOINTS } from './_url';

interface FetchOptions {
  signal?: AbortSignal | undefined;
}

interface GetChatCompletionPayload extends Partial<Omit<ChatStreamPayload, 'messages'>> {
  messages: ChatMessage[];
}

interface FetchAITaskResultParams {
  abortController?: AbortController;
  /**
   * Error handler
   */
  onError?: (e: Error, rawError?: any) => void;
  onFinish?: OnFinishHandler;
  /**
   * Loading state change handler
   * @param loading - whether a request is in progress
   */
  onLoadingChange?: (loading: boolean) => void;
  /**
   * Message handler
   * @param text - message content
   */
  onMessageHandle?: (text: string) => void;
  /**
   * Request payload
   */
  params: Partial<ChatStreamPayload>;
}

interface CreateAssistantMessageStream extends FetchSSEOptions {
  abortController?: AbortController;
  params: GetChatCompletionPayload;
}

class ChatService {
  createAssistantMessage = async (
    { messages, ...params }: GetChatCompletionPayload,
    options?: FetchOptions,
  ) => {
    const payload = merge(
      {
        model: DEFAULT_AGENT_CONFIG.model,
        stream: true,
        ...DEFAULT_AGENT_CONFIG.params,
      },
      params,
    );
    // ============  1. preprocess messages   ============ //

    const oaiMessages = this.processMessages({
      messages,
      model: payload.model,
    });

    return this.getChatCompletion({ ...params, messages: oaiMessages }, options);
  };

  createAssistantMessageStream = async ({
    params,
    abortController,
    onAbort,
    onMessageHandle,
    onErrorHandle,
    onFinish,
  }: CreateAssistantMessageStream) => {
    await fetchSSE(
      () =>
        this.createAssistantMessage(params, {
          signal: abortController?.signal,
        }),
      {
        onAbort,
        onErrorHandle,
        onFinish,
        onMessageHandle,
      },
    );
  };

  getChatCompletion = async (params: Partial<ChatStreamPayload>, options?: FetchOptions) => {
    const { signal } = options ?? {};

    const {
      frequency_penalty,
      knowledge_base_name,
      max_tokens,
      messages,
      model,
      n,
      presence_penalty,
      provider = ModelProvider.Tomechat,
      search_engine,
      stream,
      temperature,
      top_p,
    } = params;
    const payload = merge(
      {
        model: DEFAULT_AGENT_CONFIG.model,
        stream: true,
        ...DEFAULT_AGENT_CONFIG.params,
      },
      {
        frequency_penalty,
        knowledge_base_name,
        max_tokens,
        messages,
        model,
        n,
        presence_penalty,
        search_engine,
        stream,
        temperature,
        top_p,
      },
    );

    const headers = await createHeaderWithAuth({
      headers: { 'Content-Type': 'application/json' },
      provider,
    });

    return fetch(API_ENDPOINTS.chat(provider), {
      body: JSON.stringify(payload),
      headers,
      method: 'POST',
      signal,
    });
  };

  fetchPresetTaskResult = async ({
    params,
    onMessageHandle,
    onFinish,
    onError,
    onLoadingChange,
    abortController,
  }: FetchAITaskResultParams) => {
    const errorHandle = (error: Error, errorContent?: any) => {
      onLoadingChange?.(false);
      if (abortController?.signal.aborted) {
        return;
      }
      onError?.(error, errorContent);
    };

    onLoadingChange?.(true);

    const data = await fetchSSE(
      () =>
        this.getChatCompletion(params, {
          signal: abortController?.signal,
        }),
      {
        onErrorHandle: (error) => {
          errorHandle(new Error(error.message), error);
        },
        onFinish,
        onMessageHandle,
      },
    ).catch(errorHandle);

    onLoadingChange?.(false);

    return await data?.text();
  };

  private processMessages = ({
    messages,
    model,
  }: {
    messages: ChatMessage[];
    model: string;
  }): OpenAIChatMessage[] => {
    // handle content type for vision model
    // for the models with visual ability, add image url to content
    // refs: https://platform.openai.com/docs/guides/vision/quick-start
    const getContent = (m: ChatMessage) => {
      if (!m.files) return m.content;

      const imageList = filesSelectors.getImageUrlOrBase64ByList(m.files)(useFileStore.getState());

      if (imageList.length === 0) return m.content;

      const canUploadFile = modelProviderSelectors.modelEnabledUpload(model)(
        useGlobalStore.getState(),
      );

      if (!canUploadFile) {
        return m.content;
      }

      return [
        { text: m.content, type: 'text' },
        ...imageList.map(
          (i) => ({ image_url: { detail: 'auto', url: i.url }, type: 'image_url' }) as const,
        ),
      ] as UserMessageContentPart[];
    };

    return messages.map((m): OpenAIChatMessage => {
      switch (m.role) {
        case 'function': {
          return { content: m.content, role: 'assistant' };
        }

        case 'user': {
          return { content: getContent(m), role: m.role };
        }

        default: {
          return { content: m.content, role: m.role };
        }
      }
    });
  };
}

export const chatService = new ChatService();
