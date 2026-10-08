import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import SearchBar from '@/components/SearchBar';
import { useResponsive } from '@/hooks/useResponsive';
import { useChatStore } from '@/store/chat';

const TopicSearchBar = memo<{ onClear?: () => void }>(({ onClear }) => {
  const { t } = useTranslation('chat');

  const [keywords, setKeywords] = useState('');
  const { isMobile } = useResponsive();

  const useSearchTopics = useChatStore((s) => s.useSearchTopics);

  useSearchTopics(keywords);

  return (
    <SearchBar
      autoFocus
      onBlur={() => {
        if (keywords === '') onClear?.();
      }}
      onChange={(e) => {
        const value = e.target.value;

        setKeywords(value);
        useChatStore.setState({ isSearchingTopic: !!value });
      }}
      placeholder={t('topic.searchPlaceholder')}
      type={isMobile ? 'block' : 'ghost'}
      value={keywords}
    />
  );
});

export default TopicSearchBar;
