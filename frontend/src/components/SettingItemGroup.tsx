'use client';

import { cn } from '@/utils/cn';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface SettingItemGroupProps {
  children?: ReactNode;
  className?: string;
  desc?: string;
  extra?: ReactNode;
  icon?: LucideIcon;
  style?: React.CSSProperties;
  title?: string;
}

export interface SettingItemProps {
  children?: ReactNode;
  className?: string;
  desc?: string;
  label?: string;
  style?: React.CSSProperties;
}

export const SettingItemGroup = ({ children, className, desc, extra, icon: Icon, style, title }: SettingItemGroupProps) => (
  <section className={cn('overflow-hidden rounded-lg border bg-card text-card-foreground', className)} style={style}>
    {(title || extra) && (
      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3">
        {Icon && <Icon aria-hidden className="size-4 text-muted-foreground" />}
        {title && (
          <div className="min-w-0">
            <div className="text-sm font-medium leading-tight">{title}</div>
            {desc && <div className="text-xs text-muted-foreground">{desc}</div>}
          </div>
        )}
        {extra && <div className="ml-auto flex items-center gap-2">{extra}</div>}
      </div>
    )}
    <div className="divide-y divide-border">{children}</div>
  </section>
);

export const SettingItem = ({ children, className, desc, label, style }: SettingItemProps) => (
  <div className={cn('flex items-center justify-between gap-4 px-4 py-3', className)} style={style}>
    {(label || desc) && (
      <div className="min-w-0">
        {label && <div className="text-sm">{label}</div>}
        {desc && <div className="text-xs text-muted-foreground">{desc}</div>}
      </div>
    )}
    <div className="flex shrink-0 items-center">{children}</div>
  </div>
);

export default SettingItemGroup;
