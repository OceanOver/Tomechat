import { memo } from 'react';

import AgentConfig from './AgentConfig';
import AgentMeta from './AgentMeta';
import AgentPrompt from './AgentPrompt';
import StoreUpdater, { StoreUpdaterProps } from './StoreUpdater';
import { Provider, createStore } from './store';

// The panel owns a private store per mount; StoreUpdater bridges props from
// the host page, the three sections below read and write through the store.
const AgentSetting = memo<StoreUpdaterProps>((props) => (
  <Provider createStore={createStore}>
    <StoreUpdater {...props} />
    <AgentPrompt />
    <AgentMeta />
    <AgentConfig />
  </Provider>
));

export default AgentSetting;
