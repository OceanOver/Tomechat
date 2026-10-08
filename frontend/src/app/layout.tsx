import { ResolvingViewport } from 'next';
import { cookies, headers } from 'next/headers';
import { PropsWithChildren } from 'react';
import { isRtlLang } from 'rtl-detect';

import './globals.css';

import { DEFAULT_LANG, TOMECHAT_LOCALE } from '@/const/locale';
import Layout from '@/layout/GlobalLayout';
import { normalizeLocale, supportLocales } from '@/locales/resources';

// Best-effort language detection on the server: cookie first, then the
// Accept-Language header. Resolving the language here means SSR renders the
// final language directly — the client detector never switches languages
// after hydration, so no text swap/flash on first paint.
const detectLang = () => {
  const cookieStore = cookies();
  const cookieLang = cookieStore.get(TOMECHAT_LOCALE)?.value;
  if (cookieLang) return cookieLang;

  const acceptLanguage = headers().get('accept-language') ?? '';
  for (const part of acceptLanguage.split(',')) {
    const locale = part.split(';')[0]?.trim();
    if (locale && supportLocales.includes(locale)) return normalizeLocale(locale);
  }
  return DEFAULT_LANG;
};

const RootLayout = ({ children }: PropsWithChildren) => {
  const lang = detectLang();
  const direction = isRtlLang(lang) ? 'rtl' : 'ltr';

  return (
    <html dir={direction} lang={lang} suppressHydrationWarning>
      <body>
        <Layout defaultLang={lang}>{children}</Layout>
      </body>
    </html>
  );
};

export default RootLayout;

export { default as metadata } from './metadata';

export const generateViewport = async (): ResolvingViewport => {
  return {
    initialScale: 1,
    minimumScale: 1,
    themeColor: [
      { color: '#f8f8f8', media: '(prefers-color-scheme: light)' },
      { color: '#000', media: '(prefers-color-scheme: dark)' },
    ],
    viewportFit: 'cover',
    width: 'device-width',
  };
};
