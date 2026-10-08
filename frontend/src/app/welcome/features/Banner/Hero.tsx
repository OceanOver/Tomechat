import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import Logo from '@/components/Logo';

// clamp(floor, fluid, cap): readable floor on short viewports, capped growth on
// tall ones — a proper type scale instead of a bare vh cutoff.
const logoSize = 'clamp(160px, 26vh, 256px)';
const titleSize = 'clamp(28px, 5.5vh, 48px)';
const descSize = 'clamp(14px, 1.6vh + 8px, 16px)';

const Hero = memo(() => {
  const { t } = useTranslation('welcome');

  return (
    <>
      <div className="flex items-center justify-center">
        <Logo style={{ height: logoSize, width: 'auto' }} type={'flat'} />
      </div>
      {/* Brand as a quiet eyebrow; the logo image above carries the visual brand */}
      <div className="mt-6 text-sm font-medium uppercase tracking-[0.25em] text-muted-foreground">
        Tomechat
      </div>
      <h1
        className="mb-3 mt-2 whitespace-nowrap text-center font-extrabold leading-[1.3] text-foreground max-md:whitespace-normal"
        style={{ fontSize: titleSize }}
      >
        {t('slogan.title')}
      </h1>
      <div
        className="text-center font-normal leading-relaxed text-foreground/75"
        style={{ fontSize: descSize }}
      >
        {t('slogan.desc1')}
      </div>
    </>
  );
});

export default Hero;
