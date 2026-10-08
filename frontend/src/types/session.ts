import { ChatAgentConfig } from '@/types/agent';

import { BaseDataModel, MetaData } from './meta';

export enum SessionType {
  Agent = 'agent',
  Group = 'group',
}

export type SessionGroupId = SessionDefaultGroup | string;

export enum SessionDefaultGroup {
  Default = 'default',
  Pinned = 'pinned',
}

export interface SessionGroupItem {
  createdAt: number;
  id: string;
  name: string;
  sort?: number;
  updatedAt: number;
}

export type SessionGroups = SessionGroupItem[];

/**
 * Chat session
 */
export interface ChatSession extends BaseDataModel {
  config: ChatAgentConfig;
  group?: SessionGroupId;
  pinned?: boolean;
  type: SessionType.Agent;
}

export interface AgentSettings {
  /**
   * Language model role settings
   */
  config: ChatAgentConfig;
  meta: MetaData;
}

export type ChatSessions = ChatSession[];

export interface CustomSessionGroup {
  children: ChatSessions;
  id: SessionGroupId;
  name: string;
}

export interface ChatSessionList {
  all: ChatSessions;
  customGroup: CustomSessionGroup[];
  default: ChatSessions;
  pinned: ChatSessions;
}
