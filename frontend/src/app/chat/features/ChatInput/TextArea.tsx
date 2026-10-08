import TextareaAutosize from 'react-textarea-autosize';
import { memo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useSendMessage } from '@/features/ChatInput/useSend';
import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';
import { preferenceSelectors } from '@/store/global/selectors';
import { isCommandPressed } from '@/utils/keyboard';

import { useAutoFocus } from './useAutoFocus';

const InputArea = memo<{ setExpand?: (expand: boolean) => void }>(({ setExpand }) => {
  const { t } = useTranslation('chat');
  const ref = useRef<HTMLTextAreaElement>(null);
  const isChineseInput = useRef(false);

  const [loading, value, updateInputMessage] = useChatStore((s) => [
    !!s.chatLoadingId,
    s.inputMessage,
    s.updateInputMessage,
  ]);

  const useCmdEnterToSend = useGlobalStore(preferenceSelectors.useCmdEnterToSend);

  const sendMessage = useSendMessage();

  useAutoFocus(ref);

  const hasValue = !!value;

  useEffect(() => {
    const fn = (e: BeforeUnloadEvent) => {
      if (hasValue) {
        // set returnValue to trigger alert modal
        // Note: No matter what value is set, the browser will display the standard text
        e.returnValue = t('leaveConfirm');
      }
    };

    window.addEventListener('beforeunload', fn);
    return () => {
      window.removeEventListener('beforeunload', fn);
    };
  }, [hasValue]);

  return (
    <div className="relative flex-1">
      <TextareaAutosize
        autoFocus
        className="h-full w-full resize-none bg-transparent px-6 leading-1.5 shadow-none outline-none placeholder:text-muted-foreground focus-visible:ring-0"
        maxRows={12}
        onBlur={(e) => {
          updateInputMessage?.(e.target.value);
        }}
        onChange={(e) => {
          updateInputMessage?.(e.target.value);
        }}
        onCompositionEnd={(e) => {
          isChineseInput.current = false;
          // Match antd TextArea behavior: sync the current value once when IME composition ends
          updateInputMessage?.((e.target as HTMLTextAreaElement).value);
        }}
        onCompositionStart={() => {
          isChineseInput.current = true;
        }}
        onKeyDown={(e) => {
          if (e.key !== 'Enter' || e.shiftKey || isChineseInput.current) return;

          // eslint-disable-next-line unicorn/consistent-function-scoping
          const send = () => {
            // avoid inserting newline when sending message.
            e.preventDefault();

            sendMessage();
            setExpand?.(false);
          };
          const commandKey = isCommandPressed(e);

          // when user like cmd + enter to send message
          if (useCmdEnterToSend) {
            if (commandKey) send();
          } else {
            // cmd + enter to wrap
            if (commandKey) {
              updateInputMessage?.((e.target as any).value + '\n');
              return;
            }

            send();
          }
        }}
        placeholder={t('sendPlaceholder')}
        ref={ref}
        value={value}
      />
    </div>
  );
});

export default InputArea;
