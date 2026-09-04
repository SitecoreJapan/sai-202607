/**
 * fetchImageFromOrigin.ts
 *
 * 外部オリジンサーバー(例: Sitecore Experience Edge / Media Library)から
 * 画像バイナリを取得するための共通処理。
 *
 * - タイムアウト制御 (AbortController)
 * - Content-Type検証 (画像以外を弾く)
 * - HTTPエラー / ネットワークエラーのハンドリング
 * - オリジン側のETag/Last-Modifiedを条件付きリクエストとして中継 (任意)
 */

// ---- 設定値 ---------------------------------------------------------------

/** オリジンサーバーのベースURL。環境変数から取得し、末尾スラッシュを除去 */
const ORIGIN_BASE_URL = (process.env.IMAGE_ORIGIN_BASE_URL ?? '').replace(/\/+$/, '');

/** オリジンへのリクエストタイムアウト(ミリ秒) */
const FETCH_TIMEOUT_MS = Number(process.env.IMAGE_ORIGIN_TIMEOUT_MS ?? 10_000);

/** 許容する画像のContent-Typeプレフィックス */
const ALLOWED_CONTENT_TYPE_PREFIX = 'image/';

/** レスポンスとして許容する最大サイズ(バイト)。Vercel Functionsの制約に合わせて調整可能 */
const MAX_IMAGE_BYTES = Number(process.env.IMAGE_MAX_BYTES ?? 10 * 1024 * 1024); // 10MB

// ---- 型定義 -----------------------------------------------------------------

export interface FetchImageResult {
  /** 画像バイナリ本体 */
  buffer: Buffer;
  /** オリジンから返却されたContent-Type (例: image/jpeg) */
  contentType: string;
  /** オリジンのETag (存在する場合。Cache-Tag以外の追加検証に利用可能) */
  etag?: string;
  /** オリジンのLast-Modified (存在する場合) */
  lastModified?: string;
}

/** 呼び出し側でHTTPステータスに変換しやすいようにエラー種別を持たせる */
export class FetchImageError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'FetchImageError';
  }
}

// ---- 本体 -------------------------------------------------------------------

/**
 * オリジンサーバーから画像を取得する。
 *
 * @param imagePath オリジンのベースURLに続くパス (例: "/-/media/project/site/images/hero.jpg")
 *                  もしくは完全なURL (http/https始まり) をそのまま渡すことも可能
 * @param options.searchParams オリジンに引き渡すクエリパラメータ (例: 幅指定 ?w=800 など)
 */
export async function fetchImageFromOrigin(
  imagePath: string,
  options: { searchParams?: Record<string, string> } = {}
): Promise<FetchImageResult> {
  if (!imagePath) {
    throw new FetchImageError('画像パスが指定されていません', 400);
  }

  const url = buildOriginUrl(imagePath, options.searchParams);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    console.log(`[fetchImageFromOrigin] fetching image from origin: ${url}`);
    response = await fetch(url, {
      signal: controller.signal,
      // オリジン側のCDN/キャッシュを効かせるため、Next.js fetchの独自キャッシュは無効化
      // (このレイヤーのキャッシュ管理はVercel CDN + Vercel-Cache-Tagに一任する)
      cache: 'no-store',
      headers: {
        Accept: 'image/avif,image/webp,image/*,*/*;q=0.8',
      },
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new FetchImageError(
        `オリジンサーバーへのリクエストがタイムアウトしました (${FETCH_TIMEOUT_MS}ms): ${url}`,
        504,
        err
      );
    }
    throw new FetchImageError(`オリジンサーバーへの接続に失敗しました: ${url}`, 502, err);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new FetchImageError(
      `オリジンサーバーがエラーを返却しました (status: ${response.status}): ${url}`,
      response.status === 404 ? 404 : 502
    );
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().startsWith(ALLOWED_CONTENT_TYPE_PREFIX)) {
    throw new FetchImageError(
      `画像以外のコンテンツが返却されました (content-type: ${contentType || '不明'}): ${url}`,
      415
    );
  }

  const contentLengthHeader = response.headers.get('content-length');
  if (contentLengthHeader && Number(contentLengthHeader) > MAX_IMAGE_BYTES) {
    throw new FetchImageError(
      `画像サイズが上限(${MAX_IMAGE_BYTES}バイト)を超えています: ${url}`,
      413
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_IMAGE_BYTES) {
    throw new FetchImageError(
      `画像サイズが上限(${MAX_IMAGE_BYTES}バイト)を超えています: ${url}`,
      413
    );
  }

  return {
    buffer: Buffer.from(arrayBuffer),
    contentType,
    etag: response.headers.get('etag') ?? undefined,
    lastModified: response.headers.get('last-modified') ?? undefined,
  };
}

// ---- ヘルパー ---------------------------------------------------------------

/**
 * imagePathが完全なURLならそのまま使用し、相対パスならORIGIN_BASE_URLと連結してURLを構築する。
 * ディレクトリトラバーサル("..")を含むパスは拒否する。
 */
function buildOriginUrl(imagePath: string, searchParams?: Record<string, string>): string {
  if (imagePath.includes('..')) {
    throw new FetchImageError('不正な画像パスです', 400);
  }

  const isAbsoluteUrl = /^https?:\/\//i.test(imagePath);

  if (!isAbsoluteUrl && !ORIGIN_BASE_URL) {
    throw new FetchImageError('環境変数 IMAGE_ORIGIN_BASE_URL が設定されていません', 500);
  }

  const base = isAbsoluteUrl
    ? imagePath
    : `${ORIGIN_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;

  const url = new URL(base);
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return url.toString();
}

