import { ChevronRight, type LucideIcon } from 'lucide-react';
import { CSSProperties, ReactNode, memo } from 'react';

import { cn } from '@/utils/cn';
import { useResponsive } from '@/hooks/useResponsive';

export interface ItemProps {
  active?: boolean;
  className?: string;
  hoverable?: boolean;
  icon: LucideIcon;
  label: ReactNode;
  style?: CSSProperties;
}

const KnowledgeTabItem = memo<ItemProps>(
  ({ label, icon: Icon, hoverable = true, active = false, style, className }) => {
    const { isMobile } = useResponsive();
    return (
      <div
        className={cn(
          'flex cursor-pointer items-center gap-2 rounded-md py-2.5 pr-2 text-sm transition-colors',
          hoverable && 'hover:bg-accent',
          active && 'bg-accent text-primary',
          !hoverable && 'pointer-events-none',
          className,
        )}
        style={style}
      >
        {Icon && <Icon aria-hidden className="size-5 shrink-0" />}
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {isMobile && <ChevronRight aria-hidden className="size-4 shrink-0 text-muted-foreground" />}
      </div>
    );
  },
);

export default KnowledgeTabItem;
