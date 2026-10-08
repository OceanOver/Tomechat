import Dexie from 'dexie';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { LocalDB } from '../db';
import { TOMECHAT_LOCAL_DB_NAME } from '../types/db';

// Ensure each test starts from a clean IndexedDB.
const deleteDb = async () => {
  await Dexie.delete(TOMECHAT_LOCAL_DB_NAME);
};

describe('LocalDB schema', () => {
  beforeEach(deleteDb);
  afterEach(deleteDb);

  it('opens at schema v1 and persists records across reconnection', async () => {
    const db = new LocalDB();
    await db.open();
    expect(db.verno).toBe(1);

    const now = Date.now();
    await db.sessions.add({
      createdAt: now,
      id: 's1',
      meta: {},
      type: 'chat',
      updatedAt: now,
    } as any);

    const reopened = new LocalDB();
    await reopened.open();
    const session = await reopened.sessions.get('s1');
    expect(session).toBeDefined();
    expect(session?.id).toBe('s1');
  });
});
