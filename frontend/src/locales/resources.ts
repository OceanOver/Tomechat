import resources from './default';

const locales = ['en-US', 'zh-CN'] as const;

export type DefaultResources = typeof resources;
export type Locales = (typeof locales)[number];

export const normalizeLocale = (locale?: string) => {
  if (!locale) return 'en-US';

  switch (locale) {
    case 'zh-CN':
    case 'zh': {
      return 'zh-CN';
    }

    case 'en':
    case 'en-US': {
      return 'en-US';
    }

    default: {
      return 'en-US';
    }
  }
};

type LocaleOptions = {
  label: string;
  value: Locales;
}[];

export const localeOptions: LocaleOptions = [
  {
    label: 'English',
    value: 'en-US',
  },
  {
    label: '简体中文',
    value: 'zh-CN',
  },
] as LocaleOptions;

export const supportLocales: string[] = [...locales, 'en', 'zh'];
