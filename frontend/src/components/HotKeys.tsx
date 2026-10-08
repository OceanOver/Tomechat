'use client';

import { isString } from 'lodash-es';
import { Command, Delete, Option } from 'lucide-react';
import { ReactNode, memo, useEffect, useState } from 'react';

import { CLEAN_MESSAGE_KEY, META_KEY, PREFIX_KEY } from '@/const/hotkeys';
import { usePlatform } from '@/hooks/usePlatform';

export interface HotKeysProps {
  desc?: string;
  keys: string;
}

const HotKeys = memo<HotKeysProps>(({ keys, desc }) => {
  const [keysGroup, setKeysGroup] = useState<(string | ReactNode)[]>(keys.split('+'));
  const { isApple } = usePlatform();

  useEffect(() => {
    const mapping: Record<string, ReactNode> = {
      [CLEAN_MESSAGE_KEY]: isApple ? <Delete className="size-3" /> : 'backspace',
      [META_KEY]: isApple ? <Command className="size-3" /> : 'ctrl',
      [PREFIX_KEY]: isApple ? <Option className="size-3" /> : 'alt',
    };
    const newValue = keys
      .split('+')
      .filter(Boolean)
      .map((k) => mapping[k] ?? k);
    setKeysGroup(newValue);
  }, [keys, isApple]);

  const content = (
    <div className="flex items-center gap-0.5 text-xs">
      {keysGroup.map((key, index) => (
        <kbd
          className="min-w-4 rounded border border-border border-b-border/80 bg-background px-1.5 py-0.5 text-center font-sans text-xs font-semibold leading-none text-muted-foreground shadow-[inset_0_-1px_0_currentColor]/0"
          key={index}
        >
          {isString(key) ? key.toUpperCase() : key}
        </kbd>
      ))}
    </div>
  );

  if (!desc) return content;
  return (
    <div className="flex flex-col items-center text-center">
      {desc}
      {content}
    </div>
  );
});

export default HotKeys;
