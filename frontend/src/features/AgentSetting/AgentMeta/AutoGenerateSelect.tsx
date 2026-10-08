import { Sparkles, X } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ActionIcon from '@/components/ActionIcon';
import { cn } from '@/utils/cn';

// Match the antd Select tokenSeparators behavior: [',', '，', ' ']
const separators = /[\s,，]/;

export interface AutoGenerateSelectProps {
  disabled?: boolean;
  loading?: boolean;
  onChange?: (value: string[]) => void;
  onGenerate?: () => void;
  placeholder?: string;
  value?: string | string[];
}

const AutoGenerateSelect = memo<AutoGenerateSelectProps>(
  ({ disabled, loading, onChange, onGenerate, placeholder, value }) => {
    const { t } = useTranslation('common');
    const [draft, setDraft] = useState('');

    const tags = Array.isArray(value) ? value : value ? [value] : [];

    const commit = useCallback(
      (raw: string) => {
        const next = raw.split(separators).filter(Boolean);
        const merged = [...tags, ...next.filter((tag) => !tags.includes(tag))];
        if (merged.length === tags.length) return;
        onChange?.(merged);
      },
      [onChange, tags],
    );

    const removeTag = (tag: string) => {
      onChange?.(tags.filter((item) => item !== tag));
    };

    return (
      <div
        className={cn(
          'flex min-h-9 w-full items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1 text-sm transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
          disabled && 'opacity-50',
        )}
      >
        {tags.map((tag) => (
          <span
            className="inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 text-xs"
            key={tag}
          >
            {tag}
            <button
              aria-label={`remove ${tag}`}
              className="text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => removeTag(tag)}
              type="button"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          className="h-6 min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          disabled={disabled}
          onBlur={() => {
            if (draft) {
              commit(draft);
              setDraft('');
            }
          }}
          onChange={(e) => {
            const next = e.target.value;
            if (separators.test(next)) {
              commit(next);
              setDraft('');
            } else {
              setDraft(next);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (draft) {
                commit(draft);
                setDraft('');
              }
            } else if (e.key === 'Backspace' && !draft && tags.length > 0) {
              removeTag(tags.at(-1)!);
            }
          }}
          placeholder={tags.length === 0 ? placeholder : undefined}
          value={draft}
        />
        {onGenerate && (
          <ActionIcon
            active
            className="text-primary"
            disabled={disabled || loading}
            icon={Sparkles}
            onClick={onGenerate}
            size={'small'}
            title={t('autoGenerate')}
          />
        )}
      </div>
    );
  },
);

export default AutoGenerateSelect;
