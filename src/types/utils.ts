/**
 * ユーティリティ関連の型定義
 */

/**
 * アプリケーション設定の型
 */
export interface AppConfig {
  /**
   * アプリケーション情報
   */
  app: {
    name: string;
    version: string;
  };
  
  /**
   * ダウンロード設定
   */
  download: {
    /**
     * デフォルトの出力ディレクトリ
     */
    defaultOutputDir: string;
    
    /**
     * 同時ダウンロード数の上限
     */
    maxConcurrentDownloads: number;
    
    /**
     * ダウンロード履歴の最大保持数
     */
    maxHistoryItems: number;
  };
  
  /**
   * YouTube API設定
   */
  youtube: {
    /**
     * youtube-dl-execのオプション
     */
    ytdlOptions: {
      noWarnings: boolean;
      noCallHome: boolean;
      preferFreeFormats: boolean;
      youtubeSkipDashManifest: boolean;
      [key: string]: any;
    };
  };
}
