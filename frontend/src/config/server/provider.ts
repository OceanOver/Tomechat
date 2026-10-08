/* eslint-disable sort-keys-fix/sort-keys-fix , typescript-sort-keys/interface */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      CUSTOM_MODELS?: string;

      // Tomechat
      TOMECHAT_PROXY_URL?: string;

      // knowledeg
      KNOWLEDGE_PROXY_URL?: string;
    }
  }
}

export const getProviderConfig = () => {
  if (typeof process === 'undefined') {
    throw new Error('[Server Config] you are importing a server-only module outside of server');
  }

  return {
    CUSTOM_MODELS: process.env.CUSTOM_MODELS,

    TOMECHAT_PROXY_URL: process.env.TOMECHAT_PROXY_URL || '',
    KNOWLEDGE_PROXY_URL: process.env.KNOWLEDGE_PROXY_URL || 'http://localhost:7861/knowledge_base',
  };
};
