'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/utils/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MouseEvent, ReactNode, memo, useCallback, useRef, useState } from 'react';

export interface ImageGalleryProps {
  children?: ReactNode;
  className?: string;
}

const ImageGallery = memo<ImageGalleryProps>(({ children, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const collectImages = useCallback(() => {
    const imgs = Array.from(containerRef.current?.querySelectorAll('img') ?? []);
    return imgs.map((img) => ({ alt: img.alt, src: img.src })).filter((i) => i.src);
  }, []);

  const handleContainerClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== 'IMG') return;
      // Ignore clicks that stopped propagation (e.g. the delete button)
      if (e.defaultPrevented) return;
      const images = collectImages();
      if (images.length === 0) return;
      const clicked = (target as HTMLImageElement).src;
      const idx = images.findIndex((i) => i.src === clicked);
      setIndex(idx >= 0 ? idx : 0);
      setOpen(true);
    },
    [collectImages],
  );

  const go = useCallback(
    (delta: number) => {
      const images = collectImages();
      setIndex((prev) => (prev + delta + images.length) % Math.max(images.length, 1));
    },
    [collectImages],
  );

  const images = open ? collectImages() : [];
  const current = images[index];

  return (
    <>
      <div className={cn('w-full', className)} onClick={handleContainerClick} ref={containerRef}>
        {children}
      </div>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent
          className="max-w-[90vw] border-none bg-transparent p-0 shadow-none [&>button]:z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogTitle className="sr-only">{current?.alt || 'image preview'}</DialogTitle>
          <DialogDescription className="sr-only">image preview</DialogDescription>
          {current && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={current.alt}
              className="mx-auto max-h-[85vh] max-w-[90vw] rounded-md object-contain"
              src={current.src}
            />
          )}
          {images.length > 1 && (
            <>
              <Button
                aria-label="previous"
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 text-foreground hover:bg-background"
                onClick={() => go(-1)}
                size="icon"
                variant="ghost"
              >
                <ChevronLeft className="size-5" />
              </Button>
              <Button
                aria-label="next"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 text-foreground hover:bg-background"
                onClick={() => go(1)}
                size="icon"
                variant="ghost"
              >
                <ChevronRight className="size-5" />
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
});

ImageGallery.displayName = 'ImageGallery';

export default ImageGallery;
