import { INBOX_SESSION_ID } from '@/const/session';
import { sessionHelpers } from '@/store/session/slices/session/helpers';
import { MetaData } from '@/types/meta';
import {
  CustomSessionGroup as CustomGroup,
  ChatSession as AgentSession,
  ChatSessions as SessionList,
} from '@/types/session';

import { SessionStore } from '../../../store';
import { initSession as fallbackSession } from '../initialState';

const selectAll = (s: SessionStore): SessionList => s.sessions;
const selectDefaults = (s: SessionStore): SessionList => s.defaultSessions;
const selectPinned = (s: SessionStore): SessionList => s.pinnedSessions;
const selectSearchResults = (s: SessionStore): SessionList => s.searchSessions;
const selectCustomGroups = (s: SessionStore): CustomGroup[] => s.customSessionGroups;

const sessionWithId =
  (id: string) =>
  (s: SessionStore): AgentSession =>
    sessionHelpers.getSessionById(id, selectAll(s));

const metaForSession =
  (id: string) =>
  (s: SessionStore): MetaData => {
    const session = sessionWithId(id)(s);

    return session ? session.meta : {};
  };

const activeSession = (s: SessionStore): AgentSession | undefined => {
  if (!s.activeId) return;

  return selectAll(s).find(({ id }) => id === s.activeId);
};

// The inbox is a placeholder session, so never leave callers without a session object.
const activeSessionOrInbox = (s: SessionStore): AgentSession => activeSession(s) || fallbackSession;

const hasDefaultAgents = (s: SessionStore) => selectDefaults(s).length > 0;

const viewingInbox = (s: SessionStore) => s.activeId === INBOX_SESSION_ID;

const sessionListLoaded = (s: SessionStore) => s.isSessionsFirstFetchFinished;

// A session only counts as activated once the list finished loading and an id is set.
const someSessionActivated = (s: SessionStore) => !!s.activeId && sessionListLoaded(s);

export const sessionSelectors = {
  currentSession: activeSession,
  currentSessionSafe: activeSessionOrInbox,
  customSessionGroups: selectCustomGroups,
  defaultSessions: selectDefaults,
  getSessionById: sessionWithId,
  getSessionMetaById: metaForSession,
  hasCustomAgents: hasDefaultAgents,
  isInboxSession: viewingInbox,
  isSessionListInit: sessionListLoaded,
  isSomeSessionActive: someSessionActivated,
  pinnedSessions: selectPinned,
  searchSessions: selectSearchResults,
};
