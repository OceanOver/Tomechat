import { MessageSquarePlus } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import ActionIcon from '@/components/ActionIcon';
import Logo from '@/components/Logo';
import { useSessionStore } from '@/store/session';

import SessionSearchBar from './SessionSearchBar';

const Header = memo(() => {
  const { t } = useTranslation('chat');
  const [createSession] = useSessionStore((s) => [s.createSession]);

  return (
    <div className="flex flex-col gap-3 p-4 pb-2">
      <div className="flex items-center justify-between">
        <Logo size={28} type={'text'} />
        <ActionIcon
          icon={MessageSquarePlus}
          onClick={() => createSession()}
          title={t('newAgent')}
        />
      </div>
      <SessionSearchBar />
    </div>
  );
});

export default Header;
