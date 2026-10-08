import { FileImage, FileText, FileUpIcon } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useFileStore } from '@/store/file';

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
};

const DragUpload = memo(() => {
  const { t } = useTranslation('chat');
  const [isDragging, setIsDragging] = useState(false);
  // When a file is dragged to a different area, the 'dragleave' event may be triggered,
  // causing isDragging to be mistakenly set to false.
  // to fix this issue, use a counter to ensure the status change only when drag event left the browser window .
  const dragCounter = useRef(0);

  const uploadFile = useFileStore((s) => s.uploadFile);

  const uploadImages = async (fileList: FileList | undefined) => {
    if (!fileList || fileList.length === 0) return;

    const pools = Array.from(fileList).map(async (file) => {
      // skip none-file items
      if (!file.type.startsWith('image')) return;
      await uploadFile(file);
    });

    await Promise.all(pools);
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();

    dragCounter.current += 1;
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();

    // reset counter
    dragCounter.current -= 1;

    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    // reset counter
    dragCounter.current = 0;

    setIsDragging(false);

    // get filesList
    // TODO: support folder files upload
    const files = e.dataTransfer?.files;

    // upload files
    uploadImages(files);
  };

  const handlePaste = (event: ClipboardEvent) => {
    // get files from clipboard

    const files = event.clipboardData?.files;

    uploadImages(files);
  };

  useEffect(() => {
    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('paste', handlePaste);
    };
  }, []);

  if (!isDragging) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur">
      <div className="flex h-[300px] w-[300px] rounded-2xl bg-primary p-4 text-primary-foreground shadow-2xl">
        <div className="flex h-full w-full flex-col items-center justify-center gap-10 rounded-xl border-2 border-dashed border-primary-foreground p-4">
          <div className="flex">
            <FileImage className="size-16" />
            <FileUpIcon className="size-16" />
            <FileText className="size-16" />
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="text-2xl font-bold">{t('upload.dragTitle')}</div>
            <div className="text-primary-foreground/60">{t('upload.dragDesc')}</div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default DragUpload;
