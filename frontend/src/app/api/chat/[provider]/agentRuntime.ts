import { getServerConfig } from '@/config/server';
import { JWTPayload } from '@/const/auth';
import { ChatStreamPayload, TomechatAI, ModelRuntime } from '@/agent-runtime';

export interface AgentChatOptions {
  provider: string;
}

class AgentRuntime {
  private _runtime: ModelRuntime;

  constructor(runtime: ModelRuntime) {
    this._runtime = runtime;
  }

  async chat(payload: ChatStreamPayload) {
    return this._runtime.chat(payload);
  }

  /**
   * Model service configuration (endpoint, auth) is handled entirely by the backend;
   * the frontend only talks to the backend API. Hence TomechatAI is always
   * initialized here and all other providers have been removed.
   */
  static async initializeWithUserPayload(_provider: string, payload: JWTPayload) {
    const { TOMECHAT_PROXY_URL } = getServerConfig();
    const baseURL = payload?.endpoint || TOMECHAT_PROXY_URL;

    const runtimeModel: ModelRuntime = new TomechatAI({ baseURL });

    return new AgentRuntime(runtimeModel);
  }
}

export default AgentRuntime;
