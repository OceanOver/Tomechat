import { memo } from 'react';

import { useChatStore } from '@/store/chat';
import { ChatMessage } from '@/types/message';

import { RenderMessageExtra } from '../types';
import ExtraContainer from './ExtraContainer';
import Translate from './Translate';

export const AssistantMessageExtra: RenderMessageExtra = memo<ChatMessage>(
  ({ extra, id }) => {
    const loading = useChatStore((s) => s.chatLoadingId === id);

    if (!extra?.translate) return null;

    return (
      <div className="mt-2">
        <ExtraContainer>
          <Translate id={id} loading={loading} {...extra?.translate} />
        </ExtraContainer>
      </div>
    );
  },
);
