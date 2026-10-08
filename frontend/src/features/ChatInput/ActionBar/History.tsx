import { Timer, TimerOff } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import ActionIcon from '@/components/ActionIcon';
import SliderWithInput from '@/components/SliderWithInput';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

const History = memo(() => {
  const { t } = useTranslation('setting');

  const [historyCount, unlimited, updateAgentConfig] = useSessionStore((s) => {
    const config = agentSelectors.currentAgentConfig(s);
    return [config.historyCount, !config.enableHistoryCount, s.updateAgentConfig];
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div>
          <ActionIcon
            icon={unlimited ? TimerOff : Timer}
            placement={'bottom'}
            title={t(
              unlimited
                ? 'settingChat.enableHistoryCount.unlimited'
                : 'settingChat.enableHistoryCount.limited',
              { number: historyCount || 0 },
            )}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" side="top">
        <div className="flex items-center gap-4">
          <SliderWithInput
            className="w-40"
            disabled={unlimited}
            max={32}
            min={1}
            onChange={(v) => {
              updateAgentConfig({ historyCount: v });
            }}
            step={1}
            value={historyCount}
          />
          <div className="flex items-center gap-2">
            <Switch
              checked={unlimited}
              onCheckedChange={(checked) => {
                updateAgentConfig({ enableHistoryCount: !checked });
              }}
            />
            <Label className="text-xs">{t('settingChat.enableHistoryCount.alias')}</Label>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

export default History;
