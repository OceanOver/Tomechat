'use client';

import { Separator } from 'react-resizable-panels';
import { cn } from '@/utils/cn';
import { CSSProperties, ReactNode, forwardRef, memo, useEffect, useRef } from 'react';
import { Group, Panel, type PanelImperativeHandle, type PanelSize } from 'react-resizable-panels';

export interface DraggablePanelSize {
  height?: number | string;
  width?: number | string;
}

export interface DraggablePanelProps {
  children?: ReactNode;
  className?: string;
  classNames?: {
    content?: string;
    header?: string;
  };
  defaultSize?: DraggablePanelSize;
  /**
   * Controlled expand state: false collapses the panel, true expands it
   */
  expand?: boolean;
  /**
   * Whether collapsing via drag/double-click is allowed (default true; required for controlled expand)
   */
  expandable?: boolean;
  fullscreen?: boolean;
  /**
   * Kept for API compatibility: in fullscreen the header height is controlled by caller content
   */
  headerHeight?: number;
  maxHeight?: number;
  maxWidth?: number;
  minHeight?: number;
  minWidth?: number;
  /**
   * Kept for API compatibility: 'float' is currently unused by callers
   */
  mode?: 'fixed' | 'float';
  onExpandChange?: (expand: boolean) => void;
  onSizeChange?: (prevSize: DraggablePanelSize, nextSize: DraggablePanelSize) => void;
  placement?: 'left' | 'right' | 'bottom';
  size?: DraggablePanelSize;
  style?: CSSProperties;
}

