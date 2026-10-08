import {
  ChevronUp,
  CornerDownLeft,
  LucideCheck,
  LucideChevronDown,
  LucideCommand,
  LucidePlus,
} from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import StopLoadingIcon from '@/components/StopLoading';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SaveTopic from '@/features/ChatInput/Topic';
import { useSendMessage } from '@/features/ChatInput/useSend';
import { useIsMacOS } from '@/hooks/usePlatform';
import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors, preferenceSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

import DragUpload from './DragUpload';
import { LocalFiles } from './LocalFiles';

const Footer = memo<{ setExpand?: (expand: boolean) => void }>(({ setExpand }) => {
  const { t } = useTranslation('chat');
  const isMac = useIsMacOS();

  const [loading, stopGenerateMessage] = useChatStore((s) => [
    !!s.chatLoadingId,
    s.stopGenerateMessage,
  ]);
  const [useCmdEnterToSend, updatePreference] = useGlobalStore((s) => [
    preferenceSelectors.useCmdEnterToSend(s),
    s.updatePreference,
  ]);

  const model = useSessionStore(agentSelectors.currentAgentModel);
  const canUpload = useGlobalStore(modelProviderSelectors.modelEnabledUpload(model));

  const sendMessage = useSendMessage();

  const sendShortcut = useCmdEnterToSend ? (
    <span className="flex items-center gap-0.5 text-muted-foreground">
      {isMac ? <LucideCommand className="size-3.5" /> : <ChevronUp className="size-3.5" />}
      <CornerDownLeft className="size-3.5" />
    </span>
  ) : (
    <CornerDownLeft className="size-3.5 text-muted-foreground" />
  );

  const wrapperShortcut = useCmdEnterToSend ? (
    <CornerDownLeft className="size-3.5 text-muted-foreground" />
  ) : (
    <span className="flex items-center gap-0.5 text-muted-foreground">
      {isMac ? <LucideCommand className="size-3.5" /> : <ChevronUp className="size-3.5" />}
      <CornerDownLeft className="size-3.5" />
    </span>
  );

  return (
    <div className="flex flex-none items-end justify-between gap-2 px-6">
      <div className="flex items-center gap-2">
        {canUpload && (
          <>
            <DragUpload />
            <LocalFiles />
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="mr-3 flex items-center gap-1 text-xs text-muted-foreground">
          {sendShortcut}
          <span>{t('input.send')}</span>
          <span>/</span>
          {wrapperShortcut}
          <span>{t('input.warp')}</span>
        </div>
        <SaveTopic />
        <div className="flex min-w-[92px] items-center">
          {loading ? (
            <Button
              className="flex items-center gap-1.5"
              onClick={stopGenerateMessage}
              variant="outline"
            >
              <StopLoadingIcon />
              {t('input.stop')}
            </Button>
          ) : (
            <div className="inline-flex items-stretch">
              <Button
                className="rounded-r-none"
                onClick={() => {
                  sendMessage();
                  setExpand?.(false);
                }}
              >
                {t('input.send')}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    aria-label={t('input.more')}
                    className="w-7 rounded-l-none border-l border-primary-foreground/30 px-0"
                  >
                    <LucideChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="top">
                  <DropdownMenuItem
                    onClick={() => {
                      updatePreference({ useCmdEnterToSend: false });
                    }}
                  >
                    {!useCmdEnterToSend ? <LucideCheck className="size-4" /> : <div className="size-4" />}
                    {t('input.sendWithEnter')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      updatePreference({ useCmdEnterToSend: true });
                    }}
                  >
                    {useCmdEnterToSend ? <LucideCheck className="size-4" /> : <div className="size-4" />}
                    {t('input.sendWithCmdEnter', {
                      meta: isMac ? 'Cmd' : 'Ctrl',
                    })}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      sendMessage(true);
                    }}
                  >
                    <LucidePlus className="size-4" />
                    {t('input.onlyAdd')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default Footer;
