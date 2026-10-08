import { MarkdownTextPrimitive } from '@assistant-ui/react-markdown';
import { MessagePrimitive } from '@assistant-ui/react';
import { memo, useCallback, useState } from 'react';
import remarkGfm from 'remark-gfm';
import { useTranslation } from 'react-i18next';

import { type ActionEvent } from '@/components/ActionIconGroup';
import { markdownComponents } from '@/components/Markdown';
import { LOADING_FLAT } from '@/const/message';
import { cn } from '@/utils/cn';
import { ChatMessage } from '@/types/message';

import { useActionsClick } from '../Actions';
import { AssistantActionsBar } from '../Actions/Assistant';
import { DefaultActionsBar } from '../Actions/Fallback';
import { FunctionActionsBar } from '../Actions/Function';
import BubblesLoading from '../components/BubblesLoading';
import ErrorMessageExtra, { isWarningError } from '../Error';
import { AssistantMessageExtra } from '../Extras/Assistant';
import { MessageAvatar, MessageEditing } from './shared';

const markdownClassName =
  'prose prose-sm max-w-none break-words prose-p:my-1 prose-pre:my-0 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-headings:mb-2 [&_a]:break-all [&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline';

const remarkPlugins = [remarkGfm];

/**
 * MarkdownTextPrimitive must be used as the Text component of MessagePrimitive.Parts
 * (it relies on the internal part scope); mounting it under MessagePrimitive.Root breaks.
 */
const MarkdownText = memo(() => (
  <MarkdownTextPrimitive
    className={markdownClassName}
    components={markdownComponents}
    remarkPlugins={remarkPlugins}
    smooth={false}
  />
));

MarkdownText.displayName = 'MarkdownText';

const ThreadAssistant = memo<{
  message?: ChatMessage;
}>(({ message }) => {
  const { t } = useTranslation('error');
  const [editing, setEditing] = useState(false);
  const onActionsClick = useActionsClick();

  const role = message?.role ?? 'assistant';
  const content = message?.content ?? '';
  const error = message?.error;

  const plainText = role !== 'assistant';

  const RenderActionsBar =
    role === 'function'
      ? FunctionActionsBar
      : role === 'system'
        ? DefaultActionsBar
        : AssistantActionsBar;

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
      if (message.role !== 'assistant' && message.role !== 'user') return;
      if (e.altKey) setEditing(true);
    },
    [error, message],
  );

  return (
    <MessagePrimitive.Root
      className="group relative flex w-full gap-3 px-5 py-2"
      onDoubleClick={handleDoubleClick}
    >
      <MessageAvatar message={message} />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        {content === LOADING_FLAT ? (
          <BubblesLoading />
        ) : error ? (
          <div className="flex w-full flex-col gap-2">
            <div
              className={cn(
                'rounded-md border px-3 py-2 text-sm',
                isWarningError(error.type)
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-600'
                  : 'border-destructive/40 bg-destructive/10 text-destructive',
              )}
            >
              {t(`response.${error.type}` as any, { ns: 'error' })}
            </div>
            {message && <ErrorMessageExtra data={message} />}
          </div>
        ) : editing ? (
          <div className="w-full">
            <MessageEditing
              content={content}
              id={message?.id ?? ''}
              onFinished={() => setEditing(false)}
            />
          </div>
        ) : plainText ? (
          <div className="whitespace-pre-wrap break-words text-sm" id={message?.id}>
            {content}
          </div>
        ) : (
          <div className="w-full" data-code-type="markdown">
            <MessagePrimitive.Parts components={{ Text: MarkdownText }} />
          </div>
        )}
        {message && role === 'assistant' && <AssistantMessageExtra {...message} />}
        <div className="pointer-events-none absolute left-16 top-full z-10 rounded-md border bg-background p-0.5 shadow-sm opacity-0 transition-opacity focus-within:pointer-events-auto focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100">
          <RenderActionsBar
            error={!!error}
            id={message?.id}
            onActionClick={handleActionClick}
          />
        </div>
      </div>
    </MessagePrimitive.Root>
  );
});

ThreadAssistant.displayName = 'ThreadAssistant';

export default ThreadAssistant;
