import { ListEnd } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { useThreadViewport } from '@assistant-ui/react';
import { cn } from '@/utils/cn';

export interface BackBottomProps {
  className?: string;
}

/**
 * Back-to-bottom button: driven by the assistant-ui Thread viewport scroll state;
 * sticks to the bottom of the message area only when not scrolled to the end.
 */
const BackBottom = memo<BackBottomProps>(({ className }) => {
  const { t } = useTranslation('chat');
  const isAtBottom = useThreadViewport((s) => s.isAtBottom);
  const scrollToBottom = useThreadViewport((s) => s.scrollToBottom);

  if (isAtBottom) return null;

  return (
    <div className="pointer-events-none sticky bottom-3 z-10 flex justify-center">
      <Button
        className={cn(
          'pointer-events-auto gap-1.5 rounded-full border bg-background/90 shadow-md backdrop-blur',
          className,
        )}
        onClick={() => scrollToBottom({ behavior: 'smooth' })}
        size="sm"
        variant="outline"
      >
        <ListEnd className="size-3.5" />
        {t('backToBottom', { defaultValue: 'Back to bottom' })}
      </Button>
    </div>
  );
});

export default BackBottom;
