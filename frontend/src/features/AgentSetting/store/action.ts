import { StateCreator } from 'zustand/vanilla';

import { chainPickEmoji } from '@/chains/pickEmoji';
import { chainSummaryAgentName } from '@/chains/summaryAgentName';
import { chainSummaryDescription } from '@/chains/summaryDescription';
import { chainSummaryTags } from '@/chains/summaryTags';
import { chatService } from '@/services/chat';
import { ChatAgentConfig } from '@/types/agent';
import { MetaData } from '@/types/meta';
import { setNamespace } from '@/utils/storeDebug';

import { AgentSettingState, AutocompleteLoadingState, initialState } from './initialState';
import { ConfigAction, configReducer } from './reducers/config';
import { MetaAction, metaReducer } from './reducers/meta';

/**
 * Settings actions
 */
export interface Action {
  /**
   * Pick an emoji automatically
   * @param id - session id
   */
  autoPickEmoji: () => void;
  /**
   * Autocomplete the agent description
   * @param id - agent id
   * @returns Promise resolving when the async operation finishes
   */
  autocompleteAgentDescription: () => Promise<void>;
  autocompleteAgentTags: () => Promise<void>;
  /**
   * Autocomplete the agent title
   * @param id - session id
   * @returns Promise resolving when the async operation finishes
   */
  autocompleteAgentTitle: () => Promise<void>;
  /**
   * Autocomplete the agent metadata
   */
  autocompleteAllMeta: (replace?: boolean) => void;
  autocompleteMeta: (key: keyof MetaData) => void;
  dispatchConfig: (payload: ConfigAction) => void;
  dispatchMeta: (payload: MetaAction) => void;

  resetAgentConfig: () => void;

  resetAgentMeta: () => void;

  setAgentConfig: (config: Partial<ChatAgentConfig>) => void;

  setAgentMeta: (meta: Partial<MetaData>) => void;
  streamUpdateMetaArray: (key: keyof MetaData) => any;
  streamUpdateMetaString: (key: keyof MetaData) => any;
  toggleAgentPlugin: (pluginId: string, state?: boolean) => void;
  /**
   * Update a loading flag
   * @param key - key into AutocompleteLoadingState
   * @param value - loading flag value
   */
  updateLoadingState: (key: keyof AutocompleteLoadingState, value: boolean) => void;
}

export type Store = Action & AgentSettingState;

const t = setNamespace('AgentSettings');

