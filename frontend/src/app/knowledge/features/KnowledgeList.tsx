import { Inbox, Plus } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Empty } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { useKnowledgeStore } from '@/store/knowledge';

import KnowledgeCard from './KnowledgeCard';

interface KnowledgeCardListProps {
  onCreate?: () => void;
}

const RenderList = memo<{ onCreate?: () => void }>(({ onCreate }) => {
  const { t } = useTranslation('knowledge');
  const [listData, useFetchKnowledgeList] = useKnowledgeStore((s) => [
    s.listData, s.useFetchKnowledgeList
  ]);
  const { isLoading } = useFetchKnowledgeList();

  const list = listData.map(({ kb_info, kb_name }) => ({
    intro: kb_info,
    name: kb_name
  }));

  if (!isLoading && !listData.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center pb-[8vh]">
        <Empty
          boxed
          description={t('empty.noKnowledgeDesc')}
          icon={Inbox}
          title={t('empty.noKnowledgeTitle')}
        />
        <Button className="mt-6" onClick={onCreate}>
          <Plus className="size-4" />
          {t('createKnowledge')}
        </Button>
      </div>
    );
  }
  return (
    <div className="h-full min-h-[200px] w-full">
      <div className="relative h-full w-full">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-background/60">
            <Spinner className="h-5 w-5" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        )}
        <div className="flex flex-wrap items-start justify-start gap-5">
          {list.map((item, index) => {
            return <KnowledgeCard key={index} {...item} />;
          })}
        </div>
      </div>
    </div>
  );
});

const KnowledgeCardList = memo<KnowledgeCardListProps>(({ onCreate }) => {
  return <RenderList onCreate={onCreate} />;
});

export default KnowledgeCardList;
