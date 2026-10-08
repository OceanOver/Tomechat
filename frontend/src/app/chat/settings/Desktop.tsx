'use client';

import { memo } from 'react';

import SessionHydration from '@/app/chat/components/SessionHydration';

import EditPage from './features/EditPage';
import Layout from './layout.desktop';

const ChatSettings = memo(() => (
  <>
    <Layout>
      <EditPage />
    </Layout>
    <SessionHydration />
  </>
));

export default ChatSettings;
