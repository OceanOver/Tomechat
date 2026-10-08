import { DEFAULT_LANG } from '@/const/locale';
import { DEFAULT_AGENT_META } from '@/const/meta';
import { DEFAULT_AGENT, DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { Locales } from '@/locales/resources';
import { GlobalSettings } from '@/types/settings';
import { isOnServerSide } from '@/utils/env';
import { merge } from '@/utils/merge';

import { GlobalStore } from '../../../store';

export const currentSettings = (s: GlobalStore): GlobalSettings =>
  merge(s.defaultSettings, s.settings);

const password = (s: GlobalStore) => currentSettings(s).password;

const defaultAgent = (s: GlobalStore) => merge(DEFAULT_AGENT, currentSettings(s).defaultAgent);

const defaultAgentConfig = (s: GlobalStore) => merge(DEFAULT_AGENT_CONFIG, defaultAgent(s).config);

const defaultAgentMeta = (s: GlobalStore) => merge(DEFAULT_AGENT_META, defaultAgent(s).meta);

const currentLanguage = (s: GlobalStore) => {
  const locale = currentSettings(s).language;

  if (locale === 'auto') {
    if (isOnServerSide) return DEFAULT_LANG;

    return navigator.language as Locales;
  }

  return locale;
};

const dalleConfig = (s: GlobalStore) => currentSettings(s).tool?.dalle || {};
const isDalleAutoGenerating = (s: GlobalStore) => currentSettings(s).tool?.dalle?.autoGenerate;

export const settingsSelectors = {
  currentLanguage,
  currentSettings,
  dalleConfig,
  defaultAgent,
  defaultAgentConfig,
  defaultAgentMeta,
  isDalleAutoGenerating,
  password,
};
