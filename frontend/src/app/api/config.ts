import { getServerConfig } from '@/config/server';

export const getPreferredRegion = (region: string | string[] = 'auto') => {
  try {
    getServerConfig();
    return region;
  } catch (error) {
    console.error('get server config failed, error:', error);
    return region;
  }
};
