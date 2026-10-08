import { memo } from 'react';

import Header from './Header';
import { Topic } from './Topic';
import TopicSearchBar from './TopicSearchBar';

const TopicListContent = memo<{ mobile?: boolean }>(({ mobile }) => {
  return (
    <div className="flex h-full flex-col overflow-hidden" style={{ gap: mobile ? 8 : 0 }}>
      {mobile ? <TopicSearchBar /> : <Header />}
      <div className="relative flex h-full flex-col gap-4 pt-1.5" style={{ paddingInline: mobile ? 0 : 8 }}>
        <Topic />
      </div>
    </div>
  );
});

export default TopicListContent;
