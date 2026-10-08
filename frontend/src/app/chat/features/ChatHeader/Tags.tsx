import { memo } from 'react';

import ModelTag from '@/components/ModelTag';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

const TitleTags = memo(() => {
  const model = useSessionStore(agentSelectors.currentAgentModel);
  // Hide the model tag when the backend is unreachable (model list not fetched)
  const showTag = useGlobalStore(modelProviderSelectors.isRemoteModelListReady);

  if (!showTag) return null;

  return (
    <div className="flex items-center gap-2">
      <ModelTag model={model} />
    </div>
  );
});

export default TitleTags;
