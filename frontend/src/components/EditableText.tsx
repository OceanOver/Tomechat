'use client';

import { cn } from '@/utils/cn';
import { PencilLine } from 'lucide-react';
import { KeyboardEvent, memo, useCallback, useEffect, useRef, useState } from 'react';

export interface EditableTextProps {
  className?: string;
  editing?: boolean;
  onChangeEnd?: (value: string) => void;
  onEditingChange?: (editing: boolean) => void;
  placeholder?: string;
  showEditIcon?: boolean;
  size?: 'small' | 'normal' | 'large';
  style?: React.CSSProperties;
  type?: 'pure' | 'block';
  value?: string;
}

const EditableText = memo<EditableTextProps>(
  ({
    className,
    editing,
    onChangeEnd,
    onEditingChange,
    placeholder,
    showEditIcon = true,
    size = 'normal',
    style,
    type = 'block',
    value,
  }) => {
    const [inputValue, setInputValue] = useState(value ?? '');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (editing) setInputValue(value ?? '');
    }, [editing, value]);

    useEffect(() => {
      if (editing) inputRef.current?.select();
    }, [editing]);

    const commit = useCallback(() => {
      onChangeEnd?.(inputValue);
      onEditingChange?.(false);
    }, [inputValue, onChangeEnd, onEditingChange]);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        e.stopPropagation();
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') {
          setInputValue(value ?? '');
          onEditingChange?.(false);
        }
      },
      [commit, onEditingChange, value],
    );

    if (!editing) {
      return (
        <span className={cn('inline-flex items-center gap-1', className)} style={style}>
          <span className="truncate">{value}</span>
          {showEditIcon && (
            <button
              aria-label="edit"
              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onEditingChange?.(true);
              }}
              type="button"
            >
              <PencilLine className="size-3.5" />
            </button>
          )}
        </span>
      );
    }

    return (
      <input
        className={cn(
          'w-full rounded-md border border-input bg-background px-2 outline-none focus:ring-1 focus:ring-ring',
          type === 'pure' && 'border-transparent bg-muted',
          size === 'small' ? 'h-6 text-xs' : size === 'large' ? 'h-9 text-base' : 'h-7 text-sm',
          className,
        )}
        onBlur={commit}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        ref={inputRef}
        style={style}
        value={inputValue}
      />
    );
  },
);

EditableText.displayName = 'EditableText';

export default EditableText;
