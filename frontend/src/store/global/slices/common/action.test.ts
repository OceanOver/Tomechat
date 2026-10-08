import { act, renderHook, waitFor } from '@testing-library/react';
import { mutate } from 'swr';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { withSWR } from '~test-utils';

import { globalService } from '@/services/global';
import { userService } from '@/services/user';
import { useGlobalStore } from '@/store/global';
import { GlobalServerConfig } from '@/types/settings';
import { switchLang } from '@/utils/switchLang';

vi.mock('zustand/traditional');

vi.mock('@/utils/switchLang', () => ({
  switchLang: vi.fn(),
}));

vi.mock('swr', async (importOriginal) => {
  const modules = await importOriginal();
  return {
    ...(modules as any),
    mutate: vi.fn(),
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createCommonSlice', () => {
  describe('switchBackToChat', () => {
    it('should switch back to chat', () => {
      const { result } = renderHook(() => useGlobalStore());
      const sessionId = 'session-id';
      const router = { push: vi.fn() } as any;

      act(() => {
        useGlobalStore.setState({ router });
        result.current.switchBackToChat(sessionId);
      });

      expect(router.push).toHaveBeenCalledWith('/chat?session=session-id');
    });
  });

  describe('refreshUserConfig', () => {
    it('should refresh user config', async () => {
      const { result } = renderHook(() => useGlobalStore());

      await act(async () => {
        await result.current.refreshUserConfig();
      });

      expect(mutate).toHaveBeenCalledWith(['fetchUserConfig', true]);
    });
  });

  describe('updateAvatar', () => {
    it('should update avatar', async () => {
      const { result } = renderHook(() => useGlobalStore());
      const avatar = 'new-avatar';

      const spyOn = vi.spyOn(result.current, 'refreshUserConfig');
      const updateAvatarSpy = vi.spyOn(userService, 'updateAvatar');

      await act(async () => {
        await result.current.updateAvatar(avatar);
      });

      expect(updateAvatarSpy).toHaveBeenCalledWith(avatar);
      expect(spyOn).toHaveBeenCalled();
    });
  });

  describe('useFetchServerConfig', () => {
    it('should fetch server config correctly', async () => {
      const mockServerConfig = {
        defaultAgent: 'agent1',
        languageModel: 'model1',
        telemetry: {},
      } as GlobalServerConfig;
      vi.spyOn(globalService, 'getGlobalConfig').mockResolvedValueOnce(mockServerConfig);

      const { result } = renderHook(() => useGlobalStore().useFetchServerConfig());

      await waitFor(() => expect(result.current.data).toEqual(mockServerConfig));
    });
  });

  describe('useFetchUserConfig', () => {
    it('should not fetch user config if initServer is false', async () => {
      const mockUserConfig: any = undefined; // simulates the server not being initialized
      vi.spyOn(userService, 'getUserConfig').mockResolvedValueOnce(mockUserConfig);

      const { result } = renderHook(() => useGlobalStore().useFetchUserConfig(false), {
        wrapper: withSWR,
      });

      // since initServer is false, getUserConfig should not be called
      expect(userService.getUserConfig).not.toHaveBeenCalled();
      // make sure the state is unchanged
      expect(result.current.data).toBeUndefined();
    });

    it('should fetch user config correctly when initServer is true', async () => {
      const mockUserConfig: any = {
        avatar: 'new-avatar-url',
        settings: {
          language: 'en',
        },
      };
      vi.spyOn(userService, 'getUserConfig').mockResolvedValueOnce(mockUserConfig);

      const { result } = renderHook(() => useGlobalStore().useFetchUserConfig(true), {
        wrapper: withSWR,
      });

      // wait for SWR to finish fetching
      await waitFor(() => expect(result.current.data).toEqual(mockUserConfig));

      // verify the state was updated correctly
      expect(useGlobalStore.getState().avatar).toBe(mockUserConfig.avatar);
      expect(useGlobalStore.getState().settings).toEqual(mockUserConfig.settings);

      // verify the language setting was handled correctly
      expect(switchLang).not.toHaveBeenCalledWith('auto');
    });
    it('should call switch language when language is auto', async () => {
      const mockUserConfig: any = {
        avatar: 'new-avatar-url',
        settings: {
          language: 'auto',
        },
      };
      vi.spyOn(userService, 'getUserConfig').mockResolvedValueOnce(mockUserConfig);

      const { result } = renderHook(() => useGlobalStore().useFetchUserConfig(true), {
        wrapper: withSWR,
      });

      // wait for SWR to finish fetching
      await waitFor(() => expect(result.current.data).toEqual(mockUserConfig));

      // verify the state was updated correctly
      expect(useGlobalStore.getState().avatar).toBe(mockUserConfig.avatar);
      expect(useGlobalStore.getState().settings).toEqual(mockUserConfig.settings);

      // verify the language setting was handled correctly
      expect(switchLang).toHaveBeenCalledWith('auto');
    });

    it('should handle the case when user config is null', async () => {
      vi.spyOn(userService, 'getUserConfig').mockResolvedValueOnce(null as any);

      const { result } = renderHook(() => useGlobalStore().useFetchUserConfig(true), {
        wrapper: withSWR,
      });

      // wait for SWR to finish fetching
      await waitFor(() => expect(result.current.data).toBeNull());

      // verify the state was not incorrectly updated
      expect(useGlobalStore.getState().avatar).toBeUndefined();
      expect(useGlobalStore.getState().settings).toEqual({});
    });
  });
});
