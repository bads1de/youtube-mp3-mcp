import { YouTubeVideo } from "../models/YouTubeVideo";
import { DownloadTask } from "../models/DownloadTask";
import { FileSystemContext } from "./FileSystemContext";
import { AudioFormat, IDownloadContext } from "../types";
import youtubeDl from "youtube-dl-exec";
import * as path from "path";
import { randomUUID } from "crypto";

/**
 * ダウンロード処理を管理するコンテキスト
 */
export class DownloadContext implements IDownloadContext {
  /** アクティブなダウンロードタスクのマップ */
  private tasks: Map<string, DownloadTask> = new Map();

  /** デフォルトの出力ディレクトリ */
  private defaultOutputDir: string = "./downloads";

  /**
   * DownloadContextのコンストラクタ
   * @param fileSystemContext ファイルシステムコンテキスト
   */
  constructor(private fileSystemContext: FileSystemContext) {}

  /**
   * ダウンロードタスクを作成する
   * @param video ダウンロードする動画
   * @param format 出力音声フォーマット
   * @param outputDir 出力ディレクトリ（省略時はデフォルト）
   * @returns 作成されたダウンロードタスク
   */
  createDownloadTask(
    video: YouTubeVideo,
    format: AudioFormat,
    outputDir: string = this.defaultOutputDir
  ): DownloadTask {
    // ファイル名を生成（動画タイトルから不正な文字を除去）
    const sanitizedTitle = video.title.replace(/[\\/:*?"<>|]/g, "_");
    const fileName = `${sanitizedTitle}.${format.extension}`;
    const outputPath = path.join(outputDir, fileName);

    // タスクを作成
    const task = new DownloadTask({
      id: randomUUID(),
      video,
      format,
      outputPath,
    });

    // タスクをマップに追加
    this.tasks.set(task.id, task);

    return task;
  }

  /**
   * 音声をダウンロードする
   * @param video ダウンロードする動画
   * @param format 出力音声フォーマット
   * @param progressCallback 進捗コールバック関数（オプション）
   * @returns 出力ファイルパス
   * @throws ダウンロードに失敗した場合
   */
  async downloadAudio(
    video: YouTubeVideo,
    format: AudioFormat,
    progressCallback?: (progress: number) => void
  ): Promise<string> {
    // タスクを作成
    const task = this.createDownloadTask(video, format);
    task.updateStatus("downloading");

    try {
      // 出力ディレクトリを作成
      const outputDir = path.dirname(task.outputPath);
      await this.fileSystemContext.createDirectory(outputDir);

      // youtube-dl-execを使用して音声をダウンロード
      await youtubeDl(video.url, {
        extractAudio: true,
        audioFormat: format.extension,
        audioQuality: format.bitrate,
        output: task.outputPath,
      });

      // 進捗を更新
      task.updateProgress(100);
      if (progressCallback) {
        progressCallback(100);
      }

      // タスクを完了状態に更新
      task.updateStatus("completed");

      return task.outputPath;
    } catch (error) {
      // エラーが発生した場合
      task.setError(`ダウンロードに失敗しました: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * ダウンロードをキャンセルする
   * @param taskId キャンセルするタスクのID
   * @returns キャンセルに成功した場合はtrue、タスクが見つからない場合はfalse
   */
  async cancelDownload(taskId: string): Promise<boolean> {
    const task = this.tasks.get(taskId);

    if (!task) {
      return false;
    }

    // アクティブなタスクのみキャンセル可能
    if (task.status === "downloading" || task.status === "converting") {
      task.setError("ユーザーによってキャンセルされました");
      return true;
    }

    return false;
  }

  /**
   * アクティブなダウンロードタスクを取得する
   * @returns アクティブなダウンロードタスクの配列
   */
  getActiveDownloads(): DownloadTask[] {
    return Array.from(this.tasks.values()).filter(
      (task) => task.status === "downloading" || task.status === "converting"
    );
  }

  /**
   * すべてのダウンロードタスクを取得する
   * @returns すべてのダウンロードタスクの配列
   */
  getAllDownloads(): DownloadTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * タスクをIDで取得する
   * @param taskId タスクID
   * @returns タスク、または見つからない場合はundefined
   */
  getTaskById(taskId: string): DownloadTask | undefined {
    return this.tasks.get(taskId);
  }
}
