import { Plus } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import SortableList from '@/components/SortableList';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSessionStore } from '@/store/session';
import { sessionGroupSelectors } from '@/store/session/selectors';
import { SessionGroupItem } from '@/types/session';

import GroupItem from './ConfigGroupModalGroupItem';

const ConfigGroupModal = memo<{ onCancel?: () => void; open?: boolean }>(({ open, onCancel }) => {
  const { t } = useTranslation('chat');
  const sessionGroupItems = useSessionStore(sessionGroupSelectors.sessionGroupItems);
  const [addSessionGroup, updateSessionGroupSort] = useSessionStore((s) => [
    s.addSessionGroup,
    s.updateSessionGroupSort,
  ]);

  return (
    <Dialog onOpenChange={(visible) => !visible && onCancel?.()} open={open}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('sessionGroup.config')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <SortableList
            items={sessionGroupItems as SessionGroupItem[]}
            onChange={(items: SessionGroupItem[]) => {
              updateSessionGroupSort(items);
            }}
            renderItem={(item: SessionGroupItem) => (
              <SortableList.Item
                className="flex h-9 items-center justify-between gap-1 rounded-md px-2 transition-colors hover:bg-accent"
                id={item.id}
              >
                <GroupItem {...item} />
              </SortableList.Item>
            )}
          />
          <Button
            className="w-full"
            onClick={() => addSessionGroup(t('sessionGroup.newGroup'))}
            variant="outline"
          >
            <Plus className="size-4" />
            {t('sessionGroup.createGroup')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default ConfigGroupModal;
