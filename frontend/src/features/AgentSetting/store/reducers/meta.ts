import { DEFAULT_AGENT_META } from '@/const/meta';
import { MetaData } from '@/types/meta';
import { merge } from '@/utils/merge';

export type MetaAction = { type: 'update'; value: Partial<MetaData> } | { type: 'reset' };

/**
 * Pure reducer for assistant metadata. `update` deep-merges a partial patch
 * into the current value (arrays are replaced wholesale, see utils/merge);
 * `reset` swaps back to the built-in defaults.
 */
export const metaReducer = (meta: MetaData, action: MetaAction): MetaData => {
  switch (action.type) {
    case 'update': {
      return merge(meta, action.value);
    }
    case 'reset': {
      return DEFAULT_AGENT_META;
    }
  }
};
