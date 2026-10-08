import { useRouter } from 'next/navigation';

import { useResponsive } from '@/hooks/useResponsive';
import { useGlobalStore } from '@/store/global';
import { pathString } from '@/utils/url';

import { OnAvatarsClick } from '../types';

export const useAvatarsClick = (): OnAvatarsClick => {
  const [toggleSystemRole] = useGlobalStore((s) => [s.toggleSystemRole]);
  const { isMobile } = useResponsive();
  const router = useRouter();

  return (role) => {
    switch (role) {
      case 'assistant': {
        return () =>
          isMobile
            ? router.push(pathString('/chat/settings', { search: location.search }))
            : toggleSystemRole(true);
      }
    }
  };
};
