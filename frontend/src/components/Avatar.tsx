'use client';

import { cn } from '@/utils/cn';
import { type CSSProperties, type MouseEvent, type ReactNode, isValidElement, memo } from 'react';

export interface AvatarProps {
  animation?: boolean;
  /**
   * Avatar content: URL, base64, emoji, or any ReactNode
   */
  avatar?: string | ReactNode;
  /**
   * Avatar background color
   */
  background?: string;
  className?: string;
  onClick?: (e: MouseEvent<HTMLSpanElement>) => void;
  /**
   * Shape
   * @default 'circle'
   */
  shape?: 'circle' | 'square';
  /**
   * Size in pixels
   * @default 40
   */
  size?: number;
  style?: CSSProperties;
  /**
   * Alt text used when no avatar is set
   */
  title?: string;
}

const isUrl = (avatar: unknown): avatar is string =>
  typeof avatar === 'string' && /^(https?:|data:|\/)/.test(avatar);

const Avatar = memo<AvatarProps>(
  ({ avatar, title, size = 40, shape = 'circle', background, className, style, onClick }) => {
    const isNode = isValidElement(avatar);
    // Short emoji strings render as text; other non-URL inputs fall back to the default logo
    const isEmoji = typeof avatar === 'string' && avatar.length <= 8 && !isUrl(avatar);
    const src = isUrl(avatar) ? avatar : '/images/logo.png';

    return (
      <span
        className={cn(
          'relative flex shrink-0 items-center justify-center overflow-hidden',
          shape === 'circle' ? 'rounded-full' : 'rounded-md',
          onClick && 'cursor-pointer',
          className,
        )}
        onClick={onClick}
        style={{ background, height: size, width: size, ...style }}
      >
        {isNode ? (
          avatar
        ) : isEmoji ? (
          <span
            aria-hidden
            className="flex size-full items-center justify-center leading-none"
            style={{ fontSize: Math.round(size * 0.55) }}
          >
            {avatar}
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={title || 'avatar'} className="size-full object-cover" src={src} />
        )}
      </span>
    );
  },
);

Avatar.displayName = 'Avatar';

export default Avatar;
