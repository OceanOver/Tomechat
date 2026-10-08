import { memo, useMemo, useState } from 'react';
import { shallow } from 'zustand/shallow';

import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';
import { sessionHelpers } from '@/store/session/helpers';
import { agentSelectors, sessionSelectors } from '@/store/session/selectors';

import ListItem from '../ListItem';
import CreateGroupModal from '../Modals/CreateGroupModal';
import Actions from './ItemActions';

interface SessionItemProps {
  id: string;
}

const SessionItem = memo<SessionItemProps>(({ id }) => {
  const [open, setOpen] = useState(false);
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);

  const [active] = useSessionStore((s) => [s.activeId === id]);
  const [loading] = useChatStore((s) => [!!s.chatLoadingId && id === s.activeId]);

  const [pin, title, description, systemRole, avatar, avatarBackground, updateAt, group] =
    useSessionStore((s) => {
      const session = sessionSelectors.getSessionById(id)(s);
      const meta = session.meta;
      const systemRole = session.config.systemRole;

      return [
        sessionHelpers.getSessionPinned(session),
        agentSelectors.getTitle(meta),
        agentSelectors.getDescription(meta),
        systemRole,
        agentSelectors.getAvatar(meta),
        meta.backgroundColor,
        session?.updatedAt,
        session?.group,
      ];
    });

  const actions = useMemo(
    () => (
      <Actions
        group={group}
        id={id}
        openCreateGroupModal={() => setCreateGroupModalOpen(true)}
        setOpen={setOpen}
      />
    ),
    [group, id],
  );

  return (
    <>
      <ListItem
        actions={actions}
        active={active}
        avatar={avatar}
        avatarBackground={avatarBackground}
        date={updateAt ? new Date(updateAt).toLocaleDateString() : undefined}
        description={description || systemRole}
        loading={loading}
        pin={pin}
        showAction={open}
        title={title}
      />
      <CreateGroupModal
        id={id}
        onCancel={() => setCreateGroupModalOpen(false)}
        open={createGroupModalOpen}
      />
    </>
  );
}, shallow);

export default SessionItem;
