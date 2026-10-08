import { ChatMessage } from '@/types/message';

export interface ChatMessageState {
  abortController?: AbortController;
  /**
   * @title Currently active session
   * @description The session being edited or viewed
   */
  activeId: string;
  chatLoadingId?: string;
  inputMessage: string;
  messageLoadingIds: [];
  messages: ChatMessage[];
  /**
   * whether messages have fetched
   */
  messagesInit: boolean;
}

export const initialMessageState: ChatMessageState = {
  activeId: 'inbox',
  inputMessage: '',
  messageLoadingIds: [],
  messages: [],
  messagesInit: false,
};
