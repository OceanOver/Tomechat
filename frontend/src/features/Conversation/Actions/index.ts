import { useCallback } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { useChatStore } from '@/store/chat';

import { OnActionsClick } from '../types';

export const useActionsClick = (): OnActionsClick => {
  const { t } = useTranslation('common');
  const [
    deleteMessage,
    regenerateMessage,
    translateMessage,
    delAndRegenerateMessage,
    copyMessage,
  ] = useChatStore((s) => [
    s.deleteMessage,
    s.regenerateMessage,
    s.translateMessage,
    s.delAndRegenerateMessage,
    s.copyMessage,
  ]);

  return useCallback<OnActionsClick>(async (action, { id, content, error }) => {
    switch (action.key) {
      case 'copy': {
        await copyMessage(id, content);
        toast.success(t('copySuccess', { defaultValue: 'Copy Success' }));
        break;
      }

      case 'del': {
        deleteMessage(id);
        break;
      }

      case 'regenerate': {
        regenerateMessage(id);
        // if this message is an error message, we need to delete it
        if (error) deleteMessage(id);
        break;
      }

      case 'delAndRegenerate': {
        delAndRegenerateMessage(id);
        break;
      }
    }

    // The custom ActionIconGroup submenu only returns the item key (a locale such as 'en-US'),
    // so any key outside the known action keys is a translate target language
    const knownKeys = ['copy', 'del', 'delAndRegenerate', 'regenerate'];
    if (!knownKeys.includes(action.key)) {
      translateMessage(id, action.key);
    }
  }, []);
};
