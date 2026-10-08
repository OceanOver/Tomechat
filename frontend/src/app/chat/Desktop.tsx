'use client';

import { memo } from 'react';

import PageTitle from './features/PageTitle';
import ChatHeader from './features/ChatHeader';
import Conversation from './features/Conversation';
import SideBar from './features/SideBar';
import Layout from './layout.desktop';

const DesktopPage = memo(() => (
  <Layout>
    <PageTitle />
    <ChatHeader />
    <div className="flex min-h-0 flex-1">
      <Conversation />
      <SideBar />
    </div>
  </Layout>
));
export default DesktopPage;
