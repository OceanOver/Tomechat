import { getServerConfig } from '@/config/server';
import { createErrorResponse } from '@/app/api/errorResponse';
import { TOMECHAT_AUTH_HEADER } from '@/const/auth';
import { getJWTPayload } from '../../chat/auth';

export const GET = async (req: Request) => {

  // get Authorization from header
  const authorization = req.headers.get(TOMECHAT_AUTH_HEADER);
  
  const { TOMECHAT_PROXY_URL } = getServerConfig();
  
  let baseURL = TOMECHAT_PROXY_URL;

  // Parse the JWT directly to get the endpoint
  if (authorization) {
    const jwtPayload = await getJWTPayload(authorization);
    if (jwtPayload.endpoint) {
      baseURL = jwtPayload.endpoint;
    }
  }

  let res: Response;

  try {
    res = await fetch(`${baseURL}/models`, { cache: 'no-store' });

    if (!res.ok) {
      // throw new Error(`Failed to fetch models: ${res.status}`);
      return createErrorResponse(500, { error: `Failed to fetch models: ${res.status}` });
    }

    return res;

  } catch (e) {
    return createErrorResponse(500, { error: e });
  }
}
// Next.js 14 caches GET route handlers by default — force dynamic so every request hits the backend
export const dynamic = 'force-dynamic';
