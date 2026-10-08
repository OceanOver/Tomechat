import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';
import { settingsSelectors } from '@/store/global/selectors';

import { FormAction } from './style';

interface AccessCodeFormProps {
  id: string;
}

const AccessCodeForm = memo<AccessCodeFormProps>(({ id }) => {
  const { t } = useTranslation('error');
  const [password, setSettings] = useGlobalStore((s) => [
    settingsSelectors.currentSettings(s).password,
    s.setSettings,
  ]);
  const [resend, deleteMessage] = useChatStore((s) => [s.internalResendMessage, s.deleteMessage]);

  return (
    <>
      <FormAction
        avatar={'🗳'}
        description={t('unlock.password.description')}
        title={t('unlock.password.title')}
      >
        <Input
          autoComplete={'new-password'}
          className="w-64"
          onChange={(e) => {
            setSettings({ password: e.target.value });
          }}
          placeholder={t('unlock.password.placeholder')}
          type={'password'}
          value={password}
        />
      </FormAction>
      <div className="flex flex-col gap-3">
        <Button
          onClick={() => {
            resend(id);
            deleteMessage(id);
          }}
        >
          {t('unlock.confirm')}
        </Button>
        <Button
          onClick={() => {
            deleteMessage(id);
          }}
          variant="outline"
        >
          {t('unlock.closeMessage')}
        </Button>
      </div>
    </>
  );
});

export default AccessCodeForm;
