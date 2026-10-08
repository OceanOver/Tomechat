import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { sessionService } from '@/services/session';
import { useSessionStore } from '@/store/session';

afterEach(() => {
  vi.restoreAllMocks();
});

// Every mutation below goes through the service layer and then reloads the session list.
const renderStore = () => renderHook(() => useSessionStore());
const watchRefresh = () => vi.spyOn(useSessionStore.getState(), 'refreshSessions');

describe('sessionGroup actions', () => {
  it('addSessionGroup creates a group via the service and reloads sessions', async () => {
    const createdId = 'mock-id';
    const groupName = 'Test Group';
    vi.spyOn(sessionService, 'createSessionGroup').mockResolvedValue(createdId);
    const refresh = watchRefresh();

    const { result } = renderStore();

    let returnedId: string | undefined;
    await act(async () => {
      returnedId = await result.current.addSessionGroup(groupName);
    });

    expect(sessionService.createSessionGroup).toHaveBeenCalledWith(groupName);
    expect(refresh).toHaveBeenCalled();
    expect(returnedId).toBe(createdId);
  });

  it('clearSessionGroups removes all groups via the service and reloads sessions', async () => {
    vi.spyOn(sessionService, 'clearSessionGroups');
    const refresh = watchRefresh();

    const { result } = renderStore();

    await act(async () => {
      await result.current.clearSessionGroups();
    });

    expect(sessionService.clearSessionGroups).toHaveBeenCalled();
    expect(refresh).toHaveBeenCalled();
  });

  it('removeSessionGroup deletes the group via the service and reloads sessions', async () => {
    const groupId = 'mock-id';
    vi.spyOn(sessionService, 'removeSessionGroup');
    const refresh = watchRefresh();

    const { result } = renderStore();

    await act(async () => {
      await result.current.removeSessionGroup(groupId);
    });

    expect(sessionService.removeSessionGroup).toHaveBeenCalledWith(groupId);
    expect(refresh).toHaveBeenCalled();
  });

  it('updateSessionGroupId moves a session into the group and reloads sessions', async () => {
    const sessionId = 'session-id';
    const groupId = 'group-id';
    vi.spyOn(sessionService, 'updateSessionGroupId');
    const refresh = watchRefresh();

    const { result } = renderStore();

    await act(async () => {
      await result.current.updateSessionGroupId(sessionId, groupId);
    });

    expect(sessionService.updateSessionGroupId).toHaveBeenCalledWith(sessionId, groupId);
    expect(refresh).toHaveBeenCalled();
  });

  it('updateSessionGroupName renames the group via the service and reloads sessions', async () => {
    const groupId = 'mock-id';
    const newName = 'New Name';
    const refresh = watchRefresh();
    vi.spyOn(sessionService, 'updateSessionGroup');

    const { result } = renderStore();

    await act(async () => {
      await result.current.updateSessionGroupName(groupId, newName);
    });

    expect(sessionService.updateSessionGroup).toHaveBeenCalledWith(groupId, { name: newName });
    expect(refresh).toHaveBeenCalled();
  });

  it('updateSessionGroupSort persists the new ordering and reloads sessions', async () => {
    const ordering: any[] = [
      { id: 'id1', sort: 0 },
      { id: 'id2', sort: 1 },
    ];
    vi.spyOn(sessionService, 'updateSessionGroupOrder');
    const refresh = watchRefresh();

    const { result } = renderStore();

    await act(async () => {
      await result.current.updateSessionGroupSort(ordering);
    });

    expect(sessionService.updateSessionGroupOrder).toHaveBeenCalledWith(
      ordering.map(({ id, sort }) => ({ id, sort })),
    );
    expect(refresh).toHaveBeenCalled();
  });
});
