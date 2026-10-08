import { debounce } from 'lodash-es';
import { MessageSquare } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { SettingItem, SettingItemGroup } from '@/components/SettingItemGroup';
import SliderWithInput from '@/components/SliderWithInput';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import { useStore } from './store';

const AgentConfig = memo(() => {
  const { t } = useTranslation('setting');

  const [
    enableAutoCreateTopic,
    autoCreateTopicThreshold,
    enableHistoryCount,
    historyCount,
    enableCompressThreshold,
    compressThreshold,
    inputTemplate,
    updateConfig,
  ] = useStore((s) => [
    s.config.enableAutoCreateTopic,
    s.config.autoCreateTopicThreshold,
    s.config.enableHistoryCount,
    s.config.historyCount,
    s.config.enableCompressThreshold,
    s.config.compressThreshold,
    s.config.inputTemplate,
    s.setAgentConfig,
  ]);

  // Mirror the antd Form onValuesChange contract: debounced (100ms) write-back to the store
  const debouncedUpdateConfig = useMemo(() => debounce(updateConfig, 100), [updateConfig]);

  return (
    <SettingItemGroup
      icon={MessageSquare}
      title={t('settingChat.title')}
    >
      <div className="px-4 py-3">
        <div className="text-sm">{t('settingChat.inputTemplate.title')}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {t('settingChat.inputTemplate.desc')}
        </div>
        <Textarea
          className="mt-2"
          onChange={(e) => debouncedUpdateConfig({ inputTemplate: e.target.value })}
          placeholder={t('settingChat.inputTemplate.placeholder')}
          rows={3}
          value={inputTemplate ?? ''}
        />
      </div>
      <SettingItem desc={t('settingChat.enableAutoCreateTopic.desc')} label={t('settingChat.enableAutoCreateTopic.title')}>
        <Switch
          checked={enableAutoCreateTopic}
          onCheckedChange={(checked) => updateConfig({ enableAutoCreateTopic: checked })}
        />
      </SettingItem>
      {enableAutoCreateTopic && (
        <SettingItem desc={t('settingChat.autoCreateTopicThreshold.desc')} label={t('settingChat.autoCreateTopicThreshold.title')}>
          <SliderWithInput
            className="w-48"
            max={32}
            min={0}
            onChange={(value) => debouncedUpdateConfig({ autoCreateTopicThreshold: value })}
            value={autoCreateTopicThreshold}
          />
        </SettingItem>
      )}
      <SettingItem label={t('settingChat.enableHistoryCount.title')}>
        <Switch
          checked={enableHistoryCount}
          onCheckedChange={(checked) => updateConfig({ enableHistoryCount: checked })}
        />
      </SettingItem>
      {enableHistoryCount && (
        <SettingItem desc={t('settingChat.historyCount.desc')} label={t('settingChat.historyCount.title')}>
          <SliderWithInput
            className="w-48"
            max={32}
            min={1}
            onChange={(value) => debouncedUpdateConfig({ historyCount: value })}
            value={historyCount}
          />
        </SettingItem>
      )}
      <SettingItem label={t('settingChat.enableCompressThreshold.title')}>
        <Switch
          checked={enableCompressThreshold}
          onCheckedChange={(checked) => updateConfig({ enableCompressThreshold: checked })}
        />
      </SettingItem>
      {enableCompressThreshold && (
        <SettingItem desc={t('settingChat.compressThreshold.desc')} label={t('settingChat.compressThreshold.title')}>
          <SliderWithInput
            className="w-48"
            max={32}
            min={0}
            onChange={(value) => debouncedUpdateConfig({ compressThreshold: value })}
            value={compressThreshold}
          />
        </SettingItem>
      )}
    </SettingItemGroup>
  );
});

export default AgentConfig;
