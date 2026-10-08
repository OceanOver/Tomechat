import { PencilLine, Trash } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import ActionIcon from '@/components/ActionIcon';
import EditableText from '@/components/EditableText';
import SortableList from '@/components/SortableList';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useSessionStore } from '@/store/session';
import { SessionGroupItem } from '@/types/session';

const GroupItem = memo<SessionGroupItem>(({ id, name }) => {
  const { t } = useTranslation('chat');
  const { t: tCommon } = useTranslation('common');

  const [editing, setEditing] = useState(false);
  const [updateSessionGroupName, removeSessionGroup] = useSessionStore((s) => [
    s.updateSessionGroupName,
    s.removeSessionGroup,
  ]);

  return (
    <>
      <SortableList.DragHandle />
      {!editing ? (
        <>
          <span className="line-clamp-1 flex-1 text-start text-sm">{name}</span>
          <ActionIcon icon={PencilLine} onClick={() => setEditing(true)} size={'small'} title={t('sessionGroup.rename')} />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <div>
                <ActionIcon icon={Trash} size={'small'} title={tCommon('delete')} />
              </div>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>{t('sessionGroup.confirmRemoveGroupAlert')}</AlertDialogTitle>
              <div className="flex justify-end gap-2">
                <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
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
      ) : (
        <EditableText
          className="flex-1"
          editing={editing}
          onChangeEnd={(input) => {
            if (name !== input) {
              if (!input) return;
              if (input.length === 0 || input.length > 20) {
                toast.warning(t('sessionGroup.tooLong'));
                return;
              }
              updateSessionGroupName(id, input);
              toast.success(t('sessionGroup.renameSuccess'));
            }
            setEditing(false);
          }}
          onEditingChange={(e) => setEditing(e)}
          showEditIcon={false}
          size={'small'}
          type={'pure'}
          value={name}
        />
      )}
    </>
  );
});

export default GroupItem;
