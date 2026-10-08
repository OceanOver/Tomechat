import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import AgentInfo from '@/features/AgentInfo';
import EditableMessage from '@/components/EditableMessage';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { agentSelectors, sessionSelectors } from '@/store/session/selectors';
import { pathString } from '@/utils/url';

/**
 * Agent system role edit dialog.
 * Deliberately rendered outside the DraggablePanel subtree (mounted by SideBar Desktop):
 * Radix Dialogs mounted inside the panel subtree never receive React events (all buttons dead).
 */
const SystemRoleEditDialog = memo(() => {
  const router = useRouter();
  const { t } = useTranslation('setting');

  const [isInbox, systemRole, meta, updateAgentConfig] = useSessionStore((s) => [
    sessionSelectors.isInboxSession(s),
    agentSelectors.currentAgentSystemRole(s),
    agentSelectors.currentAgentMeta(s),
    s.updateAgentConfig,
  ]);

  const [showSystemRole, toggleSystemRole] = useGlobalStore((s) => [
    s.preference.showSystemRole,
    s.toggleSystemRole,
  ]);

  if (isInbox) return null;

  return (
    <EditableMessage
      model={{
        extra: (
          <AgentInfo
            meta={meta}
            onAvatarClick={() => {
              toggleSystemRole(false);
              router.push(pathString('/chat/settings', { search: location.search }));
            }}
            style={{ marginBottom: 16 }}
          />
        ),
      }}
      onChange={(e) => {
        updateAgentConfig({ systemRole: e });
      }}
      onOpenChange={toggleSystemRole}
      openModal={showSystemRole}
      placeholder={`${t('settingAgent.prompt.placeholder')}...`}
      text={{ title: t('settingAgent.prompt.title') }}
      value={systemRole}
    />
  );
});

SystemRoleEditDialog.displayName = 'SystemRoleEditDialog';

export default SystemRoleEditDialog;
