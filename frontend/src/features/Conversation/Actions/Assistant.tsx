import { memo } from 'react';

import ActionIconGroup from '@/components/ActionIconGroup';

import { useChatListActionsBar } from '../hooks/useChatListActionsBar';
import { RenderAction } from '../types';
import ErrorActionsBar from './Error';
import { useCustomActions } from './customAction';

export const AssistantActionsBar: RenderAction = memo(({ id, onActionClick, error }) => {
  const { regenerate, edit, delAndRegenerate, copy, divider, del } = useChatListActionsBar();
  const { translate } = useCustomActions();

  if (id === 'default') return null;

  if (error) return <ErrorActionsBar onActionClick={onActionClick} />;

  return (
    <ActionIconGroup
      dropdownMenu={[
        edit,
        copy,
        divider,
        translate,
        divider,
        regenerate,
        delAndRegenerate,
        del,
      ]}
      items={[regenerate, copy]}
      onActionClick={onActionClick}
      type="ghost"
    />
  );
});



export {type ActionEvent} from '@/components/ActionIconGroup';