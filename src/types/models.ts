/**
 * [EN] Model related type definitions
 *
 * [JA] モデル関連の型定義
 */

/**
 * [EN] Audio quality types
 *
 * [JA] 音声品質の種類
 */
export type AudioQuality = "low" | "medium" | "high";

/**
 * [EN] Interface representing audio format
 *
 * [JA] 音声フォーマットを表すインターフェース
 */
export interface AudioFormat {
  /** [EN] Audio quality / [JA] 音声品質 */
  quality: AudioQuality;

  /** [EN] Bitrate (kbps) / [JA] ビットレート（kbps） */
  bitrate: number;

  /** [EN] File extension / [JA] ファイル拡張子 */
  extension: "mp3";
}

/**
 * [EN] Interface representing YouTube video information
 *
 * [JA] YouTubeの動画情報を表すインターフェース
 */
export interface YouTubeVideoData {
  /** [EN] Video ID / [JA] 動画ID */
  id: string;

  /** [EN] Video title / [JA] 動画タイトル */
  title: string;

  /** [EN] Video author / [JA] 動画作者 */
  author: string;

  /** [EN] Video duration (seconds) / [JA] 動画の長さ（秒） */
  duration: number;

  /** [EN] Thumbnail URL / [JA] サムネイルURL */
  thumbnailUrl: string;

  /** [EN] Video URL / [JA] 動画URL */
  url: string;
}

/**
 * [EN] Download task status
 *
 * [JA] ダウンロードタスクのステータス
 */
export type DownloadStatus =
  | "pending"
  | "downloading"
  | "converting"
  | "completed"
  | "failed";

/**
 * [EN] Download task initialization parameters
 *
 * [JA] ダウンロードタスクの初期化パラメータ
 */
export interface DownloadTaskParams {
  /** [EN] Task ID / [JA] タスクID */
  id: string;

  /** [EN] Video to download / [JA] ダウンロード対象の動画 */
  video: any; // YouTubeVideoクラスの型を使用

  /** [EN] Output audio format / [JA] 出力音声フォーマット */
  format: AudioFormat;

  /** [EN] Output file path / [JA] 出力ファイルパス */
  outputPath: string;
}
