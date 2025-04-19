/**
 * YouTube関連の型定義
 */

/**
 * 音声品質の種類
 */
export type AudioQuality = 'low' | 'medium' | 'high';

/**
 * 音声フォーマットを表すインターフェース
 */
export interface AudioFormat {
  quality: AudioQuality;
  bitrate: number;
  extension: 'mp3';
}

/**
 * YouTubeの動画情報を表すインターフェース
 */
export interface YouTubeVideoInfo {
  id: string;
  title: string;
  author: string;
  duration: number;
  thumbnailUrl: string;
  url: string;
}
