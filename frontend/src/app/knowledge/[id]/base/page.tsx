'use client';

import { Check, Download, Inbox, Plus, Trash2, Undo2, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Empty } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useKnowledgeStore } from '@/store/knowledge';

import type { KnowledgeUpdateDocsParams } from '@/types/knowledge';

const ModalAddFile = dynamic(() => import('./ModalAddFile'));

interface DataType {
  id: React.Key;
  index: React.Key;
  loader: string;
  name: string;
  source: boolean;
  splitter: string;
  vector: boolean;
}

type ConfirmAction = 'reAdd' | 'rebuild' | 'delKnowledge' | null;

const App: React.FC<{ params: { id: string } }> = ({ params }) => {
  const { t } = useTranslation('knowledge');
  const router = useRouter();
  const [
    filesData,
    useFetchKnowledgeFilesList,
    useFetchKnowledgeDownloadDocs,
    useFetcDelInknowledgeDB,
    useFetcDelInVectorDB,
    useFetcRebuildVectorDB,
    useFetchKnowledgeDel,
    useFetcUpdateDocs
  ] = useKnowledgeStore((s) => [
    s.filesData,
    s.useFetchKnowledgeFilesList,
    s.useFetchKnowledgeDownloadDocs,
    s.useFetcDelInknowledgeDB,
    s.useFetcDelInVectorDB,
    s.useFetcRebuildVectorDB,
    s.useFetchKnowledgeDel,
    s.useFetcUpdateDocs
  ]);
  const kbName = decodeURIComponent(params.id);
  const { isLoading, mutate } = useFetchKnowledgeFilesList(kbName);

  const [delDocsLoading, setDelDocsLoading] = useState(false);
  const [delVSLoading, setDelVSLoading] = useState(false);
  const [rebuildVectorDBLoading, setRebuildVectorDBLoading] = useState(false);

  // rebuild progress
  const [rebuildStatus, setRebuildStatus] = useState<{ finished: number; msg: string; total: number }>({
    finished: 0,
    msg: '',
    total: 0,
  });

  const data: DataType[] = filesData.map(({ No, file_name, text_splitter, in_folder, in_db }) => ({
    id: file_name,
    index: No,
    loader: '',
    name: file_name,
    source: in_folder,
    splitter: text_splitter,
    vector: in_db,
  }));

  // Row selection (replaces the old antd Table rowSelection)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [isShowModal, setModal] = useState(false);
  const [isRebuildVectorDB, setIsRebuildVectorDB] = useState(false);

  const toggleRow = (name: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };
  const allChecked = data.length > 0 && selectedRows.size === data.length;
  const toggleAll = () => {
    setSelectedRows((prev) => (prev.size === data.length ? new Set<string>() : new Set(data.map((row) => row.name))));
  };
  const headerChecked = allChecked ? true : selectedRows.size > 0 ? 'indeterminate' : false;

  const selectedRowKeys = useMemo(() => [...selectedRows], [selectedRows]);
  const hasSelected = selectedRows.size > 0;

  const download = async () => {
    selectedRowKeys.forEach((docName) => {
      useFetchKnowledgeDownloadDocs(kbName, docName).catch(() => {
        toast.error(t('base.downloadFail', { name: docName }));
      });
    });
  };
  const reAddVectorDB = async () => {
    const _params: KnowledgeUpdateDocsParams = {
      chunk_overlap: 50,
      chunk_size: 250,
      docs: '',
      file_names: selectedRowKeys.map(decodeURIComponent),
      knowledge_base_name: kbName,
      not_refresh_vs_cache: false,
      override_custom_docs: false,
      to_vector_store: true,
      zh_title_enhance: false
    };
    await useFetcUpdateDocs(_params).catch(() => {
      toast.error(t('base.updateFail'));
    });
    mutate();
    setConfirmAction(null);
  };
  const rebuildVectorDB = async () => {
    setRebuildVectorDBLoading(true);
    setRebuildStatus({ finished: 0, msg: '', total: 0 });
    setConfirmAction(null);
    let sseBuf = '';
    try {
      useFetcRebuildVectorDB({
        'allow_empty_kb': true,
        'chunk_overlap': 50,
        'chunk_size': 250,
        // ponytail: embed_model not sent — backend get_default_embedding() decides
        'knowledge_base_name': kbName,
        'not_refresh_vs_cache': false,
        'vs_type': 'faiss',
        'zh_title_enhance': false,
      }, {
        onFinish: async (_output, context) => {
          if (context?.type === 'done') {
            toast.success(t('base.rebuildSuccess'));
          } else {
            toast.error(t('base.requestError'));
          }
          setRebuildVectorDBLoading(false);
          mutate();
        },
        onMessageHandle: (text) => {
          sseBuf += text;
          const lines = sseBuf.split('\n');
          sseBuf = lines.pop() ?? ''; // last line may be cut mid-chunk; keep it for the next chunk
          for (const line of lines) {
            if (!line.startsWith('data:')) continue; // skip ": ping" keep-alive comment lines
            try {
              const { msg, finished = 0, total = 0 } = JSON.parse(line.slice(5));
              if (msg || total) setRebuildStatus({ finished, msg, total });
            } catch { /* ignore non-JSON lines */ }
          }
        },
      });
    } catch {
      toast.error(t('base.requestError'));
      setRebuildVectorDBLoading(false);
    }
  };
  const delInVectorDB = async () => {
    setDelVSLoading(true);
    await useFetcDelInVectorDB({
      'delete_content': false,
      'file_names': [...selectedRowKeys],
      'knowledge_base_name': kbName, // keep the files
      'not_refresh_vs_cache': false
    }).catch(() => {
      toast.error(t('base.deleteFail'));
    });
    setDelVSLoading(false);
    setSelectedRows(new Set());
    mutate();
  };
  const delInknowledgeDB = async () => {
    setDelDocsLoading(true);
    await useFetcDelInknowledgeDB({
      'delete_content': true,
      'file_names': [...selectedRowKeys],
      'knowledge_base_name': kbName,
      'not_refresh_vs_cache': false
    }).catch(() => {
      toast.error(t('base.deleteFail'));
    });
    setDelDocsLoading(false);
    setSelectedRows(new Set());
    mutate();
  };
  const delKnowledge = async () => {
    const { code: resCode, msg: resMsg } = await useFetchKnowledgeDel(kbName);
    if (resCode !== 200) {
      toast.error(resMsg);
    } else {
      toast.success(resMsg);
      router.push('/knowledge');
    }
    setConfirmAction(null);
  };

  const confirmHandlers: Record<Exclude<ConfirmAction, null>, () => Promise<void> | void> = {
    delKnowledge: delKnowledge,
    reAdd: reAddVectorDB,
    rebuild: rebuildVectorDB,
  };

  return (
    <>
      <div className="flex w-full flex-col">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-5">
            <Button disabled={!hasSelected} onClick={download} variant="outline">
              <Download className="size-4" />
              {t('base.downloadSelected')}
            </Button>
            <Button disabled={!hasSelected} onClick={() => setConfirmAction('reAdd')} variant="outline">
              {t('base.reAddToVectorStore')}
            </Button>
            <Button
              className="text-destructive hover:text-destructive"
              disabled={!hasSelected || delVSLoading}
              onClick={delInVectorDB}
              variant="outline"
            >
              {delVSLoading && <Spinner className="size-4" />}
              <Trash2 className="size-4" />
              {t('base.deleteFromVectorStore')}
            </Button>
            <Button
              className="text-destructive hover:text-destructive"
              disabled={!hasSelected || delDocsLoading}
              onClick={delInknowledgeDB}
              variant="outline"
            >
              {delDocsLoading && <Spinner className="size-4" />}
              <Trash2 className="size-4" />
              {t('base.deleteFromKnowledgeBase')}
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <Button
              className="text-destructive hover:text-destructive"
              disabled={rebuildVectorDBLoading}
              onClick={() => setConfirmAction('delKnowledge')}
              variant="outline"
            >
              <Trash2 className="size-4" />
              {t('base.deleteKnowledgeBase')}
            </Button>
            <Button disabled={isLoading} onClick={() => { setIsRebuildVectorDB(false); setModal(true) }}>
              <Plus className="size-4" />
              {t('base.addFile')}
            </Button>
          </div>
        </div>
        <div className="relative">
          {rebuildVectorDBLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/70">
              <Spinner className="size-6" />
              <span className="text-sm font-medium">{t('base.rebuilding')}</span>
              {rebuildStatus.total > 1 && rebuildStatus.finished < rebuildStatus.total && (
                <div className="h-1.5 w-56 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-500"
                    style={{ width: `${Math.round((rebuildStatus.finished / rebuildStatus.total) * 100)}%` }}
                  />
                </div>
              )}
              {rebuildStatus.msg && (
                <span className="max-w-sm truncate text-xs text-muted-foreground tabular-nums">{rebuildStatus.msg}</span>
              )}
            </div>
          )}
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
              <Spinner className="size-6" />
            </div>
          )}
          {!isLoading && !data.length ? (
            <div className="flex min-h-[50vh] items-center justify-center pb-[8vh]">
              <div className="flex flex-col items-center">
                <Empty
                  boxed
                  description={t('empty.noFilesDesc')}
                  icon={Inbox}
                  title={t('empty.noFilesTitle')}
                />
                <Button
                  className="mt-6"
                  onClick={() => {
                    setIsRebuildVectorDB(false);
                    setModal(true);
                  }}
                >
                  <Plus className="size-4" />
                  {t('base.addFile')}
                </Button>
              </div>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    aria-checked={headerChecked === 'indeterminate' ? 'mixed' : undefined}
                    aria-label={t('base.selectAll')}
                    checked={headerChecked}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>{t('base.index')}</TableHead>
                <TableHead>{t('base.documentName')}</TableHead>
                <TableHead>{t('base.splitter')}</TableHead>
                <TableHead>{t('base.sourceFile')}</TableHead>
                <TableHead>{t('base.vectorStore')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((rowData) => (
                <TableRow data-state={selectedRows.has(rowData.name) ? 'selected' : undefined} key={rowData.name}>
                  <TableCell>
                    <Checkbox
                      aria-label={t('base.selectFile', { name: rowData.name })}
                      checked={selectedRows.has(rowData.name)}
                      onCheckedChange={() => toggleRow(rowData.name)}
                    />
                  </TableCell>
                  <TableCell>{rowData.index}</TableCell>
                  <TableCell>
                    <Link
                      className="text-primary underline-offset-4 hover:underline"
                      href={`/knowledge/${params.id}/base/${encodeURIComponent(rowData.name)}`}
                    >
                      {rowData.name}
                    </Link>
                  </TableCell>
                  <TableCell>{rowData.splitter}</TableCell>
                  <TableCell>
                    {rowData.source ? <Check className="size-4 text-emerald-600" /> : <X className="size-4 text-destructive" />}
                  </TableCell>
                  <TableCell>
                    {rowData.vector ? <Check className="size-4 text-emerald-600" /> : <X className="size-4 text-destructive" />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={6}>
                  <Button
                    className="text-destructive hover:text-destructive"
                    disabled={rebuildVectorDBLoading}
                    onClick={() => setConfirmAction('rebuild')}
                    variant="outline"
                  >
                    <Undo2 className="size-4" />
                    {t('base.rebuild')}
                  </Button>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
          )}
        </div>
      </div>
      <AlertDialog onOpenChange={(open) => !open && setConfirmAction(null)} open={confirmAction !== null}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === 'reAdd' && t('base.reAddConfirm')}
              {confirmAction === 'rebuild' && t('base.rebuildConfirm', { name: kbName })}
              {confirmAction === 'delKnowledge' && t('base.deleteConfirm', { name: kbName })}
            </AlertDialogTitle>
            <AlertDialogDescription>{t('base.irreversible')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction ? confirmHandlers[confirmAction] : undefined}
              variant={confirmAction === 'delKnowledge' ? 'destructive' : undefined}
            >
              {t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ModalAddFile
        isRebuildVectorDB={isRebuildVectorDB}
        kbName={kbName}
        open={isShowModal}
        selectedRowKeys={selectedRowKeys}
        setModalOpen={setModal}
        setSelectedRowKeys={(keys) => setSelectedRows(new Set(keys))}
      />
    </>
  );
};

export default App;
