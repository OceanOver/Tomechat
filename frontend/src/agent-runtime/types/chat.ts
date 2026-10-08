export type LLMRoleType = 'user' | 'system' | 'assistant';

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
  role: LLMRoleType;
}

/**
 * @title Chat Stream Payload
 */
export interface ChatStreamPayload {
  /**
   * @title Penalty coefficient to reduce repetition in generated text
   * @default 0
   */
  frequency_penalty?: number;
  /**
   * @title Maximum length of generated text
   */
  max_tokens?: number;
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
   * @title Penalty coefficient to reduce topic drift in generated text
   * @default 0
   */
  presence_penalty?: number;
  /**
   * @default openai
   */
  provider?: string;
  /**
   * @title Whether to enable streaming requests
   * @default true
   */
  stream?: boolean;
  /**
   * @title Randomness measure of generated text, controlling creativity and diversity
   * @default 0.5
   */
  temperature: number;
  /**
   * @title Caps the probability of a single token in generated text
   * @default 1
   */
  top_p?: number;
}

export interface ChatCompetitionOptions {
  headers?: Record<string, any>;
}
