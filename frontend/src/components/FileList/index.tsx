import ImageGallery from '@/components/ImageGallery';
import GalleyGrid from '@/components/GalleyGrid';
import { memo, useMemo } from 'react';

import ImageFileItem from './ImageFileItem';

interface FileListProps {
  items: string[];
}

const FileList = memo<FileListProps>(({ items }) => {
  const data = useMemo(() => items.map((id) => ({ id })), [items]);

  return (
    <ImageGallery>
      <GalleyGrid items={data} renderItem={({ id }) => <ImageFileItem id={id} />} />
    </ImageGallery>
  );
});

export default FileList;
