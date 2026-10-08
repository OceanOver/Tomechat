import { describe, expect, it } from 'vitest';

import { agentSelectors } from '@/store/session/slices/agent/selectors';
import { merge } from '@/utils/merge';

import { GlobalStore, useGlobalStore } from '../../../store';
import { initialSettingsState } from '../initialState';
import { modelProviderSelectors } from './modelProvider';

describe('modelProviderSelectors', () => {
  describe('CUSTOM_MODELS', () => {
    it('custom deletion, addition, and renaming of models', () => {
      const s = merge(initialSettingsState, {
        serverConfig: {
          customModelName:
            '-all,+chatglm3-6b，-chatglm_turbo,qwen-turbo=qwen-turbo-0624,qwen-plus=qwen-plus-0724',
        },
      }) as unknown as GlobalStore;

      const result = modelProviderSelectors.modelSelectList(s).filter((r) => r.enabled);

      expect(result).toMatchSnapshot();
    });

    it('duplicate naming model', () => {
      const s = merge(initialSettingsState, {
        serverConfig: {},
        settings: {
          languageModel: {
            Tomechat: {
              customModelName: 'chatglm3-6b=chatglm3-6b-32k，chatglm3-6b=chatglm3-6b-v2',
            },
          },
        },
      }) as unknown as GlobalStore;

      const result = modelProviderSelectors.modelSelectList(s).filter((r) => r.enabled);

      expect(result[0].chatModels.find((s) => s.id === 'chatglm3-6b')?.displayName).toEqual(
        'chatglm3-6b-v2',
      );
    });

    it('should delete model', () => {
      const s = merge(initialSettingsState, {
        serverConfig: { customModelName: '-chatglm3-6b' },
      }) as unknown as GlobalStore;

      const result = modelProviderSelectors.modelSelectList(s).filter((r) => r.enabled);

      expect(result[0].chatModels.find((r) => r.id === 'chatglm3-6b')).toBeUndefined();
    });

    it('only add the model', () => {
      const s = merge(initialSettingsState, {
        serverConfig: { customModelName: '+my-custom-model' },
      }) as unknown as GlobalStore;

      const result = modelProviderSelectors.modelSelectList(s).filter((r) => r.enabled);

      expect(result[0].chatModels.find((r) => r.id === 'my-custom-model')).toBeDefined();
    });
  });

  describe('remoteChatModels', () => {
    it('should use remote models when no user models configured', () => {
      const s = merge(initialSettingsState, {
        remoteChatModels: [{ displayName: 'deepseek-v4-flash', id: 'deepseek-v4-flash' }],
      }) as unknown as GlobalStore;

      const result = modelProviderSelectors.modelSelectList(s).filter((r) => r.enabled);

      expect(result[0].chatModels).toHaveLength(1);
      expect(result[0].chatModels[0].id).toEqual('deepseek-v4-flash');
    });

    it('user settings models should take precedence over remote models', () => {
      const s = merge(initialSettingsState, {
        remoteChatModels: [{ displayName: 'deepseek-v4-flash', id: 'deepseek-v4-flash' }],
        settings: {
          languageModel: {
            Tomechat: {
              models: [{ displayName: 'my-model', id: 'my-model' }],
            },
          },
        },
      }) as unknown as GlobalStore;

      const result = modelProviderSelectors.modelSelectList(s).filter((r) => r.enabled);

      expect(result[0].chatModels).toHaveLength(1);
      expect(result[0].chatModels[0].id).toEqual('my-model');
    });
  });

  describe('model card', () => {
    it('modelMaxToken should return token limit of Tomechat model', () => {
      const s = initialSettingsState as unknown as GlobalStore;

      expect(modelProviderSelectors.modelMaxToken('chatglm3-6b')(s)).toBe(128_000);
      expect(modelProviderSelectors.modelHasMaxToken('chatglm3-6b')(s)).toBe(true);
    });

    it('modelCardById should return undefined for unknown model', () => {
      const s = initialSettingsState as unknown as GlobalStore;

      expect(modelProviderSelectors.modelCardById('not-exist')(s)).toBeUndefined();
    });
  });
});
