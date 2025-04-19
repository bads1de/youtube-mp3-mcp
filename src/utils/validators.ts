/**
 * 入力検証に関するユーティリティ関数
 */

/**
 * 文字列がYouTube URLかどうかを検証する
 * @param url 検証する文字列
 * @returns YouTube URLの場合はtrue、そうでない場合はfalse
 */
export function isYouTubeUrl(url: string): boolean {
  // YouTube URLのパターン
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/youtu\.be\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/v\/[\w-]+/
  ];
  
  // いずれかのパターンにマッチすればtrue
  return patterns.some(pattern => pattern.test(url));
}

/**
 * ファイルパスが安全かどうかを検証する
 * @param path 検証するファイルパス
 * @returns 安全な場合はtrue、そうでない場合はfalse
 */
export function isSafeFilePath(path: string): boolean {
  // 危険なパターン
  const dangerousPatterns = [
    /\.\./,  // 親ディレクトリへの参照
    /^[\/\\]/,  // 絶対パス
    /[<>:"|?*]/  // Windowsで使用できない文字
  ];
  
  // いずれかの危険なパターンにマッチすればfalse
  return !dangerousPatterns.some(pattern => pattern.test(path));
}

/**
 * 文字列を安全なファイル名に変換する
 * @param input 変換する文字列
 * @returns 安全なファイル名
 */
export function sanitizeFileName(input: string): string {
  // ファイル名に使用できない文字を置換
  return input
    .replace(/[\\/:*?"<>|]/g, '_')  // 特殊文字を_に置換
    .replace(/\s+/g, ' ')  // 連続する空白を1つにまとめる
    .trim();  // 前後の空白を削除
}
