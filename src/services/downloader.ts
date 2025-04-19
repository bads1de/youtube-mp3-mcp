/**
 * ダウンロード関連のサービス
 */
import path from "path";
import fs from "fs/promises";
import youtubeDl from "youtube-dl-exec";
import { AudioFormat, YouTubeVideoData } from "../types/models";
import { config } from "../config";

/**
 * ダウンロードサービスクラス
 * YouTube動画からMP3をダウンロードする機能を提供
 */
export class DownloaderService {
  /**
   * YouTube動画から音声をダウンロードする
   * @param video 動画情報
   * @param format 音声フォーマット
   * @param outputDir 出力ディレクトリ（指定がない場合はデフォルト）
   * @param progressCallback 進捗コールバック
   * @returns 出力ファイルパス
   */
  async downloadAudio(
    video: YouTubeVideoData,
    format: AudioFormat,
    outputDir?: string,
    progressCallback?: (progress: number) => void
  ): Promise<string> {
    try {
      // 出力ディレクトリを決定
      const targetDir = outputDir || config.download.defaultOutputDir;

      // ディレクトリが存在しない場合は作成
      await this.ensureDirectoryExists(targetDir);

      // ファイル名を生成（ファイル名に使えない文字を除去）
      const safeTitle = video.title.replace(/[\\/:*?"<>|]/g, "_");
      const fileName = `${safeTitle}.${format.extension}`;
      const outputPath = path.join(targetDir, fileName);

      // 進捗コールバックが指定されている場合は初期値を設定
      if (progressCallback) {
        progressCallback(0);
      }

      // youtube-dl-execを使用して音声をダウンロード
      await youtubeDl(video.url, {
        extractAudio: true,
        audioFormat: format.extension,
        audioQuality: format.bitrate,
        output: outputPath,
      });

      // 進捗コールバックが指定されている場合は完了を通知
      if (progressCallback) {
        progressCallback(100);
      }

      return outputPath;
    } catch (error) {
      console.error("ダウンロードエラー:", error);
      throw new Error(
        `音声のダウンロードに失敗しました: ${(error as Error).message}`
      );
    }
  }

  /**
   * ディレクトリが存在することを確認し、存在しない場合は作成する
   * @param dirPath ディレクトリパス
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch (error) {
      // ディレクトリが存在しない場合は作成
      await fs.mkdir(dirPath, { recursive: true });
    }
  }
}
