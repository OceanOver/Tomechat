import { ChatModelCard } from '@/types/llm';
import { GlobalServerConfig } from '@/types/settings';

import { API_ENDPOINTS } from './_url';

class GlobalService {
  getGlobalConfig = async (): Promise<GlobalServerConfig> => {
    const res = await fetch(API_ENDPOINTS.config);

    return res.json();
  };

  /**
   * Fetch available models from the tomachat backend
   */
  getTomechatModels = async (): Promise<ChatModelCard[]> => {
    const res = await fetch(API_ENDPOINTS.models('tomechat'));

    // backend returns {object:'list', data:[{id, owned_by, platform_name}...]}
    const data = await res.json();

    return (data.data ?? []).map((m: { id: string }) => ({ displayName: m.id, id: m.id }));
  };
}

export const globalService = new GlobalService();
