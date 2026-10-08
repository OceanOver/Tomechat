import { FewShots, LLMParams } from '@/types/llm';

export interface ChatAgentConfig {
  autoCreateTopicThreshold: number;
  compressThreshold?: number;
  enableAutoCreateTopic: boolean;
  /**
   * Compression threshold for history message length
   */
  enableCompressThreshold?: boolean;
  /**
   * Enable history message count limit
   */
  enableHistoryCount?: boolean;
  enableMaxTokens?: boolean;

  fewShots?: FewShots;
  /**
   * Number of history messages
   */
  historyCount?: number;
  inputTemplate?: string;
  /**
   * Knowledge base bound to the session; empty means no knowledge base
   */
  knowledgeBase?: string;
  /**
   * Enable web search for this session; answers are grounded in search results
   */
  searchEngine?: boolean;
  /**
   * Language model used by the role
   * @default chatglm3-6b
   */
  model: string;
  /**
   * Language model parameters
   */
  params: LLMParams;
  /**
   * Enabled plugins
   */
  plugins?: string[];
  /**
   * Model provider
   */
  provider?: string;
  /**
   * System role
   */
  systemRole: string;
}

export type ChatAgentConfigKeys =
  | keyof ChatAgentConfig
  | ['params', keyof ChatAgentConfig['params']];
