'use client';

import type { InputProps } from '@/components/ui/input';
import { cn } from '@/utils/cn';
import { Search, X } from 'lucide-react';
import { ChangeEvent, forwardRef, memo, useCallback } from 'react';

export interface SearchBarProps extends Omit<InputProps, 'type' | 'onChange'> {
  allowClear?: boolean;
  /**
   * Show the shortcut hint (used together with shortKey)
   */
  enableShortKey?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onSearch?: (value: string) => void;
  shortKey?: string;
  spotlight?: boolean;
  /**
   * Variants: ghost is borderless and transparent; block/filled use a regular border
   */
  type?: 'block' | 'ghost' | 'filled';
}

const SearchBar = memo<SearchBarProps>(
  forwardRef<HTMLInputElement, SearchBarProps>(
    (
      {
        allowClear,
        className,
        enableShortKey,
        onBlur,
        onChange,
        onSearch,
        placeholder,
        shortKey = 'k',
        spotlight,
        type = 'block',
        value,
        ...rest
      },
      ref,
    ) => {
      const showClear = allowClear && value != null && String(value) !== '';

      const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
          onChange?.(e);
        },
        [onChange],
      );

      const handleClear = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          const input = (e.currentTarget.previousElementSibling ??
            e.currentTarget.parentElement?.querySelector('input')) as HTMLInputElement | null;
          if (input) {
            input.value = '';
            onChange?.({ target: input } as ChangeEvent<HTMLInputElement>);
            input.focus();
          }
        },
        [onChange],
      );

      const ghost = type === 'ghost';

      return (
        <div
          className={cn(
            'relative flex h-8 w-full items-center rounded-md transition-colors',
            ghost
              ? 'bg-transparent hover:bg-accent focus-within:bg-accent focus-within:ring-1 focus-within:ring-ring'
              : 'border border-input bg-background focus-within:ring-1 focus-within:ring-ring',
            spotlight && 'shadow-sm',
            className,
          )}
        >
          <Search aria-hidden className="pointer-events-none absolute left-2 size-4 text-muted-foreground" />
          <input
            className={cn(
              'h-full w-full bg-transparent pl-7 pr-8 text-sm outline-none placeholder:text-muted-foreground',
            )}
            onBlur={onBlur}
            onChange={handleChange}
            placeholder={placeholder}
            ref={ref}
            value={value}
            {...rest}
          />
          {showClear ? (
            <button
              aria-label="clear"
              className="absolute right-1.5 flex size-5 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
              onClick={handleClear}
              type="button"
            >
              <X className="size-3.5" />
            </button>
          ) : enableShortKey ? (
            <kbd className="pointer-events-none absolute right-2 hidden h-5 select-none items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
              ⌘{shortKey.toUpperCase()}
            </kbd>
          ) : null}
        </div>
      );
    },
  ),
);

SearchBar.displayName = 'SearchBar';

export default SearchBar;
