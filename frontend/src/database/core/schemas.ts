// Final database schema (v1). Tables are indexed per Dexie string-schema syntax.
export const dbSchema = {
  files: '&id, name, fileType, saveMode, createdAt, updatedAt, messageId, sessionId',

  messages:
    '&id, role, content, fromModel, favorite, plugin.identifier, plugin.apiName, translate.content, createdAt, updatedAt, sessionId, topicId, quotaId, parentId, [sessionId+topicId], traceId',

  plugins:
    '&identifier, type, manifest.type, manifest.meta.title, manifest.meta.description, manifest.meta.author, createdAt, updatedAt',

  sessionGroups: '&id, name, sort, createdAt, updatedAt',

  sessions: '&id, type, group, pinned, meta.title, meta.description, meta.tags, createdAt, updatedAt',

  topics: '&id, title, favorite, createdAt, updatedAt, sessionId',

  users: '++id, uuid',
};
