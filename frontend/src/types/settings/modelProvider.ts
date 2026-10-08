import { ChatModelCard } from '../llm';

export type CustomModels = { displayName: string; id: string }[];

export interface TomechatConfig {
  customModelName?: string;
  enabled?: boolean;
  endpoint?: string;
  models?: ChatModelCard[];
}

export interface GlobalLLMConfig {
  Tomechat: TomechatConfig;
}

export type GlobalLLMProviderKey = keyof GlobalLLMConfig;
