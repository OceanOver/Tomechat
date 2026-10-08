import { Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import ActionIcon from '@/components/ActionIcon';
import AgentInfo from '@/features/AgentInfo';
import EditableMessage from '@/components/EditableMessage';
import { Skeleton } from '@/components/ui/skeleton';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { agentSelectors, sessionSelectors } from '@/store/session/selectors';
import { pathString } from '@/utils/url';

import SidebarHeader from '../../components/SidebarHeader';

/**
 * Agent system role display card. The edit dialog is hoisted to the SideBar
 * container level (SystemRoleEditDialog) so no Dialog mounts inside the panel subtree.
 */
const SystemRole = memo(() => {
  const router = useRouter();

  const [init, systemRole, meta] = useSessionStore((s) => [
    sessionSelectors.isSomeSessionActive(s),
    agentSelectors.currentAgentSystemRole(s),
    agentSelectors.currentAgentMeta(s),
  ]);

  const toggleSystemRole = useGlobalStore((s) => s.toggleSystemRole);

  // Declare the 'setting' ns too, to avoid a hydration mismatch from ns overrides hitting unloaded namespaces
  const { t } = useTranslation(['common', 'setting']);

  const handleOpen = () => {
    if (!init) return;
    toggleSystemRole(true);
  };

  return (
    <div className="h-fit">
      <SidebarHeader
        actions={
          <ActionIcon icon={Edit} onClick={handleOpen} size={'small'} title={t('edit')} />
        }
        title={t('settingAgent.prompt.title', { ns: 'setting' })}
      />
      <div className="relative h-[200px] overflow-hidden border-b border-border px-4 py-3">
        {!init ? (
          <Skeleton className="mx-4 mt-3 h-16" />
        ) : (
          <>
            <EditableMessage
              classNames={{ markdown: 'h-full overflow-y-auto opacity-75 transition-opacity hover:opacity-100' }}
              model={{
                extra: (
                  <AgentInfo
                    meta={meta}
                    onAvatarClick={() => {
                      router.push(pathString('/chat/settings', { search: location.search }));
                    }}
                    style={{ marginBottom: 16 }}
                  />
                ),
              }}
              placeholder={`${t('settingAgent.prompt.placeholder', { ns: 'setting' })}...`}
              value={systemRole}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-muted/40 to-transparent" />
          </>
        )}
      </div>
    </div>
  );
});

export default SystemRole;
