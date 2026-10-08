import { DEFAULT_AGENT_META } from '@/const/meta';
import { ModelProvider } from '@/agent-runtime';
import { ChatAgentConfig } from '@/types/agent';
import {
  GlobalBaseSettings,
  GlobalDefaultAgent,
  GlobalLLMConfig,
  GlobalSettings,
} from '@/types/settings';

export const DEFAULT_BASE_SETTINGS: GlobalBaseSettings = {
  fontSize: 14,
  language: 'auto',
  password: '',
};

export const COOKIE_CACHE_DAYS = 30;

export const DEFAULT_AGENT_CONFIG: ChatAgentConfig = {
  autoCreateTopicThreshold: 2,
  compressThreshold: 32,
  enableAutoCreateTopic: true,
  historyCount: 32,
  model: 'chatglm3-6b',
  params: {
    frequency_penalty: 0,
    presence_penalty: 0,
    temperature: 0.6,
    top_p: 1,
  },
  plugins: [],
  provider: ModelProvider.Tomechat,
  systemRole: '',
};

export const DEFAULT_LLM_CONFIG: GlobalLLMConfig = {
  Tomechat: {
    enabled: true,
    endpoint: '',
  },
};

export const DEFAULT_AGENT: GlobalDefaultAgent = {
  config: DEFAULT_AGENT_CONFIG,
  meta: DEFAULT_AGENT_META,
};

export const DEFAULT_TOOL_CONFIG = {
  dalle: {
    autoGenerate: false,
  },
};

export const DEFAULT_SETTINGS: GlobalSettings = {
  defaultAgent: DEFAULT_AGENT,
  languageModel: DEFAULT_LLM_CONFIG,
  tool: DEFAULT_TOOL_CONFIG,
  ...DEFAULT_BASE_SETTINGS,
};
