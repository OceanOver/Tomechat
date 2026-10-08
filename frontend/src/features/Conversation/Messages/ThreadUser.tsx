import { MessagePrimitive } from '@assistant-ui/react';
import { memo, useCallback, useState } from 'react';

import FileList from '@/components/FileList';
import { LOADING_FLAT } from '@/const/message';
import { useChatStore } from '@/store/chat';
import { ChatMessage } from '@/types/message';

import BubblesLoading from '../components/BubblesLoading';
import { UserMessageExtra } from '../Extras/User';
import { useActionsClick } from '../Actions';
import { UserActionsBar } from '../Actions/User';
import { type ActionEvent } from '@/components/ActionIconGroup';
import { MessageAvatar, MessageEditing } from './shared';

const ThreadUser = memo<{
  message?: ChatMessage;
}>(({ message }) => {
  const [editing, setEditing] = useState(false);
  const onActionsClick = useActionsClick();

  const loading = useChatStore((s) => !!message?.id && s.chatLoadingId === message?.id);
  const error = !!message?.error;

  const handleActionClick = useCallback(
    async (action: ActionEvent) => {
      if (action.key === 'edit') {
        setEditing(true);
        return;
      }
      if (message) await onActionsClick(action, message);
    },
    [message, onActionsClick],
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!message || message.id === 'default' || error) return;
      if (e.altKey) setEditing(true);
    },
    [error, message],
  );

  const content = message?.content ?? '';
  const files = message?.files;

  return (
    <MessagePrimitive.Root
      className="group relative flex w-full flex-row-reverse gap-3 px-5 py-2"
      onDoubleClick={handleDoubleClick}
    >
      <MessageAvatar message={message} />
      <div className="flex min-w-0 flex-1 flex-col items-end gap-1">
        {content === LOADING_FLAT ? (
          <BubblesLoading />
        ) : editing ? (
          <div className="w-full max-w-[85%]">
            <MessageEditing content={content} id={message?.id ?? ''} onFinished={() => setEditing(false)} />
          </div>
        ) : (
          <div
            className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl bg-muted px-4 py-2 text-sm"
            id={message?.id}
          >
            {content}
          </div>
        )}
        {files && files.length > 0 && (
          <div className="w-full max-w-[85%]">
            <FileList items={files} />
          </div>
        )}
        {message && <UserMessageExtra {...message} />}
        {loading ? null : (
          <div className="pointer-events-none absolute right-16 top-full z-10 rounded-md border bg-background p-0.5 shadow-sm opacity-0 transition-opacity focus-within:pointer-events-auto focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100">
            <UserActionsBar onActionClick={handleActionClick} />
          </div>
        )}
      </div>
    </MessagePrimitive.Root>
  );
});

ThreadUser.displayName = 'ThreadUser';

export default ThreadUser;
