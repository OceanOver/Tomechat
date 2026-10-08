import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import SearchBar from '@/components/SearchBar';
import { useResponsive } from '@/hooks/useResponsive';
import { useSessionStore } from '@/store/session';

const SessionSearchBar = memo(() => {
  const { t } = useTranslation('chat');
  const [keywords, setKeywords] = useState<string | undefined>(undefined);
  const [useSearchSessions] = useSessionStore((s) => [s.useSearchSessions]);

  useSearchSessions(keywords);

  const { isMobile } = useResponsive();

  return (
    <SearchBar
      allowClear
      enableShortKey={!isMobile}
      onChange={(e) => {
        const newKeywords = e.target.value;
        setKeywords(newKeywords);
        useSessionStore.setState({ isSearching: !!newKeywords });
      }}
      placeholder={t('searchAgentPlaceholder')}
      shortKey={'k'}
      type={isMobile ? 'block' : 'ghost'}
      value={keywords}
    />
  );
});

export default SessionSearchBar;
