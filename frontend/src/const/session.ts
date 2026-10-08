import { DEFAULT_AGENT_META } from '@/const/meta';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { ChatSession, SessionType } from '@/types/session';

export const INBOX_SESSION_ID = 'inbox';

export const DEFAULT_AGENT_SESSION: ChatSession = {
  config: DEFAULT_AGENT_CONFIG,
  createdAt: Date.now(),
  id: '',
  meta: DEFAULT_AGENT_META,
  type: SessionType.Agent,
  updatedAt: Date.now(),
};
