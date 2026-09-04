/**
 * pages/api/images/[...path].ts
 *
 * Pages Router の Catch-all API Route。
 * /api/images/products/hero.jpg のようなリクエストを受け、
 * オリジンサーバーから画像を取得してVercel CDNにキャッシュさせる。
 *
 * - Cache-Control: CDNキャッシュの鮮度を制御 (これがないとVercel-Cache-Tagだけでは
 *   キャッシュされない点に注意)
 * - Vercel-Cache-Tag: 後から `vercel cache invalidate --tag ...` や
 *   REST API (invalidate-by-tags) でグループ単位に無効化するためのラベル
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchImageFromOrigin, FetchImageError } from '../../../lib/fetchImageFromOrigin';

// CDNキャッシュの鮮度 (秒)。要件に応じて調整。
const CDN_MAX_AGE_SECONDS = 60 * 60 * 24; // 24時間
const STALE_WHILE_REVALIDATE_SECONDS = 60 * 60; // 1時間

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { path } = req.query;
  // catch-allルートなので path は string[] で渡ってくる
  const segments = Array.isArray(path) ? path : path ? [path] : [];

  if (segments.length === 0) {
    res.status(400).json({ error: '画像パスが指定されていません' });
    return;
  }

  // 例: ["products", "hero.jpg"] -> "/products/hero.jpg"
  const imagePath = `/${segments.map(encodeURIComponentSafe).join('/')}`;

  // w=800 のようなクエリパラメータをそのままオリジンへ中継したい場合はここで抽出
  const { path: _omit, ...restQuery } = req.query;
  const forwardParams = Object.fromEntries(
    Object.entries(restQuery).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string'
    )
  );

  try {
    console.log(`[api/images] fetching image from origin: ${imagePath}, params:`, forwardParams);
    const { buffer, contentType, etag } = await fetchImageFromOrigin(imagePath, {
      searchParams: forwardParams,
    });

    // このレスポンスをグループ化するタグ。
    // - 個別画像単位: `image:${imagePath}` -> 特定画像だけ無効化したい場合
    // - 全体グループ: `images` -> 画像全体を一括無効化したい場合
    const cacheTag = `image:${imagePath},images`;

    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Cache-Control',
      `public, s-maxage=${CDN_MAX_AGE_SECONDS}, stale-while-revalidate=${STALE_WHILE_REVALIDATE_SECONDS}`
    );
    res.setHeader('Vercel-Cache-Tag', cacheTag);
    if (etag) {
      res.setHeader('ETag', etag);
    }

    res.status(200).send(buffer);
  } catch (err) {
    if (err instanceof FetchImageError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    console.error('[api/images] unexpected error:', err);
    res.status(500).json({ error: '画像の取得中に予期しないエラーが発生しました' });
  }
}

/** URLセグメントのエンコード漏れ・二重エンコードを防ぐための軽量ヘルパー */
function encodeURIComponentSafe(segment: string): string {
  try {
    // すでにエンコード済みの場合はデコードしてから再エンコードし、二重エンコードを避ける
    return encodeURIComponent(decodeURIComponent(segment));
  } catch {
    return encodeURIComponent(segment);
  }
}

// 画像バイナリを扱うため、Next.jsのデフォルトのbodyParserは不要
export const config = {
  api: {
    bodyParser: false,
  },
};
