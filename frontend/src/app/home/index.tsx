'use client';

import { useTranslation } from 'react-i18next';

import FullscreenLoading from '@/components/FullscreenLoading';

const Loading = () => {
  // `ready` gates on the async locale bundle: without it the title renders the
  // raw key (or fallback language) for a frame and swaps once resources land.
  const { ready, t } = useTranslation('common');

  return <FullscreenLoading title={ready ? t('appInitializing') : undefined} />;
};

export default Loading;
