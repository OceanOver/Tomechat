import { Timer } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface HistoryDividerProps {
  enable?: boolean;
}

const HistoryDivider = memo<HistoryDividerProps>(({ enable }) => {
  const { t } = useTranslation('common');
  if (!enable) return null;

  return (
    <div className="px-5">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-xs text-muted-foreground">
          <Timer className="size-3" />
          {t('historyRange', { defaultValue: 'History Message' })}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
});

export default HistoryDivider;
