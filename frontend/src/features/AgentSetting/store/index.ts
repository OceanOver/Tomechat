import { StoreApi } from 'zustand';
import { createContext } from 'zustand-utils';
import { subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

import { Store, store } from './action';

// Shallow equality for array/object selector results so `useStore((s) => [...])`
// doesn't re-render on every store update.
export const createStore = () => createWithEqualityFn(subscribeWithSelector(store), shallow);

type StoreApiWithSelector = Omit<StoreApi<Store>, 'subscribe'> & {
  subscribe: (listener: (state: Store, prevState: Store) => void) => () => void;
};

export const { useStore, useStoreApi, Provider } = createContext<StoreApiWithSelector>();
