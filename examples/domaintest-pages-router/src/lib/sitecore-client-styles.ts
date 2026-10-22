import { SitecoreClient } from '@sitecore-content-sdk/nextjs/client';
import scConfig from 'sitecore.config';

const client = new SitecoreClient({
  ...scConfig,
  api: {
    ...scConfig.api,
    edge: {
      ...scConfig.api.edge,
      contextId: process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID || '',
    },
  },
});

export default client;
