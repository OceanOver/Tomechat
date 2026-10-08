import { type LucideIcon } from 'lucide-react';

import { cn } from '@/utils/cn';

export interface EmptyProps {
  boxed?: boolean;
  className?: string;
  description?: string;
  icon?: LucideIcon;
  title?: string;
}

const Empty = ({ boxed, icon: Icon, title, description, className }: EmptyProps) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center gap-2 py-10 text-center',
      className
    )}
  >
    {Icon &&
      (boxed ? (
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <Icon className="size-6 text-muted-foreground" />
        </div>
      ) : (
        <Icon className="h-10 w-10 text-muted-foreground/60" />
      ))}
    {title && <p className="text-sm font-medium text-foreground">{title}</p>}
    {description && <p className="max-w-sm text-xs text-muted-foreground">{description}</p>}
  </div>
);

Empty.displayName = 'Empty';

export { Empty };
