import { YouTubeContext } from "../contexts/YouTubeContext";
import { DownloadContext } from "../contexts/DownloadContext";
import { AudioQualityUtils } from "../models/AudioFormat";
import { AudioQuality, IToolHandlers } from "../types";

/**
 * MCPツールハンドラーを提供するクラス
 */
export class ToolHandlers implements IToolHandlers {
  /**
   * ToolHandlersのコンストラクタ
   * @param youtubeContext YouTubeコンテキスト
   * @param downloadContext ダウンロードコンテキスト
   */
  constructor(
    private youtubeContext: YouTubeContext,
    private downloadContext: DownloadContext
  ) {}

  /**
   * MP3ダウンロードツールのハンドラー
   * @param args ツール引数
   * @returns ツールレスポンス
   */
  async handleDownloadMp3(args: {
    url: string;
    quality?: "low" | "medium" | "high";
    outputPath?: string;
  }) {
    try {
      // URLを検証
      const isValidUrl = await this.youtubeContext.validateUrl(args.url);
      if (!isValidUrl) {
        return {
          toolResult: {
            content: [
              {
                type: "text",
                text: "エラー: 無効なYouTube URLです。",
              },
            ],
            isError: true,
          },
        };
      }

      // 動画情報を取得
      const video = await this.youtubeContext.getVideoInfo(args.url);

      // 音声フォーマットを作成
      const quality = args.quality || "medium";
      const format = AudioQualityUtils.createFromQuality(quality);

      // 音声をダウンロード
      const outputPath = await this.downloadContext.downloadAudio(
        video,
        format,
        (progress) => {
          // 進捗は現在のところ使用しない
        }
      );

      return {
        toolResult: {
          content: [
            {
              type: "text",
              text: `
「${video.title}」のダウンロードが完了しました。

**ファイル**: ${outputPath}
**品質**: ${quality} (${format.bitrate}kbps)
            `.trim(),
            },
          ],
        },
      };
    } catch (error) {
      return {
        toolResult: {
          content: [
            {
              type: "text",
              text: `エラー: ダウンロードに失敗しました - ${(error as Error).message}`,
            },
          ],
          isError: true,
        },
      };
    }
  }

  /**
   * ダウンロードキャンセルツールのハンドラー
   * @param args ツール引数
   * @returns ツールレスポンス
   */
  async handleCancelDownload(args: { taskId: string }) {
    try {
      // ダウンロードをキャンセル
      const success = await this.downloadContext.cancelDownload(args.taskId);

      if (success) {
        return {
          toolResult: {
            content: [
              {
                type: "text",
                text: `タスクID '${args.taskId}' のダウンロードをキャンセルしました。`,
              },
            ],
          },
        };
      } else {
        return {
          toolResult: {
            content: [
              {
                type: "text",
                text: `エラー: タスクID '${args.taskId}' のダウンロードをキャンセルできませんでした。タスクが存在しないか、すでに完了または失敗している可能性があります。`,
              },
            ],
            isError: true,
          },
        };
      }
    } catch (error) {
      return {
        toolResult: {
          content: [
            {
              type: "text",
              text: `エラー: キャンセル処理中にエラーが発生しました - ${(error as Error).message}`,
            },
          ],
          isError: true,
        },
      };
    }
  }
}
