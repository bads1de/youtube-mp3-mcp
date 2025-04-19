/**
 * プロトコル関連の型定義
 */
import { AudioQuality } from "./models";
import {
  IYouTubeContext,
  IDownloadContext,
  IFileSystemContext,
} from "./contexts";

/**
 * MCPサーバーのインターフェース
 */
export interface IMCPServer {
  /**
   * サーバーを初期化する
   */
  initialize(): Promise<void>;

  /**
   * サーバーを起動する
   */
  start(): Promise<void>;

  /**
   * サーバーを停止する
   */
  stop(): Promise<void>;
}

/**
 * リソースハンドラーのインターフェース
 */
export interface IResourceHandlers {
  /**
   * YouTube動画情報リソースのハンドラー
   * @param uri リソースURI
   * @param params URIパラメータ
   * @returns リソースレスポンス
   */
  handleVideoInfo(
    uri: URL,
    params: { videoId: string }
  ): Promise<{
    contents: Array<{
      uri: string;
      text: string;
    }>;
  }>;

  /**
   * ダウンロード履歴リソースのハンドラー
   * @param uri リソースURI
   * @returns リソースレスポンス
   */
  handleDownloadHistory(uri: URL): Promise<{
    contents: Array<{
      uri: string;
      text: string;
    }>;
  }>;

  /**
   * ダウンロードタスクリソースのハンドラー
   * @param uri リソースURI
   * @param params URIパラメータ
   * @returns リソースレスポンス
   */
  handleDownloadTask(
    uri: URL,
    params: { taskId: string }
  ): Promise<{
    contents: Array<{
      uri: string;
      text: string;
    }>;
  }>;
}

/**
 * ツールハンドラーのインターフェース
 */
export interface IToolHandlers {
  /**
   * MP3ダウンロードツールのハンドラー
   * @param args ツール引数
   * @returns ツールレスポンス
   */
  handleDownloadMp3(args: {
    url: string;
    quality?: AudioQuality;
    outputPath?: string;
  }): Promise<{
    toolResult: {
      content: Array<{
        type: string;
        text: string;
      }>;
      isError?: boolean;
    };
  }>;

  /**
   * ダウンロードキャンセルツールのハンドラー
   * @param args ツール引数
   * @returns ツールレスポンス
   */
  handleCancelDownload(args: { taskId: string }): Promise<{
    toolResult: {
      content: Array<{
        type: string;
        text: string;
      }>;
      isError?: boolean;
    };
  }>;
}
