import { DeepPartial } from 'utility-types';

import { DEFAULT_SETTINGS } from '@/const/settings';
import { ChatModelCard } from '@/types/llm';
import { GlobalServerConfig, GlobalSettings } from '@/types/settings';

export interface GlobalSettingsState {
  avatar?: string;
  defaultSettings: GlobalSettings;
  remoteChatModels: ChatModelCard[];
  serverConfig: GlobalServerConfig;
  settings: DeepPartial<GlobalSettings>;
  userId?: string;
}

export const initialSettingsState: GlobalSettingsState = {
  defaultSettings: DEFAULT_SETTINGS,
  remoteChatModels: [],
  serverConfig: {},
  settings: {},
};
