import { MouseEvent, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';

interface CreateGroupModalProps {
  id: string;
  onCancel?: (e?: MouseEvent<HTMLButtonElement>) => void;
  open?: boolean;
}

const CreateGroupModal = memo<CreateGroupModalProps>(
  ({ id, open, onCancel }: CreateGroupModalProps) => {
    const { t } = useTranslation('chat');

    const toggleExpandSessionGroup = useGlobalStore((s) => s.toggleExpandSessionGroup);
    const [updateSessionGroup, addCustomGroup] = useSessionStore((s) => [
      s.updateSessionGroupId,
      s.addSessionGroup,
    ]);
    const [input, setInput] = useState('');

    const handleOk = async (e?: MouseEvent<HTMLButtonElement>) => {
      if (!input) return;

      if (input.length === 0 || input.length > 20) {
        toast.warning(t('sessionGroup.tooLong'));
        return;
      }

      const groupId = await addCustomGroup(input);
      await updateSessionGroup(id, groupId);
      toggleExpandSessionGroup(groupId, true);

      toast.success(t('sessionGroup.createSuccess'));
      onCancel?.(e);
    };

    return (
      <Dialog onOpenChange={(visible) => !visible && onCancel?.()} open={open}>
        <DialogContent className="max-w-sm" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>{t('sessionGroup.createGroup')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="group-name">{t('sessionGroup.nameLabel')}</Label>
            <Input
              autoFocus
              id="group-name"
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('sessionGroup.inputPlaceholder')}
              value={input}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={() => onCancel?.()} size="sm" variant="ghost">
              {t('cancel', { ns: 'common' })}
            </Button>
            <Button onClick={handleOk} size="sm">
              {t('ok', { ns: 'common' })}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  },
);

export default CreateGroupModal;
