import { Pin } from 'lucide-react';
import { memo } from 'react';

import Avatar from '@/components/Avatar';
import { cn } from '@/utils/cn';

export interface ListItemProps {
  actions?: React.ReactNode;
  active?: boolean;
  addon?: React.ReactNode;
  avatar?: string;
  avatarBackground?: string;
  className?: string;
  date?: React.ReactNode;
  description?: React.ReactNode;
  loading?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  pin?: boolean;
  showAction?: boolean;
  title?: React.ReactNode;
}

const ListItem = memo<ListItemProps>(
  ({
    active,
    actions,
    addon,
    avatar,
    avatarBackground,
    className,
    date,
    description,
    loading,
    pin,
    showAction,
    title,
    onClick,
  }) => {
    return (
      <div
        className={cn(
          'group relative my-0.5 flex cursor-pointer items-center gap-3 rounded-md py-2 pr-4 pl-2 transition-colors',
          active ? 'bg-accent' : 'hover:bg-accent/50',
          className,
        )}
        onClick={onClick}
      >
        <Avatar avatar={avatar} background={avatarBackground} size={40} title={typeof title === 'string' ? title : undefined} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className={cn('truncate text-sm', active && 'font-medium', loading && 'opacity-50')}>
              {title}
              {pin && <Pin aria-hidden className="ml-1 inline size-3 text-muted-foreground" />}
            </span>
            {date && (
              <span className="shrink-0 text-xs text-muted-foreground">{date}</span>
            )}
          </div>
          {description && (
            <div className="mt-0.5 truncate text-xs text-muted-foreground">{description}</div>
          )}
          {addon && <div className="mt-1 flex flex-wrap gap-1">{addon}</div>}
        </div>

        {actions && (
          <div
            className={cn(
              'absolute right-1 top-1/2 -translate-y-1/2 rounded-md bg-background/80 p-0.5 backdrop-blur transition-opacity',
              showAction ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {actions}
          </div>
        )}
      </div>
    );
  },
);

export default ListItem;
