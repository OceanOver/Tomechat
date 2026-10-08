import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useKnowledgeStore } from '@/store/knowledge';
import type { KnowledgeSearchDocsList, KnowledgeUpdateDocsParams } from '@/types/knowledge';

type ModalSegmentProps = {
  dataSource: KnowledgeSearchDocsList;
  fileId: string;
  kbName: string;
  toggleOpen: (open: boolean) => void;
};

const ModalSegment = memo<ModalSegmentProps>(({ kbName, fileId, dataSource = [], toggleOpen }) => {
  const { t } = useTranslation('knowledge');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [editContentInfo, useFetcUpdateDocs] = useKnowledgeStore((s) => [
    s.editContentInfo, s.useFetcUpdateDocs
  ]);
  const [textValue, setTextValue] = useState<string>(editContentInfo?.page_content || '');

  const onOk = async () => {
    const newDataSource = dataSource.map(item => ({
      ...item,
      page_content: item.id === editContentInfo?.id ? textValue : item.page_content
    }));
    const params: KnowledgeUpdateDocsParams = {
      chunk_overlap: 50,
      chunk_size: 250,
      docs: JSON.stringify({
        [decodeURIComponent(fileId)]: [...newDataSource]
      }),
      file_names: [decodeURIComponent(fileId)],
      knowledge_base_name: kbName,
      not_refresh_vs_cache: false,
      override_custom_docs: false,
      to_vector_store: true,
      zh_title_enhance: false
    };

    try {
      setUpdateLoading(true);
      const { code: resCode, msg: resMsg } = await useFetcUpdateDocs(params);
      setUpdateLoading(false);
      toggleOpen(false);

      if (resCode !== 200) {
        toast.error(resMsg);
        return;
      }
      toast.success(resMsg);
    } catch (err) {
      toast.error(`${err}`);
      setUpdateLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={toggleOpen} open>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('segment.title')}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center p-5">
          <Textarea
            className="min-h-[240px] max-h-[360px] w-[600px] max-w-full resize-none"
            onChange={(e) => setTextValue(e.target.value)}
            value={textValue}
          />
        </div>
        <DialogFooter>
          <Button onClick={() => toggleOpen(false)} variant="outline">{t('cancel')}</Button>
          <Button disabled={updateLoading} onClick={onOk}>
            {updateLoading ? t('submitting') : t('segment.confirmEdit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default ModalSegment;
