
import type {
    KnowledgeList, KnowledgeFormFields, Reseponse,
    KnowledgeFilesList, KnowledgeDelDocsParams, KnowledgeDelDocsRes,
    KnowledgeRebuildVectorParams, 
    ReAddVectorDBParams, ReAddVectorDBRes,
    KnowledgeSearchDocsParams, KnowledgeSearchDocsList, KnowledgeUpdateDocsParams
} from '@/types/knowledge';

import { fetchSSE, FetchSSEOptions } from '@/utils/fetch';
import { API_ENDPOINTS } from './_url';

// Backend down or proxy 5xx returns an empty/HTML body; bare parseJsonRes(res) would throw an
// opaque SyntaxError that crashes the page — surface a readable error instead (SWR and
// callers turn it into an error state).
export const parseJsonRes = async <T = any>(res: Response): Promise<T> => {
    const text = await res.text();
    try {
        return JSON.parse(text) as T;
    } catch {
        throw new Error(`knowledge API ${res.status}: empty or invalid response`);
    }
};

class KnowledgeService {
    getList = async (): Promise<Reseponse<KnowledgeList>> => {
        const res = await fetch(`${API_ENDPOINTS.knowledgeList}`);
        const data = await parseJsonRes(res);
        return data;
    };

    add = async (formValues: KnowledgeFormFields) => {
        const res = await fetch(`${API_ENDPOINTS.knowledgeAdd}`, {
            body: JSON.stringify(formValues),
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        });
        return parseJsonRes(res);
    };
    update = async (formValues: Partial<KnowledgeFormFields>) => {
        const res = await fetch(`${API_ENDPOINTS.knowledgeUpdate}`, {
            body: JSON.stringify(formValues),
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        });
        return parseJsonRes(res);
    };

    del = async (name: string) => {
        const res = await fetch(`${API_ENDPOINTS.knowledgeDel}`, {
            body: JSON.stringify(name),
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        });
        return parseJsonRes(res);
    };

    getFilesList = (name: string): () => Promise<Reseponse<KnowledgeFilesList>> => {
        const queryString = new URLSearchParams({
            knowledge_base_name: name
        }).toString();
        return async () => {
            const res = await fetch(`${API_ENDPOINTS.knowledgeFilesList}?${queryString}`);
            const data = await parseJsonRes(res);
            return data;
        }
    };

    uploadDocs = async (formData: FormData): Promise<Reseponse<{}>> => {
        const res = await fetch(`${API_ENDPOINTS.knowledgeUploadDocs}`, {
            body: formData,
            method: 'POST',
        });
        return parseJsonRes(res);
    };

    delInknowledgeDB = async (params: KnowledgeDelDocsParams): Promise<Reseponse<KnowledgeDelDocsRes>> => {
        const res = await fetch(`${API_ENDPOINTS.knowledgeDelInknowledgeDB}`, {
            body: JSON.stringify({
                ...params,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        });
        return parseJsonRes(res);
    };

    rebuildVectorDB = async (params: KnowledgeRebuildVectorParams, opts:
        { onFinish: FetchSSEOptions["onFinish"]; onMessageHandle: FetchSSEOptions["onMessageHandle"] }
    ) => {
        const { onFinish, onMessageHandle } = opts;
        return fetchSSE(async () => await fetch(`${API_ENDPOINTS.knowledgeRebuildVectorDB}`, {
            body: JSON.stringify({
                ...params,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST'
        }), {
            onErrorHandle: (error) => {
                throw new Error('请求错误：' + error);
            },
            onFinish,
            onMessageHandle
        })
    };

    delVectorDocs = async (params: KnowledgeDelDocsParams): Promise<Reseponse<KnowledgeDelDocsRes>> => {
        const res = await fetch(`${API_ENDPOINTS.knowledgeDelVectorDB}`, {
            body: JSON.stringify({
                ...params,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        });
        return parseJsonRes(res);
    };
 
    downloadDocs = async (kbName: string, docName: string): Promise<void> => {
        const queryString = new URLSearchParams({
            file_name: docName,
            knowledge_base_name: kbName,
            preview: 'false'
        }).toString();
        const url = `${API_ENDPOINTS.knowledgeDownloadDocs}?${queryString}`;
        window.open(url, docName); 
    }; 
    reAddVectorDB = async (params: ReAddVectorDBParams): Promise<Reseponse<ReAddVectorDBRes>> => {
        const res = await fetch(`${API_ENDPOINTS.knowledgeReAddVectorDB}`, {
            body: JSON.stringify({
                ...params,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        });
        return parseJsonRes(res);
    };
    searchDocs = async (params: KnowledgeSearchDocsParams): Promise<KnowledgeSearchDocsList> => {
        const res = await fetch(`${API_ENDPOINTS.knowledgeSearchDocs}`, {
            body: JSON.stringify({
                ...params,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        });
        return parseJsonRes(res);
    }; 
    updateDocs = async (params: KnowledgeUpdateDocsParams): Promise<Reseponse<{}>> => {
        const res = await fetch(`${API_ENDPOINTS.updateDocsContent}`, {
            body: JSON.stringify({
                ...params,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        });
        return parseJsonRes(res);
    }; 
}

export const knowledgeService = new KnowledgeService();
