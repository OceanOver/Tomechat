/* eslint-disable sort-keys-fix/sort-keys-fix */
import { transform } from 'lodash-es';

import { withBasePath } from '@/utils/basePath';

const mapWithBasePath = <T extends object>(apis: T): T => {
  return transform(apis, (result, value, key) => {
    if (typeof value === 'string') {
      // @ts-ignore
      result[key] = withBasePath(value);
    } else {
      result[key] = value;
    }
  });
};

export const API_ENDPOINTS = mapWithBasePath({
  config: '/api/config',
  proxy: '/api/proxy',

  // chat
  chat: (provider: string) => withBasePath(`/api/chat/${provider}`),

  // models
  models: (provider: string) => withBasePath(`/api/models/${provider}`),

  // knowledge
  knowledgeList: '/api/knowledge/list', 
  knowledgeAdd: '/api/knowledge/add',
  knowledgeUpdate: '/api/knowledge/update',
  knowledgeDel: '/api/knowledge/del',
  // knowledge files
  knowledgeFilesList: '/api/knowledge/listFiles', 
  knowledgeUploadDocs:  '/api/knowledge/uploadDocs', 
  updateDocsContent:  '/api/knowledge/updateDocs', 
  knowledgeDownloadDocs:  '/api/knowledge/downloadDocs', 
  knowledgeDelInknowledgeDB:  '/api/knowledge/deleteDocs', 
  knowledgeDelVectorDB:'/api/knowledge/delVectorDocs', 
  knowledgeRebuildVectorDB:  '/api/knowledge/rebuildVectorDB', 
  knowledgeReAddVectorDB:  '/api/knowledge/reAddVectorDB', 
  knowledgeSearchDocs: '/api/knowledge/searchDocs',  
});
