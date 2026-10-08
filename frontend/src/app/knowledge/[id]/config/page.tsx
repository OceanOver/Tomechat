'use client';

import { Settings } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { SettingItem, SettingItemGroup } from '@/components/SettingItemGroup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useKnowledgeStore } from '@/store/knowledge';

const KnowledgeBaseConfig = memo(({ params }: { params: { id: string } }) => {
  const { t } = useTranslation('knowledge');
  const [submitLoading, setSubmitLoading] = useState(false);

  const [
    editKnowledgeInfo,
    useFetchKnowledgeUpdate
  ] = useKnowledgeStore((s) => [
    s.editKnowledgeInfo,
    s.useFetchKnowledgeUpdate
  ]);

  const [knowledge_base_name, setKnowledgeBaseName] = useState(editKnowledgeInfo?.knowledge_base_name ?? '');
  const [kb_info, setKbInfo] = useState(editKnowledgeInfo?.kb_info ?? '');

  const handleConfigChange = useCallback(async () => {
    // Manual validation (previously Form rules: name/intro required)
    if (!knowledge_base_name) {
      toast.error(t('config.nameRequired'));
      return;
    }
    if (!kb_info) {
      toast.error(t('config.introRequired'));
      return;
    }

    setSubmitLoading(true);
    const { msg, code } = await useFetchKnowledgeUpdate({ kb_info, knowledge_base_name });
    if (code === 200) {
      toast.success(msg);
    } else {
      toast.error(msg);
    }
    setSubmitLoading(false);
  }, [kb_info, knowledge_base_name]);

  return (
    <div className="w-full max-w-3xl">
      <SettingItemGroup icon={Settings} title={t('config.title')}>
        <SettingItem label={t('config.name')}>
          <Input
            className="w-72 max-w-[70%] disabled:opacity-100"
            disabled
            onChange={(e) => setKnowledgeBaseName(e.target.value)}
            placeholder={t('config.namePlaceholder')}
            value={knowledge_base_name}
          />
        </SettingItem>
        <SettingItem label={t('config.intro')}>
          <Textarea
            className="w-72 max-w-[70%]"
            onChange={(e) => setKbInfo(e.target.value)}
            placeholder={t('config.introPlaceholder')}
            value={kb_info}
          />
        </SettingItem>
      </SettingItemGroup>
      <div className="flex justify-center p-12">
        <Button
          className="w-80"
          disabled={submitLoading}
          onClick={handleConfigChange}
          size="lg"
        >
          {submitLoading ? t('config.saving') : t('config.save')}
        </Button>
      </div>
    </div>
  );
});

export default KnowledgeBaseConfig;
