import { Trash } from 'lucide-react';
import { memo, useCallback } from 'react';

import ActionIcon from '@/components/ActionIcon';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlatform } from '@/hooks/usePlatform';
import { useFileStore } from '@/store/file';

interface FileItemProps {
  alwaysShowClose?: boolean;
  className?: string;
  editable?: boolean;
  id: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const ImageFileItem = memo<FileItemProps>(({ editable, id, alwaysShowClose, className, style }) => {
  const useFetchFile = useFileStore((s) => s.useFetchFile);
  const removeFile = useFileStore((s) => s.removeFile);
  const { data, isLoading } = useFetchFile(id);
  const { isSafari } = usePlatform();

  const handleRemoveFile = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      removeFile(id);
    },
    [id, removeFile],
  );

  return (
    <div
      className={`group/image relative w-full overflow-hidden rounded-md border border-border/60 bg-background ${
        className ?? ''
      }`}
      style={{ height: isSafari ? 'auto' : '100%', minHeight: 64, ...style }}
    >
      {isLoading ? (
        <Skeleton className="size-full" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={data?.name || id || ''}
          className="size-full object-cover"
          src={data?.url}
        />
      )}
      {editable && (
        <div
          className={`absolute right-1 top-1 ${
            alwaysShowClose ? 'opacity-100' : 'opacity-0 transition-opacity group-hover/image:opacity-100'
          }`}
        >
          <ActionIcon
            className="bg-black/50 text-white hover:bg-destructive hover:text-white"
            icon={Trash}
            onClick={handleRemoveFile}
            size={'small'}
          />
        </div>
      )}
    </div>
  );
});

export default ImageFileItem;
