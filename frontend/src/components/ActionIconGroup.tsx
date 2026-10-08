'use client';

import ActionIcon from '@/components/ActionIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/utils/cn';
import { MoreVertical } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';
import { memo } from 'react';

export interface ActionIconGroupItem {
  children?: ActionIconGroupItem[];
  danger?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  key: string;
  label?: ReactNode;
  title?: string;
}

export type ActionEvent = { key: string };

export type DividerItem = { type: 'divider' };

export interface ActionIconGroupProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Actions collapsed into the dropdown menu (dividers supported)
   */
  dropdownMenu?: (ActionIconGroupItem | DividerItem)[];
  /**
   * Actions rendered inline
   */
  items?: ActionIconGroupItem[];
  onActionClick?: (action: ActionEvent) => void;
  type?: 'ghost' | 'block';
}

const isDivider = (item: ActionIconGroupItem | DividerItem): item is DividerItem =>
  (item as DividerItem).type === 'divider';

const ActionIconGroup = memo<ActionIconGroupProps>(
  ({ className, dropdownMenu, items = [], onActionClick, style, type = 'ghost', ...rest }) => (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn('flex items-center gap-0.5', type === 'block' && 'gap-1', className)}
        onClick={(e) => e.stopPropagation()}
        style={style}
        {...rest}
      >
        {items.map((item) =>
          item.icon ? (
            <ActionIcon
              className={cn(item.danger && 'text-destructive hover:text-destructive')}
              disabled={item.disabled}
              icon={item.icon}
              key={item.key}
              onClick={() => onActionClick?.({ key: item.key })}
              size="small"
              title={typeof item.label === 'string' ? item.label : item.title}
            />
          ) : null,
        )}
        {dropdownMenu && dropdownMenu.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ActionIcon icon={MoreVertical} size="small" title="More" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-36">
              {dropdownMenu.map((item: ActionIconGroupItem | DividerItem, index: number) =>
                isDivider(item) ? (
                  <DropdownMenuSeparator key={`divider-${index}`} />
                ) : (
                item.children && item.children.length > 0 ? (
                  <DropdownMenuSub key={item.key}>
                    <DropdownMenuSubTrigger disabled={item.disabled}>
                      {item.icon && <item.icon aria-hidden className="size-4" />}
                      {item.label ?? item.title}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="min-w-36">
                      {item.children.map((child) => (
                        <DropdownMenuItem
                          className={cn(
                            child.danger && 'text-destructive focus:text-destructive',
                          )}
                          disabled={child.disabled}
                          key={child.key}
                          onClick={() => onActionClick?.({ key: child.key })}
                        >
                          {child.icon && <child.icon aria-hidden className="size-4" />}
                          {child.label ?? child.title}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                ) : (
                  <DropdownMenuItem
                    className={cn(item.danger && 'text-destructive focus:text-destructive')}
                    disabled={item.disabled}
                    key={item.key}
                    onClick={() => onActionClick?.({ key: item.key })}
                  >
                    {item.icon && <item.icon aria-hidden className="size-4" />}
                    {item.label ?? item.title}
                  </DropdownMenuItem>
                )
                ),
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </TooltipProvider>
  ),
);

ActionIconGroup.displayName = 'ActionIconGroup';

export default ActionIconGroup;
