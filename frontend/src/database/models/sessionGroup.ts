import { BaseModel } from '@/database/core';
import { DB_SessionGroup, DB_SessionGroupSchema } from '@/database/schemas/sessionGroup';
import { SessionGroups } from '@/types/session';
import { shortId } from '@/utils/uuid';

class _SessionGroupModel extends BaseModel {
  constructor() {
    super('sessionGroups', DB_SessionGroupSchema);
  }

  async create(name: string, sort?: number, id = shortId()) {
    return this._add({ name, sort }, id);
  }
  async batchCreate(groups: SessionGroups) {
    return this._batchAdd(groups, { idGenerator: shortId });
  }

  async findById(id: string): Promise<DB_SessionGroup> {
    return this.table.get(id);
  }

  async update(id: string, data: Partial<DB_SessionGroup>) {
    return super._update(id, data);
  }

  async delete(id: string, removeGroupItem: boolean = false) {
    this.db.sessions.toCollection().modify((session) => {
      //  update all session associated with the sessionGroup to default
      if (session.group === id) session.group = 'default';
    });
    if (!removeGroupItem) {
      return this.table.delete(id);
    } else {
      return this.db.sessions.where('group').equals(id).delete();
    }
  }

  async query(): Promise<SessionGroups> {
    const allGroups = await this.table.toArray();

    // Custom sort: group by presence of `sort`, then order each group
    return allGroups.sort((a, b) => {
      // Both have sort — order by it
      if (a.sort !== undefined && b.sort !== undefined) {
        // Same sort — newest first
        if (a.sort === b.sort) return b.createdAt - a.createdAt;

        return a.sort - b.sort;
      }
      // Only a has sort — a first
      if (a.sort !== undefined) {
        return -1;
      }
      // Only b has sort — b first
      if (b.sort !== undefined) {
        return 1;
      }
      // Neither has sort — newest first
      return b.createdAt - a.createdAt;
    });
  }

  async updateOrder(sortMap: { id: string; sort: number }[]) {
    return this.db.transaction('rw', this.table, async () => {
      for (const { id, sort } of sortMap) {
        await this.table.update(id, { sort });
      }
    });
  }

  async clear() {
    this.table.clear();
  }
}

export const SessionGroupModel = new _SessionGroupModel();
