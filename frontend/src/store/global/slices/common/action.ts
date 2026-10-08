import useSWR, { SWRResponse, mutate } from 'swr';
import { DeepPartial } from 'utility-types';
import type { StateCreator } from 'zustand/vanilla';

import { INBOX_SESSION_ID } from '@/const/session';
import { SESSION_CHAT_URL } from '@/const/url';
import { globalService } from '@/services/global';
import { UserConfig, userService } from '@/services/user';
import type { GlobalStore } from '@/store/global';
import { ChatModelCard } from '@/types/llm';
import type { GlobalServerConfig, GlobalSettings } from '@/types/settings';
import { merge } from '@/utils/merge';
import { setNamespace } from '@/utils/storeDebug';
import { switchLang } from '@/utils/switchLang';

import { settingsSelectors } from '../settings/selectors';

const n = setNamespace('common');

/**
 * Setter actions
 */
export interface CommonAction {
  refreshUserConfig: () => Promise<void>;
  switchBackToChat: (sessionId?: string) => void;
  updateAvatar: (avatar: string) => Promise<void>;
  useFetchModelList: () => SWRResponse;
  useFetchServerConfig: () => SWRResponse;
  useFetchUserConfig: (initServer: boolean) => SWRResponse<UserConfig | undefined>;
}

const USER_CONFIG_FETCH_KEY = 'fetchUserConfig';

export const createCommonSlice: StateCreator<
  GlobalStore,
  [['zustand/devtools', never]],
  [],
  CommonAction
> = (set, get) => ({
  refreshUserConfig: async () => {
    await mutate([USER_CONFIG_FETCH_KEY, true]);
  },
  switchBackToChat: (sessionId) => {
    get().router?.push(SESSION_CHAT_URL(sessionId || INBOX_SESSION_ID));
  },

  updateAvatar: async (avatar) => {
    await userService.updateAvatar(avatar);
    await get().refreshUserConfig();
  },
  useFetchServerConfig: () =>
    useSWR<GlobalServerConfig>('fetchGlobalConfig', globalService.getGlobalConfig, {
      onSuccess: (data) => {
        if (data) {
          const serverSettings: DeepPartial<GlobalSettings> = {
            defaultAgent: data.defaultAgent,
          };

          const defaultSettings = merge(get().defaultSettings, serverSettings);
          set({ defaultSettings, serverConfig: data }, false, n('initGlobalConfig'));
        }
      },
      revalidateOnFocus: false,
    }),
  useFetchModelList: () =>
    useSWR<ChatModelCard[]>('fetchModelList', globalService.getTomechatModels, {
      onSuccess: (data) => {
        if (data?.length) {
          set({ remoteChatModels: data }, false, n('fetchModelList', data));
        }
      },
      revalidateOnFocus: false,
    }),
  useFetchUserConfig: (initServer) =>
    useSWR<UserConfig | undefined>(
      [USER_CONFIG_FETCH_KEY, initServer],
      async () => {
        if (!initServer) return;
        return userService.getUserConfig();
      },
      {
        onSuccess: (data) => {
          if (!data) return;

          set(
            { avatar: data.avatar, settings: data.settings, userId: data.uuid },
            false,
            n('fetchUserConfig', data),
          );

          const { language } = settingsSelectors.currentSettings(get());
          if (language === 'auto') {
            switchLang('auto');
          }
        },
        revalidateOnFocus: false,
      },
    ),
});
