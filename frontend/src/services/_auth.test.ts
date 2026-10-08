import { act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ModelProvider } from '@/agent-runtime';
import { useGlobalStore } from '@/store/global';
import { GlobalLLMConfig, GlobalLLMProviderKey } from '@/types/settings';

import { getProviderAuthPayload } from './_auth';

// mock the traditional zustand
vi.mock('zustand/traditional');

const setModelProviderConfig = <T extends GlobalLLMProviderKey>(
  provider: T,
  config: Partial<GlobalLLMConfig[T]>,
) => {
  useGlobalStore.setState({
    settings: { languageModel: { [provider]: config } },
  });
};

describe('getProviderAuthPayload', () => {
  it('should return Tomechat endpoint payload', () => {
    act(() => {
      setModelProviderConfig('Tomechat', { endpoint: 'http://localhost:7861/v1' });
    });

    const payload = getProviderAuthPayload(ModelProvider.Tomechat);
    expect(payload).toEqual({ endpoint: 'http://localhost:7861/v1' });
  });

  it('should return empty endpoint payload when not configured', () => {
    act(() => {
      setModelProviderConfig('Tomechat', {});
    });

    const payload = getProviderAuthPayload(ModelProvider.Tomechat);
    expect(payload).toEqual({ endpoint: '' });
  });
});
