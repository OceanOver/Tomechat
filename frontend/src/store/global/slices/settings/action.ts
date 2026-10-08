import isEqual from 'fast-deep-equal';
import { DeepPartial } from 'utility-types';
import type { StateCreator } from 'zustand/vanilla';

import { userService } from '@/services/user';
import type { GlobalStore } from '@/store/global';
import { AgentSettings } from '@/types/session';
import { GlobalSettings } from '@/types/settings';
import { difference } from '@/utils/difference';
import { merge } from '@/utils/merge';

/**
 * Setter actions
 */
export interface SettingsAction {
  importAppSettings: (settings: GlobalSettings) => Promise<void>;
  resetSettings: () => Promise<void>;
  setSettings: (settings: DeepPartial<GlobalSettings>) => Promise<void>;
  updateDefaultAgent: (agent: DeepPartial<AgentSettings>) => Promise<void>;
}

export const createSettingsSlice: StateCreator<
  GlobalStore,
  [['zustand/devtools', never]],
  [],
  SettingsAction
> = (set, get) => ({
  importAppSettings: async (importAppSettings) => {
    const { setSettings } = get();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...settings } = importAppSettings;

    await setSettings(settings);
  },
  resetSettings: async () => {
    await userService.resetUserSettings();
    await get().refreshUserConfig();
  },
  setSettings: async (settings) => {
    const { settings: prevSetting, defaultSettings } = get();

    const nextSettings = merge(prevSetting, settings);

    if (isEqual(prevSetting, nextSettings)) return;

    const diffs = difference(nextSettings, defaultSettings);

    await userService.updateUserSettings(diffs);
    await get().refreshUserConfig();
  },

  updateDefaultAgent: async (defaultAgent) => {
    await get().setSettings({ defaultAgent });
  },
});
