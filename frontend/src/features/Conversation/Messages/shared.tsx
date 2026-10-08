import { Button } from '@/components/ui/button';
import Avatar from '@/components/Avatar';
import TextareaAutosize from 'react-textarea-autosize';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useChatStore } from '@/store/chat';
import { ChatMessage } from '@/types/message';

import { useAvatarsClick } from './index';

export const MessageAvatar = memo<{ message?: ChatMessage }>(({ message }) => {
  const onAvatarsClick = useAvatarsClick();
  const meta = message?.meta;

  return (
    <Avatar
      avatar={meta?.avatar}
      background={meta?.backgroundColor}
      className="mt-0.5 shrink-0"
      onClick={onAvatarsClick(message?.role ?? 'assistant')}
      size={32}
      title={meta?.title}
    />
  );
});

MessageAvatar.displayName = 'MessageAvatar';

export const MessageEditing = memo<{
  content: string;
  id: string;
  onFinished: () => void;
}>(({ content, id, onFinished }) => {
  const { t } = useTranslation('common');
  const [value, setValue] = useState(content);
  const modifyMessageContent = useChatStore((s) => s.modifyMessageContent);

  return (
    <div className="flex w-full flex-col">
      <TextareaAutosize
        autoFocus
        className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
        maxRows={16}
        minRows={3}
        onChange={(e) => setValue(e.target.value)}
        value={value}
      />
      <div className="mt-2 flex justify-end gap-2">
        <Button onClick={onFinished} size="sm" variant="ghost">
          {t('cancel')}
        </Button>
        <Button
          onClick={async () => {
            await modifyMessageContent(id, value);
            onFinished();
          }}
          size="sm"
        >
          {t('ok')}
        </Button>
      </div>
    </div>
  );
});

MessageEditing.displayName = 'MessageEditing';
