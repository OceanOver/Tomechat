import { ChevronDown } from 'lucide-react';
import { memo } from 'react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export interface CollapseGroupItem {
  children: React.ReactNode;
  extra?: React.ReactNode;
  key: string;
  label: React.ReactNode;
}

interface CollapseGroupProps {
  activeKey?: string[];
  items: CollapseGroupItem[];
  onChange?: (keys: string[]) => void;
}

const CollapseGroup = memo<CollapseGroupProps>(({ activeKey = [], items, onChange }) => {
  return (
    <div className="flex flex-col gap-0.5">
      {items.map((item) => {
        const open = activeKey.includes(item.key);

        return (
          <Collapsible
            key={item.key}
            onOpenChange={(isOpen) => {
              const next = isOpen
                ? [...activeKey, item.key]
                : activeKey.filter((k) => k !== item.key);
              onChange?.(next);
            }}
            open={open}
          >
            <div className="group/collapse-header flex items-center gap-1 rounded-md pr-2.5 pl-2 hover:bg-accent/60">
              <CollapsibleTrigger className="flex flex-1 items-center gap-1 py-1.5 text-xs text-muted-foreground transition-colors group-hover/collapse-header:text-foreground">
                <ChevronDown
                  className={`size-4 transition-transform ${open ? '' : '-rotate-90'}`}
                />
                {item.label}
              </CollapsibleTrigger>
              <div
                className="hidden group-hover/collapse-header:block"
                onClick={(e) => e.stopPropagation()}
              >
                {item.extra}
              </div>
            </div>
            <CollapsibleContent>{item.children}</CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
});

export default CollapseGroup;
