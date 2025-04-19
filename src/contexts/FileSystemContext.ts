import * as fs from "fs/promises";
import * as path from "path";
import { IFileSystemContext } from "../types";

/**
 * ファイルシステムとの相互作用を管理するコンテキスト
 */
export class FileSystemContext implements IFileSystemContext {
  /**
   * ディレクトリを作成する
   * @param dirPath 作成するディレクトリのパス
   * @throws ディレクトリ作成に失敗した場合
   */
  async createDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      throw new Error(
        `ディレクトリの作成に失敗しました: ${(error as Error).message}`
      );
    }
  }

  /**
   * ファイルを保存する
   * @param filePath 保存先のファイルパス
   * @param data 保存するデータ
   * @throws ファイル保存に失敗した場合
   */
  async saveFile(filePath: string, data: Buffer): Promise<void> {
    try {
      // ディレクトリが存在することを確認
      const dirPath = path.dirname(filePath);
      await this.createDirectory(dirPath);

      // ファイルを書き込む
      await fs.writeFile(filePath, data);
    } catch (error) {
      throw new Error(
        `ファイルの保存に失敗しました: ${(error as Error).message}`
      );
    }
  }

  /**
   * ファイルが存在するかどうかを確認する
   * @param filePath 確認するファイルのパス
   * @returns ファイルが存在する場合はtrue、そうでない場合はfalse
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 利用可能なディスク容量を取得する（バイト単位）
   * @returns 利用可能なディスク容量（バイト）
   * @throws 容量取得に失敗した場合
   */
  async getAvailableSpace(): Promise<number> {
    try {
      // Windowsの場合はC:ドライブ、それ以外はルートディレクトリを使用
      const rootPath = process.platform === "win32" ? "C:\\" : "/";
      const stats = await fs.stat(rootPath);

      // statsオブジェクトからavailableプロパティを取得
      // Node.jsのfs.Statsの型定義にはavailableが含まれていないため、anyにキャスト
      return (stats as any).available || 0;
    } catch (error) {
      console.warn(
        `利用可能なディスク容量の取得に失敗しました: ${(error as Error).message}`
      );
      return 0;
    }
  }
}
