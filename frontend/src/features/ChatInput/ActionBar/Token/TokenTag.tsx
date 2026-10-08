import numeral from 'numeral';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import TokenTag from '@/components/TokenTag';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTokenCount } from '@/hooks/useTokenCount';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

const format = (number: number) => numeral(number).format('0,0');

const Token = memo(() => {
  const { t } = useTranslation('chat');

  const [input, messageString] = useChatStore((s) => [
    s.inputMessage,
    chatSelectors.chatsMessageString(s),
  ]);

  const [systemRole, model] = useSessionStore((s) => [
    agentSelectors.currentAgentSystemRole(s),
    agentSelectors.currentAgentModel(s) as string,
  ]);

  const maxTokens = useGlobalStore(modelProviderSelectors.modelMaxToken(model));

  // Chat usage token
  const inputTokenCount = useTokenCount(input);

  const chatsToken = useTokenCount(messageString) + inputTokenCount;

  // SystemRole token
  const systemRoleToken = useTokenCount(systemRole);

  // Total token
  const totalToken = systemRoleToken + chatsToken;
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="ml-2">
            <TokenTag
              displayMode={'used'}
              maxValue={maxTokens}
              text={{
                overload: t('tokenTag.overload'),
                remained: t('tokenTag.remained'),
                used: t('tokenTag.used'),
              }}
              value={totalToken}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="flex w-[150px] flex-col">
            <Row label={t('tokenDetails.systemRole')} value={format(systemRoleToken)} />
            <Row label={t('tokenDetails.chats')} value={format(chatsToken)} />
            <Row label={t('tokenDetails.used')} value={format(totalToken)} />
            <div className="mt-2" />
            <Row label={t('tokenDetails.total')} value={format(maxTokens)} />
            <Row label={t('tokenDetails.rest')} value={format(maxTokens - totalToken)} />
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

const Row = memo<{ label: string; value: string }>(({ label, value }) => (
  <div className="flex items-center justify-between gap-2">
    <span>{label}</span>
    <span>{value}</span>
  </div>
));

Row.displayName = 'Row';

export default Token;
