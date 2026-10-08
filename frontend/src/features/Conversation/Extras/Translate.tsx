import { ChevronDown, ChevronUp, ChevronsRight, CopyIcon, TrashIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import ActionIcon from '@/components/ActionIcon';
import Markdown from '@/components/Markdown';
import { useChatStore } from '@/store/chat';
import { ChatTranslate } from '@/types/message';
import { copyToClipboard } from '@/utils/clipboard';

import BubblesLoading from '../components/BubblesLoading';

interface TranslateProps extends ChatTranslate {
  id: string;
  loading?: boolean;
}

const LangBadge = ({ label }: { label: string }) => (
  <span className="inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs text-muted-foreground">
    {label}
  </span>
);

const Translate = memo<TranslateProps>(({ content = '', from, to, id, loading }) => {
  const { t } = useTranslation('common');
  const [collapsed, setCollapsed] = useState(false);
  const clearTranslate = useChatStore((s) => s.clearTranslate);

  const copyText = async () => {
    const success = await copyToClipboard(content);
    if (success) toast.success(t('copySuccess'));
  };

  const body = loading && !content ? <BubblesLoading /> : <Markdown>{content}</Markdown>;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <LangBadge label={from ? t(`lang.${from}` as any) : '...'} />
          <ChevronsRight className="size-3.5 text-muted-foreground" />
          <LangBadge label={t(`lang.${to}` as any)} />
        </div>
        <div className="flex items-center">
          <ActionIcon icon={CopyIcon} onClick={copyText} size={'small'} title={t('copy')} />
          <ActionIcon
            icon={TrashIcon}
            onClick={() => {
              clearTranslate(id);
            }}
            size={'small'}
            title={t('translate.clear', { ns: 'chat' })}
          />
          <ActionIcon
            icon={collapsed ? ChevronUp : ChevronDown}
            onClick={() => {
              setCollapsed(!collapsed);
            }}
            size={'small'}
          />
        </div>
      </div>
      {collapsed ? null : body}
    </div>
  );
});

export default Translate;
