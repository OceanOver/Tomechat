'use client';

import { memo } from 'react';

import Footer from './features/Footer';
import Showcase from './features/Showcase';
import Layout from './layout.desktop';

export default memo(() => (
  <Layout>
    <Showcase />
    <Footer />
  </Layout>
));
