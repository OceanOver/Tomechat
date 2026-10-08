import { AgentRuntimeErrorCode } from '../error';
import { AgentInitErrorPayload, ChatCompletionErrorPayload } from '../types';

export const AgentRuntimeError = {
  chat: (error: ChatCompletionErrorPayload): ChatCompletionErrorPayload => error,
  createError: (
    errorType: AgentRuntimeErrorCode | string | number,
    error?: any,
  ): AgentInitErrorPayload => ({ error, errorType }),
};
