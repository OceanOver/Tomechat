/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
// Disable the auto sort key eslint rule to make the code more logic and readable
import { template } from 'lodash-es';
import useSWR, { SWRResponse, mutate } from 'swr';

import { copyToClipboard } from '@/utils/clipboard';
import { StateCreator } from 'zustand/vanilla';

import { LOADING_FLAT } from '@/const/message';
import { CreateMessageParams } from '@/database/models/message';
import { chatService } from '@/services/chat';
import { messageService } from '@/services/message';
import { topicService } from '@/services/topic';
import { chatHelpers } from '@/store/chat/helpers';
import { ChatStore } from '@/store/chat/store';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';
import { ChatMessage } from '@/types/message';
import { setNamespace } from '@/utils/storeDebug';

import { chatSelectors } from '../../selectors';
import { MessageDispatch, messagesReducer } from './reducer';

const n = setNamespace('message');

interface SendMessageParams {
  message: string;
  files?: { id: string; url: string }[];
  onlyAddUserMessage?: boolean;
}

export interface ChatMessageAction {
  // create
  sendMessage: (params: SendMessageParams) => Promise<void>;
  /**
   * regenerate message
   * trace enabled
   * @param id
   */
  regenerateMessage: (id: string) => Promise<void>;

  // delete
  /**
   * clear message on the active session
   */
  clearMessage: () => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  delAndRegenerateMessage: (id: string) => Promise<void>;
  clearAllMessages: () => Promise<void>;
  // update
  updateInputMessage: (message: string) => void;
  modifyMessageContent: (id: string, content: string) => Promise<void>;
  // query
  useFetchMessages: (sessionId: string, topicId?: string) => SWRResponse<ChatMessage[]>;
  stopGenerateMessage: () => void;
  copyMessage: (id: string, content: string) => Promise<void>;

  // =========  ↓ Internal Method ↓  ========== //
  // ========================================== //
  // ========================================== //

  /**
   * update message at the frontend point
   * this method will not update messages to database
   */
  dispatchMessage: (payload: MessageDispatch) => void;
  /**
   * core process of the AI message (include preprocess and postprocess)
   */
  coreProcessMessage: (messages: ChatMessage[], parentId: string) => Promise<void>;
  /**
   * Actually fetch the AI response
   * @param messages - chat message array
   * @param options - SSE fetching options
   */
  fetchAIChatMessage: (
    messages: ChatMessage[],
    assistantMessageId: string,
  ) => Promise<{
    content: string;
  }>;
  toggleChatLoading: (
    loading: boolean,
    id?: string,
    action?: string,
  ) => AbortController | undefined;
  refreshMessages: () => Promise<void>;
  // TODO: consider moving smoothMessage down to the SSE layer
  createSmoothMessage: (id: string) => {
    startAnimation: (speed?: number) => Promise<void>;
    stopAnimation: () => void;
    outputQueue: string[];
    isAnimationActive: boolean;
    getBuffer: () => string;
  };
  /**
   * a method used by other action
   * @param id
   * @param content
   */
  internalUpdateMessageContent: (id: string, content: string) => Promise<void>;
  internalResendMessage: (id: string) => Promise<void>;
}

const getAgentConfig = () => agentSelectors.currentAgentConfig(useSessionStore.getState());

const preventLeavingFn = (e: BeforeUnloadEvent) => {
  // set returnValue to trigger alert modal
  // Note: No matter what value is set, the browser will display the standard text
  e.returnValue = '你有正在生成中的请求，确定要离开吗？';
};

