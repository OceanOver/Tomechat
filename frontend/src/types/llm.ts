export interface ChatModelCard {
  description?: string;
  displayName?: string;
  /**
   * whether model supports file upload
   */
  files?: boolean;
  /**
   * whether model supports function call
   */
  functionCall?: boolean;
  hidden?: boolean;
  id: string;
  /**
   * whether model is custom
   */
  isCustom?: boolean;
  /**
   * whether model is legacy (deprecated but not removed yet)
   */
  legacy?: boolean;
  maxOutput?: number;
  tokens?: number;
  /**
   *  whether model supports vision
   */
  vision?: boolean;
}

export interface ModelProviderCard {
  chatModels: ChatModelCard[];
  enabled?: boolean;
  id: string;
}

// Generation parameters for LLM requests.
export interface LLMParams {
  /**
   * Penalizes repeated tokens to reduce verbatim repetition.
   * @default 0
   */
  frequency_penalty?: number;
  /**
   * Maximum number of tokens to generate.
   */
  max_tokens?: number;
  /**
   * Penalizes tokens that already appeared, encouraging new topics.
   * @default 0
   */
  presence_penalty?: number;
  /**
   * Sampling randomness; higher values increase creativity and diversity.
   * @default 0.6
   */
  temperature?: number;
  /**
   * Nucleus sampling cutoff for token probability mass.
   * @default 1
   */
  top_p?: number;
}

export type LLMRoleType = 'user' | 'system' | 'assistant' | 'function';

export interface LLMMessage {
  content: string;
  role: LLMRoleType;
}

export type FewShots = LLMMessage[];
