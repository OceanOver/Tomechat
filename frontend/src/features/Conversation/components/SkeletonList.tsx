import { memo } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonListProps {
  mobile?: boolean;
}
const SkeletonList = memo<SkeletonListProps>(({ mobile }) => {
  return (
    <div className="mt-6 flex flex-col gap-6 p-3" style={{ paddingTop: mobile ? 24 : 32 }}>
      <div className="flex flex-row-reverse items-start gap-4">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-4 w-[50%] min-w-40" />
          <Skeleton className="h-4 w-[30%] min-w-24" />
        </div>
      </div>
      <div className="flex items-start gap-4">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-[50%] min-w-40" />
          <Skeleton className="h-4 w-[30%] min-w-24" />
        </div>
      </div>
    </div>
  );
});
export default SkeletonList;
