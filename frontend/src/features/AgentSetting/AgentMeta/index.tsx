import { INBOX_SESSION_ID } from '@/const/session';
import { UserCircle, Wand2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { SettingItem, SettingItemGroup } from '@/components/SettingItemGroup';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useGlobalStore } from '@/store/global';
import { settingsSelectors } from '@/store/global/selectors';

import { useStore } from '../store';
import AutoGenerateInput from './AutoGenerateInput';
import AutoGenerateSelect from './AutoGenerateSelect';
import EmojiPicker from './EmojiPicker';

const AgentMeta = memo(() => {
  const { t } = useTranslation('setting');

  const [hasSystemRole, updateMeta, autocompleteMeta, autocompleteAllMeta, id] = useStore((s) => [
    !!s.config.systemRole,
    s.setAgentMeta,
    s.autocompleteMeta,
    s.autocompleteAllMeta,
    s.id,
  ]);
  const locale = useGlobalStore(settingsSelectors.currentLanguage);
  const loading = useStore((s) => s.autocompleteLoading);
  const meta = useStore((s) => s.meta);

  const isGenerating = Object.values(loading).some((i) => !!i);
  // The default assistant (inbox) metadata is read-only
  const disabled = id === INBOX_SESSION_ID;

  return (
    <SettingItemGroup
      extra={
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                disabled={
                  disabled || !(hasSystemRole || meta.title || meta.description) || isGenerating
                }
                onClick={(e) => {
                  e.stopPropagation();

                  autocompleteAllMeta(true);
                }}
                size={'sm'}
                variant={'outline'}
              >
                {isGenerating ? (
                  <Spinner className="size-4" />
                ) : (
                  <Wand2 className="size-4" />
                )}
                {t('autoGenerate', { ns: 'common' })}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('autoGenerateTooltip', { ns: 'common' })}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      }
      icon={UserCircle}
      title={t('settingAgent.title')}
    >
      <SettingItem label={t('settingAgent.avatar.title')}>
        <EmojiPicker
          backgroundColor={meta.backgroundColor}
          disabled={disabled}
          locale={locale}
          onChange={(avatar) => updateMeta({ avatar })}
          value={meta.avatar}
        />
      </SettingItem>
      <SettingItem label={t('settingAgent.name.title')}>
        <AutoGenerateInput
          disabled={disabled || !(hasSystemRole || meta.description)}
          loading={loading.title}
          onChange={(e) => updateMeta({ title: e.target.value })}
          onGenerate={() => autocompleteMeta('title')}
          placeholder={t('settingAgent.name.placeholder')}
          value={meta.title}
        />
      </SettingItem>
      <SettingItem label={t('settingAgent.description.title')}>
        <AutoGenerateInput
          disabled={disabled || !(hasSystemRole || meta.title)}
          loading={loading.description}
          onChange={(e) => updateMeta({ description: e.target.value })}
          onGenerate={() => autocompleteMeta('description')}
          placeholder={t('settingAgent.description.placeholder')}
          value={meta.description}
        />
      </SettingItem>
      {/* The default assistant shows no tags */}
      {!disabled && (
        <SettingItem label={t('settingAgent.tag.title')}>
          <AutoGenerateSelect
            disabled={!(hasSystemRole || meta.title || meta.description)}
            loading={loading.tags}
            onChange={(tags) => updateMeta({ tags })}
            onGenerate={() => autocompleteMeta('tags')}
            placeholder={t('settingAgent.tag.placeholder')}
            value={meta.tags}
          />
        </SettingItem>
      )}
    </SettingItemGroup>
  );
});

export default AgentMeta;
