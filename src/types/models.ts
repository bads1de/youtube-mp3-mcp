/**
 * モデル関連の型定義
 */

/**
 * 音声品質の種類
 */
export type AudioQuality = "low" | "medium" | "high";

/**
 * 音声フォーマットを表すインターフェース
 */
export interface AudioFormat {
  /** 音声品質 */
  quality: AudioQuality;

  /** ビットレート（kbps） */
  bitrate: number;

  /** ファイル拡張子 */
  extension: "mp3";
}

/**
 * YouTubeの動画情報を表すインターフェース
 */
export interface YouTubeVideoData {
  /** 動画ID */
  id: string;

  /** 動画タイトル */
  title: string;

  /** 動画作者 */
  author: string;

  /** 動画の長さ（秒） */
  duration: number;

  /** サムネイルURL */
  thumbnailUrl: string;

  /** 動画URL */
  url: string;
}

/**
 * ダウンロードタスクのステータス
 */
export type DownloadStatus =
  | "pending"
  | "downloading"
  | "converting"
  | "completed"
  | "failed";

/**
 * ダウンロードタスクの初期化パラメータ
 */
export interface DownloadTaskParams {
  /** タスクID */
  id: string;

  /** ダウンロード対象の動画 */
  video: any; // YouTubeVideoクラスの型を使用

  /** 出力音声フォーマット */
  format: AudioFormat;

  /** 出力ファイルパス */
  outputPath: string;
}
