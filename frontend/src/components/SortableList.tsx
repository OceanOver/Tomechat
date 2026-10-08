'use client';

import { cn } from '@/utils/cn';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DraggableAttributes,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { CSSProperties, HTMLAttributes, ReactNode, createContext, memo, useContext, useMemo } from 'react';

interface SortableItemContextValue {
  attributes: DraggableAttributes;
  isDragging: boolean;
  listeners: Record<string, any> | undefined;
  setActivatorNodeRef: (node: HTMLElement | null) => void;
}

const SortableItemContext = createContext<SortableItemContextValue>({} as SortableItemContextValue);

const SortableItem = memo<
  {
    id: string;
    style?: CSSProperties;
  } & HTMLAttributes<HTMLDivElement>
>(({ children, className, id, style, ...rest }) => {
  const { attributes, isDragging, listeners, setActivatorNodeRef, setNodeRef, transform, transition } =
    useSortable({ id });

  const contextValue = useMemo(
    () => ({ attributes, isDragging, listeners, setActivatorNodeRef }),
    [attributes, isDragging, listeners, setActivatorNodeRef],
  );

  return (
    <SortableItemContext.Provider value={contextValue}>
      <div
        className={cn(
          'flex items-center rounded-md transition-shadow',
          isDragging && 'z-10 bg-background opacity-80 ring-1 ring-ring',
          className,
        )}
        ref={setNodeRef}
        style={{ transform: CSS.Translate.toString(transform), transition, ...style }}
        {...attributes}
        {...rest}
      >
        {children}
      </div>
    </SortableItemContext.Provider>
  );
});

SortableItem.displayName = 'SortableItem';

const DragHandle = memo(() => {
  const { attributes, isDragging, listeners, setActivatorNodeRef } = useContext(SortableItemContext);
  return (
    <span
      aria-hidden
      className={cn(
        'flex h-6 w-4 shrink-0 cursor-grab touch-none items-center justify-center rounded-sm text-muted-foreground/60 transition-colors hover:text-foreground',
        isDragging && 'cursor-grabbing',
      )}
      ref={setActivatorNodeRef as any}
      {...(attributes as any)}
      {...(listeners as any)}
    >
      <GripVertical className="size-3.5" />
    </span>
  );
});

DragHandle.displayName = 'DragHandle';

export interface SortableListProps<T> {
  className?: string;
  items: T[];
  onChange?: (items: T[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
  style?: CSSProperties;
}

const SortableList = <T extends { id: string }>({
  className,
  items,
  onChange,
  renderItem,
  style,
}: SortableListProps<T>) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = [...items];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    onChange?.(next);
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className={cn('flex flex-col gap-1', className)} style={style}>
          {items.map((item, index) => renderItem(item, index))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

const SortableListWithStatics = SortableList as typeof SortableList & {
  DragHandle: typeof DragHandle;
  Item: typeof SortableItem;
};

SortableListWithStatics.DragHandle = DragHandle;
SortableListWithStatics.Item = SortableItem;

export default SortableListWithStatics;
