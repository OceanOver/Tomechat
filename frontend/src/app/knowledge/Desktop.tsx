'use client';

import { Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { useKnowledgeStore } from '@/store/knowledge';

import KnowledgeCardList from './features/KnowledgeList';
import Layout from './layout.desktop';

const ModalCreateKnowledge = dynamic(() => import('./features/ModalCreateKnowledge'));

const DesktopPage = memo(() => {
  const { t } = useTranslation('knowledge');
  const [showModal, setShowModal] = useState(false);
  const hasKnowledge = useKnowledgeStore((s) => s.listData.length > 0);

  return (
    <>
      <Layout>
        <KnowledgeCardList onCreate={() => setShowModal(true)} />
        {hasKnowledge && (
          <div className="absolute bottom-6 right-6">
            <Button className="h-auto gap-2 rounded-full px-4 py-3 shadow-lg" onClick={() => setShowModal(true)}>
              <Plus />
              {t('createKnowledge')}
            </Button>
          </div>
        )}
      </Layout>
      <ModalCreateKnowledge open={showModal} toggleModal={setShowModal} />
    </>
  );
});
export default DesktopPage;
