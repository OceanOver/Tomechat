import { PropsWithChildren, memo } from 'react';

import DraggablePanel, { DraggablePanelContainer } from '@/components/DraggablePanel';
import { FOLDER_WIDTH } from '@/const/layoutTokens';
import { useGlobalStore } from '@/store/global';

const FolderPanel = memo<PropsWithChildren>(({ children }) => {
  const [sessionsWidth, sessionExpandable, updatePreference] = useGlobalStore((s) => [
    s.preference.sessionsWidth,
    s.preference.showSessionPanel,
    s.updatePreference,
  ]);

  return (
    <DraggablePanel
      className="h-full bg-muted/40 text-muted-foreground"
      defaultSize={{ width: sessionsWidth }}
      expand={sessionExpandable}
      maxWidth={400}
      minWidth={FOLDER_WIDTH}
      onExpandChange={(expand) => {
        updatePreference({
          sessionsWidth: expand ? 320 : 0,
          showSessionPanel: expand,
        });
      }}
      onSizeChange={(_, size) => {
        if (!size) return;

        const nextWidth = typeof size.width === 'string' ? Number.parseInt(size.width) : size.width;

        if (!nextWidth || nextWidth === sessionsWidth) return;

        updatePreference({ sessionsWidth: nextWidth });
      }}
      placement="left"
      size={{ height: '100%', width: sessionsWidth }}
    >
      <DraggablePanelContainer style={{ flex: 'none', height: '100%', minWidth: FOLDER_WIDTH }}>
        {children}
      </DraggablePanelContainer>
    </DraggablePanel>
  );
});

export default FolderPanel;
