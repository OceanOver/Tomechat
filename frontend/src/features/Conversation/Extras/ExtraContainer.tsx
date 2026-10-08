import { memo } from 'react';

// Horizontal divider above any extra content block attached to a message.
const ExtraContainer = memo(({ children }: { children?: React.ReactNode }) => (
  <div>
    <div className="mb-2 border-t border-border" />
    {children}
  </div>
));

export default ExtraContainer;
