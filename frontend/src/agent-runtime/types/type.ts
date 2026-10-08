import OpenAI from 'openai';

import { AgentRuntimeErrorCode } from '../error';
import { ChatCompetitionOptions, ChatStreamPayload } from './chat';

export interface ModelRuntime {
  baseURL?: string;

  chat(
    payload: ChatStreamPayload,
    options?: ChatCompetitionOptions,
  ): Promise<Response>;
}

export interface AgentInitErrorPayload {
  error: object;
  errorType: string | number;
}

export interface ChatCompletionErrorPayload {
  [key: string]: any;
  endpoint?: string;
  error: object;
  errorType: AgentRuntimeErrorCode;
  provider: ModelProvider;
}

export interface CreateChatCompletionOptions {
  chatModel: OpenAI;
  payload: ChatStreamPayload;
}

export enum ModelProvider {
  Tomechat = 'tomechat',
}
