import ChatHeaderBase from '@/components/ChatHeader';
import { memo } from 'react';

import HeaderAction from './HeaderAction';
import Main from './Main';

const Header = memo(() => (
  <ChatHeaderBase left={<Main />} right={<HeaderAction />} />
));

export default Header;
