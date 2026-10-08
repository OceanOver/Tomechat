import isEqual from 'fast-deep-equal';
import {
  Check,
  ListTree,
  LucideCopy,
  LucidePlus,
  MoreVertical,
  Pin,
  PinOff,
  Trash,
} from 'lucide-react';
import { memo, useMemo, useState } from 'react';
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSessionStore } from '@/store/session';
import { sessionHelpers } from '@/store/session/helpers';
import { sessionGroupSelectors, sessionSelectors } from '@/store/session/selectors';
import { SessionDefaultGroup } from '@/types/session';

interface ActionProps {
  group: string | undefined;
  id: string;
  openCreateGroupModal: () => void;
  setOpen: (open: boolean) => void;
}

const Actions = memo<ActionProps>(({ group, id, openCreateGroupModal, setOpen }) => {
  const { t } = useTranslation('chat');
  const { t: tCommon } = useTranslation('common');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const sessionCustomGroups = useSessionStore(sessionGroupSelectors.sessionGroupItems, isEqual);
  const [pin, removeSession, pinSession, duplicateSession, updateSessionGroup] = useSessionStore(
    (s) => {
      const session = sessionSelectors.getSessionById(id)(s);
      return [
        sessionHelpers.getSessionPinned(session),
        s.removeSession,
        s.pinSession,
        s.duplicateSession,
        s.updateSessionGroupId,
      ];
    },
  );

  const isDefault = group === SessionDefaultGroup.Default;

  const moveGroupChildren = useMemo(
    () => [
      ...sessionCustomGroups.map(({ id: groupId, name }) => ({
        icon: group === groupId ? Check : undefined,
        key: groupId,
        label: name,
        onSelect: () => {
          updateSessionGroup(id, groupId);
        },
      })),
      {
        icon: isDefault ? Check : undefined,
        key: 'defaultList',
        label: t('defaultList'),
        onSelect: () => {
          updateSessionGroup(id, SessionDefaultGroup.Default);
        },
      },
      {
        icon: LucidePlus,
        key: 'createGroup',
        label: t('sessionGroup.createGroup'),
        onSelect: () => {
          openCreateGroupModal();
        },
      },
    ],
    [group, id, isDefault, openCreateGroupModal, sessionCustomGroups, t, updateSessionGroup],
  );

  return (
    <>
      <DropdownMenu onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <div>
            <ActionIcon icon={MoreVertical} size={'small'} title={t('moreActions')} />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onSelect={() => pinSession(id, !pin)}>
            {pin ? <PinOff className="size-4" /> : <Pin className="size-4" />}
            {t(pin ? 'pinOff' : 'pin')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              duplicateSession(id);
            }}
          >
            <LucideCopy className="size-4" />
            {t('duplicate', { ns: 'common' })}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ListTree className="size-4" />
              {t('sessionGroup.moveGroup')}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="min-w-36">
              {moveGroupChildren.map((child) => (
                <div key={child.key}>
                  {child.key === 'createGroup' && <DropdownMenuSeparator />}
                  <DropdownMenuItem onSelect={child.onSelect}>
                    {child.icon ? <child.icon className="size-4" /> : <div className="size-4" />}
                    {child.label}
                  </DropdownMenuItem>
                </div>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
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
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>{t('confirmRemoveSessionItemAlert')}</AlertDialogTitle>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
              {tCommon('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.stopPropagation();
                removeSession(id);
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
});

export default Actions;
