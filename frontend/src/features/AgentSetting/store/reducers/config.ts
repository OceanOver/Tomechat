import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { ChatAgentConfig } from '@/types/agent';
import { merge } from '@/utils/merge';

export type ConfigAction =
  | { type: 'update'; patch: Partial<ChatAgentConfig> }
  | { type: 'togglePlugin'; pluginId: string; enabled?: boolean }
  | { type: 'reset' };

/**
 * Compute the next plugin id list. Without an explicit `enabled` flag the
 * membership toggles; with one, it is forced (matching historical behavior
 * where forcing "on" appends even if the id is already present).
 */
const nextPluginList = (
  plugins: string[] | undefined,
  pluginId: string,
  enabled?: boolean,
): string[] => {
  const current = plugins ?? [];

  if (typeof enabled === 'undefined') {
    return current.includes(pluginId)
      ? current.filter((id) => id !== pluginId)
      : [...current, pluginId];
  }

  return enabled ? [...current, pluginId] : current.filter((id) => id !== pluginId);
};

/**
 * Pure reducer for the agent configuration object. `update` deep-merges a
 * partial patch, `togglePlugin` mutates only the plugin list, and `reset`
 * restores the built-in defaults.
 */
export const configReducer = (config: ChatAgentConfig, action: ConfigAction): ChatAgentConfig => {
  switch (action.type) {
    case 'update': {
      return merge(config, action.patch);
    }
    case 'togglePlugin': {
      return { ...config, plugins: nextPluginList(config.plugins, action.pluginId, action.enabled) };
    }
    case 'reset': {
      return DEFAULT_AGENT_CONFIG;
    }
  }
};
