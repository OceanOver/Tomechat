import { memo } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

/**
 * Session list skeleton: avatar + two text lines
 */
export const AvatarSkeletonList = memo<{ count?: number }>(({ count = 4 }) => (
  <div className="flex flex-col gap-2 px-4">
    {Array.from({ length: count }).map((_, index) => (
      <div className="flex items-start gap-3" key={index}>
        <Skeleton className="size-10 rounded-full" />
        <div className="flex flex-1 flex-col gap-1 pt-1">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    ))}
  </div>
));

AvatarSkeletonList.displayName = 'AvatarSkeletonList';

/**
 * Single-line list skeleton (topics, etc.)
 */
export const RowSkeletonList = memo<{ count?: number }>(({ count = 8 }) => (
  <div className="flex flex-col">
    {Array.from({ length: count }).map((_, i) => (
      <div className="flex h-11 flex-col justify-center px-2 py-2" key={i}>
        <Skeleton className="h-6 w-full" />
      </div>
    ))}
  </div>
));

RowSkeletonList.displayName = 'RowSkeletonList';
