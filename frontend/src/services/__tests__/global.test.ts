import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import { globalService } from '../global';

global.fetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GlobalService', () => {
  describe('ServerConfig', () => {
    it('should return the serverConfig when fetch is successful', async () => {
      // Arrange
      (fetch as Mock).mockResolvedValue({
        json: () => Promise.resolve({ customModelName: 'abc' }),
      });

      // Act
      const config = await globalService.getGlobalConfig();

      // Assert
      expect(config).toEqual({ customModelName: 'abc' });
    });
  });
});
