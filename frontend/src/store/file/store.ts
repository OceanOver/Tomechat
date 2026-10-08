import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { isDev } from '@/utils/env';

import { FilesStoreState, initialState } from './initialState';
import { FileAction, createFileSlice } from './slices/images';

//  ===============  aggregate createStoreFn ============ //

export type FileStore = FilesStoreState & FileAction;

const createStore: StateCreator<FileStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...createFileSlice(...parameters),
});

//  ===============  instantiate useStore ============ //

export const useFileStore = createWithEqualityFn<FileStore>()(
  devtools(createStore, {
    name: 'Tomechat_File' + (isDev ? '_DEV' : ''),
  }),
  shallow,
);
