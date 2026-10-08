import { Metadata } from 'next';

import { getCanonicalUrl } from '@/const/url';

import DesktopPage from './Desktop';

const Page = () => <DesktopPage />;

export default Page;

export const metadata: Metadata = {
  alternates: { canonical: getCanonicalUrl('/welcome') },
};
