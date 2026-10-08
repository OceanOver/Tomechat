'use client';

import { memo } from 'react';

const Footer = memo(() => {
  return (
    <div className="flex items-center justify-center p-4">
      <span className="text-muted-foreground">©{new Date().getFullYear()} Tomechat</span>
    </div>
  );
});

export default Footer;
