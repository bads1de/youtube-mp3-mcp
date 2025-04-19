/**
 * アプリケーション設定
 */
export const config = {
  /**
   * アプリケーション情報
   */
  app: {
    name: 'YouTube MP3 Downloader',
    version: '1.0.0'
  },
  
  /**
   * ダウンロード設定
   */
  download: {
    /**
     * デフォルトの出力ディレクトリ
     */
    defaultOutputDir: './downloads',
    
    /**
     * 同時ダウンロード数の上限
     */
    maxConcurrentDownloads: 3,
    
    /**
     * ダウンロード履歴の最大保持数
     */
    maxHistoryItems: 100
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
      noCallHome: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true
    }
  }
};
