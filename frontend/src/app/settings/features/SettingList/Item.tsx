'use client';

import { ChevronRight, type LucideIcon } from 'lucide-react';
import { CSSProperties, ReactNode, memo } from 'react';

import { cn } from '@/utils/cn';

export interface ItemProps {
  active?: boolean;
  className?: string;
  hoverable?: boolean;
  icon: LucideIcon;
  label: ReactNode;
  style?: CSSProperties;
}

const SettingItem = memo<ItemProps>(
  ({ label, icon: Icon, hoverable = true, active = false, style, className }) => {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-md px-3 py-4 text-sm',
          hoverable && 'cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground',
          active && 'bg-accent text-accent-foreground',
          !hoverable && 'pointer-events-none',
          className,
        )}
        style={style}
      >
        <Icon aria-hidden className="size-5 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <ChevronRight aria-hidden className="size-4 shrink-0 text-muted-foreground" />
      </div>
    );
  },
);

export default SettingItem;
