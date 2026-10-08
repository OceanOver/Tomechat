import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { DEFAULT_AGENT_META } from '@/const/meta';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { CustomSessionGroup, ChatSession, SessionType } from '@/types/session';

export const initSession: ChatSession = {
  config: DEFAULT_AGENT_CONFIG,
  createdAt: Date.now(),
  id: '',
  meta: DEFAULT_AGENT_META,
  type: SessionType.Agent,
  updatedAt: Date.now(),
};

export interface SessionState {
  /**
   * @title Active session
   * @description The session currently being edited or viewed
   */
  activeId: string;
  customSessionGroups: CustomSessionGroup[];
  defaultSessions: ChatSession[];
  isSearching: boolean;
  isSessionsFirstFetchFinished: boolean;
  pinnedSessions: ChatSession[];
  /**
   * Consider moving the router logic out later
   * @deprecated
   */
  router?: AppRouterInstance;
  searchKeywords: string;
  searchSessions: ChatSession[];
  /**
   * it means defaultSessions
   */
  sessions: ChatSession[];
}

export const initialSessionState: SessionState = {
  activeId: 'inbox',
  customSessionGroups: [],
  defaultSessions: [],
  isSearching: false,
  isSessionsFirstFetchFinished: false,
  pinnedSessions: [],
  searchKeywords: '',
  searchSessions: [],
  sessions: [],
};
