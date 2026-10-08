import React, { CSSProperties, ReactNode, memo } from 'react';

import { cn } from '@/utils/cn';

import Divider from './Divider';
import LogoHighContrast from './LogoHighContrast';
import LogoText from './LogoText';

export interface LogoProps {
  className?: string;
  /**
   * @description Additional React Node to be rendered next to the logo
   */
  extra?: ReactNode;
  imageUrl?: string;
  localImage?: string;
  /**
   * @description Size of the logo in pixels
   * @default 32
   */
  size?: number;
  style?: CSSProperties;
  /**
   * @description Type of the logo to be rendered
   * @default 'flat'
   */
  type?: '3d' | 'flat' | 'high-contrast' | 'text' | 'combine';
}

const Logo = memo<LogoProps>(
  ({ type = 'flat', size = 32, style, extra, className, imageUrl, localImage }) => {
    let logoComponent: ReactNode;

    switch (type) {
      case 'flat': {
        logoComponent = (
          <img alt="Tomechat" height={size} src={`/images/chathead.webp`} style={style} width={size} />
        );
        break;
      }
      case '3d': {
        if (!imageUrl) {
          console.error('Custom image type requires imageUrl prop.');
          return null;
        }

        logoComponent = (
          <img
            alt="image-reference"
            src={imageUrl}
            style={{ height: `${size}px`, width: `${size}px` }}
          />
        );
        break;
      }
      case 'combine': {
        logoComponent = (
          <>
            <img alt="Tomechat" height={size} src={`/images/chatjump.webp`} style={style} width={size} />
            <LogoText style={{ height: size, marginLeft: Math.round(size / 4), width: 'auto' }} />
          </>
        );
        break;
      }
      case 'high-contrast': {
        logoComponent = <LogoHighContrast style={{ height: size, width: size }} />;
        break;
      }
      case 'text': {
        logoComponent = (
          <LogoText
            className={className}
            height={size}
            style={style}
            width={size * 2.9375}
          />
        );
        break;
      }
    }

    if (!extra) return <>{logoComponent}</>;

    const extraSize = Math.round((size / 3) * 1.9);

    return (
      <div className={cn('flex items-center', className)} style={style}>
        {logoComponent}
        <Divider className="mx-1 shrink-0 text-muted-foreground" style={{ height: extraSize, width: extraSize }} />
        <div className="whitespace-nowrap font-light" style={{ fontSize: extraSize }}>
          {extra}
        </div>
      </div>
    );
  },
);

Logo.displayName = 'Logo';

export default Logo;
