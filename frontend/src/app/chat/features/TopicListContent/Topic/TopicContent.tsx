import { LucideCopy, MoreVertical, PencilLine, Star, Trash, Wand2 } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ActionIcon from '@/components/ActionIcon';
import EditableText from '@/components/EditableText';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useChatStore } from '@/store/chat';

interface TopicContentProps {
  fav?: boolean;
  id: string;
  title: string;
}

const TopicContent = memo<TopicContentProps>(({ id, title, fav }) => {
  const { t } = useTranslation('common');
  const { t: tChat } = useTranslation('chat');
  const { t: tCommon } = useTranslation('common');

  const [favoriteTopic, updateTopicTitle, removeTopic, autoRenameTopicTitle, duplicateTopic] =
    useChatStore((s) => [s.favoriteTopic, s.updateTopicTitle, s.removeTopic, s.autoRenameTopicTitle, s.duplicateTopic]);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const toggleEditing = (visible?: boolean) => {
    useChatStore.setState({ topicRenamingId: visible ? id : '' });
  };

  const editing = useChatStore((s) => s.topicRenamingId === id);

  const menuItems = useMemo(
    () => [
      {
        icon: Wand2,
        key: 'autoRename',
        label: tChat('topic.actions.autoRename'),
        onSelect: () => {
          autoRenameTopicTitle(id);
        },
      },
      {
        icon: PencilLine,
        key: 'rename',
        label: t('rename'),
        onSelect: () => {
          toggleEditing(true);
        },
      },
      { divider: true, key: 'd1' },
      {
        icon: LucideCopy,
        key: 'duplicate',
        label: tChat('topic.actions.duplicate'),
        onSelect: () => {
          duplicateTopic(id);
        },
      },
      { divider: true, key: 'd2' },
    ],
    [autoRenameTopicTitle, duplicateTopic, id, t, tChat],
  );

  return (
    <div
      className="flex w-full items-center justify-between gap-2"
      onDoubleClick={(e) => {
        if (!id) return;
        if (e.altKey) toggleEditing(true);
      }}
    >
      <ActionIcon
        active={fav}
        className={fav ? 'text-amber-500' : undefined}
        icon={Star}
        onClick={(e) => {
          e.stopPropagation();
          if (!id) return;
          favoriteTopic(id, !fav);
        }}
        size={'small'}
      />
      {!editing ? (
        <span className="line-clamp-1 flex-1 text-start" title={title}>
          {title}
        </span>
      ) : (
        <EditableText
          className="flex-1"
          editing={editing}
          onChangeEnd={(v) => {
            if (title !== v) {
              updateTopicTitle(id, v);
            }
            toggleEditing(false);
          }}
          onEditingChange={toggleEditing}
          showEditIcon={false}
          size={'small'}
          type={'pure'}
          value={title}
        />
      )}
      {!editing && (
        <DropdownMenu>
          {/* Menu content renders via portal outside the row. If mounted conditionally on hover,
              moving the pointer into the menu triggers mouseleave and unmounts it right after
              opening — always mount here and control visibility with CSS only */}
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <div className="invisible focus-within:visible group-hover:visible">
              <ActionIcon icon={MoreVertical} size={'small'} title={tChat('moreActions')} />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            {menuItems.map((item) =>
              'divider' in item && item.divider ? (
                <DropdownMenuSeparator key={item.key} />
              ) : (
                <DropdownMenuItem key={item.key} onSelect={item.onSelect}>
                  {item.icon && <item.icon className="size-4" />}
                  {item.label}
                </DropdownMenuItem>
              ),
            )}
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => {
                setConfirmOpen(true);
              }}
            >
              <Trash className="size-4" />
              {t('delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>{tChat('topic.confirmRemoveTopic')}</AlertDialogTitle>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!id) return;
                removeTopic(id);
              }}
              variant="destructive"
            >
              {tCommon('ok')}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

export default TopicContent;
