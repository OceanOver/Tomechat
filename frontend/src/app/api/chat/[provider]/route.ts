import { getPreferredRegion } from '@/app/api/config';
import { createErrorResponse } from '@/app/api/errorResponse';
import { TOMECHAT_AUTH_HEADER } from '@/const/auth';
import { AgentRuntimeError, ChatCompletionErrorPayload } from '@/agent-runtime';
import { ChatErrorType } from '@/types/fetch';
import { ChatStreamPayload } from '@/types/openai/chat';

import { checkAuthMethod, getJWTPayload } from '../auth';
import AgentRuntime from './agentRuntime';

export const runtime = 'edge';

export const preferredRegion = getPreferredRegion();

export const POST = async (req: Request, { params }: { params: { provider: string } }) => {
  const { provider } = params;

  try {
    // ============  1. init chat model   ============ //

    // get Authorization from header
    const authorization = req.headers.get(TOMECHAT_AUTH_HEADER);

    if (!authorization) throw AgentRuntimeError.createError(ChatErrorType.Unauthorized);

    // check the Auth With payload
    const jwtPayload = await getJWTPayload(authorization);
    checkAuthMethod(jwtPayload.accessCode, jwtPayload.apiKey);

    const agentRuntime = await AgentRuntime.initializeWithUserPayload(provider, jwtPayload);

    // ============  2. create chat completion   ============ //

    const data = (await req.json()) as ChatStreamPayload;

    return await agentRuntime.chat(data);
  } catch (e) {
    const {
      errorType = ChatErrorType.InternalServerError,
      error: errorContent,
      ...res
    } = e as ChatCompletionErrorPayload;

    const error = errorContent || e;
    // track the error at server side
    console.error(`Route: [${provider}] ${errorType}:`, error);

    return createErrorResponse(errorType, { error, ...res, provider });
  }
};