export const store: StateCreator<Store, [['zustand/devtools', never]]> = (set, get) => ({
  ...initialState,
  autoPickEmoji: async () => {
    const { config, meta, dispatchMeta } = get();

    const systemRole = config.systemRole;

    const content = [meta.title, meta.description, systemRole].filter(Boolean).join(',');

    if (!content) return;

    const emoji = await chatService.fetchPresetTaskResult({
      onLoadingChange: (loading) => {
        get().updateLoadingState('avatar', loading);
      },
      params: chainPickEmoji(content),
    });

    if (emoji) {
      dispatchMeta({ type: 'update', value: { avatar: emoji } });
    }
  },
  autocompleteAgentDescription: async () => {
    const { dispatchMeta, config, meta, updateLoadingState, streamUpdateMetaString } = get();

    const systemRole = config.systemRole;

    // The description is derived from the prompt, falling back to the name
    const content = systemRole || meta.title;

    if (!content) return;

    const preValue = meta.description;

    // Replace with an ellipsis
    dispatchMeta({ type: 'update', value: { description: '...' } });

    chatService.fetchPresetTaskResult({
      onError: () => {
        dispatchMeta({ type: 'update', value: { description: preValue } });
      },
      onLoadingChange: (loading) => {
        updateLoadingState('description', loading);
      },
      onMessageHandle: streamUpdateMetaString('description'),
      params: chainSummaryDescription(content),
    });
  },
  autocompleteAgentTags: async () => {
    const { dispatchMeta, config, meta, updateLoadingState, streamUpdateMetaArray } = get();

    const systemRole = config.systemRole;

    const content = [meta.title, meta.description, systemRole].filter(Boolean).join(',');

    if (!content) return;

    const preValue = meta.tags;

    // Replace with an ellipsis
    dispatchMeta({ type: 'update', value: { tags: ['...'] } });

    chatService.fetchPresetTaskResult({
      onError: () => {
        dispatchMeta({ type: 'update', value: { tags: preValue } });
      },
      onLoadingChange: (loading) => {
        updateLoadingState('tags', loading);
      },
      onMessageHandle: streamUpdateMetaArray('tags'),
      params: chainSummaryTags(content),
    });
  },
  autocompleteAgentTitle: async () => {
    const { dispatchMeta, config, meta, updateLoadingState, streamUpdateMetaString } = get();

    const systemRole = config.systemRole;

    const nameContent = [meta.description, systemRole].filter(Boolean).join(',');

    if (!nameContent) return;

    const previousTitle = meta.title;

    // Replace with an ellipsis
    dispatchMeta({ type: 'update', value: { title: '...' } });

    chatService.fetchPresetTaskResult({
      onError: () => {
        dispatchMeta({ type: 'update', value: { title: previousTitle } });
      },
      onLoadingChange: (loading) => {
        updateLoadingState('title', loading);
      },
      onMessageHandle: streamUpdateMetaString('title'),
      params: chainSummaryAgentName(nameContent),
    });
  },
  autocompleteAllMeta: (replace) => {
    const { meta } = get();

    if (!meta.title || replace) {
      get().autocompleteAgentTitle();
    }

    if (!meta.description || replace) {
      get().autocompleteAgentDescription();
    }

    if (!meta.avatar || replace) {
      get().autoPickEmoji();
    }

    if (!meta.tags || replace) {
      get().autocompleteAgentTags();
    }
  },
  autocompleteMeta: (key) => {
    const {
      autoPickEmoji,
      autocompleteAgentTitle,
      autocompleteAgentDescription,
      autocompleteAgentTags,
    } = get();

    switch (key) {
      case 'avatar': {
        autoPickEmoji();
        return;
      }

      case 'description': {
        autocompleteAgentDescription();
        return;
      }

      case 'title': {
        autocompleteAgentTitle();
        return;
      }

      case 'tags': {
        autocompleteAgentTags();
        return;
      }
    }
  },
  dispatchConfig: (payload) => {
    const nextConfig = configReducer(get().config, payload);

    set({ config: nextConfig }, false, payload);

    get().onConfigChange?.(nextConfig);
  },
  dispatchMeta: (payload) => {
    const nextValue = metaReducer(get().meta, payload);

    set({ meta: nextValue }, false, payload);

    get().onMetaChange?.(nextValue);
  },
  resetAgentConfig: () => {
    get().dispatchConfig({ type: 'reset' });
  },
  resetAgentMeta: () => {
    get().dispatchMeta({ type: 'reset' });
  },

  setAgentConfig: (config) => {
    get().dispatchConfig({ patch: config, type: 'update' });
  },
  setAgentMeta: (meta) => {
    get().dispatchMeta({ type: 'update', value: meta });
  },

  streamUpdateMetaArray: (key: keyof MetaData) => {
    let value = '';
    return (text: string) => {
      value += text;
      get().dispatchMeta({ type: 'update', value: { [key]: value.split(',') } });
    };
  },

  streamUpdateMetaString: (key: keyof MetaData) => {
    let value = '';
    return (text: string) => {
      value += text;
      get().dispatchMeta({ type: 'update', value: { [key]: value } });
    };
  },

  toggleAgentPlugin: (id, state) => {
    get().dispatchConfig({ enabled: state, pluginId: id, type: 'togglePlugin' });
  },

  updateLoadingState: (key, value) => {
    set(
      { autocompleteLoading: { ...get().autocompleteLoading, [key]: value } },
      false,
      t('updateLoadingState', { key, value }),
    );
  },
});
