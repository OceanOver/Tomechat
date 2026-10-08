import { DEFAULT_AGENT_META } from '@/const/meta';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { ChatAgentConfig } from '@/types/agent';
import { MetaData } from '@/types/meta';

export type AutocompleteField =
  | 'avatar'
  | 'backgroundColor'
  | 'description'
  | 'tags'
  | 'title';

export type AutocompleteLoadingState = Record<AutocompleteField, boolean>;

export interface AgentSettingState {
  autocompleteLoading: AutocompleteLoadingState;
  config: ChatAgentConfig;
  id?: string;
  meta: MetaData;

  onConfigChange?: (config: ChatAgentConfig) => void;
  onMetaChange?: (meta: MetaData) => void;
}

const AUTOCOMPLETE_FIELDS: AutocompleteField[] = [
  'avatar',
  'backgroundColor',
  'description',
  'tags',
  'title',
];

// Every field starts out idle; built from the field list so the two stay in sync.
const idleAutocompleteLoading = () =>
  Object.fromEntries(AUTOCOMPLETE_FIELDS.map((field) => [field, false])) as AutocompleteLoadingState;

export const initialState: AgentSettingState = {
  autocompleteLoading: idleAutocompleteLoading(),
  config: DEFAULT_AGENT_CONFIG,
  meta: DEFAULT_AGENT_META,
};
