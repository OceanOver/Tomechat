import { memo } from 'react';

import ActionIconGroup from '@/components/ActionIconGroup';

import { useChatListActionsBar } from '../hooks/useChatListActionsBar';
import { RenderAction } from '../types';
import { useCustomActions } from './customAction';

export const UserActionsBar: RenderAction = memo(({ onActionClick }) => {
  const { regenerate, edit, copy, divider, del } = useChatListActionsBar();
  const { translate } = useCustomActions();

  return (
    <ActionIconGroup
      dropdownMenu={[edit, copy, divider, translate, divider, regenerate, del]}
      items={[regenerate, edit]}
      onActionClick={onActionClick}
      type="ghost"
    />
  );
});
