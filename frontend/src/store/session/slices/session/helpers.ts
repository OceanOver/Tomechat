import { ChatSession, ChatSessions } from '@/types/session';

import { initSession } from './initialState';

export const getSessionPinned = (session: ChatSession) => session.pinned;

const getSessionById = (id: string, sessions: ChatSessions): ChatSession => {
  const session = sessions.find((s) => s.id === id);

  if (!session) return initSession;

  return session;
};

export const sessionHelpers = {
  getSessionById,
  getSessionPinned,
};
