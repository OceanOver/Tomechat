import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { DBModel } from '@/database/core/types/db';
import { CreateMessageParams, MessageModel } from '@/database/models/message';
import { DB_Message } from '@/database/schemas/message';
import { DB_Topic } from '@/database/schemas/topic';
import { shortId } from '@/utils/uuid';
import * as uuidUtils from '@/utils/uuid';

import { CreateTopicParams, QueryTopicParams, TopicModel } from '../topic';

describe('TopicModel', () => {
  let topicData: CreateTopicParams;

  beforeEach(() => {
    // Set up topic data with the correct structure
    topicData = {
      sessionId: 'session1',
      title: 'Test Topic',
      favorite: false,
    };
  });

  afterEach(async () => {
    // Clean up the database after each test
    await TopicModel.clearTable();
  });

  describe('create', () => {
    it('should create a topic record', async () => {
      const result = await TopicModel.create(topicData);

      expect(result).toHaveProperty('id');
      // Verify that the topic has been added to the database
      const topicInDb = await TopicModel.findById(result.id);

      expect(topicInDb).toEqual(
        expect.objectContaining({
          title: topicData.title,
          favorite: topicData.favorite ? 1 : 0,
          sessionId: topicData.sessionId,
        }),
      );
    });

    it('should create a topic with favorite set to true', async () => {
      const favoriteTopicData: CreateTopicParams = {
        ...topicData,
        favorite: true,
      };
      const result = await TopicModel.create(favoriteTopicData);

      expect(result).toHaveProperty('id');
      const topicInDb = await TopicModel.findById(result.id);
      expect(topicInDb).toEqual(
        expect.objectContaining({
          title: favoriteTopicData.title,
          favorite: 1,
          sessionId: favoriteTopicData.sessionId,
        }),
      );
    });

    it('should update messages with the new topic id when messages are provided', async () => {
      const messagesToUpdate = [shortId(), shortId()];
      // These messages now exist in the database
      for (const messageId of messagesToUpdate) {
        await MessageModel.table.add({ id: messageId, text: 'Sample message', topicId: null });
      }

      const topicDataWithMessages = {
        ...topicData,
        messages: messagesToUpdate,
      };

      const topic = await TopicModel.create(topicDataWithMessages);
      expect(topic).toHaveProperty('id');

      // Verify the messages in the database were updated
      const updatedMessages: DB_Message[] = await MessageModel.table
        .where('id')
        .anyOf(messagesToUpdate)
        .toArray();

      expect(updatedMessages).toHaveLength(messagesToUpdate.length);
      for (const message of updatedMessages) {
        expect(message.topicId).toEqual(topic.id);
      }
    });

    it('should create a topic with a unique id when no id is provided', async () => {
      const spy = vi.spyOn(uuidUtils, 'shortId'); // Spy on shortId via the Vitest spy API
      const result = await TopicModel.create(topicData);

      expect(spy).toHaveBeenCalled(); // Verify shortId was used to generate the id
      expect(result).toHaveProperty('id');
      expect(typeof result.id).toBe('string');
      spy.mockRestore(); // Restore the original behavior
    });
  });
  describe('batch create', () => {
    it('should batch create topic records', async () => {
      const topicsToCreate = [topicData, topicData];
      const results = await TopicModel.batchCreate(topicsToCreate);

      expect(results.ids).toHaveLength(topicsToCreate.length);
      // Verify that the topics have been added to the database
      for (const result of results.ids!) {
        const topicInDb = await TopicModel.findById(result);
        expect(topicInDb).toEqual(
          expect.objectContaining({
            title: topicData.title,
            favorite: topicData.favorite ? 1 : 0,
            sessionId: topicData.sessionId,
          }),
        );
      }
    });

    it('should batch create topics with mixed favorite values', async () => {
      const mixedTopicsData: CreateTopicParams[] = [
        { ...topicData, favorite: true },
        { ...topicData, favorite: false },
      ];

      const results = await TopicModel.batchCreate(mixedTopicsData);

      expect(results.ids).toHaveLength(mixedTopicsData.length);
      for (const id of results.ids!) {
        const topicInDb = await TopicModel.findById(id);
        expect(topicInDb).toBeDefined();
        expect(topicInDb.favorite).toBeGreaterThanOrEqual(0);
        expect(topicInDb.favorite).toBeLessThanOrEqual(1);
      }
    });
  });

  it('should query topics with pagination', async () => {
    // Create multiple topics to test the query method
    await TopicModel.batchCreate([topicData, topicData]);

    const queryParams: QueryTopicParams = { pageSize: 1, current: 0, sessionId: 'session1' };
    const queriedTopics = await TopicModel.query(queryParams);

    expect(queriedTopics).toHaveLength(1);
  });

  it('should find topics by session id', async () => {
    // Create multiple topics to test the findBySessionId method
    await TopicModel.batchCreate([topicData, topicData]);

    const topicsBySessionId = await TopicModel.findBySessionId(topicData.sessionId);

    expect(topicsBySessionId).toHaveLength(2);
    expect(topicsBySessionId.every((i) => i.sessionId === topicData.sessionId)).toBeTruthy();
  });

  it('should delete a topic and its associated messages', async () => {
    const createdTopic = await TopicModel.create(topicData);

    await TopicModel.delete(createdTopic.id);

    // Verify the topic and its related messages are deleted
    const topicInDb = await TopicModel.findById(createdTopic.id);
    expect(topicInDb).toBeUndefined();

    // You need to verify that messages related to the topic are also deleted
    // This would require additional setup to create messages associated with the topic
    // and then assertions to check that they're deleted after the topic itself is deleted
  });

  it('should batch delete topics by session id', async () => {
    // Create multiple topics to test the batchDeleteBySessionId method
    await TopicModel.batchCreate([topicData, topicData]);

    await TopicModel.batchDeleteBySessionId(topicData.sessionId);

    // Verify that all topics with the given session id are deleted
    const topicsInDb = await TopicModel.findBySessionId(topicData.sessionId);
    expect(topicsInDb).toHaveLength(0);
  });

  it('should update a topic', async () => {
    const createdTopic = await TopicModel.create(topicData);
    const updateData = { title: 'New Title' };

    await TopicModel.update(createdTopic.id, updateData);
    const updatedTopic = await TopicModel.findById(createdTopic.id);

    expect(updatedTopic).toHaveProperty('title', 'New Title');
  });

  describe('toggleFavorite', () => {
    it('should toggle favorite status of a topic', async () => {
      const createdTopic = await TopicModel.create(topicData);

      const newState = await TopicModel.toggleFavorite(createdTopic.id);

      expect(newState).toBe(true);
      const topicInDb = await TopicModel.findById(createdTopic.id);
      expect(topicInDb).toHaveProperty('favorite', 1);
    });

    it('should handle toggleFavorite when topic does not exist', async () => {
      const nonExistentTopicId = 'non-existent-id';
      await expect(TopicModel.toggleFavorite(nonExistentTopicId)).rejects.toThrow(
        `Topic with id ${nonExistentTopicId} not found`,
      );
    });

    it('should set favorite to specific state using toggleFavorite', async () => {
      const createdTopic = await TopicModel.create(topicData);

      // Set favorite to true regardless of current state
      await TopicModel.toggleFavorite(createdTopic.id, true);
      let topicInDb = await TopicModel.findById(createdTopic.id);
      expect(topicInDb.favorite).toBe(1);

      // Set favorite to false regardless of current state
      await TopicModel.toggleFavorite(createdTopic.id, false);
      topicInDb = await TopicModel.findById(createdTopic.id);
      expect(topicInDb.favorite).toBe(0);
    });
  });

  it('should delete a topic and its associated messages', async () => {
    // Create a topic with associated messages
    const createdTopic = await TopicModel.create(topicData);
    const messageData: CreateMessageParams = {
      content: 'Test Message',
      topicId: createdTopic.id,
      sessionId: topicData.sessionId,
      role: 'user',
    };
    await MessageModel.create(messageData);

    // Delete the topic
    await TopicModel.delete(createdTopic.id);

    // Verify the topic is gone
    const topicInDb = await TopicModel.findById(createdTopic.id);
    expect(topicInDb).toBeUndefined();

    // Verify its messages were removed too
    const messagesInDb = await MessageModel.query({
      sessionId: topicData.sessionId,
      topicId: createdTopic.id,
    });
    expect(messagesInDb).toHaveLength(0);
  });

  it('should batch delete topics and their associated messages', async () => {
    // Create multiple topics with associated messages
    const createdTopic1 = await TopicModel.create(topicData);
    const createdTopic2 = await TopicModel.create(topicData);

    const messageData1: CreateMessageParams = {
      content: 'Test Message 1',
      topicId: createdTopic1.id,
      sessionId: topicData.sessionId,
      role: 'user',
    };
    const messageData2: CreateMessageParams = {
      content: 'Test Message 2',
      topicId: createdTopic2.id,
      sessionId: topicData.sessionId,
      role: 'user',
    };
    await MessageModel.create(messageData1);
    await MessageModel.create(messageData2);

    // Run the batch delete
    await TopicModel.batchDelete([createdTopic1.id, createdTopic2.id]);

    // Verify the topic is gone
    const topicInDb1 = await TopicModel.findById(createdTopic1.id);
    const topicInDb2 = await TopicModel.findById(createdTopic2.id);
    expect(topicInDb1).toBeUndefined();
    expect(topicInDb2).toBeUndefined();

    // Verify its messages were removed too
    const messagesInDb1 = await MessageModel.query({
      sessionId: topicData.sessionId,
      topicId: createdTopic1.id,
    });
    const messagesInDb2 = await MessageModel.query({
      sessionId: topicData.sessionId,
      topicId: createdTopic2.id,
    });
    expect(messagesInDb1).toHaveLength(0);
    expect(messagesInDb2).toHaveLength(0);
  });

  describe('duplicateTopic', () => {
    let originalTopic: DBModel<DB_Topic>;
    let originalMessages: any[];

    beforeEach(async () => {
      // Create an original topic
      const { id } = await TopicModel.create({
        title: 'Original Topic',
        sessionId: 'session1',
        favorite: false,
      });
      originalTopic = await TopicModel.findById(id);

      // Create messages associated with the original topic
      originalMessages = await Promise.all(
        ['Message 1', 'Message 2'].map((text) =>
          MessageModel.create({
            content: text,
            topicId: originalTopic.id,
            sessionId: originalTopic.sessionId!,
            role: 'user',
          }),
        ),
      );
    });

    afterEach(async () => {
      // Wipe all topics and messages
      await TopicModel.clearTable();
      await MessageModel.clearTable();
    });

    it('should duplicate a topic with all associated messages', async () => {
      // Run the duplicate operation
      await TopicModel.duplicateTopic(originalTopic.id);

      // Verify the duplicated topic exists
      const duplicatedTopic = await TopicModel.findBySessionId(originalTopic.sessionId!);
      expect(duplicatedTopic).toHaveLength(2);

      // Verify the duplicated messages exist
      const duplicatedMessages = await MessageModel.query({
        sessionId: originalTopic.sessionId!,
        topicId: duplicatedTopic[1].id, // The duplicate is the second topic
      });
      expect(duplicatedMessages).toHaveLength(originalMessages.length);
    });

    it('should throw an error if the topic does not exist', async () => {
      // Try duplicating a non-existent topic
      const nonExistentTopicId = shortId();
      await expect(TopicModel.duplicateTopic(nonExistentTopicId)).rejects.toThrow(
        `Topic with id ${nonExistentTopicId} not found`,
      );
    });

    it('should preserve the properties of the duplicated topic', async () => {
      // Run the duplicate operation
      await TopicModel.duplicateTopic(originalTopic.id);

      // Fetch the duplicated topic
      const topics = await TopicModel.findBySessionId(originalTopic.sessionId!);
      const duplicatedTopic = topics.find((topic) => topic.id !== originalTopic.id);

      // Verify the duplicate kept the original topic attributes
      expect(duplicatedTopic).toBeDefined();
      expect(duplicatedTopic).toMatchObject({
        title: originalTopic.title,
        favorite: originalTopic.favorite,
        sessionId: originalTopic.sessionId,
      });
      // Ensure a fresh id was generated
      expect(duplicatedTopic.id).not.toBe(originalTopic.id);
    });

    it('should properly handle the messages hierarchy when duplicating', async () => {
      // Create a child message under one of the original messages
      const { id } = await MessageModel.create({
        content: 'Child Message',
        topicId: originalTopic.id,
        parentId: originalMessages[0].id,
        sessionId: originalTopic.sessionId!,
        role: 'user',
      });
      const childMessage = await MessageModel.findById(id);

      // Run the duplicate operation
      await TopicModel.duplicateTopic(originalTopic.id);

      // Fetch the duplicated messages
      const duplicatedMessages = await MessageModel.queryBySessionId(originalTopic.sessionId!);

      // Verify the duplicated child message exists and its parentId was remapped
      const duplicatedChildMessage = duplicatedMessages.find(
        (message) => message.content === childMessage.content && message.id !== childMessage.id,
      );

      expect(duplicatedChildMessage).toBeDefined();
      expect(duplicatedChildMessage.parentId).not.toBe(childMessage.parentId);
      expect(duplicatedChildMessage.parentId).toBeDefined();
    });

    it('should fail if the database transaction fails', async () => {
      // Force the transaction to fail by throwing mid-duplication
      const dbTransactionFailedError = new Error('DB transaction failed');
      const spyOn = vi.spyOn(TopicModel['db'], 'transaction').mockImplementation((async () => {
        throw dbTransactionFailedError;
      }) as any);

      // Attempt the duplicate and catch the expected error
      await expect(TopicModel.duplicateTopic(originalTopic.id)).rejects.toThrow(
        dbTransactionFailedError,
      );
      spyOn.mockRestore();
    });

    it('should not create partial duplicates if the process fails at some point', async () => {
      // The error happens while duplicating messages
      vi.spyOn(MessageModel, 'duplicateMessages').mockImplementation(async () => {
        throw new Error('Failed to duplicate messages');
      });

      // Attempt the duplicate; it should reject
      await expect(TopicModel.duplicateTopic(originalTopic.id)).rejects.toThrow();

      // Ensure no duplicates were created
      const topics = await TopicModel.findBySessionId(originalTopic.sessionId!);
      expect(topics).toHaveLength(1); // only the original topic

      const messages = await MessageModel.queryBySessionId(originalTopic.sessionId!);
      expect(messages).toHaveLength(originalMessages.length); // only the original messages
    });
  });

  describe('clearTable', () => {
    it('should clear the table', async () => {
      // Create a topic to ensure the table is not empty
      await TopicModel.create(topicData);

      // Clear the table
      await TopicModel.clearTable();

      // Verify the table is empty
      const topics = await TopicModel.queryAll();
      expect(topics).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('should update a topic', async () => {
      // Create a topic
      const createdTopic = await TopicModel.create(topicData);

      // Update the topic
      const newTitle = 'Updated Title';
      await TopicModel.update(createdTopic.id, { title: newTitle });

      // Verify the topic is updated
      const updatedTopic = await TopicModel.findById(createdTopic.id);
      expect(updatedTopic.title).toBe(newTitle);
    });
  });

  describe('batchDelete', () => {
    it('should batch delete topics', async () => {
      // Create multiple topics
      const topic1 = await TopicModel.create(topicData);
      const topic2 = await TopicModel.create(topicData);

      await TopicModel.create(topicData);

      const ids = [topic1.id, topic2.id];
      // Batch delete the topics
      await TopicModel.batchDelete(ids);

      expect(await TopicModel.table.count()).toEqual(1);
    });
  });

  describe('queryAll', () => {
    it('should query all topics', async () => {
      // Create multiple topics
      await TopicModel.batchCreate([topicData, topicData]);

      // Query all topics
      const topics = await TopicModel.queryAll();

      // Verify all topics are queried
      expect(topics).toHaveLength(2);
    });
  });

  describe('queryByKeyword', () => {
    it('should query topics by keyword', async () => {
      // Create a topic with a unique title
      const uniqueTitle = 'Unique Title';
      await TopicModel.create({ ...topicData, title: uniqueTitle });

      // Query topics by the unique title
      const topics = await TopicModel.queryByKeyword(uniqueTitle);

      // Verify the correct topic is queried
      expect(topics).toHaveLength(1);
      expect(topics[0].title).toBe(uniqueTitle);
    });

    it('should not throw when matched messages have no topicId', async () => {
      const keyword = 'UniqueKeywordContent';
      // topic matching keyword + message without topicId (fresh chat, no topic assigned)
      const topic = await TopicModel.create({ ...topicData, title: keyword }, 'aaa');
      // second topic with id sorting after, so the cursor walks past the match
      await TopicModel.create({ ...topicData, title: 'other' }, 'zzz');
      await MessageModel.create({ content: keyword, role: 'user', sessionId: 'session1' });

      const topics = await TopicModel.queryByKeyword(keyword);

      expect(topics).toHaveLength(1);
      expect(topics[0].id).toBe(topic.id);
    });
  });
});
