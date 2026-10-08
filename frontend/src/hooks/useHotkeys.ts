'use client';

/**
 * SSR-safe wrapper around react-hotkeys-hook.
 *
 * react-hotkeys-hook@4 touches `window` at module top level (registering a
 * DOMContentLoaded listener), so any module evaluation during SSR throws
 * "window is not defined" and 500s the /chat page. The lib is therefore
 * loaded lazily at runtime, and hotkeys are skipped while server rendering.
 */

type UseHotkeys = (
  keys: string | string[],
  callback: (...args: any[]) => void,
  options?: any,
  dependencies?: any[],
) => void;

let lib: { useHotkeys: UseHotkeys } | null = null;

if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
  lib = require('react-hotkeys-hook');
}

export const useHotkeys: UseHotkeys = (...args) => {
  // Skip hotkey registration while server rendering
  if (!lib) return;
  return lib.useHotkeys(...args);
};

export default useHotkeys;
