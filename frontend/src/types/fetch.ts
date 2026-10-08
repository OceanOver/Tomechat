/* eslint-disable sort-keys-fix/sort-keys-fix */
import { AgentRuntimeErrorCode } from '@/agent-runtime';

/** Error codes surfaced to the chat UI; numeric values mirror HTTP statuses. */
export const ChatErrorType = {
  // ******* Business errors ******* //

  InvalidAccessCode: 'InvalidAccessCode',
  OpenAIBizError: 'OpenAIBizError', // provider returned a business-level error
  NoOpenAIAPIKey: 'NoOpenAIAPIKey',

  // ******* Client errors ******* //
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  ContentNotFound: 404,
  MethodNotAllowed: 405,
  TooManyRequests: 429,

  // ******* Server errors ******* //
  InternalServerError: 500,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
} as const;
/* eslint-enable */

export type ErrorType = (typeof ChatErrorType)[keyof typeof ChatErrorType];

export interface ErrorResponse {
  body: any;
  errorType: ErrorType | AgentRuntimeErrorCode;
}
