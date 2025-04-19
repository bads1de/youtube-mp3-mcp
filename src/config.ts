/**
 * アプリケーション設定
 */
import path from "path";
import os from "os";

/**
 * アプリケーション設定
 */
export const config = {
  /**
   * アプリケーション情報
   */
  app: {
    name: "YouTube MP3 Downloader",
    version: "1.0.0",
  },

  /**
   * ダウンロード設定
   */
  download: {
    /**
     * デフォルトの出力ディレクトリ
     * 環境変数 YOUTUBE_MP3_OUTPUT_DIR で上書き可能
     */
    defaultOutputDir:
      process.env.YOUTUBE_MP3_OUTPUT_DIR ||
      path.join(os.homedir(), "Downloads"),

    /**
     * デフォルトの音声品質
     * 環境変数 YOUTUBE_MP3_DEFAULT_QUALITY で上書き可能
     */
    defaultAudioQuality:
      (process.env.YOUTUBE_MP3_DEFAULT_QUALITY as "low" | "medium" | "high") ||
      "medium",

    /**
     * 一時ファイルディレクトリ
     * 環境変数 YOUTUBE_MP3_TEMP_DIR で上書き可能
     */
    tempDir: process.env.YOUTUBE_MP3_TEMP_DIR || os.tmpdir(),
  },

  /**
   * YouTube API設定
   */
  youtube: {
    /**
     * youtube-dl-execのオプション
     */
    ytdlOptions: {
      noWarnings: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
    },
  },
};
