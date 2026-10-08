import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { isDev } from '@/utils/env';

import { ChatStoreState, initialState } from './initialState';
import { ChatEnhanceAction, chatEnhance } from './slices/enchance/action';
import { ChatMessageAction, chatMessage } from './slices/message/action';
import { ChatTopicAction, chatTopic } from './slices/topic/action';

export interface ChatStoreAction extends ChatMessageAction, ChatTopicAction, ChatEnhanceAction {}

export type ChatStore = ChatStoreAction & ChatStoreState;

//  ===============  aggregate createStoreFn ============ //

const createStore: StateCreator<ChatStore, [['zustand/devtools', never]]> = (...params) => ({
  ...initialState,

  ...chatMessage(...params),
  ...chatTopic(...params),
  ...chatEnhance(...params),
});

//  ===============  instantiate useStore ============ //

export const useChatStore = createWithEqualityFn<ChatStore>()(
  subscribeWithSelector(
    devtools(createStore, {
      name: 'Tomechat_Chat' + (isDev ? '_DEV' : ''),
    }),
  ),
  shallow,
);
