import { MessageSquareDashed } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const DefaultContent = memo(() => {
  const { t } = useTranslation('common');

  return (
    <div className="flex items-center gap-2">
      <div className="flex size-6 items-center justify-center">
        <MessageSquareDashed className="size-4 text-muted-foreground" />
      </div>
      <span className="line-clamp-1 flex-1 text-start">{t('topic.defaultTitle', { ns: 'chat' })}</span>
      <span className="inline-flex items-center whitespace-nowrap rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
        {t('temp')}
      </span>
    </div>
  );
});

export default DefaultContent;
