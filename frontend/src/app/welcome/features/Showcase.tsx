'use client';

import { Suspense, memo } from 'react';

import Banner from '@/app/welcome/features/Banner';

const Showcase = memo(() => (
  // flex-1 (not h-full): inside the scrolling column, a 100%-height child plus
  // the footer would always overflow by the footer's height.
  <div className="relative flex w-full flex-1 items-center justify-center">
    <div className="grid w-full place-items-center rounded-lg border border-border p-4">
      {/* The i18n namespace loads async on the client. Without a boundary here the
          banner suspends at the root during hydration, React discards the SSR'd
          content and the box collapses until the locale chunk lands — the
          big→small flash on refresh. A boundary keeps the SSR HTML on screen. */}
      <Suspense fallback={null}>
        <Banner />
      </Suspense>
    </div>
  </div>
));

export default Showcase;
