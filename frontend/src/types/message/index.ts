import { AgentRuntimeErrorCode } from '@/agent-runtime';
import { ErrorType } from '@/types/fetch';

import { LLMRoleType } from '../llm';
import { BaseDataModel } from '../meta';

export interface ChatPluginPayload {
  apiName: string;
  arguments: string;
  identifier: string;
  type: 'markdown' | 'default' | 'standalone' | 'builtin';
}

interface Translate {
  from?: string;
  to: string;
}

/**
 * Chat message error object
 */
export interface ChatMessageError {
  body?: any;
  message: string;
  type: ErrorType | AgentRuntimeErrorCode;
}

export interface ModelSelectorError {
  message: string;
  type: ErrorType;
}

export interface ChatTranslate extends Translate {
  content?: string;
}

export interface ChatTTS {
  contentMd5?: string;
  file?: string;
  voice?: string;
}

export interface ChatMessage extends BaseDataModel {
  content: string;
  error?: ChatMessageError;
  // extension fields
  extra?: {
    fromModel?: string;
    fromProvider?: string;
    // translate
    translate?: ChatTranslate | false;
    // TTS
    tts?: ChatTTS;
  } & Record<string, any>;

  files?: string[];
  /**
   * observation id
   */
  observationId?: string;
  /**
   * parent message id
   */
  parentId?: string;
  plugin?: ChatPluginPayload;

  pluginState?: any;
  /**
   * quoted other message's id
   */
  quotaId?: string;
  /**
   * message role type
   */
  role: LLMRoleType;
  sessionId?: string;

  /**
   * Topic the message is saved to
   */
  topicId?: string;
  /**
   * Trace id
   */
  traceId?: string;
}

export type ChatMessageMap = Record<string, ChatMessage>;