const toPixels = (value: number | string | undefined): number | undefined => {
  if (value == null) return undefined;
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const DraggablePanel = memo<DraggablePanelProps>(
  forwardRef<HTMLDivElement, DraggablePanelProps>(
    (
      {
        children,
        className,
        classNames,
        defaultSize,
        expand,
        expandable = true,
        fullscreen,
        headerHeight,
        maxHeight,
        maxWidth,
        minHeight,
        minWidth,
        mode,
        onExpandChange,
        onSizeChange,
        placement = 'left',
        size,
        style,
      },
      ref,
    ) => {
      const panelRef = useRef<PanelImperativeHandle | null>(null);
      const isExpandedRef = useRef<boolean>(expand ?? true);
      // Pixel size from the last expanded state, restored on controlled re-expand
      const lastExpandedPxRef = useRef<number | undefined>(undefined);
      const vertical = placement === 'bottom';

      const callbacksRef = useRef({ onExpandChange, onSizeChange });
      callbacksRef.current = { onExpandChange, onSizeChange };

      const handleResize = (panelSize: PanelSize, _id: unknown, prevPanelSize: PanelSize | undefined) => {
        const nextSize: DraggablePanelSize = vertical
          ? { height: panelSize.inPixels, width: '100%' }
          : { height: '100%', width: panelSize.inPixels };
        if (prevPanelSize) {
          const prevSize: DraggablePanelSize = vertical
            ? { height: prevPanelSize.inPixels, width: '100%' }
            : { height: '100%', width: prevPanelSize.inPixels };
          callbacksRef.current.onSizeChange?.(prevSize, nextSize);
        }
        if (panelSize.inPixels > 0) {
          lastExpandedPxRef.current = panelSize.inPixels;
        }
        const expanded = panelSize.inPixels > 0;
        if (expanded !== isExpandedRef.current) {
          isExpandedRef.current = expanded;
          callbacksRef.current.onExpandChange?.(expanded);
        }
      };

      // Controlled size (pixel size synced only while expanded)
      useEffect(() => {
        const target = toPixels(vertical ? size?.height : size?.width);
        const panel = panelRef.current;
        if (target == null || !panel) return;
        if (panel.isCollapsed()) return;
        const current = panel.getSize().inPixels;
        if (Math.abs(current - target) > 1) panel.resize(target);
      }, [vertical, size?.width, size?.height]);

      if (fullscreen) {
        return (
          <div className={cn('fixed inset-0 z-50 flex flex-col bg-background', className)} style={style}>
            {children}
          </div>
        );
      }

      // Controlled collapse: skip the Group/Panel layout system entirely and render a
      // zero-width placeholder. react-resizable-panels v4 imperative collapse/expand/resize
      // silently no-ops after px-constrained toggle cycles; unmounting is the reliable way.
      if (expand === false) {
        return (
          <div
            className={cn('flex-none overflow-hidden', vertical ? 'h-0 w-full' : 'h-full w-0', className)}
            ref={ref}
            style={style}
          />
        );
      }

      const defaultPixels = toPixels(vertical ? defaultSize?.height : defaultSize?.width);
      const sizePixels = toPixels(vertical ? size?.height : size?.width);
      const minSize = toPixels(vertical ? minHeight : minWidth);
      const maxSize = toPixels(vertical ? maxHeight : maxWidth);

      const separator = (
        <Separator
          className={cn(
            'group/separator relative z-10 bg-border transition-colors hover:bg-ring data-[separator=active]:bg-ring',
            vertical ? 'h-px w-full' : 'h-auto w-px',
          )}
          disableDoubleClick
          onDoubleClick={() => callbacksRef.current.onExpandChange?.(!isExpandedRef.current)}
        />
      );

      const panel = (
        <Panel
          className={cn('h-full w-full overflow-hidden', classNames?.content)}
          collapsedSize="0px"
          collapsible={expandable}
          defaultSize={
            defaultPixels != null || sizePixels != null
              ? `${defaultPixels ?? sizePixels}px`
              : expand === true && minSize != null
                ? `${lastExpandedPxRef.current ?? minSize}px`
                : undefined
          }
          maxSize={maxSize != null ? `${maxSize}px` : undefined}
          minSize={minSize != null ? `${minSize}px` : undefined}
          onResize={handleResize}
          panelRef={panelRef}
          style={vertical ? { width: '100%' } : { height: '100%' }}
        >
          {children}
        </Panel>
      );

      // In v4, collapse() on the last panel gives all space back to itself (a single-panel
      // Group can never collapse), so a non-interactive filler Panel absorbs the freed space.
      const filler = expandable ? (
        <Panel
          className="pointer-events-none"
          collapsible={false}
          defaultSize="0px"
          minSize="0px"
        />
      ) : null;

      // v4's Group needs a definite size on the main axis to allocate px sizes:
      // for vertical (bottom) panels the caller-provided size.height decides the root height,
      // aligned with minSize (a Panel grows to min; a too-small root clips content)
      const verticalHeight = toPixels(vertical ? size?.height : undefined);
      const verticalRootHeight =
        vertical && verticalHeight != null
          ? Math.max(verticalHeight, minSize ?? 0)
          : undefined;

      return (
        <div
          className={cn('flex-none', vertical ? 'w-full' : 'h-full', className)}
          ref={ref}
          style={
            vertical && verticalRootHeight != null
              ? { height: verticalRootHeight, ...style }
              : style
          }
        >
          <Group
            className={cn('flex h-full', vertical ? 'w-full' : 'w-auto')}
            orientation={vertical ? 'vertical' : 'horizontal'}
          >
            {placement === 'left' ? (
              <>
                {panel}
                {separator}
                {filler}
              </>
            ) : (
              <>
                {separator}
                {panel}
                {filler}
              </>
            )}
          </Group>
        </div>
      );
    },
  ),
);

DraggablePanel.displayName = 'DraggablePanel';

/**
 * Compatibility wrapper: a plain horizontal flex container
 */
export const DraggablePanelContainer = ({
  children,
  className,
  style,
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) => (
  <div className={cn('flex flex-col items-stretch', className)} style={style}>
    {children}
  </div>
);

DraggablePanelContainer.displayName = 'DraggablePanelContainer';

/**
 * Compatibility wrapper: scrollable panel body
 */
export const DraggablePanelBody = ({
  children,
  className,
  style,
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) => (
  <div className={cn('min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4', className)} style={style}>
    {children}
  </div>
);

DraggablePanelBody.displayName = 'DraggablePanelBody';

export default DraggablePanel;
