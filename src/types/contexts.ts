/**
 * コンテキスト関連の型定義
 */
import { AudioFormat, AudioQuality, DownloadStatus, YouTubeVideoData } from './models';

/**
 * YouTubeコンテキストのインターフェース
 */
export interface IYouTubeContext {
  /**
   * YouTube URLが有効かどうかを検証する
   * @param url 検証するURL
   * @returns URLが有効な場合はtrue、そうでない場合はfalse
   */
  validateUrl(url: string): Promise<boolean>;
  
  /**
   * YouTube URLから動画情報を取得する
   * @param url YouTube URL
   * @returns YouTubeVideoオブジェクト
   * @throws URLが無効な場合やAPIエラーの場合
   */
  getVideoInfo(url: string): Promise<YouTubeVideoData>;
  
  /**
   * 動画で利用可能な音声フォーマットを取得する
   * @param video YouTubeVideoオブジェクト
   * @returns 利用可能な音声フォーマットの配列
   */
  getAvailableFormats(video: YouTubeVideoData): Promise<AudioFormat[]>;
}

/**
 * ファイルシステムコンテキストのインターフェース
 */
export interface IFileSystemContext {
  /**
   * ディレクトリを作成する
   * @param dirPath 作成するディレクトリのパス
   * @throws ディレクトリ作成に失敗した場合
   */
  createDirectory(dirPath: string): Promise<void>;
  
  /**
   * ファイルを保存する
   * @param filePath 保存先のファイルパス
   * @param data 保存するデータ
   * @throws ファイル保存に失敗した場合
   */
  saveFile(filePath: string, data: Buffer): Promise<void>;
  
  /**
   * ファイルが存在するかどうかを確認する
   * @param filePath 確認するファイルのパス
   * @returns ファイルが存在する場合はtrue、そうでない場合はfalse
   */
  fileExists(filePath: string): Promise<boolean>;
  
  /**
   * 利用可能なディスク容量を取得する（バイト単位）
   * @returns 利用可能なディスク容量（バイト）
   * @throws 容量取得に失敗した場合
   */
  getAvailableSpace(): Promise<number>;
}

/**
 * ダウンロードコンテキストのインターフェース
 */
export interface IDownloadContext {
  /**
   * ダウンロードタスクを作成する
   * @param video ダウンロードする動画
   * @param format 出力音声フォーマット
   * @param outputDir 出力ディレクトリ（省略時はデフォルト）
   * @returns 作成されたダウンロードタスク
   */
  createDownloadTask(
    video: YouTubeVideoData,
    format: AudioFormat,
    outputDir?: string
  ): any; // DownloadTaskクラスの型は後で定義
  
  /**
   * 音声をダウンロードする
   * @param video ダウンロードする動画
   * @param format 出力音声フォーマット
   * @param progressCallback 進捗コールバック関数（オプション）
   * @returns 出力ファイルパス
   * @throws ダウンロードに失敗した場合
   */
  downloadAudio(
    video: YouTubeVideoData,
    format: AudioFormat,
    progressCallback?: (progress: number) => void
  ): Promise<string>;
  
  /**
   * ダウンロードをキャンセルする
   * @param taskId キャンセルするタスクのID
   * @returns キャンセルに成功した場合はtrue、タスクが見つからない場合はfalse
   */
  cancelDownload(taskId: string): Promise<boolean>;
  
  /**
   * アクティブなダウンロードタスクを取得する
   * @returns アクティブなダウンロードタスクの配列
   */
  getActiveDownloads(): any[]; // DownloadTaskクラスの型は後で定義
  
  /**
   * すべてのダウンロードタスクを取得する
   * @returns すべてのダウンロードタスクの配列
   */
  getAllDownloads(): any[]; // DownloadTaskクラスの型は後で定義
  
  /**
   * タスクをIDで取得する
   * @param taskId タスクID
   * @returns タスク、または見つからない場合はundefined
   */
  getTaskById(taskId: string): any | undefined; // DownloadTaskクラスの型は後で定義
}
