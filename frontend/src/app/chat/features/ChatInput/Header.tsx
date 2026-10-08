import { Maximize2, Minimize2 } from 'lucide-react';
import { memo } from 'react';

import ActionIcon from '@/components/ActionIcon';

import ActionBar from '@/features/ChatInput/ActionBar';

interface HeaderProps {
  expand: boolean;
  setExpand: (expand: boolean) => void;
}

const Header = memo<HeaderProps>(({ expand, setExpand }) => (
  <ActionBar
    padding={'0 24px'}
    rightAreaEndRender={
      <ActionIcon
        icon={expand ? Minimize2 : Maximize2}
        onClick={() => {
          setExpand(!expand);
        }}
      />
    }
  />
));

export default Header;
