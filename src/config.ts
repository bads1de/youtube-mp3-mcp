/**
 * [EN] Application configuration
 *
 * [JA] アプリケーション設定
 */
import path from "path";
import os from "os";

/**
 * [EN] Application configuration object
 *
 * [JA] アプリケーション設定オブジェクト
 */
export const config = {
  /**
   * [EN] Application information
   *
   * [JA] アプリケーション情報
   */
  app: {
    name: "youtube-mp3-server",
    version: "1.0.0",
  },

  /**
   * [EN] Download settings
   *
   * [JA] ダウンロード設定
   */
  download: {
    /**
     * [EN] Default output directory
     * Can be overridden with the YOUTUBE_MP3_OUTPUT_DIR environment variable
     *
     * [JA] デフォルトの出力ディレクトリ
     * 環境変数 YOUTUBE_MP3_OUTPUT_DIR で上書き可能
     */
    defaultOutputDir:
      process.env.YOUTUBE_MP3_OUTPUT_DIR ||
      path.join(os.homedir(), "Downloads"),

    /**
     * [EN] Default audio quality
     * Can be overridden with the YOUTUBE_MP3_DEFAULT_QUALITY environment variable
     *
     * [JA] デフォルトの音声品質
     * 環境変数 YOUTUBE_MP3_DEFAULT_QUALITY で上書き可能
     */
    defaultAudioQuality:
      (process.env.YOUTUBE_MP3_DEFAULT_QUALITY as "low" | "medium" | "high") ||
      "medium",

    /**
     * [EN] Temporary file directory
     * Can be overridden with the YOUTUBE_MP3_TEMP_DIR environment variable
     *
     * [JA] 一時ファイルディレクトリ
     * 環境変数 YOUTUBE_MP3_TEMP_DIR で上書き可能
     */
    tempDir: process.env.YOUTUBE_MP3_TEMP_DIR || os.tmpdir(),
  },

  /**
   * [EN] YouTube API settings
   *
   * [JA] YouTube API設定
   */
  youtube: {
    /**
     * [EN] youtube-dl-exec options
     *
     * [JA] youtube-dl-execのオプション
     */
    ytdlOptions: {
      noWarnings: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
    },
  },
};
