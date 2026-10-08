'use client';

import { Inbox } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import React, { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { useKnowledgeStore } from '@/store/knowledge';

const ModalSegment = dynamic(() => import('./ModalSegment'));

const App = memo((props: { params: { fileId: string, id: string; } }) => {
  const { t } = useTranslation('knowledge');
  const { params: { id, fileId } } = props;
  const kbName = decodeURIComponent(id);
  const [isModalOpen, toggleOpen] = useState(false);
  const [fileSearchData, useFetchSearchDocs, setEditContentInfo] = useKnowledgeStore((s) => [
    s.fileSearchData, s.useFetchSearchDocs, s.setEditContentInfo
  ]);
  const { isLoading, mutate } = useFetchSearchDocs({
    file_name: decodeURIComponent(fileId),
    knowledge_base_name: kbName,
    query: '',
    top_k: 3
  });

  useEffect(() => {
    !isModalOpen && mutate();
  }, [isModalOpen])

  const handleSegmentCardClick: typeof setEditContentInfo = (item) => {
    setEditContentInfo({ ...item });
    toggleOpen(true);
  };

  if (!isLoading && !fileSearchData.length) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center pb-[8vh] pt-3">
        <Empty
          boxed
          description={t('empty.noSegmentsDesc')}
          icon={Inbox}
          title={t('empty.noSegmentsTitle')}
        />
        <Button asChild className="mt-6" variant="outline">
          <Link href={`/knowledge/${id}/base`}>{t('empty.backToFiles')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full pt-3">
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-background/60">
            <Spinner className="size-5" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {fileSearchData.map((item, i) => (
            <Card
              className="cursor-pointer overflow-hidden transition-transform hover:ring-1 hover:ring-foreground active:scale-95"
              key={item.id ?? i}
              onClick={() => handleSegmentCardClick(item)}
            >
              {item.page_content}
            </Card>
          ))}
        </div>
        {isModalOpen && (
          <ModalSegment
            dataSource={[...fileSearchData]}
            fileId={props.params.fileId}
            kbName={kbName}
            toggleOpen={toggleOpen}
          />
        )}
      </div>
    </div>
  );
});

export default App;
