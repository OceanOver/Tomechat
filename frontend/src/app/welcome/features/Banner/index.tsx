'use client';

import { SendHorizonal } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

import { useGlobalStore } from '@/store/global';

import Hero from './Hero';

const Banner = memo(() => {
  // Render nothing until the locale bundle lands — otherwise the slogan/button
  // labels flash the raw i18n keys for a frame before the real text swaps in.
  const { ready, t } = useTranslation('welcome');
  const switchBackToChat = useGlobalStore((s) => s.switchBackToChat);

  if (!ready) return null;

  return (
    <>
      <div className="z-10 mb-4 flex w-full flex-col items-center">
        <Hero />
      </div>
      <div className="flex w-full items-center justify-center gap-4">
        <Button onClick={() => switchBackToChat()} size={'lg'}>
          <span className="inline-flex items-center gap-1">
            {t('button.start')}
            <SendHorizonal className="h-4 w-4" />
          </span>
        </Button>
      </div>
    </>
  );
});

export default Banner;
