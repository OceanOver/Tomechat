import { settingsSelectors } from './slices/settings/selectors';
import { useGlobalStore } from './store';

// Read the language preference straight from the store snapshot (for non-React callers).
const currentLanguage = () => settingsSelectors.currentLanguage(useGlobalStore.getState());

export const globalHelpers = {
  getCurrentLanguage: currentLanguage,
};
