import Dexie, { Transaction } from 'dexie';

import { DB_File } from '@/database/schemas/files';
import { DB_Message } from '@/database/schemas/message';
import { DB_Plugin } from '@/database/schemas/plugin';
import { DB_Session } from '@/database/schemas/session';
import { DB_SessionGroup } from '@/database/schemas/sessionGroup';
import { DB_Topic } from '@/database/schemas/topic';
import { DB_User } from '@/database/schemas/user';

import { dbSchema } from './schemas';
import { DBModel, TOMECHAT_LOCAL_DB_NAME } from './types/db';

interface DBSchemaMap {
  files: DB_File;
  messages: DB_Message;
  plugins: DB_Plugin;
  sessionGroups: DB_SessionGroup;
  sessions: DB_Session;
  topics: DB_Topic;
  users: DB_User;
}

// Client-side database. There is a single schema version: this app has no
// legacy on-disk formats to upgrade from.
export class LocalDB extends Dexie {
  public files: DBTable<'files'>;
  public sessions: DBTable<'sessions'>;
  public messages: DBTable<'messages'>;
  public topics: DBTable<'topics'>;
  public plugins: DBTable<'plugins'>;
  public sessionGroups: DBTable<'sessionGroups'>;
  public users: DBTable<'users'>;

  constructor() {
    super(TOMECHAT_LOCAL_DB_NAME);
    this.version(1).stores(dbSchema);

    this.files = this.table('files');
    this.sessions = this.table('sessions');
    this.messages = this.table('messages');
    this.topics = this.table('topics');
    this.plugins = this.table('plugins');
    this.sessionGroups = this.table('sessionGroups');
    this.users = this.table('users');
  }
}

export const LocalDBInstance = new LocalDB();

// types helper
export type LocalDBSchema = {
  [t in keyof DBSchemaMap]: {
    model: DBSchemaMap[t];
    table: Dexie.Table<DBModel<DBSchemaMap[t]>, string>;
  };
};
type DBTable<T extends keyof DBSchemaMap> = LocalDBSchema[T]['table'];
