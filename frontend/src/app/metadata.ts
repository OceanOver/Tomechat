import { Metadata } from 'next';

import { getClientConfig } from '@/config/client';
import { getServerConfig } from '@/config/server';

import pkg from '../../package.json';

const title = 'Tomechat';
const { description } = pkg;

const { SITE_URL } = getServerConfig();
const { BASE_PATH } = getClientConfig();

const noManifest = !!BASE_PATH;

const metadataBaseUrl = (() => {
  try {
    return new URL(SITE_URL || 'http://localhost');
  } catch {
    return new URL('http://localhost');
  }
})();

const metadata: Metadata = {
  appleWebApp: {
    statusBarStyle: 'black-translucent',
    title,
  },
  description,
  manifest: noManifest ? undefined : '/manifest.json',
  metadataBase: metadataBaseUrl,
  // Silence Chrome's deprecation warning for `apple-mobile-web-app-capable`
  other: {
    'mobile-web-app-capable': 'yes',
  },
  openGraph: {
    description: description,
    locale: 'zh-CN',
    siteName: title,
    title: title,
    type: 'website',
    url: SITE_URL || '/',
  },
  title: {
    default: title,
    template: '%s · Tomechat',
  },
};

export default metadata;
