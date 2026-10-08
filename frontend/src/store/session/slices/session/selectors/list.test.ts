import type { SessionStore } from '@/store/session';
import {
  ChatSession as AgentSession,
  SessionType,
} from '@/types/session';

import { initSession as fallbackSession } from '../initialState';
import { sessionSelectors } from './list';

const makeAgentSession = (id: string): AgentSession =>
  ({
    id,
    config: {
      model: 'gpt-3.5-turbo',
      params: {},
      systemRole: 'system-role',
    },
    type: SessionType.Agent,
  }) as AgentSession;

const stateWithActive = (activeId: string) =>
  ({
    activeId,
    sessions: [makeAgentSession('1'), makeAgentSession('2')],
  }) as unknown as SessionStore;

describe('currentSession', () => {
  it('gives undefined when activeId is not set', () => {
    expect(sessionSelectors.currentSession({ sessions: {} } as any)).toBeUndefined();
  });

  it('gives the session whose id matches activeId', () => {
    const state = stateWithActive('1');
    expect(sessionSelectors.currentSession(state)).toEqual(state.sessions[0]);
  });
});

describe('currentSessionSafe', () => {
  it('falls back to the inbox placeholder when no session matches', () => {
    expect(sessionSelectors.currentSessionSafe({ sessions: {} } as any)).toEqual(fallbackSession);
  });

  it('passes through the matched session when one exists', () => {
    const state = stateWithActive('1');
    expect(sessionSelectors.currentSessionSafe(state)).toEqual(state.sessions[0]);
  });
});

describe('getSessionById', () => {
  const state = stateWithActive('1');

  it('gives the session stored under the requested id', () => {
    expect(sessionSelectors.getSessionById('1')(state)).toEqual(state.sessions[0]);
  });

  it('falls back to the inbox placeholder for an unknown id', () => {
    expect(sessionSelectors.getSessionById('3')(state)).toEqual(fallbackSession);
  });
});

describe('getSessionMetaById', () => {
  const state: SessionStore = {
    sessions: [
      { id: '1', meta: { title: 'Session 1' } },
      { id: '2', meta: { title: 'Session 2' } },
    ],
  } as unknown as SessionStore;

  it('gives the meta of the session stored under the requested id', () => {
    expect(sessionSelectors.getSessionMetaById('1')(state)).toEqual({ title: 'Session 1' });
  });

  it('gives an empty object for an unknown id', () => {
    expect(sessionSelectors.getSessionMetaById('3')(state)).toEqual({});
  });
});
