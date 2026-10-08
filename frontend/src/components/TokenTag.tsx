'use client';

import { cn } from '@/utils/cn';
import { memo } from 'react';

export interface TokenTagProps {
  className?: string;
  /**
   * Display mode: used shows used/total
   */
  displayMode?: 'used' | 'remained' | 'overload';
  maxValue?: number;
  shape?: 'circle' | 'square';
  style?: React.CSSProperties;
  text?: {
    overload?: string;
    remained?: string;
    used?: string;
  };
  value: number;
}

const format = (number: number) => number.toLocaleString('en-US');

const TokenTag = memo<TokenTagProps>(
  ({ className, displayMode = 'used', maxValue, shape = 'circle', style, text, value }) => {
    const overloaded = maxValue != null && value > maxValue;
    const remained = maxValue != null ? maxValue - value : undefined;
    const nearLimit = maxValue != null && value / maxValue > 0.75;

    let display = format(value);
    if (displayMode === 'used' && maxValue != null) {
      display = overloaded ? `${format(value)} (${text?.overload || 'overload'})` : `${format(value)} / ${format(maxValue)}`;
    } else if (displayMode === 'remained' && remained != null) {
      display = `${format(remained)} (${text?.remained || 'remained'})`;
    } else if (displayMode === 'overload') {
      display = text?.overload || 'overload';
    }

    return (
      <span
        className={cn(
          'inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 font-mono text-xs tabular-nums',
          shape === 'square' && 'rounded-md',
          overloaded
            ? 'border-destructive/40 bg-destructive/10 text-destructive'
            : nearLimit
              ? 'border-amber-500/40 bg-amber-500/10 text-amber-600'
              : 'border-border bg-muted/50 text-muted-foreground',
          className,
        )}
        style={style}
      >
        {display}
      </span>
    );
  },
);

TokenTag.displayName = 'TokenTag';

export default TokenTag;
