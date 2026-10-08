import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import TokenTag from '@/components/TokenTag';
import { useTokenCount } from '@/hooks/useTokenCount';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors } from '@/store/global/selectors';

import { useStore } from '../store';

const Tokens = memo(() => {
  const { t } = useTranslation('chat');
  const [systemRole, model] = useStore((s) => [s.config.systemRole, s.config.model]);
  const systemTokenCount = useTokenCount(systemRole);

  const showTag = useGlobalStore(modelProviderSelectors.modelHasMaxToken(model));
  const modelMaxTokens = useGlobalStore(modelProviderSelectors.modelMaxToken(model));

  if (!showTag) return null;

  return (
    <TokenTag
      displayMode={'used'}
      maxValue={modelMaxTokens}
      shape={'square'}
      text={{
        overload: t('tokenTag.overload'),
        remained: t('tokenTag.remained'),
        used: t('tokenTag.used'),
      }}
      value={systemTokenCount}
    />
  );
});

export default Tokens;
