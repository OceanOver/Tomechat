import { GlobalStore } from '../../../store';
import { settingsSelectors } from './settings';

describe('settingsSelectors', () => {
  describe('currentSettings', () => {
    it('should merge DEFAULT_SETTINGS and s.settings correctly', () => {
      const s = {
        settings: {
          avatar: 'avatar.jpg',
          fontSize: 14,
          language: 'en-US',
          password: 'password123',
          defaultAgent: {
            config: {
              systemRole: '',
              model: 'gpt-3.5-turbo',
              params: {},
            },
            meta: {
              avatar: 'Default Agent',
              description: 'Default agent for testing',
            },
          },
          languageModel: {
            openAI: {
              OPENAI_API_KEY: 'openai-api-key',
              endpoint: 'https://openai-endpoint.com',
              models: ['gpt-3.5-turbo'],
            },
          },
        },
      } as unknown as GlobalStore;

      const result = settingsSelectors.currentSettings(s);

      expect(result).toMatchSnapshot();
    });
  });

  describe('defaultAgent', () => {
    it('should merge DEFAULT_AGENT and s.settings.defaultAgent correctly', () => {
      const s = {
        settings: {
          defaultAgent: {
            config: {
              systemRole: 'user',
              model: 'gpt-3.5-turbo',
            },
            meta: {
              avatar: 'agent-avatar.jpg',
              description: 'Test agent',
            },
          },
        },
      } as unknown as GlobalStore;

      const result = settingsSelectors.defaultAgent(s);

      expect(result).toMatchSnapshot();
    });
  });

  describe('defaultAgentConfig', () => {
    it('should merge DEFAULT_AGENT_CONFIG and defaultAgent(s).config correctly', () => {
      const s = {
        settings: {
          defaultAgent: {
            config: {
              systemRole: 'user',
              model: 'gpt-3.5-turbo',
              params: {
                temperature: 0.7,
              },
            },
          },
        },
      } as unknown as GlobalStore;

      const result = settingsSelectors.defaultAgentConfig(s);

      expect(result).toMatchSnapshot();
    });
  });

  describe('defaultAgentMeta', () => {
    it('should merge DEFAULT_AGENT_META and defaultAgent(s).meta correctly', () => {
      const s = {
        settings: {
          defaultAgent: {
            meta: {
              avatar: 'agent-avatar.jpg',
              description: 'Test agent',
            },
          },
        },
      } as unknown as GlobalStore;

      const result = settingsSelectors.defaultAgentMeta(s);

      expect(result).toMatchSnapshot();
    });
  });

  describe('currentLanguage', () => {
    it('should return the correct language setting', () => {
      const s = {
        settings: {
          language: 'fr',
        },
      } as unknown as GlobalStore;

      const result = settingsSelectors.currentLanguage(s);

      expect(result).toBe('fr');
    });
  });

  describe('dalleConfig', () => {
    it('should return the dalle configuration', () => {
      const s = {
        settings: {
          tool: {
            dalle: {
              apiKey: 'dalle-api-key',
              autoGenerate: true,
            },
          },
        },
      } as unknown as GlobalStore;

      const result = settingsSelectors.dalleConfig(s);

      expect(result).toMatchSnapshot();
    });
  });

  describe('isDalleAutoGenerating', () => {
    it('should return the autoGenerate flag from dalle configuration', () => {
      const s = {
        settings: {
          tool: {
            dalle: {
              autoGenerate: true,
            },
          },
        },
      } as unknown as GlobalStore;

      const result = settingsSelectors.isDalleAutoGenerating(s);

      expect(result).toBe(true);
    });
  });
});
