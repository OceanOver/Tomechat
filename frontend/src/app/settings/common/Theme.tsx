import isEqual from 'fast-deep-equal';
import { Palette } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { SettingItem, SettingItemGroup } from '@/components/SettingItemGroup';
import SliderWithInput from '@/components/SliderWithInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AvatarWithUpload from '@/features/AvatarWithUpload';
import type { LocaleMode } from '@/types/locale';
import { localeOptions } from '@/locales/resources';
import { useGlobalStore } from '@/store/global';
import { settingsSelectors } from '@/store/global/selectors';
import { switchLang } from '@/utils/switchLang';

const Theme = memo(() => {
  const { t } = useTranslation('setting');

  const settings = useGlobalStore(settingsSelectors.currentSettings, isEqual);
  const setSettings = useGlobalStore((s) => s.setSettings);

  return (
    <SettingItemGroup icon={Palette} title={t('settingTheme.title')}>
      <SettingItem label={t('settingTheme.avatar.title')}>
        <AvatarWithUpload />
      </SettingItem>
      <SettingItem label={t('settingTheme.lang.title')}>
        <Select
          onValueChange={(value) => {
            setSettings({ language: value as LocaleMode });
            switchLang(value as LocaleMode);
          }}
          value={settings.language}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t('settingTheme.lang.autoMode')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">{t('settingTheme.lang.autoMode')}</SelectItem>
            {localeOptions.map(({ label, value }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingItem>
      <SettingItem desc={t('settingTheme.fontSize.desc')} label={t('settingTheme.fontSize.title')}>
        <SliderWithInput
          className="w-48"
          max={18}
          min={12}
          onChange={(fontSize) => setSettings({ fontSize })}
          step={1}
          value={settings.fontSize}
        />
      </SettingItem>
    </SettingItemGroup>
  );
});

export default Theme;
