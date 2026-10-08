import urlJoin from 'url-join';

import { withBasePath } from '@/utils/basePath';

import { INBOX_SESSION_ID } from './session';

export const getCanonicalUrl = (path: string) => urlJoin('/', path);

export const SESSION_CHAT_URL = (id: string = INBOX_SESSION_ID) => `/chat?session=${id}`;

export const imageUrl = (filename: string) => withBasePath(`/images/${filename}`);
