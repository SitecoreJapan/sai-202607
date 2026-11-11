import { type NextRequest } from "next/server";
import {
  defineProxy,
  PreviewProxy,
  AppRouterMultisiteProxy,
  PersonalizeProxy,
  RedirectsProxy,
  LocaleProxy,
} from "@sitecore-content-sdk/nextjs/proxy";
import sites from ".sitecore/sites.json";
import scConfig from "sitecore.config";
import { routing } from "./i18n/routing";
import client from "./lib/sitecore-client";
import { initContentSdk } from "@sitecore-content-sdk/core";
import { analyticsPlugin } from "@sitecore-content-sdk/analytics-core";
import { eventsPlugin } from "@sitecore-content-sdk/events";
import { personalizeServerPlugin } from "@sitecore-content-sdk/personalize";
import {
  analyticsProxyAdapter,
  personalizeProxyAdapter,
} from "@sitecore-content-sdk/nextjs";
const preview = new PreviewProxy({
  client,
  ...scConfig.api.edge,
});

const locale = new LocaleProxy({
  /**
   * List of sites for site resolver to work with
   */
  sites,
  /**
   * List of all supported locales configured in routing.ts
   */
  locales: routing.locales.slice(),
  // This function determines if the middleware should be turned off on per-request basis.
  // Certain paths are ignored by default (e.g. files and Next.js API routes), but you may wish to disable more.
  // This is an important performance consideration since Next.js Edge middleware runs on every request.
  // in multilanguage scenarios, we need locale middleware to always run first to ensure locale is set and used correctly by the rest of the middlewares
  skip: () => false,
});

const multisite = new AppRouterMultisiteProxy({
  /**
   * List of sites for site resolver to work with
   */
  sites,
  ...scConfig.api.edge,
  ...scConfig.multisite,
  // This function determines if the middleware should be turned off on per-request basis.
  // Certain paths are ignored by default (e.g. files and Next.js API routes), but you may wish to disable more.
  // This is an important performance consideration since Next.js Edge middleware runs on every request.
  skip: () => false,
});

const redirects = new RedirectsProxy({
  /**
   * List of sites for site resolver to work with
   */
  sites,
  ...scConfig.api.edge,
  ...scConfig.api.local,
  ...scConfig.redirects,
  // This function determines if the middleware should be turned off on per-request basis.
  // Certain paths are ignored by default (e.g. Next.js API routes), but you may wish to disable more.
  // By default it is disabled while in development mode.
  // This is an important performance consideration since Next.js Edge middleware runs on every request.
  skip: () => false,
});

const personalize = new PersonalizeProxy({
  /**
   * List of sites for site resolver to work with
   */
  sites,
  ...scConfig.api.edge,
  ...scConfig.personalize,
  // This function determines if the middleware should be turned off on per-request basis.
  //skip: () => false,
  // Certain paths are ignored by default (e.g. Next.js API routes), but you may wish to disable more.
  // By default it is disabled while in development mode.
  // This is an important performance consideration since Next.js Edge middleware runs on every request.
  skip: (req: NextRequest) => {
    const consent = req.cookies.get("sitecore-cookie-consent")?.value;

    // Consent が accepted でなければ PersonalizeProxy を skip
    return consent !== "accepted";
  },
});

export default async function proxy(req: NextRequest) {
  return defineProxy(preview, locale, multisite, redirects, personalize).exec(
    req,
  );

  // const response = await defineProxy(
  //   preview,
  //   locale,
  //   multisite,
  //   redirects,
  //   personalize,
  // ).exec(req);

  // await initContentSdk({
  //   config: {
  //     contextId: process.env.SITECORE_EDGE_CONTEXT_ID!,
  //     siteName: process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME!,
  //   },
  //   plugins: [
  //     analyticsPlugin({
  //       options: {
  //         enableCookie: false,
  //       },
  //       adapter: analyticsProxyAdapter(req, response),
  //     }),

  //     eventsPlugin(),

  //     personalizeServerPlugin({
  //       options: {
  //         enablePersonalizeCookie: false,
  //       },
  //       adapter: personalizeProxyAdapter(req, response),
  //     }),
  //   ],
  // });

  // return response;
}

export const config = {
  /*
   * Match all paths except for:
   * 1. API route handlers
   * 2. /_next (Next.js internals)
   * 3. /sitecore/api (Sitecore API routes)
   * 4. /- (Sitecore media)
   * 5. /healthz (Health check)
   * 7. all root files inside /public
   */
  matcher: [
    "/",
    "/((?!api/|\\.well-known/|sitemap|robots|llms|_next/|healthz|sitecore/api/|-/|favicon.ico|sc_logo.svg|ai/).*)",
  ],
};
