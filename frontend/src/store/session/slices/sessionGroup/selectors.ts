import { SessionStore } from '@/store/session';

// Flatten custom groups down to the { id, name } pairs the UI renders.
const groupOptions = (s: SessionStore) =>
  s.customSessionGroups.map(({ id, name }) => ({ id, name }));

const findGroup =
  (id: string) =>
  (s: SessionStore) =>
    groupOptions(s).find((group) => group.id === id);

export const sessionGroupSelectors = {
  getGroupById: findGroup,
  sessionGroupItems: groupOptions,
};
