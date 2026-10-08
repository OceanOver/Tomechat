import chat from './chat';
import common from './common';
import error from './error';
import knowledge from './knowledge';
import setting from './setting';
import welcome from './welcome';

const resources = {
  chat,
  common,
  error,
  knowledge,
  setting,
  welcome,
} as const;

export default resources;
