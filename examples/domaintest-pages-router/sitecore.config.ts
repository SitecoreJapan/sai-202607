import { defineConfig } from '@sitecore-content-sdk/nextjs/config';
/**
 * @type {import('@sitecore-content-sdk/nextjs/config').SitecoreConfig}
 * See the documentation for `defineConfig`:
 * https://doc.sitecore.com/xmc/en/developers/content-sdk/the-sitecore-configuration-file.html
 */
export default defineConfig({
  api: {
    edge: {
      contextId:
        process.env.SITECORE_EDGE_CONTEXT_ID ||
        process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID ||
        '',
      clientContextId: process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID,
      edgeUrl: process.env.NEXT_PUBLIC_SITECORE_EDGE_PLATFORM_HOSTNAME,
    },
    local: {
      apiKey: process.env.NEXT_PUBLIC_SITECORE_API_KEY || '',
      apiHost: process.env.NEXT_PUBLIC_SITECORE_API_HOST || '',
    },
  },
  defaultSite: process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME,
  defaultLanguage: process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en',
  editingSecret: process.env.SITECORE_EDITING_SECRET,
  redirects: {
    enabled: true,
    locales: ['en'],
  },
  multisite: {
    enabled: false,
    useCookieResolution: () => process.env.VERCEL_ENV === 'preview',
  },
  personalize: {
    scope: process.env.NEXT_PUBLIC_PERSONALIZE_SCOPE,
    edgeTimeout: parseInt(process.env.PERSONALIZE_MIDDLEWARE_EDGE_TIMEOUT!, 10),
    cdpTimeout: parseInt(process.env.PERSONALIZE_MIDDLEWARE_EDGE_TIMEOUT!, 10),
  },
  rewriteMediaUrls: function rewriteEdgeHostInString(str: string): string {
    const customEdgeUrl = '';
    const EDGE_HOST_PATTERN = new RegExp('sitecoresaa27d4-sai2026070698-dev48c1-2d4c', 'gi');
    return str.replace(EDGE_HOST_PATTERN, customEdgeUrl);
  },
});
