import { memo } from 'react';

import { AgentRuntimeErrorType, AgentRuntimeErrorCode } from '@/agent-runtime';
import { ChatErrorType, ErrorType } from '@/types/fetch';
import { ChatMessage, ChatMessageError } from '@/types/message';

import ErrorJsonViewer from './ErrorJsonViewer';
import InvalidAccessCode from './InvalidAccessCode';

/**
 * Whether the error should render as a warning instead of a danger style
 * OpenAIBizError / ZhipuBizError / GoogleBizError / ...
 */
export const isWarningError = (
  errorType?: AgentRuntimeErrorCode | ErrorType,
): boolean => {
  if (typeof errorType === 'string' && (errorType.includes('Biz') || errorType.includes('Invalid')))
    return true;

  return errorType === AgentRuntimeErrorType.LocationNotSupportError;
};

const ErrorMessageExtra = memo<{ data: ChatMessage }>(({ data }) => {
  const error = data.error as ChatMessageError;
  if (!error?.type) return null;

  switch (error.type) {
    case ChatErrorType.InvalidAccessCode: {
      return <InvalidAccessCode id={data.id} />;
    }

    default: {
      return <ErrorJsonViewer error={data.error} id={data.id} />;
    }
  }
});

export default ErrorMessageExtra;
