import { merge as deepMerge, mergeWith } from 'lodash-es';

// Deep-merge `source` over `target`; arrays are replaced wholesale instead of
// being merged index-by-index.
export const merge: typeof deepMerge = <T = object>(target: T, source: T) =>
  mergeWith({}, target, source, (targetVal, sourceVal) =>
    Array.isArray(targetVal) ? sourceVal : undefined,
  );
