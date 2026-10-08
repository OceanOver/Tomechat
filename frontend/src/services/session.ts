import { DeepPartial } from 'utility-types';

import { SessionModel } from '@/database/models/session';
import { SessionGroupModel } from '@/database/models/sessionGroup';
import { ChatAgentConfig } from '@/types/agent';
import { MetaData } from '@/types/meta';
import {
  ChatSessionList,
  ChatSession,
  SessionType,
  ChatSessions,
  SessionGroupId,
  SessionGroupItem,
  SessionGroups,
} from '@/types/session';

class SessionService {
  async createNewSession(
    type: SessionType,
    defaultValue: Partial<ChatSession>,
  ): Promise<string> {
    const item = await SessionModel.create(type, defaultValue);
    if (!item) {
      throw new Error('session create Error');
    }
    return item.id;
  }

  async batchCreateSessions(importSessions: ChatSessions) {
    return SessionModel.batchCreate(importSessions);
  }

  async duplicateSession(id: string, newTitle: string): Promise<string | undefined> {
    const res = await SessionModel.duplicate(id, newTitle);

    if (res) return res?.id;
  }

  async getSessions(): Promise<ChatSessions> {
    return SessionModel.query();
  }

  async getSessionsWithGroup(): Promise<ChatSessionList> {
    return SessionModel.queryWithGroups();
  }

  async getAllAgents(): Promise<ChatSessions> {
    // TODO: add a filter to get only agents
    return await SessionModel.query();
  }

  async hasSessions() {
    const isEmpty = await SessionModel.isEmpty();
    return !isEmpty;
  }

  async searchSessions(keyword: string) {
    return SessionModel.queryByKeyword(keyword);
  }

  async updateSessionGroupId(id: string, group: SessionGroupId) {
    return SessionModel.update(id, { group });
  }
  async updateSessionPinned(id: string, pinned: boolean) {
    return SessionModel.updatePinned(id, pinned);
  }

  async updateSessionMeta(activeId: string, meta: Partial<MetaData>) {
    return SessionModel.update(activeId, { meta });
  }

  async updateSessionConfig(activeId: string, config: DeepPartial<ChatAgentConfig>) {
    return SessionModel.updateConfig(activeId, config);
  }

  async removeSession(id: string) {
    return SessionModel.delete(id);
  }

  async removeAllSessions() {
    return SessionModel.clearTable();
  }

  // ************************************** //
  // ***********  SessionGroup  *********** //
  // ************************************** //

  async createSessionGroup(name: string, sort?: number) {
    const item = await SessionGroupModel.create(name, sort);
    if (!item) {
      throw new Error('session group create Error');
    }

    return item.id;
  }

  async batchCreateSessionGroups(groups: SessionGroups) {
    return SessionGroupModel.batchCreate(groups);
  }

  async removeSessionGroup(id: string, removeChildren?: boolean) {
    return await SessionGroupModel.delete(id, removeChildren);
  }

  async updateSessionGroup(id: string, data: Partial<SessionGroupItem>) {
    return SessionGroupModel.update(id, data);
  }

  async updateSessionGroupOrder(sortMap: { id: string; sort: number }[]) {
    return SessionGroupModel.updateOrder(sortMap);
  }

  async getSessionGroups(): Promise<SessionGroupItem[]> {
    return SessionGroupModel.query();
  }

  async clearSessionGroups() {
    return SessionGroupModel.clear();
  }
}

export const sessionService = new SessionService();
