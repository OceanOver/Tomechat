import { MoreHorizontal, Search, Trash } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ActionIcon from '@/components/ActionIcon';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';

import SidebarHeader from '../../components/SidebarHeader';
import TopicSearchBar from './TopicSearchBar';

const Header = memo(() => {
  const { t } = useTranslation('chat');
  const { t: tCommon } = useTranslation('common');
  const [topicLength, removeUnstarredTopic, removeAllTopic] = useChatStore((s) => [
    topicSelectors.currentTopicLength(s),
    s.removeUnstarredTopic,
    s.removeSessionTopics,
  ]);

  const [showSearch, setShowSearch] = useState(false);

  return showSearch ? (
    <div className="px-4 pb-1 pt-3">
      <TopicSearchBar onClear={() => setShowSearch(false)} />
    </div>
  ) : (
    <SidebarHeader
      actions={
        <>
          <ActionIcon icon={Search} onClick={() => setShowSearch(true)} size={'small'} title={t('searchTopics')} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div>
                <ActionIcon icon={MoreHorizontal} size={'small'} title={t('moreActions')} />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Trash className="size-4" />
                    {t('topic.removeUnstarred')}
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogTitle>{t('topic.confirmRemoveUnstarred')}</AlertDialogTitle>
                  <div className="flex justify-end gap-2">
                    <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        removeUnstarredTopic();
                      }}
                      variant="destructive"
                    >
                      {tCommon('ok')}
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash className="size-4" />
                    {t('topic.removeAll')}
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogTitle>{t('topic.confirmRemoveAll')}</AlertDialogTitle>
                  <div className="flex justify-end gap-2">
                    <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        removeAllTopic();
                      }}
                      variant="destructive"
                    >
                      {tCommon('ok')}
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
      title={`${t('topic.title')} ${topicLength > 1 ? topicLength + 1 : ''}`}
    />
  );
});

export default Header;
