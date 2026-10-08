import Clear from './Clear';
import FileUpload from './FileUpload';
import History from './History';
import KnowledgeBase from './KnowledgeBase';
import Token from './Token';
import WebSearch from './WebSearch';

export const actionMap = {
  clear: Clear,
  fileUpload: FileUpload,
  history: History,
  knowledgeBase: KnowledgeBase,
  token: Token,
  webSearch: WebSearch,
} as const;

type ActionMap = typeof actionMap;

export type ActionKeys = keyof ActionMap;

type getActionList = (mobile?: boolean) => ActionKeys[];

// we can make these action lists configurable in the future
export const getLeftActionList: getActionList = () =>
  ['fileUpload', 'knowledgeBase', 'webSearch', 'history', 'token'] as ActionKeys[];

export const getRightActionList: getActionList = () => ['clear'].filter(Boolean) as ActionKeys[];
