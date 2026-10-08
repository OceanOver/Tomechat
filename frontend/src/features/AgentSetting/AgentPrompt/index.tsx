import { Bot } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import EditableMessage from '@/components/EditableMessage';
import { SettingItemGroup } from '@/components/SettingItemGroup';
import { Button } from '@/components/ui/button';

import { useStore } from '../store';
import TokenTag from './TokenTag';

const AgentPrompt = memo(() => {
  const { t } = useTranslation('setting');
  const [editing, setEditing] = useState(false);
  const systemRole = useStore((s) => s.config.systemRole);
  const setAgentConfig = useStore((s) => s.setAgentConfig);

  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
  };

  return (
    <SettingItemGroup extra={<TokenTag />} icon={Bot} title={t('settingAgent.prompt.title')}>
      <div className="flex flex-col gap-4 p-4">
        <EditableMessage
          classNames={{ textarea: 'bg-muted/50' }}
          editButtonSize="small"
          editing={editing}
          height="auto"
          inputType="ghost"
          onChange={(value) => setAgentConfig({ systemRole: value })}
          onEditingChange={setEditing}
          placeholder={t('settingAgent.prompt.placeholder')}
          showEditWhenEmpty
          text={{
            cancel: t('cancel', { ns: 'common' }),
            confirm: t('ok', { ns: 'common' }),
          }}
          value={systemRole}
        />
        {systemRole && !editing && (
          <div className="flex justify-end">
            <Button onClick={startEditing} size="sm">
              {t('edit', { ns: 'common' })}
            </Button>
          </div>
        )}
      </div>
    </SettingItemGroup>
  );
});

export default AgentPrompt;
