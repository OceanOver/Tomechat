'use client';

import { Button, type ButtonProps } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/utils/cn';
import { LucideIcon } from 'lucide-react';
import { CSSProperties, forwardRef, memo, MouseEvent } from 'react';

type ActionIconSize = 'small' | 'normal' | 'large' | number | { fontSize: number };

export interface ActionIconProps extends Omit<ButtonProps, 'size' | 'title' | 'children'> {
  active?: boolean;
  /**
   * Text/icon color, forwarded to the lucide icon
   */
  color?: string;
  /**
   * Legacy spelling kept for API compatibility; equivalent to `disabled`
   */
  disable?: boolean;
  fill?: string;
  /**
   * Kept for API compatibility; renders a plain background
   */
  glass?: boolean;
  icon: LucideIcon;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /**
   * Prefer 'small' | 'normal' | 'large'; number and { fontSize } are deprecated legacy inputs
   * @deprecated Use named sizes instead
   */
  size?: ActionIconSize;
  style?: CSSProperties;
  title?: string;
}

const sizeClasses: Record<'small' | 'normal' | 'large', string> = {
  large: 'h-10 w-10 [&_svg]:size-5',
  normal: 'h-8 w-8 [&_svg]:size-[18px]',
  small: 'h-7 w-7 [&_svg]:size-4',
};

const normalizeSize = (size: ActionIconSize | undefined) => {
  if (!size || size === 'normal') return 'normal' as const;
  if (size === 'small' || size === 'large') return size;
  return undefined;
};

const ActionIcon = memo<ActionIconProps>(
  forwardRef<HTMLButtonElement, ActionIconProps>(
    (
      {
        active,
        className,
        color,
        disable,
        disabled,
        fill,
        glass,
        icon: Icon,
        placement = 'top',
        size,
        style,
        title,
        onClick,
        ...rest
      },
      ref,
    ) => {
      const normalized = normalizeSize(size);
      const iconStyle: CSSProperties = {};
      if (color) iconStyle.color = color;
      if (fill) iconStyle.fill = fill;
      if (typeof size === 'number') {
        iconStyle.width = size;
        iconStyle.height = size;
      } else if (typeof size === 'object' && size !== null && 'fontSize' in size) {
        iconStyle.width = size.fontSize;
        iconStyle.height = size.fontSize;
      }

      const button = (
        <Button
          aria-label={title}
          className={cn(
            'shrink-0 rounded-md text-muted-foreground hover:text-foreground',
            normalized ? sizeClasses[normalized] : 'h-auto w-auto p-1',
            active && 'bg-accent text-accent-foreground',
            (disabled ?? disable) && 'pointer-events-none opacity-50',
            className,
          )}
          disabled={disabled ?? disable}
          onClick={onClick}
          ref={ref}
          style={style}
          variant="ghost"
          {...rest}
        >
          <Icon style={iconStyle} />
        </Button>
      );

      if (!title) return button;

      return (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side={placement}>{title}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  ),
);

ActionIcon.displayName = 'ActionIcon';

export default ActionIcon;
