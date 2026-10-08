import { getServerConfig } from '@/config/server';

import DesktopPage from './Desktop';

const Page = () => {
  const { SHOW_ACCESS_CODE_CONFIG } = getServerConfig();

  return <DesktopPage showAccessCodeConfig={SHOW_ACCESS_CODE_CONFIG} />;
};

export default Page;