export const chatMessage: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatMessageAction
> = (set, get) => ({
  deleteMessage: async (id) => {
    await messageService.removeMessage(id);
    await get().refreshMessages();
  },
  delAndRegenerateMessage: async (id) => {
    get().internalResendMessage(id);
    get().deleteMessage(id);
  },
  regenerateMessage: async (id: string) => {
    await get().internalResendMessage(id);
  },
  clearMessage: async () => {
    const { activeId, activeTopicId, refreshMessages, refreshTopic, switchTopic } = get();

    await messageService.removeMessages(activeId, activeTopicId);

    if (activeTopicId) {
      await topicService.removeTopic(activeTopicId);
    }
    await refreshTopic();
    await refreshMessages();

    // after remove topic , go back to default topic
    switchTopic();
  },
  clearAllMessages: async () => {
    const { refreshMessages } = get();
    await messageService.clearAllMessage();
    await refreshMessages();
  },
  internalResendMessage: async (messageId) => {
    // 1. Build all relevant history messages
    const chats = chatSelectors.currentChats(get());

    const currentIndex = chats.findIndex((c) => c.id === messageId);
    if (currentIndex < 0) return;

    const currentMessage = chats[currentIndex];

    let contextMessages: ChatMessage[] = [];

    switch (currentMessage.role) {
      case 'function':
      case 'user': {
        contextMessages = chats.slice(0, currentIndex + 1);
        break;
      }
      case 'assistant': {
        // message comes from the AI, so find its parent user message
        const userId = currentMessage.parentId;
        const userIndex = chats.findIndex((c) => c.id === userId);
        // without a parentId, fall back to the same behavior as user/function
        contextMessages = chats.slice(0, userIndex < 0 ? currentIndex + 1 : userIndex + 1);
        break;
      }
    }

    if (contextMessages.length <= 0) return;

    const { coreProcessMessage } = get();

    const latestMsg = contextMessages.findLast((s) => s.role === 'user');

    if (!latestMsg) return;

    await coreProcessMessage(contextMessages, latestMsg.id);
  },
  sendMessage: async ({ message, files, onlyAddUserMessage }) => {
    const { coreProcessMessage, activeTopicId, activeId } = get();
    if (!activeId) return;

    const fileIdList = files?.map((f) => f.id);

    // if message is empty and no files, then stop
    if (!message && (!fileIdList || fileIdList?.length === 0)) return;

    const newMessage: CreateMessageParams = {
      content: message,
      // if message has attached with files, then add files to message and the agent
      files: fileIdList,
      role: 'user',
      sessionId: activeId,
      // if there is activeTopicId，then add topicId to message
      topicId: activeTopicId,
    };

    const id = await messageService.create(newMessage);
    await get().refreshMessages();

    // if only add user message, then stop
    if (onlyAddUserMessage) return;

    // Get the current messages to generate AI response
    const messages = chatSelectors.currentChats(get());

    await coreProcessMessage(messages, id);

    // check activeTopic and then auto create topic
    const chats = chatSelectors.currentChats(get());

    const agentConfig = getAgentConfig();
    // if autoCreateTopic is false, then stop
    if (!agentConfig.enableAutoCreateTopic) return;

    if (!activeTopicId && chats.length >= agentConfig.autoCreateTopicThreshold) {
      const { saveToTopic, switchTopic } = get();
      const id = await saveToTopic();
      if (id) switchTopic(id);
    }
  },

  copyMessage: async (id, content) => {
    await copyToClipboard(content);
  },

  stopGenerateMessage: () => {
    const { abortController, toggleChatLoading } = get();
    if (!abortController) return;

    abortController.abort();

    toggleChatLoading(false, undefined, n('stopGenerateMessage') as string);
  },
  updateInputMessage: (message) => {
    set({ inputMessage: message }, false, n('updateInputMessage', message));
  },
  modifyMessageContent: async (id, content) => {
    await get().internalUpdateMessageContent(id, content);
  },
  useFetchMessages: (sessionId, activeTopicId) =>
    useSWR<ChatMessage[]>(
      [sessionId, activeTopicId],
      async ([sessionId, topicId]: [string, string | undefined]) =>
        messageService.getMessages(sessionId, topicId),
      {
        onSuccess: (messages, key) => {
          set(
            { activeId: sessionId, messages, messagesInit: true },
            false,
            n('useFetchMessages', {
              messages,
              queryKey: key,
            }),
          );
        },
        // default is 2000ms ,it makes the user's quick switch don't work correctly.
        // we need to set it to 0.
        dedupingInterval: 0,
      },
    ),
  refreshMessages: async () => {
    await mutate([get().activeId, get().activeTopicId]);
  },

  // the internal process method of the AI message
  coreProcessMessage: async (messages, userMessageId) => {
    const { fetchAIChatMessage, refreshMessages, activeTopicId } = get();

    const { model, provider } = getAgentConfig();

    // 1. Add an empty message to place the AI response
    const assistantMessage: CreateMessageParams = {
      role: 'assistant',
      content: LOADING_FLAT,
      fromModel: model,
      fromProvider: provider,

      parentId: userMessageId,
      sessionId: get().activeId,
      topicId: activeTopicId, // if there is activeTopicId，then add it to topicId
    };

    const mid = await messageService.create(assistantMessage);
    await refreshMessages();

    // 2. fetch the AI response
    await fetchAIChatMessage(messages, mid);
  },
  dispatchMessage: (payload) => {
    const { activeId } = get();

    if (!activeId) return;

    const messages = messagesReducer(get().messages, payload);

    set({ messages }, false, n(`dispatchMessage/${payload.type}`, payload));
  },
  fetchAIChatMessage: async (messages, assistantId) => {
    const {
      toggleChatLoading,
      refreshMessages,
      internalUpdateMessageContent,
      dispatchMessage,
      createSmoothMessage,
    } = get();

    const abortController = toggleChatLoading(
      true,
      assistantId,
      n('generateMessage(start)', { assistantId, messages }) as string,
    );

    const config = getAgentConfig();

    const compiler = template(config.inputTemplate, { interpolate: /{{([\S\s]+?)}}/g });

    // ================================== //
    //   messages uniformly preprocess    //
    // ================================== //

    // 1. slice messages with config
    let preprocessMsgs = chatHelpers.getSlicedMessagesWithConfig(messages, config);

    // 2. replace inputMessage template
    preprocessMsgs = !config.inputTemplate
      ? preprocessMsgs
      : preprocessMsgs.map((m) => {
          if (m.role === 'user') {
            try {
              return { ...m, content: compiler({ text: m.content }) };
            } catch (error) {
              console.error(error);

              return m;
            }
          }

          return m;
        });

    // 3. add systemRole
    if (config.systemRole) {
      preprocessMsgs.unshift({ content: config.systemRole, role: 'system' } as ChatMessage);
    }

    // 4. handle max_tokens
    config.params.max_tokens = config.enableMaxTokens ? config.params.max_tokens : undefined;

    // 5. handle config for the vision model
    // Due to the gpt-4-vision-preview model's default max_tokens is very small
    // we need to set the max_tokens a larger one.
    if (config.model === 'gpt-4-vision-preview') {
      /* eslint-disable unicorn/no-lonely-if */
      if (!config.params.max_tokens)
        config.params.max_tokens = 2048;
    }

    let output = '';

    const { startAnimation, stopAnimation, outputQueue, isAnimationActive, getBuffer } =
      createSmoothMessage(assistantId);

    await chatService.createAssistantMessageStream({
      abortController,
      params: {
        messages: preprocessMsgs,
        model: config.model,
        provider: config.provider,
        knowledge_base_name: config.knowledgeBase,
        search_engine: config.searchEngine,
        ...config.params,
      },
      onErrorHandle: async (error) => {
        await messageService.updateMessageError(assistantId, error);
        await refreshMessages();
      },
      onAbort: async () => {
        stopAnimation();
        // on stop, keep only what has been typed out and persist it so a refresh doesn't roll back
        await internalUpdateMessageContent(assistantId, getBuffer());
      },
      onFinish: async (content, { type } = {}) => {
        // on abort, onAbort already handled it; don't flush the queue or overwrite content
        if (type === 'abort') return;

        stopAnimation();

        if (outputQueue.length > 0) {
          await startAnimation(15);
        }

        // update the content after fetch result
        await internalUpdateMessageContent(assistantId, content);
      },
      onMessageHandle: async (text) => {
        output += text;
        outputQueue.push(...text.split(''));

        if (!isAnimationActive) startAnimation();
      },
    });

    toggleChatLoading(false, undefined, n('generateMessage(end)') as string);

    return {
      content: output,
    };
  },
  toggleChatLoading: (loading, id, action) => {
    if (loading) {
      window.addEventListener('beforeunload', preventLeavingFn);

      const abortController = new AbortController();
      set({ abortController, chatLoadingId: id }, false, action);

      return abortController;
    } else {
      set({ abortController: undefined, chatLoadingId: undefined }, false, action);

      window.removeEventListener('beforeunload', preventLeavingFn);
    }
  },
  internalUpdateMessageContent: async (id, content) => {
    const { dispatchMessage, refreshMessages } = get();

    // Due to the async update method and refresh need about 100ms
    // we need to update the message content at the frontend to avoid the update flick
    // refs: https://medium.com/@kyledeguzmanx/what-are-optimistic-updates-483662c3e171
    dispatchMessage({ id, key: 'content', type: 'updateMessage', value: content });

    await messageService.updateMessage(id, { content });
    await refreshMessages();
  },

  createSmoothMessage: (id) => {
    const { dispatchMessage } = get();

    let buffer = '';
    let outputQueue: string[] = [];

    // eslint-disable-next-line no-undef
    let animationTimeoutId: NodeJS.Timeout | null = null;
    let isAnimationActive = false;

    // when you need to stop the animation, call this function
    const stopAnimation = () => {
      isAnimationActive = false;
      if (animationTimeoutId !== null) {
        clearTimeout(animationTimeoutId);
        animationTimeoutId = null;
      }
    };

    // define startAnimation function to display the text in buffer smooth
    // when you need to start the animation, call this function
    const startAnimation = (speed = 2) =>
      new Promise<void>((resolve) => {
        if (isAnimationActive) {
          resolve();
          return;
        }

        isAnimationActive = true;

        const updateText = () => {
          // stop updating text if the animation is no longer active
          if (!isAnimationActive) {
            clearTimeout(animationTimeoutId!);
            animationTimeoutId = null;
            resolve();
          }

          // if text remains to be shown
          // check the queue for pending characters
          if (outputQueue.length > 0) {
            // take the next few characters from the queue
            const charsToAdd = outputQueue.splice(0, speed).join('');
            buffer += charsToAdd;

            // update the message content; may need tuning for real-world usage
            dispatchMessage({ id, key: 'content', type: 'updateMessage', value: buffer });

            // schedule the next update
            animationTimeoutId = setTimeout(updateText, 16); // 16ms delay to simulate a typewriter effect
          } else {
            // all characters displayed; clear the animation state
            isAnimationActive = false;
            animationTimeoutId = null;
            resolve();
          }
        };

        updateText();
      });

    return { startAnimation, stopAnimation, outputQueue, isAnimationActive, getBuffer: () => buffer };
  },
});
