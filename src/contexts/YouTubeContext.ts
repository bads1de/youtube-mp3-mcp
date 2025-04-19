import { YouTubeVideo } from "../models/YouTubeVideo";
import { AudioQualityUtils } from "../models/AudioFormat";
import { AudioFormat, IYouTubeContext } from "../types";
import youtubeDl from "youtube-dl-exec";

/**
 * YouTube APIとの通信を管理するコンテキスト
 */
export class YouTubeContext implements IYouTubeContext {
  /**
   * YouTube URLが有効かどうかを検証する
   * @param url 検証するURL
   * @returns URLが有効な場合はtrue、そうでない場合はfalse
   */
  async validateUrl(url: string): Promise<boolean> {
    const videoId = YouTubeVideo.extractVideoId(url);
    return videoId !== null;
  }

  /**
   * YouTube URLから動画情報を取得する
   * @param url YouTube URL
   * @returns YouTubeVideoオブジェクト
   * @throws URLが無効な場合やAPIエラーの場合
   */
  async getVideoInfo(url: string): Promise<YouTubeVideo> {
    try {
      // youtube-dl-execを使用して動画情報を取得
      const info = await youtubeDl(url, {
        dumpSingleJson: true,
        noWarnings: true,
        preferFreeFormats: true,
        youtubeSkipDashManifest: true,
      });

      // YouTubeVideoオブジェクトを作成して返す
      return new YouTubeVideo({
        id: info.id,
        title: info.title,
        author: info.uploader || info.channel || "Unknown",
        duration: info.duration || 0,
        thumbnailUrl: info.thumbnail || "",
        url: info.webpage_url || url,
      });
    } catch (error) {
      throw new Error(
        `動画情報の取得に失敗しました: ${(error as Error).message}`
      );
    }
  }

  /**
   * 動画で利用可能な音声フォーマットを取得する
   * @param video YouTubeVideoオブジェクト
   * @returns 利用可能な音声フォーマットの配列
   */
  async getAvailableFormats(_video: YouTubeVideo): Promise<AudioFormat[]> {
    // 現在の実装では、常に3つの固定フォーマット（低、中、高品質）を返す
    return [
      AudioQualityUtils.createFromQuality("low"),
      AudioQualityUtils.createFromQuality("medium"),
      AudioQualityUtils.createFromQuality("high"),
    ];
  }
}
