import isEqual from 'fast-deep-equal';
import { memo, useEffect } from 'react';

import { AgentSettingState } from './store/initialState';
import { useStoreApi } from './store';

export type StoreUpdaterProps = Partial<
  Pick<AgentSettingState, 'config' | 'id' | 'meta' | 'onConfigChange' | 'onMetaChange'>
>;

// Copies externally-owned values into the store. Undefined props are skipped
// so an absent value never clears what the store already holds; unchanged
// values (deep-equal for data, reference for callbacks) are skipped to avoid
// pointless store writes.
const StoreUpdater = memo<StoreUpdaterProps>((props) => {
  const storeApi = useStoreApi();
  const { config, id, meta, onConfigChange, onMetaChange } = props;

  useEffect(() => {
    const state = storeApi.getState();
    const updates: Partial<AgentSettingState> = {};

    if (typeof meta !== 'undefined' && !isEqual(state.meta, meta)) updates.meta = meta;
    if (typeof config !== 'undefined' && !isEqual(state.config, config)) updates.config = config;
    if (typeof id !== 'undefined' && state.id !== id) updates.id = id;
    if (typeof onConfigChange !== 'undefined' && state.onConfigChange !== onConfigChange) {
      updates.onConfigChange = onConfigChange;
    }
    if (typeof onMetaChange !== 'undefined' && state.onMetaChange !== onMetaChange) {
      updates.onMetaChange = onMetaChange;
    }

    if (Object.keys(updates).length > 0) storeApi.setState(updates);
  }, [config, id, meta, onConfigChange, onMetaChange, storeApi]);

  return null;
});

export default StoreUpdater;
