// Prefix store action types with a namespace so devtools entries stay readable.
export const setNamespace =
  (namespace: string) =>
  (type: string, payload?: unknown): { payload: unknown; type: string } | string => {
    const name = [namespace, type].filter(Boolean).join('/');
    return payload === undefined ? name : { payload, type: name };
  };
