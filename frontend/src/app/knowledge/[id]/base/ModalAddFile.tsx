import { Inbox, X } from 'lucide-react';
import React, { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import FileUpload from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Empty } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useKnowledgeStore } from '@/store/knowledge';
import type { ReAddVectorDBParams } from '@/types/knowledge';

type ModalAddFileProps = {
  initialValue?: Record<string, unknown>;
  isRebuildVectorDB?: boolean;
  kbName: string;
  open: boolean;
  selectedRowKeys: string[];
  setModalOpen: (open: boolean) => void;
  setSelectedRowKeys: (keys: string[]) => void;
};

const DEFAULT_FORM_VALUES = {
  chunk_overlap: 50,
  chunk_size: 250,
  override: true,
  to_vector_store: true,
};

const BooleanRadioField = memo<{
  id: string;
  label: string;
  onChange: (value: boolean) => void;
  value: boolean;
}>(({ id, label, onChange, value }) => {
  const { t } = useTranslation('knowledge');
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <Label htmlFor={id}>{label}</Label>
      <RadioGroup
        className="flex flex-row items-center gap-4"
        id={id}
        onValueChange={(v) => onChange(v === 'true')}
        value={String(value)}
      >
        <label className="flex cursor-pointer items-center gap-2 text-sm" htmlFor={`${id}-yes`}>
          <RadioGroupItem id={`${id}-yes`} value="true" />
          {t('yes')}
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm" htmlFor={`${id}-no`}>
          <RadioGroupItem id={`${id}-no`} value="false" />
          {t('no')}
        </label>
      </RadioGroup>
    </div>
  );
});
BooleanRadioField.displayName = 'BooleanRadioField';

const ModalAddFile = memo<ModalAddFileProps>(({ open, setModalOpen, setSelectedRowKeys, selectedRowKeys, kbName, initialValue, isRebuildVectorDB }) => {
  const { t } = useTranslation('knowledge');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [useFetchKnowledgeUploadDocs, useFetchKnowledgeFilesList, useFetcReAddVectorDB] = useKnowledgeStore((s) => [
    s.useFetchKnowledgeUploadDocs, s.useFetchKnowledgeFilesList,
    s.useFetcReAddVectorDB
  ]);
  const { mutate } = useFetchKnowledgeFilesList(kbName);

  const [fileList, setFileList] = useState<File[]>([]);
  const [values, setValues] = useState<Record<string, unknown>>({
    ...DEFAULT_FORM_VALUES,
    ...initialValue,
  });

  // Mirror the original Modal's destroyOnClose behavior: reset on every open
  useEffect(() => {
    if (open) {
      setFileList([]);
      setValues({ ...DEFAULT_FORM_VALUES, ...initialValue });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const setFieldValue = (key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async () => {
    if (isRebuildVectorDB) {
      // Re-add to vector library
      setConfirmLoading(true);
      await useFetcReAddVectorDB({
        ...values,
        'file_names': selectedRowKeys,
        'knowledge_base_name': kbName,
      } as unknown as ReAddVectorDBParams).catch(() => {
        toast.error(t('fileModal.updateFail'));
      });
      setConfirmLoading(false);
      setSelectedRowKeys([]);
      return;
    }

    if (!fileList.length) {
      toast.error(t('fileModal.fileRequired'));
      return;
    }

    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('files', file);
    });
    for (const key in values) {
      formData.append(key, values[key] as never);
    }
    formData.append('knowledge_base_name', kbName);

    try {
      setConfirmLoading(true);
      const { code: resCode, msg: resMsg } = await useFetchKnowledgeUploadDocs(formData);
      setConfirmLoading(false);

      if (resCode !== 200) {
        toast.error(resMsg);
        return;
      }
      toast.success(resMsg);
      mutate();
      setModalOpen(false);
    } catch (err) {
      toast.error(`${err}`);
      setConfirmLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={setModalOpen} open={open}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isRebuildVectorDB ? t('fileModal.reAddTitle') : t('fileModal.title')}</DialogTitle>
        </DialogHeader>

        {!isRebuildVectorDB && (
          <>
            <div className="py-1">
              <FileUpload
                className="flex w-full flex-col gap-2 rounded-md border-2 border-dashed border-input px-6 py-8 text-center transition-colors hover:bg-accent/50"
                multiple
                onFileSelect={(files) => setFileList((prev) => [...prev, ...files])}
              >
                <Empty description={t('fileModal.uploadHint')} icon={Inbox} />
              </FileUpload>
            </div>
            {!!fileList.length && (
              <ul className="flex flex-col gap-1">
                {fileList.map((file, index) => (
                  <li className="flex items-center justify-between gap-2 rounded px-2 py-1 text-sm hover:bg-accent/50" key={`${file.name}-${index}`}>
                    <span className="min-w-0 flex-1 truncate">{file.name}</span>
                    <button
                      aria-label={t('fileModal.remove', { name: file.name })}
                      className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      onClick={() => setFileList((prev) => prev.filter((_, i) => i !== index))}
                    >
                      <X className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <BooleanRadioField
              id="override"
              label={t('fileModal.override')}
              onChange={(v) => setFieldValue('override', v)}
              value={Boolean(values.override)}
            />
          </>
        )}

        <BooleanRadioField
          id="to_vector_store"
          label={t('fileModal.vectorize')}
          onChange={(v) => setFieldValue('to_vector_store', v)}
          value={Boolean(values.to_vector_store)}
        />
        <BooleanRadioField
          id="zh_title_enhance"
          label={t('fileModal.zhTitleEnhance')}
          onChange={(v) => setFieldValue('zh_title_enhance', v)}
          value={Boolean(values.zh_title_enhance)}
        />
        <BooleanRadioField
          id="not_refresh_vs_cache"
          label={t('fileModal.notRefreshVsCache')}
          onChange={(v) => setFieldValue('not_refresh_vs_cache', v)}
          value={Boolean(values.not_refresh_vs_cache)}
        />

        <div className="flex items-center justify-between gap-4 py-2">
          <Label htmlFor="chunk_size">{t('fileModal.chunkSize')}</Label>
          <Input
            className="w-52"
            id="chunk_size"
            min={0}
            onChange={(e) => setFieldValue('chunk_size', Number(e.target.value))}
            type="number"
            value={values.chunk_size as number}
          />
        </div>
        <div className="flex items-center justify-between gap-4 py-2">
          <Label htmlFor="chunk_overlap">{t('fileModal.chunkOverlap')}</Label>
          <Input
            className="w-52"
            id="chunk_overlap"
            min={0}
            onChange={(e) => setFieldValue('chunk_overlap', Number(e.target.value))}
            type="number"
            value={values.chunk_overlap as number}
          />
        </div>

        <DialogFooter>
          <Button onClick={() => setModalOpen(false)} variant="outline">{t('cancel')}</Button>
          <Button disabled={confirmLoading} onClick={onSubmit}>
            {confirmLoading ? t('submitting') : t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default ModalAddFile;
