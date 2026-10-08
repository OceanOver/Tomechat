import { useCallback } from 'react';

import { useChatStore } from '@/store/chat';
import { filesSelectors, useFileStore } from '@/store/file';

/**
 * Shared send entry point: both the runtime adapter (onNew) and useSendMessage
 * route through this function.
 */
export const sendCurrentInput = (onlyAddUserMessage?: boolean) => {
  const store = useChatStore.getState();
  if (!!store.chatLoadingId) return;
  if (!store.inputMessage) return;

  const imageList = filesSelectors.imageUrlOrBase64List(useFileStore.getState());

  store.sendMessage({
    files: imageList,
    message: store.inputMessage,
    onlyAddUserMessage: onlyAddUserMessage,
  });

  store.updateInputMessage('');
  useFileStore.getState().clearImageList();
};

export const useSendMessage = () =>
  useCallback((onlyAddUserMessage?: boolean) => {
    sendCurrentInput(onlyAddUserMessage);
  }, []);
