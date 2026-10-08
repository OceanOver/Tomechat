import { PersistOptions, createJSONStorage, devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { isDev } from '@/utils/env';

import { type GlobalState, initialState } from './initialState';
import { type CommonAction, createCommonSlice } from './slices/common/action';
import { type PreferenceAction, createPreferenceSlice } from './slices/preference/action';
import { type SettingsAction, createSettingsSlice } from './slices/settings/action';

//  ===============  aggregate createStoreFn ============ //

export type GlobalStore = CommonAction & GlobalState & SettingsAction & PreferenceAction;

const createStore: StateCreator<GlobalStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...createCommonSlice(...parameters),
  ...createSettingsSlice(...parameters),
  ...createPreferenceSlice(...parameters),
});

//  ===============  persist middleware configuration ============ //
type GlobalPersist = Pick<GlobalStore, 'preference'>;

const persistOptions: PersistOptions<GlobalStore, GlobalPersist> = {
  name: 'TOMECHAT_GLOBAL',

  skipHydration: true,

  storage: createJSONStorage(() => localStorage),

  // Only the small preference slice belongs in localStorage; the rest is session-scoped.
  partialize: (state): GlobalPersist => ({ preference: state.preference }),
};

//  ===============  instantiate useStore ============ //

export const useGlobalStore = createWithEqualityFn<GlobalStore>()(
  persist(
    subscribeWithSelector(
      devtools(createStore, {
        name: 'Tomechat_Global' + (isDev ? '_DEV' : ''),
      }),
    ),
    persistOptions,
  ),
  shallow,
);
