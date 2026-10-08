import { getServerConfig } from '@/config/server';
 
const { KNOWLEDGE_PROXY_URL } = getServerConfig();
export const GET = async (request: Request) => {   
    const fetchRes = await fetch(`${KNOWLEDGE_PROXY_URL}/list_knowledge_bases`, { cache: 'no-store' });
    return fetchRes;
};

// Next.js 14 caches GET route handlers by default — force dynamic so every request hits the backend
export const dynamic = 'force-dynamic';
