import { memo } from 'react';

import ActionIconGroup, { type ActionEvent } from '@/components/ActionIconGroup';

import { useChatListActionsBar } from '../hooks/useChatListActionsBar';

interface ErrorActionsBarProps {
  onActionClick?: (action: ActionEvent) => void;
}

const ErrorActionsBar = memo<ErrorActionsBarProps>(({ onActionClick }) => {
  const { regenerate, del } = useChatListActionsBar();

  return <ActionIconGroup items={[regenerate, del]} onActionClick={onActionClick} type="ghost" />;
});

export default ErrorActionsBar;
