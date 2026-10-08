import { Pencil, Trash2, TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useKnowledgeStore } from '@/store/knowledge';

interface KnowLedgeCardProps {
  embed_model?: string;
  intro: string;
  name: string;
  vector_store_type?: string;
}

const KnowledgeCard: React.FC<KnowLedgeCardProps> = (props: KnowLedgeCardProps) => {
  const [useFetchKnowledgeDel, useFetchKnowledgeList, setEditKnowledge] = useKnowledgeStore((s) => [
    s.useFetchKnowledgeDel, s.useFetchKnowledgeList, s.setEditKnowledge
  ]);
  const { mutate } = useFetchKnowledgeList();
  const { t } = useTranslation('knowledge');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const { name, intro } = props;
  const router = useRouter();

  const handleCardEditClick = () => {
    setEditKnowledge({
      embed_model: props.embed_model,
      kb_info: props.intro,
      knowledge_base_name: props.name,
      vector_store_type: props.vector_store_type,
    });
    router.push(`/knowledge/${encodeURIComponent(name)}/base`);
  };

  const delClick = async () => {
    const { code: resCode, msg: resMsg } = await useFetchKnowledgeDel(name);
    if (resCode !== 200) {
      toast.error(resMsg);
    } else {
      toast.success(resMsg);
      mutate();
    }
    setConfirmOpen(false);
  };

  return (
    <>
      <Card className="mt-4 w-[300px]">
        <CardHeader>
          <CardTitle className="text-base">{name}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{intro}</CardContent>
        <CardFooter className="justify-around gap-2 border-t px-2 py-1">
          <button
            aria-label={t('card.edit')}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={handleCardEditClick}
          >
            <Pencil className="size-4" />
          </button>
          <button
            aria-label={t('card.delete')}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="size-4" />
          </button>
        </CardFooter>
      </Card>
      <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <TriangleAlert aria-hidden className="size-5 text-amber-500" />
              {t('card.deleteConfirmTitle', { name })}
            </AlertDialogTitle>
            <AlertDialogDescription>{t('card.deleteConfirmDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={delClick} variant="destructive">
              {t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
KnowledgeCard.displayName = 'KnowledgeCard';

export default KnowledgeCard;
