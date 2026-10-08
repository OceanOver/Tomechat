import { PropsWithChildren, memo } from 'react';

import { Separator } from '@/components/ui/separator';

const Footer = memo<PropsWithChildren>(({ children }) => {
  return (
    <div className="flex w-full max-w-3xl flex-col items-center px-4">
      <div className="flex w-full items-center gap-3">
        <Separator className="flex-1" />
        <span className="shrink-0 text-xs text-muted-foreground/60">{children}</span>
        <Separator className="flex-1" />
      </div>
    </div>
  );
});

export default Footer;
