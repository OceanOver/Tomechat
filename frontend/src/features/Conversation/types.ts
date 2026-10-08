import { type ActionEvent } from '@/components/ActionIconGroup';
import { FC } from 'react';

import { LLMRoleType } from '@/types/llm';
import { ChatMessage } from '@/types/message';

export type OnActionsClick = (action: ActionEvent, message: ChatMessage) => void;
export type OnAvatarsClick = (role: string) => (() => void) | undefined;
export type RenderRole = LLMRoleType | 'default' | string;

export type RenderMessageExtra = FC<ChatMessage>;

export type RenderAction = FC<{
  content?: string;
  error?: boolean;
  id?: string;
  onActionClick?: (action: ActionEvent) => void;
}>;
