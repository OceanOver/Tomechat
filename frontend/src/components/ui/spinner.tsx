import { Loader2, type LucideProps } from 'lucide-react';

import { cn } from '@/utils/cn';

const Spinner = ({ className, ...props }: LucideProps) => (
  <Loader2 className={cn('h-4 w-4 animate-spin text-muted-foreground', className)} {...props} />
);

Spinner.displayName = 'Spinner';

export { Spinner };
