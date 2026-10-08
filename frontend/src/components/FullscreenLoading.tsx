import { Loader2 } from 'lucide-react';
import { memo } from 'react';

import Logo from '@/components/Logo';

// Critical styles are inlined: this screen renders at first paint, possibly
// before any external CSS has loaded (dev mode serves layout.css late). Theme
// values come from CSS variables — shadcn stores them as raw HSL triplets, so
// they need the hsl() wrapper — with hardcoded fallbacks for the pre-CSS frame.
// The spin keyframes are declared inline for the same reason.
const FullscreenLoading = memo<{ title?: string }>(({ title }) => {
  return (
    <div
      style={{
        alignItems: 'center',
        background: 'hsl(var(--background, 0 0% 100%))',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        height: '100%',
        justifyContent: 'center',
        maxHeight: '100dvh',
        userSelect: 'none',
        width: '100%',
      }}
    >
      <style>{'@keyframes tm-spin{to{transform:rotate(360deg)}}'}</style>
      {/* Image-only logo: same brand form as the welcome hero (wordmark lives in the hero eyebrow) */}
      <Logo size={64} type={'flat'} />
      {/* No title until the locale bundle is ready — an empty row reserves no
          space, so nothing shifts when the text appears */}
      {title && (
        <div
          style={{
            alignItems: 'center',
            color: 'hsl(var(--muted-foreground, 0 0% 45.1%))',
            display: 'flex',
            fontSize: 14,
            gap: 8,
          }}
        >
          <Loader2
            style={{
              animation: 'tm-spin 1s linear infinite',
              height: 16,
              width: 16,
            }}
          />
          {title}
        </div>
      )}
    </div>
  );
});

FullscreenLoading.displayName = 'FullscreenLoading';

export default FullscreenLoading;
