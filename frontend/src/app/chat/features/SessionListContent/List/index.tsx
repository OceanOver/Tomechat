import Link from 'next/link';
import { memo } from 'react';
import LazyLoad from 'react-lazy-load';

import { SESSION_CHAT_URL } from '@/const/url';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { ChatSession } from '@/types/session';

import AddButton from './AddButton';
import SessionItem from './Item';
import SkeletonList from './SkeletonList';

interface SessionListProps {
  dataSource: ChatSession[];
  groupId?: string;
  showAddButton?: boolean;
}
const SessionList = memo<SessionListProps>(({ dataSource, groupId, showAddButton = true }) => {
  const [activeSession, isInit] = useSessionStore((s) => [
    s.activeSession,
    sessionSelectors.isSessionListInit(s),
  ]);

  if (!isInit) return <SkeletonList />;

  if (dataSource.length === 0) {
    return showAddButton ? <AddButton groupId={groupId} /> : null;
  }

  return (
    <>
      {dataSource.map(({ id }) => (
        <LazyLoad className="min-h-[64px]" key={id}>
          <Link
            aria-label={id}
            href={SESSION_CHAT_URL(id)}
            onClick={(e) => {
              e.preventDefault();
              activeSession(id);
            }}
          >
            <SessionItem id={id} />
          </Link>
        </LazyLoad>
      ))}
    </>
  );
});

export default SessionList;
