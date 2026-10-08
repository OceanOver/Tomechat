import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export enum SidebarTabKey {
  Chat = 'chat',
  Knowledge = 'knowledge',
  Setting = 'settings',
}

export enum SettingsTabs {
  Common = 'common',
}

export interface Guide {
  // Topic guide
  topic?: boolean;
}

export interface GlobalCommonState {
  router?: AppRouterInstance;
  sidebarKey: SidebarTabKey;
}

export const initialCommonState: GlobalCommonState = {
  sidebarKey: SidebarTabKey.Chat,
};
