import { memo } from 'react';

import ActionIconGroup from '@/components/ActionIconGroup';

import { useChatListActionsBar } from '../hooks/useChatListActionsBar';
import { RenderAction } from '../types';

export const DefaultActionsBar: RenderAction = memo(({ onActionClick }) => {
  const { del } = useChatListActionsBar();

  return (
    <ActionIconGroup dropdownMenu={[del]} items={[]} onActionClick={onActionClick} type="ghost" />
  );
});
