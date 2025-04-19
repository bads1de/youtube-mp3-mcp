/**
 * ダウンロード関連の型定義
 */
import { AudioFormat, YouTubeVideoInfo } from './youtube';

/**
 * ダウンロードタスクのステータス
 */
export type DownloadStatus = 'pending' | 'downloading' | 'converting' | 'completed' | 'failed';

/**
 * ダウンロード結果を表すインターフェース
 */
export interface DownloadResult {
  videoInfo: YouTubeVideoInfo;
  format: AudioFormat;
  outputPath: string;
  status: DownloadStatus;
  error?: string;
}
