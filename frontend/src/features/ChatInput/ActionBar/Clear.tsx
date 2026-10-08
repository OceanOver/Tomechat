import { Eraser } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ActionIcon from '@/components/ActionIcon';
import HotKeys from '@/components/HotKeys';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { CLEAN_MESSAGE_KEY, META_KEY, PREFIX_KEY } from '@/const/hotkeys';
import { useChatStore } from '@/store/chat';
import { useFileStore } from '@/store/file';

const Clear = memo(() => {
  const { t: tCommon } = useTranslation('common');
  const { t: tChat } = useTranslation('chat');
  const [clearMessage] = useChatStore((s) => [s.clearMessage]);
  const [clearImageList] = useFileStore((s) => [s.clearImageList]);
  const hotkeys = [META_KEY, PREFIX_KEY, CLEAN_MESSAGE_KEY].join('+');
  const [confirmOpened, updateConfirmOpened] = useState(false);

  const resetConversation = useCallback(() => {
    clearMessage();
    clearImageList();
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <AlertDialog onOpenChange={updateConfirmOpened} open={confirmOpened}>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild>
              <ActionIcon aria-label={tChat('clearCurrentMessages')} icon={Eraser} />
            </AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <HotKeys desc={tChat('clearCurrentMessages')} keys={hotkeys} />
          </TooltipContent>
        </Tooltip>
        <AlertDialogContent>
          <AlertDialogTitle>{tChat('confirmClearCurrentMessages')}</AlertDialogTitle>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={resetConversation}
              variant="destructive"
            >
              {tCommon('ok')}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
});

export default Clear;
