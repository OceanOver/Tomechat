'use client';

import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { ReactNode, memo } from 'react';

import ChatHydration from '@/components/StoreHydration/ChatHydration';
import { useGlobalStore } from '@/store/global';
import { settingsSelectors } from '@/store/global/selectors';

import SkeletonList from './components/SkeletonList';
import Thread from './components/Thread';
import { useInitConversation } from './hooks/useInitConversation';
import { useChatRuntime } from './runtimeAdapter';

interface ConversationProps {
  chatInput: ReactNode;
  mobile?: boolean;
}

const Conversation = memo<ConversationProps>(({ chatInput, mobile }) => {
  const fontSize = useGlobalStore((s) => settingsSelectors.currentSettings(s).fontSize);

  const runtime = useChatRuntime();

  const init = useInitConversation();

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {fontSize !== 14 && (
        <style>{`
          [data-code-type='markdown'] :is(p, code, pre, ul, ol, li, blockquote) {
            font-size: ${fontSize}px;
          }
        `}</style>
      )}
      <AssistantRuntimeProvider runtime={runtime}>
        <div className="min-h-0 flex-1">
          {init ? <Thread mobile={mobile} /> : <SkeletonList mobile={mobile} />}
        </div>
      </AssistantRuntimeProvider>
      {chatInput}
      <ChatHydration />
    </div>
  );
});

export default Conversation;
