'use client';

import { memo, useState } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/utils/cn';

const emojis = [
  '🤖', '😀', '😃', '😄', '😁', '😆', '🙂', '😉',
  '😍', '🤩', '😘', '😋', '🤪', '🤨', '🧐', '🤓',
  '😎', '🥳', '😏', '😌', '🤯', '🥱', '😴', '🤠',
  '👻', '👾', '🐱', '🐶', '🦊', '🐻', '🐼', '🐨',
  '🦁', '🐯', '🐮', '🐷', '🐸', '🐵', '🦄', '🐙',
  '🌟', '✨', '🔥', '💡', '🎯', '🚀', '🎨', '🧠',
];

export interface EmojiPickerProps {
  backgroundColor?: string;
  disabled?: boolean;
  /**
   * Kept for API compatibility (the built-in palette has no localized labels)
   */
  locale?: string;
  onChange?: (emoji: string) => void;
  value?: string;
}

const EmojiPicker = memo<EmojiPickerProps>(({ backgroundColor, disabled, onChange, value }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      onOpenChange={(next) => {
        if (disabled) return;
        setOpen(next);
      }}
      open={open}
    >
      <PopoverTrigger asChild>
        <button
          aria-label="avatar"
          className="flex size-10 items-center justify-center rounded-full border border-border text-xl transition-colors hover:bg-accent disabled:cursor-default disabled:opacity-50"
          disabled={disabled}
          style={{ backgroundColor }}
          type="button"
        >
          {value || '🤖'}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <div className="grid grid-cols-8 gap-1">
          {emojis.map((emoji) => (
            <button
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md text-lg transition-colors hover:bg-accent',
                value === emoji && 'bg-accent',
              )}
              key={emoji}
              onClick={() => {
                onChange?.(emoji);
                setOpen(false);
              }}
              type="button"
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
});

EmojiPicker.displayName = 'EmojiPicker';

export default EmojiPicker;
