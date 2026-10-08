import { LLMRoleType } from '@/types/llm';

interface UserMessageContentPartText {
  text: string;
  type: 'text';
}
interface UserMessageContentPartImage {
  image_url: {
    detail?: 'auto' | 'low' | 'high';
    url: string;
  };
  type: 'image_url';
}

export type UserMessageContentPart = UserMessageContentPartText | UserMessageContentPartImage;

export interface OpenAIChatMessage {
  /**
   * @title Content
   * @description Message content
   */
  content: string | UserMessageContentPart[];

  /**
   * Role
   * @description Role of the message sender
   */
  role: Exclude<LLMRoleType, 'function'>;
}

/**
 * @title Chat Stream Payload
 */
export interface ChatStreamPayload {
  /**
   * @title Penalty to reduce repetition in generated text
   * @default 0
   */
  frequency_penalty?: number;
  /**
   * @title Maximum length of generated text
   */
  max_tokens?: number;
  /**
   * @title Bound knowledge base name
   * @description When provided, the backend retrieves the knowledge base before answering
   */
  knowledge_base_name?: string;
  /**
   * @title Enable web search
   * @description When true, the backend searches the web before answering
   */
  search_engine?: boolean;
  /**
   * @title List of chat messages
   */
  messages: OpenAIChatMessage[];
  /**
   * @title Model name
   */
  model: string;
  /**
   * @title Number of texts to return
   */
  n?: number;
  /**
   * @title Penalty to reduce topic drift in generated text
   * @default 0
   */
  presence_penalty?: number;
  /**
   * @default openai
   */
  provider?: string;
  /**
   * @title Whether to enable streaming
   * @default true
   */
  stream?: boolean;
  /**
   * @title Randomness of generated text, controlling creativity and diversity
   * @default 0.5
   */
  temperature: number;
  /**
   * @title Cap on the highest-probability token in generated text
   * @default 1
   */
  top_p?: number;
}
