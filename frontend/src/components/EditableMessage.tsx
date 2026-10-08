'use client';

import Markdown from '@/components/Markdown';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/utils/cn';
import { PencilLine } from 'lucide-react';
import { CSSProperties, ReactNode, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';

export interface EditableMessageProps {
  classNames?: {
    markdown?: string;
    textarea?: string;
  };
  /**
   * Kept for API compatibility
   */
  editButtonSize?: 'small' | 'normal' | 'large';
  editing?: boolean;
  height?: number | 'auto';
  /**
   * Kept for API compatibility
   */
  inputType?: 'ghost' | 'textarea';
  model?: {
    extra?: ReactNode;
    onAvatarClick?: () => void;
  };
  onChange?: (value: string) => void;
  onEditingChange?: (editing: boolean) => void;
  onOpenChange?: (open: boolean) => void;
  openModal?: boolean;
  placeholder?: string;
  showEditWhenEmpty?: boolean;
  styles?: {
    markdown?: CSSProperties;
    textarea?: CSSProperties;
  };
  text?: {
    cancel?: string;
    confirm?: string;
    edit?: string;
    title?: string;
  };
  value?: string;
}

const textareaClasses =
  'w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring';

const EditableMessage = memo<EditableMessageProps>(
  ({
    classNames,
    editButtonSize,
    editing,
    inputType,
    model,
    onChange,
    onEditingChange,
    onOpenChange,
    openModal,
    placeholder,
    showEditWhenEmpty,
    styles,
    text,
    value = '',
  }) => {
    const [draft, setDraft] = useState(value);

    const { t } = useTranslation('common');

    useEffect(() => {
      if (openModal) setDraft(value);
    }, [openModal, value]);

    const closeEditing = useCallback(() => {
      onEditingChange?.(false);
      onOpenChange?.(false);
    }, [onEditingChange, onOpenChange]);

    // Confirm: submit the current draft
    const confirmEditing = useCallback(() => {
      onChange?.(draft);
      closeEditing();
    }, [closeEditing, draft, onChange]);

    // Cancel: revert unconfirmed edits back to the original value
    const cancelEditing = useCallback(() => {
      setDraft(value);
      onChange?.(value);
      closeEditing();
    }, [closeEditing, onChange, value]);

    const textarea = useMemo(
      () => (
        <TextareaAutosize
          autoFocus
          className={cn(textareaClasses, classNames?.textarea)}
          maxRows={16}
          minRows={3}
          onChange={(e) => {
            setDraft(e.target.value);
            onChange?.(e.target.value);
          }}
          placeholder={placeholder}
          style={
            // react-textarea-autosize v8 throws when style carries minHeight/height keys
            // (use minRows/maxRows instead), so height is not forwarded — only custom styles are
            (styles?.textarea ?? {}) as any
          }
          value={openModal !== undefined ? draft : value}
        />
      ),
      [classNames?.textarea, draft, onChange, openModal, placeholder, styles?.textarea, value],
    );

    const footer = useMemo(
      () => (
        <div className="mt-2 flex justify-end gap-2">
          <Button onClick={cancelEditing} size="sm" variant="ghost">
            {text?.cancel || t('cancel')}
          </Button>
          <Button onClick={confirmEditing} size="sm">
            {text?.confirm || t('ok')}
          </Button>
        </div>
      ),
      [cancelEditing, confirmEditing, t, text],
    );

    // In controlled openModal mode, editing happens inside the modal (which already
    // covers the screen; no separate display layer needed)
    if (openModal !== undefined) {
      return (
        <Dialog onOpenChange={(open) => (open ? onOpenChange?.(true) : cancelEditing())} open={openModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{text?.title || t('edit')}</DialogTitle>
              <DialogDescription className="sr-only">{text?.title || t('edit')}</DialogDescription>
            </DialogHeader>
            {model?.extra}
            {textarea}
            {footer}
          </DialogContent>
        </Dialog>
      );
    }

    // Inline editing
    if (editing) {
      return (
        <div className="flex w-full flex-col">
          {textarea}
          {footer}
        </div>
      );
    }

    const empty = !value;

    return (
      <div className="w-full">
        {empty && placeholder ? (
          <div
            className={cn(
              'text-muted-foreground opacity-60',
              showEditWhenEmpty && 'text-sm',
            )}
          >
            {placeholder}
          </div>
        ) : (
          <div className={cn(classNames?.markdown)} style={styles?.markdown}>
            <Markdown>{value}</Markdown>
          </div>
        )}
        {empty && showEditWhenEmpty && (
          <button
            className="mt-1.5 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => onEditingChange?.(true)}
            type="button"
          >
            <PencilLine className="size-3.5" />
            {text?.edit || t('edit')}
          </button>
        )}
      </div>
    );
  },
);

EditableMessage.displayName = 'EditableMessage';

export default EditableMessage;
