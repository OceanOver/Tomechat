import { PropsWithChildren, memo } from 'react';

import Layout from '../layout.desktop';
import Header from './features/Header';

export default memo(({ children }: PropsWithChildren) => (
  <Layout>
    <Header />
    {/* Header is in normal flow, no extra offset needed; min-h-0 lets the flex child shrink so overflow-y-auto works */}
    <div className="min-h-0 flex-1 overflow-y-auto p-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-stretch gap-6">{children}</div>
    </div>
  </Layout>
));
