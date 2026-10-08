import {
  type AppendMessage,
  type ThreadMessageLike,
  useExternalStoreRuntime,
  type ExternalStoreAdapter,
} from '@assistant-ui/react';
import isEqual from 'fast-deep-equal';
import { useMemo } from 'react';

import { sendCurrentInput } from '@/features/ChatInput/useSend';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';
import { ChatMessage } from '@/types/message';

/**
 * ChatMessage → ThreadMessageLike
 *
 * The zustand chat store remains the single source of truth: this adapter only maps
 * data read-only; streaming, persistence, and TTS logic all live in store actions.
 */
export const convertMessage = (message: ChatMessage): ThreadMessageLike => ({
  content: [{ text: message.content, type: 'text' }],
  createdAt: new Date(message.createdAt),
  id: message.id,
  // assistant-ui has no counterpart for the 'function' role — render as assistant;
  // components read the original role back from store data to differentiate display
  role: message.role === 'system' ? 'system' : message.role === 'user' ? 'user' : 'assistant',
});

const extractText = (message: AppendMessage): string =>
  message.content
    .map((c) => (c.type === 'text' ? c.text : ''))
    .join('');

/**
 * Build the assistant-ui ExternalStoreRuntime adapter
 * - messages / isRunning: read-only selectors
 * - onNew / onCancel / onReload / onEdit: delegate to the existing store actions
 */
export const useChatRuntime = () => {
  const meta = useSessionStore(agentSelectors.currentAgentMeta, isEqual);

  const messages = useChatStore(
    (s) => chatSelectors.currentChatsWithGuideMessage(meta)(s),
    isEqual,
  );

  const isRunning = useChatStore((s) => !!s.chatLoadingId);

  const adapter = useMemo<ExternalStoreAdapter<ChatMessage>>(() => {
    return {
      convertMessage,
      isRunning,
      messages,
      onCancel: async () => {
        useChatStore.getState().stopGenerateMessage();
      },
      // Edit-and-resend: update the target message content, then regenerate from it
      onEdit: async (message) => {
        const text = extractText(message);
        const chats = chatSelectors.currentChats(useChatStore.getState());
        const index = message.parentId
          ? chats.findIndex((c) => c.id === message.parentId) + 1
          : 0;
        const target = chats[index] as ChatMessage | undefined;
        if (!target || !text || target.content === text) return;
        await useChatStore.getState().modifyMessageContent(target.id, text);
        await useChatStore.getState().internalResendMessage(target.id);
      },
      // Send: the same entry point as ChatInput
      onNew: async () => {
        sendCurrentInput();
      },
      // Regenerate the messages after parentId (same behavior as the old regenerate)
      onReload: async (parentId) => {
        const chats = chatSelectors.currentChats(useChatStore.getState());
        const index = parentId ? chats.findIndex((c) => c.id === parentId) + 1 : 0;
        const target = chats[index] as ChatMessage | undefined;
        if (!target) return;
        await useChatStore.getState().internalResendMessage(target.id);
      },
    };
  }, [messages, isRunning]);

  return useExternalStoreRuntime(adapter);
};
