import { produce } from 'immer';

import { TomechatProvider, DEFAULT_MODEL_LIST } from '@/config/modelProviders';
import { ChatModelCard, ModelProviderCard } from '@/types/llm';
import { parseModelString } from '@/utils/parseModels';

import { GlobalStore } from '../../../store';
import { currentSettings } from './settings';

const modelProvider = (s: GlobalStore) => currentSettings(s).languageModel;

const enableTomechat = (s: GlobalStore) => modelProvider(s).Tomechat.enabled;
const TomechatProxyUrl = (s: GlobalStore) => modelProvider(s).Tomechat.endpoint;
const TomechatModels = (s: GlobalStore) => modelProvider(s).Tomechat.models || [];
// Available models fetched from the Tomechat backend /models endpoint
const remoteChatModels = (s: GlobalStore) => s.remoteChatModels || [];

// Dedicated handler for chatModels
const processChatModels = (
  modelConfig: ReturnType<typeof parseModelString>,
  defaultChartModels: ChatModelCard[] = TomechatProvider.chatModels,
): ChatModelCard[] => {
  let chatModels = modelConfig.removeAll ? [] : defaultChartModels;

  // handle removals
  if (!modelConfig.removeAll) {
    chatModels = chatModels.filter((m) => !modelConfig.removed.includes(m.id));
  }

  return produce(chatModels, (draft) => {
    // handle additions and replacements
    for (const toAddModel of modelConfig.add) {
      // first try to find the model in DEFAULT_MODEL_LIST to confirm if it is a known model
      const knownModel = DEFAULT_MODEL_LIST.find((model) => model.id === toAddModel.id);

      // if the model is known, update it based on the known model
      if (knownModel) {
        const modelInList = draft.find((model) => model.id === toAddModel.id);

        // if the model is already in chatModels, update it
        if (modelInList) {
          if (modelInList.hidden) delete modelInList.hidden;
          if (toAddModel.displayName) modelInList.displayName = toAddModel.displayName;
        } else {
          // if the model is not in chatModels, add it
          draft.push({
            ...knownModel,
            displayName: toAddModel.displayName || knownModel.displayName || knownModel.id,
            hidden: undefined,
          });
        }
      } else {
        // if the model is not in DEFAULT_MODEL_LIST, add it as a new custom model
        draft.push({
          ...toAddModel,
          displayName: toAddModel.displayName || toAddModel.id,
          functionCall: true,
          isCustom: true,
          vision: true,
        });
      }
    }
  });
};

const modelSelectList = (s: GlobalStore): ModelProviderCard[] => {
  const string = [s.serverConfig.customModelName, currentSettings(s).languageModel.Tomechat.customModelName]
    .filter(Boolean)
    .join(',');

  const modelConfig = parseModelString(string);

  // model list priority: user settings > backend response > default model cards
  const defaultModels = TomechatModels(s).length
    ? TomechatModels(s)
    : remoteChatModels(s).length
      ? remoteChatModels(s)
      : TomechatProvider.chatModels;

  const chatModels = processChatModels(modelConfig, defaultModels);

  return [
    {
      ...TomechatProvider,
      chatModels,
      enabled: enableTomechat(s),
    },
  ];
};

const modelCardById = (id: string) => (s: GlobalStore) => {
  const list = modelSelectList(s);

  return list.flatMap((i) => i.chatModels).find((m) => m.id === id);
};

const modelEnabledFunctionCall = (id: string) => (s: GlobalStore) =>
  modelCardById(id)(s)?.functionCall || false;

// vision model white list, these models will change the content from string to array
const modelEnabledVision = (id: string) => (s: GlobalStore) =>
  modelCardById(id)(s)?.vision || id.includes('vision');

const modelEnabledFiles = (id: string) => (s: GlobalStore) => modelCardById(id)(s)?.files;

// ponytail: backend /models has no capability metadata; don't presume vision on the frontend, let the model/backend decide
const modelEnabledUpload = (_id: string) => (s: GlobalStore) => enableTomechat(s);

const modelHasMaxToken = (id: string) => (s: GlobalStore) =>
  typeof modelCardById(id)(s)?.tokens !== 'undefined';

const modelMaxToken = (id: string) => (s: GlobalStore) => modelCardById(id)(s)?.tokens || 0;

/* eslint-disable sort-keys-fix/sort-keys-fix,  */
export const modelProviderSelectors = {
  modelSelectList,

  modelCardById,
  modelMaxToken,
  modelHasMaxToken,

  modelEnabledFunctionCall,
  modelEnabledVision,
  modelEnabledFiles,
  modelEnabledUpload,

  modelProviderConfig: modelProvider,
  providerEnabled: (provider: 'Tomechat') => enableTomechat,

  // Tomechat
  enableTomechat,
  TomechatProxyUrl,
  remoteChatModels,
  // whether the backend model list has been fetched (controls model tag visibility)
  isRemoteModelListReady: (s: GlobalStore) => remoteChatModels(s).length > 0,
};
