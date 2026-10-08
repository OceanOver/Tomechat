import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import ChatHeader from '@/components/ChatHeader';
import { pathString } from '@/utils/url';

const Header = memo(() => {
  const { t } = useTranslation('setting');
  const router = useRouter();

  return (
    <ChatHeader
      left={
        <div className="min-w-0">
          <span className="truncate text-sm font-medium leading-tight">
            {t('header.session')}
          </span>
        </div>
      }
      onBackClick={() => router.push(pathString('/chat', { search: location.search }))}
      showBackButton
    />
  );
});

export default Header;
