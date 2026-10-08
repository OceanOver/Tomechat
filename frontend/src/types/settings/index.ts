import { DeepPartial } from 'utility-types';

import type { ChatSession } from '@/types/session';

import { GlobalBaseSettings } from './base';
import { GlobalLLMConfig } from './modelProvider';

export type GlobalDefaultAgent = Pick<ChatSession, 'config' | 'meta'>;

export * from './base';
export * from './modelProvider';

export interface GlobalTool {
  dalle: {
    autoGenerate: boolean;
  };
}

export interface GlobalServerConfig {
  customModelName?: string;
  defaultAgent?: DeepPartial<GlobalDefaultAgent>;
}

/**
 * Configuration settings
 */
export interface GlobalSettings extends GlobalBaseSettings {
  defaultAgent: GlobalDefaultAgent;
  languageModel: GlobalLLMConfig;
  tool: GlobalTool;
}

