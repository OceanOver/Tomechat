import { type CSSProperties, memo } from 'react';

import { cn } from '@/utils/cn';

interface LogoTextProps {
  className?: string;
  height?: number;
  style?: CSSProperties;
  width?: number;
}

const LogoText = memo<LogoTextProps>(({ className, height = 32, style }) => (
  <span
    className={cn(
      'select-none whitespace-nowrap font-bold leading-none tracking-tight',
      className,
    )}
    style={{ fontSize: Math.round(height * 0.72), ...style }}
  >
    Tomechat
  </span>
));

LogoText.displayName = 'LogoText';

export default LogoText;
