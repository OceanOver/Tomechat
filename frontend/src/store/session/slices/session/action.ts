import { toast } from 'sonner';
import { t } from 'i18next';
import useSWR, { SWRResponse, mutate } from 'swr';
import { DeepPartial } from 'utility-types';
import { StateCreator } from 'zustand/vanilla';

import { INBOX_SESSION_ID } from '@/const/session';
import { SESSION_CHAT_URL } from '@/const/url';
import { sessionService } from '@/services/session';
import { useGlobalStore } from '@/store/global';
import { settingsSelectors } from '@/store/global/selectors';
import { SessionStore } from '@/store/session';
import { ChatSessionList, ChatSession, SessionType, ChatSessions } from '@/types/session';
import { merge } from '@/utils/merge';
import { setNamespace } from '@/utils/storeDebug';

import { agentSelectors } from '../agent/selectors';
import { initSession } from './initialState';
import { sessionSelectors } from './selectors';

const n = setNamespace('session');

const FETCH_SESSIONS_KEY = 'fetchSessions';

export interface SessionAction {
  /**
   * active the session
   * @param sessionId
   */
  activeSession: (sessionId: string) => void;
  /**
   * reset sessions to default
   */
  clearSessions: () => Promise<void>;
  /**
   * create a new session
   * @param agent
   * @returns sessionId
   */
  createSession: (
    session?: DeepPartial<ChatSession>,
    isSwitchSession?: boolean,
  ) => Promise<string>;
  duplicateSession: (id: string) => Promise<void>;
  /**
   * Pins or unpins a session.
   */
  pinSession: (id: string, pinned: boolean) => Promise<void>;
  /**
   * re-fetch the data
   */
  refreshSessions: () => Promise<void>;
  /**
   * remove session
   * @param id - sessionId
   */
  removeSession: (id: string) => void;
  /**
   * switch session url
   */
  switchSession: (sessionId?: string) => void;
  /**
   * A custom hook that uses SWR to fetch sessions data.
   */
  useFetchSessions: () => SWRResponse<any>;
  useSearchSessions: (keyword?: string) => SWRResponse<any>;
}

export const createSessionSlice: StateCreator<
  SessionStore,
  [['zustand/devtools', never]],
  [],
  SessionAction
> = (set, get) => ({
  activeSession: (sessionId) => {
    if (get().activeId === sessionId) return;

    set({ activeId: sessionId }, false, n(`activeSession/${sessionId}`));
  },

  clearSessions: async () => {
    await sessionService.removeAllSessions();

    get().refreshSessions();
  },

  createSession: async (agent, isSwitchSession = true) => {
    const { switchSession, refreshSessions } = get();

    // merge the defaultAgent from settings
    const defaultAgent = merge(
      initSession,
      settingsSelectors.defaultAgent(useGlobalStore.getState()),
    );

    const newSession: ChatSession = merge(defaultAgent, agent);

    const id = await sessionService.createNewSession(SessionType.Agent, newSession);
    await refreshSessions();

    // whether to switch to the new session after creation; defaults to yes
    if (isSwitchSession) switchSession(id);

    return id;
  },

  duplicateSession: async (id) => {
    const { switchSession, refreshSessions } = get();
    const session = sessionSelectors.getSessionById(id)(get());

    if (!session) return;
    const title = agentSelectors.getTitle(session.meta);

    const newTitle = t('duplicateTitle', { ns: 'chat', title: title });

    const newId = await sessionService.duplicateSession(id, newTitle);

    // duplicate Session Error
    if (!newId) {
      toast.error(t('copyFail', { ns: 'common' }));
      return;
    }

    await refreshSessions();
    switchSession(newId);
  },

  pinSession: async (sessionId, pinned) => {
    await sessionService.updateSessionPinned(sessionId, pinned);

    await get().refreshSessions();
  },

  refreshSessions: async () => {
    await mutate(FETCH_SESSIONS_KEY);
  },

  removeSession: async (sessionId) => {
    await sessionService.removeSession(sessionId);
    await get().refreshSessions();

    if (sessionId === get().activeId) {
      get().switchSession();
    }
  },

  switchSession: (sessionId = INBOX_SESSION_ID) => {
    const { router } = get();

    get().activeSession(sessionId);

    // TODO: remove router from here later
    router?.push(SESSION_CHAT_URL(sessionId));
  },

  useFetchSessions: () =>
    useSWR<ChatSessionList>(FETCH_SESSIONS_KEY, sessionService.getSessionsWithGroup, {
      onSuccess: (data) => {
        // Only refreshSessions updates sessions and thus triggers a page rerender,
        // so we cannot add an equal check here or the page would not update
        // if (get().isSessionsFirstFetchFinished && isEqual(get().sessions, data)) return;

        // TODO: the real fix later is to decouple inbox and session data
        // so they no longer depend on each other

        set(
          {
            customSessionGroups: data.customGroup,
            defaultSessions: data.default,
            isSessionsFirstFetchFinished: true,
            pinnedSessions: data.pinned,
            sessions: data.all,
          },
          false,
          n('useFetchSessions/onSuccess', data),
        );
      },
    }),

  useSearchSessions: (keyword) =>
    useSWR<ChatSessions>(keyword, sessionService.searchSessions, {
      onSuccess: (data) => {
        set({ searchSessions: data }, false, n('useSearchSessions(success)', data));
      },
      revalidateOnFocus: false,
    }),
});
