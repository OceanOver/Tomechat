'use client';

import ActionIcon from '@/components/ActionIcon';
import { cn } from '@/utils/cn';
import { ChevronLeft } from 'lucide-react';
import { CSSProperties, HTMLAttributes, ReactNode, memo } from 'react';

export interface ChatHeaderProps extends HTMLAttributes<HTMLDivElement> {
  center?: ReactNode;
  left?: ReactNode;
  onBackClick?: () => void;
  right?: ReactNode;
  showBackButton?: boolean;
}

const ChatHeader = memo<ChatHeaderProps>(
  ({ center, className, left, onBackClick, right, showBackButton, style, ...rest }) => (
    <header
      className={cn(
        'flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/80 px-3 backdrop-blur',
        className,
      )}
      style={style}
      {...rest}
    >
      <div className="flex min-w-0 items-center gap-2">
        {showBackButton && (
          <ActionIcon icon={ChevronLeft} onClick={onBackClick} title="Back" />
        )}
        {left}
      </div>
      {center && <div className="flex min-w-0 flex-1 justify-center">{center}</div>}
      {right && <div className="flex items-center gap-1">{right}</div>}
    </header>
  ),
);

ChatHeader.displayName = 'ChatHeader';

export interface ChatHeaderTitleProps {
  className?: string;
  desc?: string;
  style?: CSSProperties;
  tag?: ReactNode;
  title?: ReactNode;
}

export const ChatHeaderTitle = memo<ChatHeaderTitleProps>(({ className, desc, style, tag, title }) => (
  <div className={cn('flex min-w-0 flex-col justify-center gap-0.5', className)} style={style}>
    <div className="flex items-center gap-2">
      <span className="truncate text-sm font-medium leading-tight">{title}</span>
      {tag}
    </div>
    {desc && <div className="truncate text-xs text-muted-foreground">{desc}</div>}
  </div>
));

ChatHeaderTitle.displayName = 'ChatHeaderTitle';

export default ChatHeader;
