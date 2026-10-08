import { memo } from 'react';

import ImageGallery from '@/components/ImageGallery';
import { useResponsive } from '@/hooks/useResponsive';

import ImageFileItem from './ImageFileItem';

interface EditableFileListProps {
  alwaysShowClose?: boolean;
  editable?: boolean;
  items: string[];
  padding?: number | string;
}

const EditableFileList = memo<EditableFileListProps>(
  ({ items, editable = true, alwaysShowClose, padding = 12 }) => {
    const { isMobile } = useResponsive();
    return (
      <div
        className="flex w-full"
        style={{ gap: isMobile ? 4 : 6, overflowX: 'scroll', padding }}
      >
        <ImageGallery className="flex gap-1.5">
          {items.map((i) => (
            <ImageFileItem
              alwaysShowClose={alwaysShowClose}
              editable={editable}
              id={i}
              key={i}
              style={{ height: 64, width: 64 }}
            />
          ))}
        </ImageGallery>
      </div>
    );
  },
);

export default EditableFileList;
