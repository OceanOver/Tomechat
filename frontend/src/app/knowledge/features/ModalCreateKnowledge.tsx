'use client';

import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useKnowledgeStore } from '@/store/knowledge';

const DEFAULT_FIELD_VALUE = {
  // ponytail: embed_model not sent — backend get_default_embedding() default decides; vector store uses server default
  vector_store_type: 'faiss',
};

interface ModalCreateKnowledgeProps {
  open: boolean;
  toggleModal: (open: boolean) => void;
}

const CreateKnowledgeBase = memo<ModalCreateKnowledgeProps>(({ toggleModal, open }) => {
  const { t } = useTranslation('knowledge');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [knowledge_base_name, setKnowledgeBaseName] = useState('');
  const [kb_info, setKbInfo] = useState('');

  const [useFetchKnowledgeAdd, useFetchKnowledgeList] = useKnowledgeStore((s) => [
    s.useFetchKnowledgeAdd, s.useFetchKnowledgeList
  ]);
  const { mutate } = useFetchKnowledgeList();

  const onSubmit = async () => {
    // Manual validation (previously Form rules: name required)
    if (!knowledge_base_name.trim()) {
      toast.error(t('createModal.nameRequired'));
      return;
    }

    setConfirmLoading(true);
    const { code: resCode, msg: resMsg } = await useFetchKnowledgeAdd({
      kb_info,
      knowledge_base_name,
      vector_store_type: DEFAULT_FIELD_VALUE.vector_store_type,
    });
    setConfirmLoading(false);

    if (resCode !== 200) {
      toast.error(resMsg);
      return;
    }
    mutate();
    toggleModal(false);
  };

  return (
    <Dialog onOpenChange={toggleModal} open={open}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('createModal.title')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="knowledge_base_name">{t('createModal.name')}</Label>
            <Input
              autoFocus
              id="knowledge_base_name"
              onChange={(e) => setKnowledgeBaseName(e.target.value)}
              value={knowledge_base_name}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="kb_info">{t('createModal.intro')}</Label>
            <Input id="kb_info" onChange={(e) => setKbInfo(e.target.value)} value={kb_info} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => toggleModal(false)} variant="outline">{t('cancel')}</Button>
          <Button disabled={confirmLoading} onClick={onSubmit}>
            {confirmLoading ? t('submitting') : t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default CreateKnowledgeBase;
