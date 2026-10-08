import { memo } from 'react';

import { DraggablePanelBody } from '@/components/DraggablePanel';

import FolderPanel from '@/features/FolderPanel';

import SessionListContent from './SessionListContent';
import Header from './SessionHeader';

const Sessions = memo(() => {
  return (
    <FolderPanel>
      <Header />
      <DraggablePanelBody className="flex flex-col gap-0.5 px-2 pt-2">
        <SessionListContent />
      </DraggablePanelBody>
    </FolderPanel>
  );
});

export default Sessions;
