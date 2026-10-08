import { changeLanguage } from 'i18next';

import { LocaleMode } from '@/types/locale';

// Apply the UI language. 'auto' defers to the browser setting.
export const switchLang = (locale: LocaleMode): void => {
  const lang = locale === 'auto' ? navigator.language : locale;

  void changeLanguage(lang);
  document.documentElement.lang = lang;
};
