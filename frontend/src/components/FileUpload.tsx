'use client';

import { cn } from '@/utils/cn';
import { DragEvent, ReactNode, memo, useCallback, useRef, useState } from 'react';

export interface FileUploadProps {
  accept?: string;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
  onFileSelect?: (files: File[]) => void;
}

const FileUpload = memo<FileUploadProps>(
  ({ accept, children, className, disabled, multiple, onFileSelect }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);

    const emitFiles = useCallback(
      (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        onFileSelect?.(Array.from(fileList));
      },
      [onFileSelect],
    );

    const handleDrop = useCallback(
      (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);
        if (disabled) return;
        emitFiles(e.dataTransfer.files);
      },
      [disabled, emitFiles],
    );

    return (
      <div
        aria-disabled={disabled}
        className={cn(
          'relative inline-flex max-w-full cursor-pointer items-center justify-center transition-colors',
          dragActive && 'bg-accent ring-1 ring-ring',
          disabled && 'pointer-events-none opacity-50',
          className,
        )}
        onClick={() => inputRef.current?.click()}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragActive(true);
        }}
        onDrop={handleDrop}
      >
        <input
          accept={accept}
          className="hidden"
          multiple={multiple}
          onChange={(e) => {
            emitFiles(e.target.files);
            e.target.value = '';
          }}
          ref={inputRef}
          type="file"
        />
        {children}
      </div>
    );
  },
);

FileUpload.displayName = 'FileUpload';

export default FileUpload;
