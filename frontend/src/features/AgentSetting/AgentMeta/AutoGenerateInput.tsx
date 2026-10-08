import { Sparkles } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import ActionIcon from '@/components/ActionIcon';
import { Input } from '@/components/ui/input';

export interface AutoGenerateInputProps {
  disabled?: boolean;
  loading?: boolean;
  onChange?: (e: { target: { value: string } }) => void;
  onGenerate?: () => void;
  placeholder?: string;
  value?: string;
}

const AutoGenerateInput = memo<AutoGenerateInputProps>(
  ({ disabled, loading, onChange, onGenerate, placeholder, value }) => {
    const { t } = useTranslation('common');

    return (
      <div className="relative w-full">
        <Input
          className="h-9 pr-9"
          disabled={disabled}
          onChange={(e) => onChange?.({ target: { value: e.target.value } })}
          placeholder={placeholder}
          value={value ?? ''}
        />
        {onGenerate && (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
            <ActionIcon
              active
              className="text-primary"
              disabled={disabled || loading}
              icon={Sparkles}
              onClick={onGenerate}
              size={'small'}
              title={t('autoGenerate')}
            />
          </div>
        )}
      </div>
    );
  },
);

export default AutoGenerateInput;
