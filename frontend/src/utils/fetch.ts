import { t } from 'i18next';

import { ErrorResponse, ErrorType } from '@/types/fetch';
import { ChatMessageError } from '@/types/message';

export const getMessageError = async (response: Response) => {
  let chatMessageError: ChatMessageError;

  // try to extract business error semantics
  try {
    const data = (await response.json()) as ErrorResponse;
    chatMessageError = {
      body: data.body,
      message: t(`response.${data.errorType}` as any, { ns: 'error' }),
      type: data.errorType,
    };
  } catch {
    // if the body cannot be parsed, treat it as a regular error
    chatMessageError = {
      message: t(`response.${response.status}` as any, { ns: 'error' }),
      type: response.status as ErrorType,
    };
  }

  return chatMessageError;
};

type SSEFinishType = 'done' | 'error' | 'abort';

export type OnFinishHandler = (text: string, context?: { type?: SSEFinishType }) => Promise<void>;

export interface FetchSSEOptions {
  onAbort?: (text: string) => Promise<void>;
  onErrorHandle?: (error: ChatMessageError) => void;
  onFinish?: OnFinishHandler;
  onMessageHandle?: (text: string) => void;
}

/**
 * Fetch data via SSE streaming
 * @param fetchFn
 * @param options
 */
export const fetchSSE = async (fetchFn: () => Promise<Response>, options: FetchSSEOptions = {}) => {
  let returnRes: Response | undefined;
  let output = '';
  let finishedType: SSEFinishType = 'done';

  try {
    const response = await fetchFn();

    // not ok means a request error
    if (!response.ok) {
      const chatMessageError = await getMessageError(response);

      options.onErrorHandle?.(chatMessageError);
      return;
    }

    returnRes = response.clone();

    const data = response.body;

    if (!data) return;

    const reader = data.getReader();
    const decoder = new TextDecoder();

    for (;;) {
      const { value, done: doneReading } = await reader.read();
      if (doneReading) break;
      const chunkValue = decoder.decode(value, { stream: true });

      output += chunkValue;
      options.onMessageHandle?.(chunkValue);
    }
  } catch (error) {
    // AbortError from both the fetch and stream-reading stages goes through the abort flow
    if ((error as TypeError).name === 'AbortError') {
      finishedType = 'abort';
      options?.onAbort?.(output);
    } else {
      finishedType = 'error';
      console.error(error);
    }
  }

  await options?.onFinish?.(output, { type: finishedType });

  return returnRes;
};
