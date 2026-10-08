/* eslint-disable sort-keys-fix/sort-keys-fix */
// ******* Runtime Biz Error ******* //
export const AgentRuntimeErrorType = {
  AgentRuntimeError: 'AgentRuntimeError', // Runtime error from the agent runtime module
  LocationNotSupportError: 'LocationNotSupportError',

  OpenAIBizError: 'OpenAIBizError',

  NoOpenAIAPIKey: 'NoOpenAIAPIKey',

  InvalidAzureAPIKey: 'InvalidAzureAPIKey',
  AzureBizError: 'AzureBizError',

  InvalidZhipuAPIKey: 'InvalidZhipuAPIKey',
  ZhipuBizError: 'ZhipuBizError',

  InvalidGoogleAPIKey: 'InvalidGoogleAPIKey',
  GoogleBizError: 'GoogleBizError',

  InvalidBedrockCredentials: 'InvalidBedrockCredentials',
  BedrockBizError: 'BedrockBizError',

  InvalidMistralAPIKey: 'InvalidMistralAPIKey',
  MistralBizError: 'MistralBizError',

  InvalidMoonshotAPIKey: 'InvalidMoonshotAPIKey',
  MoonshotBizError: 'MoonshotBizError',

  InvalidOllamaArgs: 'InvalidOllamaArgs',
  OllamaBizError: 'OllamaBizError',

  InvalidPerplexityAPIKey: 'InvalidPerplexityAPIKey',
  PerplexityBizError: 'PerplexityBizError',

  InvalidAnthropicAPIKey: 'InvalidAnthropicAPIKey',
  AnthropicBizError: 'AnthropicBizError',

  InvalidTomechatArgs: 'InvalidTomechatArgs',
  TomechatBizError: 'TomechatBizError',
} as const;

export type AgentRuntimeErrorCode =
  (typeof AgentRuntimeErrorType)[keyof typeof AgentRuntimeErrorType];
