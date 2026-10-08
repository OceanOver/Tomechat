import { t } from 'i18next';

import { DEFAULT_INBOX_AVATAR } from '@/const/meta';
import { INBOX_SESSION_ID } from '@/const/session';
import { useGlobalStore } from '@/store/global';
import { commonSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';
import { ChatMessage } from '@/types/message';
import { MetaData } from '@/types/meta';
import { merge } from '@/utils/merge';

import { chatHelpers } from '../../helpers';
import type { ChatStore } from '../../store';

const getMeta = (message: ChatMessage) => {
  switch (message.role) {
    case 'user': {
      return {
        // Empty (not a fallback emoji) so Avatar renders the default logo —
        // same fallback as the settings page.
        avatar: commonSelectors.userAvatar(useGlobalStore.getState()) || undefined,
      };
    }

    case 'system': {
      return message.meta;
    }

    case 'assistant': {
      return agentSelectors.currentAgentMeta(useSessionStore.getState());
    }

    case 'function': {
      // TODO: switch to storing plugin metadata in message metadata
      return {
        avatar: '🧩',
        title: 'plugin-unknown',
      };
    }
  }
};

const currentChatKey = (s: ChatStore) => `${s.activeId}_${s.activeTopicId}`;

// Currently active message list
const currentChats = (s: ChatStore): ChatMessage[] => {
  if (!s.activeId) return [];

  return s.messages.map((i) => ({ ...i, meta: getMeta(i) }));
};

const initTime = Date.now();
// Custom welcome message injected for a brand-new assistant
const currentChatsWithGuideMessage =
  (meta: MetaData) =>
  (s: ChatStore): ChatMessage[] => {
    const data = currentChats(s);

    const isBrandNewChat = data.length === 0;

    if (!isBrandNewChat) return data;

    const [activeId, isInbox] = [s.activeId, s.activeId === INBOX_SESSION_ID];

    const inboxMsg = t('inbox.defaultMessage', { ns: 'chat' });
    const agentSystemRoleMsg = t('agentDefaultMessageWithSystemRole', {
      name: meta.title || t('defaultAgent'),
      ns: 'chat',
      systemRole: meta.description,
    });
    const agentMsg = t('agentDefaultMessage', {
      id: activeId,
      name: meta.title || t('defaultAgent'),
      ns: 'chat',
    });

    const emptyInboxGuideMessage = {
      content: isInbox ? inboxMsg : !!meta.description ? agentSystemRoleMsg : agentMsg,
      createdAt: initTime,
      extra: {},
      id: 'default',
      meta: merge({ avatar: DEFAULT_INBOX_AVATAR }, meta),
      role: 'assistant',
      updatedAt: initTime,
    } as ChatMessage;

    return [emptyInboxGuideMessage];
  };

const currentChatIDsWithGuideMessage = (s: ChatStore) => {
  const meta = agentSelectors.currentAgentMeta(useSessionStore.getState());

  return currentChatsWithGuideMessage(meta)(s).map((s) => s.id);
};

const currentChatsWithHistoryConfig = (s: ChatStore): ChatMessage[] => {
  const chats = currentChats(s);
  const config = agentSelectors.currentAgentConfig(useSessionStore.getState());

  return chatHelpers.getSlicedMessagesWithConfig(chats, config);
};

const chatsMessageString = (s: ChatStore): string => {
  const chats = currentChatsWithHistoryConfig(s);
  return chats.map((m) => m.content).join('');
};

const getFunctionMessageProps =
  ({ plugin, content, id }: Pick<ChatMessage, 'plugin' | 'content' | 'id'>) =>
  (s: ChatStore) => ({
    arguments: plugin?.arguments,
    command: plugin,
    content,
    id: plugin?.identifier,
    loading: id === s.chatLoadingId,
    type: plugin?.type,
  });

const getMessageById = (id: string) => (s: ChatStore) => chatHelpers.getMessageById(s.messages, id);

const latestMessage = (s: ChatStore) => currentChats(s).at(-1);

const currentChatLoadingState = (s: ChatStore) => !s.messagesInit;

export const chatSelectors = {
  chatsMessageString,
  currentChatIDsWithGuideMessage,
  currentChatKey,
  currentChatLoadingState,
  currentChats,
  currentChatsWithGuideMessage,
  currentChatsWithHistoryConfig,
  getFunctionMessageProps,
  getMessageById,
  latestMessage,
};
