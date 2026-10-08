import { LanguagesIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { type ActionIconGroupItem } from '@/components/ActionIconGroup';
import { localeOptions } from '@/locales/resources';

export const useCustomActions = () => {
  const { t } = useTranslation('chat');

  const translate = {
    children: localeOptions.map((i) => ({
      key: i.value,
      label: t(`lang.${i.value}`, { ns: 'common' }),
    })),
    icon: LanguagesIcon,
    key: 'translate',
    label: t('translate.action'),
  } as ActionIconGroupItem;

  return useMemo(() => ({ translate }), []);
};
