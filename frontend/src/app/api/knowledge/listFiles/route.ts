import { getServerConfig } from '@/config/server'; 

const { KNOWLEDGE_PROXY_URL } = getServerConfig(); 
export const GET = async (request: Request) => {
    const knowledge_base_name: string = new URL(request.url).searchParams.get('knowledge_base_name') as string; 
    const queryString = new URLSearchParams({ knowledge_base_name }).toString();
    const fetchRes = await fetch(`${KNOWLEDGE_PROXY_URL}/list_files?${queryString}`, { cache: 'no-store' });
    return fetchRes;
};

// Next.js 14 caches GET route handlers by default — force dynamic so every request hits the backend
export const dynamic = 'force-dynamic';
