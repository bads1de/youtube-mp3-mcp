import { YouTubeVideoData } from "../types";

/**
 * YouTubeの動画情報を表すクラス
 */
export class YouTubeVideo implements YouTubeVideoData {
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

  /**
   * YouTubeVideoのコンストラクタ
   */
  constructor(params: YouTubeVideoData) {
    this.id = params.id;
    this.title = params.title;
    this.author = params.author;
    this.duration = params.duration;
    this.thumbnailUrl = params.thumbnailUrl;
    this.url = params.url;
  }

  /**
   * 動画の長さを「時:分:秒」形式でフォーマットする
   * @returns フォーマットされた時間文字列
   */
  formatDuration(): string {
    const hours = Math.floor(this.duration / 3600);
    const minutes = Math.floor((this.duration % 3600) / 60);
    const seconds = this.duration % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
  }

  /**
   * YouTube URLから動画IDを抽出する
   * @param url YouTube URL
   * @returns 動画ID、または無効なURLの場合はnull
   */
  static extractVideoId(url: string): string | null {
    // 標準的なYouTube URLからIDを抽出（例: https://www.youtube.com/watch?v=VIDEO_ID）
    let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
    if (match && match[1]) {
      return match[1];
    }

    // 短縮URLからIDを抽出（例: https://youtu.be/VIDEO_ID）
    match = url.match(/(?:youtu\.be\/)([^&?/]+)/);
    if (match && match[1]) {
      return match[1];
    }

    return null;
  }
}
