import { YouTubeVideo } from "./YouTubeVideo";
import { AudioFormat, DownloadStatus, DownloadTaskParams } from "../types";

/**
 * ダウンロードタスクを表すクラス
 */
export class DownloadTask {
  /** タスクID */
  id: string;

  /** ダウンロード対象の動画 */
  video: YouTubeVideo;

  /** 出力音声フォーマット */
  format: AudioFormat;

  /** タスクのステータス */
  status: DownloadStatus;

  /** ダウンロード進捗（0-100） */
  progress: number;

  /** 出力ファイルパス */
  outputPath: string;

  /** エラーメッセージ（失敗時） */
  errorMessage?: string;

  /** タスク開始時間 */
  startTime: Date;

  /** タスク終了時間 */
  endTime?: Date;

  /**
   * DownloadTaskのコンストラクタ
   * @param params 初期化パラメータ
   */
  constructor(params: DownloadTaskParams) {
    this.id = params.id;
    this.video = params.video;
    this.format = params.format;
    this.status = "pending";
    this.progress = 0;
    this.outputPath = params.outputPath;
    this.startTime = new Date();
  }

  /**
   * タスクのステータスを更新する
   * @param status 新しいステータス
   */
  updateStatus(status: DownloadStatus): void {
    this.status = status;

    // 完了または失敗時に終了時間を設定
    if (status === "completed" || status === "failed") {
      this.endTime = new Date();
    }
  }

  /**
   * ダウンロード進捗を更新する
   * @param progress 進捗値（0-100）
   */
  updateProgress(progress: number): void {
    // 進捗値を0-100の範囲に制限
    this.progress = Math.max(0, Math.min(100, progress));

    // 進捗が100%になったら、ステータスを変換中に更新
    if (this.progress === 100 && this.status === "downloading") {
      this.updateStatus("converting");
    }
  }

  /**
   * エラーを設定する
   * @param message エラーメッセージ
   */
  setError(message: string): void {
    this.errorMessage = message;
    this.updateStatus("failed");
  }

  /**
   * タスクの経過時間（秒）を取得する
   * @returns 経過時間（秒）
   */
  getElapsedTimeInSeconds(): number {
    const now = new Date();
    return (now.getTime() - this.startTime.getTime()) / 1000;
  }

  /**
   * タスクの合計時間（秒）を取得する
   * @returns 合計時間（秒）、または未完了の場合は経過時間
   */
  getTotalTimeInSeconds(): number {
    if (this.endTime) {
      return (this.endTime.getTime() - this.startTime.getTime()) / 1000;
    }
    return this.getElapsedTimeInSeconds();
  }
}
