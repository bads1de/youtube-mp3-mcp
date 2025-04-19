/**
 * YouTube関連のサービス
 */
import youtubeDl from "youtube-dl-exec";
import { AudioFormat, AudioQuality, YouTubeVideoData } from "../types/models";
import { config } from "../config";

/**
 * YouTubeサービスクラス
 * YouTube動画の情報取得や検証を行う
 */
export class YouTubeService {
  /**
   * YouTubeのURLを検証する
   * @param url 検証するURL
   * @returns URLが有効な場合はtrue、そうでない場合はfalse
   */
  async validateUrl(url: string): Promise<boolean> {
    try {
      // 簡易的なURL検証
      const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
      if (!urlPattern.test(url)) {
        return false;
      }

      // youtube-dl-execを使用して動画情報を取得できるか試す
      await this.getVideoInfo(url);
      return true;
    } catch (error) {
      console.error("URL検証エラー:", error);
      return false;
    }
  }

  /**
   * YouTube動画の情報を取得する
   * @param url 動画のURL
   * @returns 動画情報
   */
  async getVideoInfo(url: string): Promise<YouTubeVideoData> {
    try {
      // youtube-dl-execを使用して動画情報を取得
      const info = await youtubeDl(url, {
        dumpSingleJson: true,
        noWarnings: true,
        preferFreeFormats: true,
        youtubeSkipDashManifest: true,
      });

      // 動画情報を整形して返す
      return {
        id: info.id,
        title: info.title,
        author: info.uploader || info.channel || "Unknown",
        duration: info.duration,
        thumbnailUrl: info.thumbnail || "",
        url: url,
      };
    } catch (error) {
      console.error("動画情報取得エラー:", error);
      throw new Error(`動画情報の取得に失敗しました: ${(error as Error).message}`);
    }
  }

  /**
   * 指定した品質の音声フォーマットを作成する
   * @param quality 音声品質
   * @returns 音声フォーマット
   */
  createAudioFormat(quality: AudioQuality): AudioFormat {
    // 品質に応じたビットレートを設定
    let bitrate: number;
    switch (quality) {
      case "low":
        bitrate = 128;
        break;
      case "medium":
        bitrate = 192;
        break;
      case "high":
        bitrate = 320;
        break;
      default:
        bitrate = 192;
    }

    return {
      quality,
      bitrate,
      extension: "mp3",
    };
  }
}
