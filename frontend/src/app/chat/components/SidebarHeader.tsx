import { type ReactNode, memo } from 'react';

interface SidebarHeaderProps {
  actions?: ReactNode;
  title: ReactNode;
}

const SidebarHeader = memo<SidebarHeaderProps>(({ title, actions }) => {
  return (
    <div className="z-10 flex items-center justify-between border-b border-border/60 py-3.5 pl-4 pr-4">
      <div className="flex items-center gap-1">{title}</div>
      <div className="flex items-center gap-0.5">{actions}</div>
    </div>
  );
});

export default SidebarHeader;
