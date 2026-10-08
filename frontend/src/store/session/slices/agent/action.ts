import { produce } from 'immer';
import { StateCreator } from 'zustand/vanilla';

import { sessionService } from '@/services/session';
import { useGlobalStore } from '@/store/global';
import { agentSelectors } from '@/store/session/selectors';
import { ChatAgentConfig } from '@/types/agent';
import { MetaData } from '@/types/meta';

import { SessionStore } from '../../store';
import { sessionSelectors } from '../session/selectors';

/**
 * Agent actions
 */
export interface AgentAction {
  removePlugin: (id: string) => void;
  togglePlugin: (id: string, open?: boolean) => Promise<void>;
  updateAgentConfig: (config: Partial<ChatAgentConfig>) => void;
  updateAgentMeta: (meta: Partial<MetaData>) => void;
}

export const createAgentSlice: StateCreator<
  SessionStore,
  [['zustand/devtools', never]],
  [],
  AgentAction
> = (set, get) => ({
  removePlugin: async (id) => {
    await get().togglePlugin(id, false);
  },

  togglePlugin: async (id, open) => {
    const originConfig = agentSelectors.currentAgentConfig(get());

    const config = produce(originConfig, (draft) => {
      draft.plugins = produce(draft.plugins || [], (plugins) => {
        const index = plugins.indexOf(id);
        const shouldOpen = open !== undefined ? open : index === -1;

        if (shouldOpen) {
          // add if open is true or id is not in plugins
          if (index === -1) {
            plugins.push(id);
          }
        } else {
          // remove if open is false or id is in plugins
          if (index !== -1) {
            plugins.splice(index, 1);
          }
        }
      });
    });

    get().updateAgentConfig(config);
  },
  updateAgentConfig: async (config) => {
    // if is the inbox session, update the global config
    const isInbox = sessionSelectors.isInboxSession(get());
    if (isInbox) {
      await useGlobalStore.getState().updateDefaultAgent({ config });
    } else {
      const session = sessionSelectors.currentSession(get());
      if (!session) return;

      const { activeId } = get();

      await sessionService.updateSessionConfig(activeId, config);
    }

    // trigger store rerender
    await get().refreshSessions();
  },

  updateAgentMeta: async (meta) => {
    // the default session (inbox) is not in the sessions list; meta is stored on the global defaultAgent
    const isInbox = sessionSelectors.isInboxSession(get());
    if (isInbox) {
      await useGlobalStore.getState().updateDefaultAgent({ meta });
      return;
    }

    const session = sessionSelectors.currentSession(get());
    if (!session) return;

    const { activeId, refreshSessions } = get();

    await sessionService.updateSessionMeta(activeId, meta);
    await refreshSessions();
  },
});
