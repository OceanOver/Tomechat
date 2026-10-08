import isEqual from 'fast-deep-equal';
import { AppWindow } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { SettingItem, SettingItemGroup } from '@/components/SettingItemGroup';
import { Input } from '@/components/ui/input';
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
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/store/chat';
import { useFileStore } from '@/store/file';
import { useGlobalStore } from '@/store/global';
import { settingsSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';

export interface SettingsCommonProps {
  showAccessCodeConfig: boolean;
}

type ConfirmAction = 'reset' | 'clear' | null;

const Common = memo<SettingsCommonProps>(({ showAccessCodeConfig }) => {
  const { t } = useTranslation('setting');

  const clearSessions = useSessionStore((s) => s.clearSessions);
  const clearSessionGroups = useSessionStore((s) => s.clearSessionGroups);
  const clearTopics = useChatStore((s) => s.removeAllTopics);
  const clearAllMessages = useChatStore((s) => s.clearAllMessages);
  const removeAllFiles = useFileStore((s) => s.removeAllFiles);
  const settings = useGlobalStore(settingsSelectors.currentSettings, isEqual);
  const setSettings = useGlobalStore((s) => s.setSettings);
  const resetSettings = useGlobalStore((s) => s.resetSettings);

  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const handleReset = useCallback(() => {
    resetSettings();
    setConfirmAction(null);
  }, [resetSettings]);

  const handleClear = useCallback(async () => {
    await clearSessions();
    await clearTopics();
    await removeAllFiles();
    await clearAllMessages();
    await clearSessionGroups();

    toast.success(t('danger.clear.success'));
    setConfirmAction(null);
  }, [clearAllMessages, clearSessionGroups, clearSessions, clearTopics, removeAllFiles, t]);

  return (
    <>
      <SettingItemGroup icon={AppWindow} title={t('settingSystem.title')}>
        {showAccessCodeConfig && (
          <SettingItem
            desc={t('settingSystem.accessCode.desc')}
            label={t('settingSystem.accessCode.title')}
          >
            <Input
              aria-label={t('settingSystem.accessCode.title')}
              autoComplete="new-password"
              className="w-56"
              onChange={(e) => setSettings({ password: e.target.value })}
              placeholder={t('settingSystem.accessCode.placeholder')}
              type="password"
              value={settings.password ?? ''}
            />
          </SettingItem>
        )}
        <SettingItem desc={t('danger.reset.title')} label={t('danger.reset.desc')}>
          <Button
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirmAction('reset')}
            size="sm"
            variant="outline"
          >
            {t('danger.reset.action')}
          </Button>
        </SettingItem>
        <SettingItem desc={t('danger.clear.desc')} label={t('danger.clear.title')}>
          <Button
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirmAction('clear')}
            size="sm"
            variant="outline"
          >
            {t('danger.clear.action')}
          </Button>
        </SettingItem>
      </SettingItemGroup>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
        open={confirmAction !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === 'reset'
                ? t('danger.reset.confirm')
                : t('danger.clear.confirm')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'reset'
                ? t('danger.reset.desc')
                : t('danger.clear.desc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel', { ns: 'common' })}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction === 'reset' ? handleReset : handleClear}
              variant="destructive"
            >
              {t('ok', { ns: 'common' })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

export default Common;
