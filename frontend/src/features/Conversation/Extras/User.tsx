import { memo } from 'react';

import { useChatStore } from '@/store/chat';
import { ChatMessage } from '@/types/message';

import { RenderMessageExtra } from '../types';
import ExtraContainer from './ExtraContainer';
import Translate from './Translate';

export const UserMessageExtra: RenderMessageExtra = memo<ChatMessage>(({ extra, id }) => {
  const loading = useChatStore((s) => s.chatLoadingId === id);

  const showTranslate = !!extra?.translate;

  if (!showTranslate) return null;

  return (
    <div className="mt-2">
      {extra?.translate && (
        <ExtraContainer>
          <Translate id={id} {...extra?.translate} loading={loading} />
        </ExtraContainer>
      )}
    </div>
  );
});
