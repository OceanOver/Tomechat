import { MoreVertical, PencilLine, Plus, Settings2, Trash } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ActionIcon from '@/components/ActionIcon';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSessionStore } from '@/store/session';

interface ActionsProps {
  id?: string;
  isCustomGroup?: boolean;
  isPinned?: boolean;
  onOpenChange?: (open: boolean) => void;
  openConfigModal: () => void;
  openRenameModal?: () => void;
}

const Actions = memo<ActionsProps>(
  ({ id, openRenameModal, openConfigModal, onOpenChange, isCustomGroup, isPinned }) => {
    const { t } = useTranslation('chat');
    const { t: tCommon } = useTranslation('common');
    const [confirmOpen, setConfirmOpen] = useState(false);

    const [createSession, removeSessionGroup] = useSessionStore((s) => [
      s.createSession,
      s.removeSessionGroup,
    ]);

    const stop = (e: { stopPropagation: () => void }) => e.stopPropagation();

    return (
      <>
        <DropdownMenu onOpenChange={onOpenChange}>
          <DropdownMenuTrigger asChild onClick={stop}>
            <div>
              <ActionIcon icon={MoreVertical} size={'small'} title={t('moreActions')} />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={stop}>
            <DropdownMenuItem
              onSelect={() => createSession({ group: id, pinned: isPinned })}
            >
              <Plus className="size-4" />
              {t('newAgent')}
            </DropdownMenuItem>
            {isCustomGroup && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => {
                    openRenameModal?.();
                  }}
                >
                  <PencilLine className="size-4" />
                  {t('sessionGroup.rename')}
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem
              onSelect={() => {
                openConfigModal();
              }}
            >
              <Settings2 className="size-4" />
              {t('sessionGroup.config')}
            </DropdownMenuItem>
            {isCustomGroup && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={() => {
                    setConfirmOpen(true);
                  }}
                >
                  <Trash className="size-4" />
                  {t('delete', { ns: 'common' })}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
          <AlertDialogContent onClick={stop}>
            <AlertDialogTitle>{t('sessionGroup.confirmRemoveGroupAlert')}</AlertDialogTitle>
            <div className="flex justify-end gap-2">
              <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (!id) return;
                  removeSessionGroup(id);
                }}
                variant="destructive"
              >
                {tCommon('ok')}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  },
);

export default Actions;
