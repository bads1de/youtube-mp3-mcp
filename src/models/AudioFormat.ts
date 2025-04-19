import { AudioFormat, AudioQuality as Quality } from "../types";

/**
 * 音声品質に関連するユーティリティ
 */
export class AudioQualityUtils {
  /**
   * 品質に対応するビットレートを取得する
   * @param quality 音声品質
   * @returns ビットレート（kbps）
   */
  static getBitrateForQuality(quality: Quality): number {
    switch (quality) {
      case "low":
        return 64;
      case "medium":
        return 128;
      case "high":
        return 320;
      default:
        return 128; // デフォルトは中品質
    }
  }

  /**
   * 品質からAudioFormatオブジェクトを作成する
   * @param quality 音声品質
   * @returns AudioFormatオブジェクト
   */
  static createFromQuality(quality: Quality): AudioFormat {
    return {
      quality,
      bitrate: this.getBitrateForQuality(quality),
      extension: "mp3",
    };
  }

  /**
   * youtube-dl用のフォーマット文字列を取得する
   * @param format 音声フォーマット
   * @returns youtube-dl用のフォーマット文字列
   */
  static getFormatString(_format: AudioFormat): string {
    // youtube-dlでは、最高品質の音声を選択し、後でffmpegで変換する
    return "bestaudio[ext=m4a]/bestaudio";
  }
}
