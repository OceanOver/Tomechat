import { Plus } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { useSessionStore } from '@/store/session';

const AddButton = memo<{ groupId?: string }>(({ groupId }) => {
  const { t } = useTranslation('chat');
  const createSession = useSessionStore((s) => s.createSession);

  return (
    <div className="mx-2 my-2">
      <Button
        className="h-9 w-full"
        onClick={() => createSession({ group: groupId })}
        variant="outline"
      >
        <Plus className="size-4" />
        {t('newAgent')}
      </Button>
    </div>
  );
});

export default AddButton;
