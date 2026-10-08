import isEqual from 'fast-deep-equal';
import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { X } from 'lucide-react';

import { imageUrl } from '@/const/url';
import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';
import { useGlobalStore } from '@/store/global';
import { ChatTopic } from '@/types/topic';

import { SkeletonList } from './SkeletonList';
import TopicItem from './TopicItem';

/** Empty-state guide card (replaces the upstream EmptyCard) */
const EmptyGuide = memo<{ onDismiss: () => void }>(({ onDismiss }) => {
  const { t } = useTranslation('chat');

  return (
    <div className="relative mx-auto mb-1.5 w-[200px] rounded-md border bg-background text-center shadow-sm">
      <button
        aria-label="dismiss"
        className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
        onClick={onDismiss}
        type="button"
      >
        <X className="size-3.5" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={t('topic.guide.desc')}
        className="h-[120px] w-full rounded-t-md object-cover"
        src={imageUrl('empty_topic_light.webp')}
      />
      <div className="p-2">
        <div className="text-sm font-medium">{t('topic.guide.title')}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{t('topic.guide.desc')}</div>
      </div>
    </div>
  );
});

export const Topic = memo(() => {
  const { t } = useTranslation('chat');
  const [topicsInit, activeTopicId, topicLength] = useChatStore((s) => [
    s.topicsInit,
    s.activeTopicId,
    topicSelectors.currentTopicLength(s),
  ]);
  const [visible, updateGuideState] = useGlobalStore((s) => [
    s.preference.guide?.topic,
    s.updateGuideState,
  ]);

  const topics = useChatStore(
    (s) => [
      {
        favorite: false,
        id: 'default',
        title: t('topic.defaultTitle'),
      } as ChatTopic,
      ...topicSelectors.displayTopics(s),
    ],
    isEqual,
  );

  const itemContent = useCallback(
    ({ favorite, id, title }: ChatTopic) =>
      !id || id === 'default' ? (
        <TopicItem active={!activeTopicId} fav={favorite} title={title} />
      ) : (
        <TopicItem active={activeTopicId === id} fav={favorite} id={id} key={id} title={title} />
      ),
    [activeTopicId],
  );

  const showGuide = useMemo(() => topicLength === 0 && visible !== false, [topicLength, visible]);

  return !topicsInit ? (
    <SkeletonList />
  ) : (
    <div className="mb-3 flex h-full flex-col gap-0.5">
      {showGuide && (
        <EmptyGuide
          onDismiss={() => {
            updateGuideState({ topic: false });
          }}
        />
      )}
      <div className="flex flex-col gap-0.5">
        {topics.map((topic, index) => (
          <React.Fragment key={topic.id ?? index}>{itemContent(topic)}</React.Fragment>
        ))}
      </div>
    </div>
  );
});
