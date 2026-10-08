import isEqual from 'fast-deep-equal';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGlobalStore } from '@/store/global';
import { preferenceSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { SessionDefaultGroup } from '@/types/session';

import GroupActions from '../SessionListContent/CollapseGroup/Actions';
import CollapseGroup, { type CollapseGroupItem } from './CollapseGroup';
import Inbox from './Inbox';
import SessionList from './List';
import ConfigGroupModal from './Modals/ConfigGroupModal';
import RenameGroupModal from './Modals/RenameGroupModal';

const SessionListContent = memo(() => {
  const { t } = useTranslation('chat');

  // Which custom group a dropdown/ modal is targeting, and which modal is open.
  const [targetGroupId, setTargetGroupId] = useState<string>();
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  const fetchSessions = useSessionStore((s) => s.useFetchSessions);
  fetchSessions();

  const pinned = useSessionStore(sessionSelectors.pinnedSessions, isEqual);
  const defaults = useSessionStore(sessionSelectors.defaultSessions, isEqual);
  const customGroups = useSessionStore(sessionSelectors.customSessionGroups, isEqual);

  const [expandedKeys, updatePreference] = useGlobalStore((s) => [
    preferenceSelectors.sessionGroupKeys(s),
    s.updatePreference,
  ]);

  const openConfig = () => setConfigModalOpen(true);

  // Sections render top-to-bottom: pinned, custom groups, then the default list.
  const sections = useMemo<CollapseGroupItem[]>(() => {
    const list: CollapseGroupItem[] = [];

    if (pinned.length > 0) {
      list.push({
        children: <SessionList dataSource={pinned} />,
        extra: <GroupActions isPinned openConfigModal={openConfig} />,
        key: SessionDefaultGroup.Pinned,
        label: t('pin'),
      });
    }

    for (const { children, id, name } of customGroups) {
      list.push({
        children: <SessionList dataSource={children} groupId={id} />,
        extra: (
          <GroupActions
            id={id}
            isCustomGroup
            onOpenChange={(open) => {
              if (open) setTargetGroupId(id);
            }}
            openConfigModal={openConfig}
            openRenameModal={() => setRenameModalOpen(true)}
          />
        ),
        key: id,
        label: name,
      });
    }

    list.push({
      children: <SessionList dataSource={defaults} />,
      extra: <GroupActions openConfigModal={openConfig} />,
      key: SessionDefaultGroup.Default,
      label: t('defaultList'),
    });

    return list;
  }, [customGroups, defaults, pinned, t]);

  return (
    <>
      <Inbox />
      <CollapseGroup
        activeKey={expandedKeys}
        items={sections}
        onChange={(keys) => {
          updatePreference({ expandSessionGroupKeys: keys });
        }}
      />
      {targetGroupId && (
        <RenameGroupModal
          id={targetGroupId}
          onCancel={() => setRenameModalOpen(false)}
          open={renameModalOpen}
        />
      )}
      <ConfigGroupModal onCancel={() => setConfigModalOpen(false)} open={configModalOpen} />
    </>
  );
});

export default SessionListContent;
