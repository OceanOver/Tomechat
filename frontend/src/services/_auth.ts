import { JWTPayload, TOMECHAT_AUTH_HEADER } from '@/const/auth';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors, settingsSelectors } from '@/store/global/selectors';
import { createJWT } from '@/utils/jwt';

/**
 * Model service configuration is handled entirely by the backend; the frontend
 * only needs to carry the Tomechat backend address and access code in the JWT.
 */
export const getProviderAuthPayload = (provider: string) => {
  return { endpoint: modelProviderSelectors.TomechatProxyUrl(useGlobalStore.getState()) };
};

const createAuthTokenWithPayload = async (payload = {}) => {
  const accessCode = settingsSelectors.password(useGlobalStore.getState());

  return await createJWT<JWTPayload>({ accessCode, ...payload });
};

interface AuthParams {
  // eslint-disable-next-line no-undef
  headers?: HeadersInit;
  payload?: Record<string, any>;
  provider?: string;
}

// eslint-disable-next-line no-undef
export const createHeaderWithAuth = async (params?: AuthParams): Promise<HeadersInit> => {
  let payload = params?.payload || {};

  if (params?.provider) {
    payload = { ...payload, ...getProviderAuthPayload(params?.provider) };
  }

  const token = await createAuthTokenWithPayload(payload);

  // eslint-disable-next-line no-undef
  return { ...params?.headers, [TOMECHAT_AUTH_HEADER]: token };
};
