import { t } from 'i18next';

import { DEFAULT_AVATAR, DEFAULT_BACKGROUND_COLOR, DEFAULT_INBOX_AVATAR } from '@/const/meta';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors, settingsSelectors } from '@/store/global/selectors';
import { SessionStore } from '@/store/session';
import { MetaData } from '@/types/meta';
import { ChatAgentConfig } from '@/types/agent';
import { merge } from '@/utils/merge';

import { sessionSelectors } from '../session/selectors';

// ==========   Config   ============== //
const currentAgentConfig = (s: SessionStore) => {
  const session = sessionSelectors.currentSession(s);

  let config: ChatAgentConfig;

  // if is the inbox session, use the default agent config in global store
  if (sessionSelectors.isInboxSession(s)) {
    config = settingsSelectors.defaultAgentConfig(useGlobalStore.getState());
  } else {
    config = merge(DEFAULT_AGENT_CONFIG, session?.config);
  }

  // If the model is not in the available list (e.g. an old session persisted a retired model),
  // fall back to the first available model so display matches what is actually sent
  const list = modelProviderSelectors.modelSelectList(useGlobalStore.getState()).flatMap((p) => p.chatModels);

  if (list.length && !list.some((m) => m.id === config.model)) {
    config = { ...config, model: list[0].id };
  }

  return config;
};

const currentAgentSystemRole = (s: SessionStore) => {
  return currentAgentConfig(s).systemRole;
};

const currentAgentModel = (s: SessionStore): string => {
  return currentAgentConfig(s).model;
};

const currentAgentModelProvider = (s: SessionStore) => {
  const config = currentAgentConfig(s);

  return config?.provider;
};

const currentAgentPlugins = (s: SessionStore) => {
  const config = currentAgentConfig(s);

  return config?.plugins || [];
};

// ==========   Meta   ============== //
const currentAgentMeta = (s: SessionStore): MetaData => {
  const isInbox = sessionSelectors.isInboxSession(s);

  const defaultMeta = {
    avatar: isInbox ? DEFAULT_INBOX_AVATAR : DEFAULT_AVATAR,
    backgroundColor: DEFAULT_BACKGROUND_COLOR,
    description: isInbox
      ? t('inbox.desc', { ns: 'chat' })
      : currentAgentSystemRole(s) || t('noDescription'),
    title: isInbox ? t('inbox.title', { ns: 'chat' }) : t('defaultSession'),
  };

  const session = sessionSelectors.currentSession(s);

  // The default session (inbox) has no session record; meta reads/writes go through the global defaultAgent
  if (isInbox) {
    return merge(defaultMeta, settingsSelectors.defaultAgentMeta(useGlobalStore.getState()));
  }

  return merge(defaultMeta, session?.meta);
};

const currentAgentTitle = (s: SessionStore) => currentAgentMeta(s).title;
const currentAgentDescription = (s: SessionStore) => currentAgentMeta(s).description;
const currentAgentAvatar = (s: SessionStore) => currentAgentMeta(s).avatar;
const currentAgentBackgroundColor = (s: SessionStore) => currentAgentMeta(s).backgroundColor;

const getAvatar = (s: MetaData) => s.avatar || DEFAULT_AVATAR;
const getTitle = (s: MetaData) => s.title || t('defaultSession', { ns: 'common' });
export const getDescription = (s: MetaData) =>
  s.description || t('noDescription', { ns: 'common' });

const hasSystemRole = (s: SessionStore) => {
  const config = currentAgentConfig(s);

  return !!config.systemRole;
};

export const agentSelectors = {
  currentAgentAvatar,
  currentAgentBackgroundColor,
  currentAgentConfig,
  currentAgentDescription,
  currentAgentMeta,
  currentAgentModel,
  currentAgentModelProvider,
  currentAgentPlugins,
  currentAgentSystemRole,
  currentAgentTitle,
  getAvatar,
  getDescription,
  getTitle,
  hasSystemRole,
};
