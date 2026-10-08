import { ReactNode, memo } from 'react';
import { cn } from '@/utils/cn';

import Avatar from '@/components/Avatar';

export const ErrorActionContainer = memo<{ children: ReactNode }>(({ children }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-lg border border-border bg-background px-6 py-6">
      {children}
    </div>
  );
});

export const FormAction = memo<{
  avatar: ReactNode;
  background?: string;
  children: ReactNode;
  description: string;
  title: string;
}>(({ children, background, title, description, avatar }) => {
  return (
    <div className="flex max-w-[300px] flex-col items-center justify-center gap-4">
      <Avatar avatar={avatar} background={background} size={80} title="" />
      <div className="flex flex-col text-xl">{title}</div>
      <div className={cn('flex flex-col text-center text-sm text-muted-foreground')}>
        {description}
      </div>
      {children}
    </div>
  );
});
