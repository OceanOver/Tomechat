import isEqual from 'fast-deep-equal';
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
import { useSessionStore } from '@/store/session';
import { sessionGroupSelectors } from '@/store/session/selectors';

interface RenameGroupModalProps {
  id: string;
  onCancel?: (e?: MouseEvent<HTMLButtonElement>) => void;
  open?: boolean;
}

const RenameGroupModal = memo<RenameGroupModalProps>(({ id, open, onCancel }) => {
  const { t } = useTranslation('chat');

  const updateSessionGroupName = useSessionStore((s) => s.updateSessionGroupName);
  const group = useSessionStore((s) => sessionGroupSelectors.getGroupById(id)(s), isEqual);

  const [input, setInput] = useState<string>();

  const handleOk = (e?: MouseEvent<HTMLButtonElement>) => {
    if (!input) return;
    if (input.length === 0 || input.length > 20) {
      toast.warning(t('sessionGroup.tooLong'));
      return;
    }
    updateSessionGroupName(id, input);
    toast.success(t('sessionGroup.renameSuccess'));
    onCancel?.(e);
  };

  return (
    <Dialog onOpenChange={(visible) => !visible && onCancel?.()} open={open}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('sessionGroup.rename')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="group-rename">{t('sessionGroup.nameLabel')}</Label>
          <Input
            autoFocus
            defaultValue={group?.name}
            id="group-rename"
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
});

export default RenameGroupModal;
