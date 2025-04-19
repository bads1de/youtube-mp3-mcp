import { YouTubeContext } from "../contexts/YouTubeContext";
import { DownloadContext } from "../contexts/DownloadContext";
import { DownloadTask } from "../models/DownloadTask";
import { IResourceHandlers } from "../types";

/**
 * MCPリソースハンドラーを提供するクラス
 */
export class ResourceHandlers implements IResourceHandlers {
  /**
   * ResourceHandlersのコンストラクタ
   * @param youtubeContext YouTubeコンテキスト
   * @param downloadContext ダウンロードコンテキスト
   */
  constructor(
    private youtubeContext: YouTubeContext,
    private downloadContext: DownloadContext
  ) {}

  /**
   * YouTube動画情報リソースのハンドラー
   * @param uri リソースURI
   * @param params URIパラメータ
   * @returns リソースレスポンス
   */
  async handleVideoInfo(uri: URL, params: { videoId: string }) {
    try {
      // 動画IDからYouTube URLを構築
      const url = `https://www.youtube.com/watch?v=${params.videoId}`;

      // 動画情報を取得
      const video = await this.youtubeContext.getVideoInfo(url);

      // レスポンスを構築
      return {
        contents: [
          {
            uri: uri.href,
            text: `
# ${video.title}

**作者**: ${video.author}
**長さ**: ${video.formatDuration()}
**URL**: ${video.url}

![サムネイル](${video.thumbnailUrl})
          `.trim(),
          },
        ],
      };
    } catch (error) {
      // エラーが発生した場合
      return {
        contents: [
          {
            uri: uri.href,
            text: `エラー: 動画情報の取得に失敗しました - ${(error as Error).message}`,
          },
        ],
      };
    }
  }

  /**
   * ダウンロード履歴リソースのハンドラー
   * @param uri リソースURI
   * @returns リソースレスポンス
   */
  async handleDownloadHistory(uri: URL) {
    // すべてのダウンロードタスクを取得
    const tasks = this.downloadContext.getAllDownloads();

    if (tasks.length === 0) {
      return {
        contents: [
          {
            uri: uri.href,
            text: "ダウンロード履歴はありません。",
          },
        ],
      };
    }

    // タスクの一覧を構築
    const tasksText = tasks
      .map((task) => this.formatTaskInfo(task))
      .join("\n\n");

    return {
      contents: [
        {
          uri: uri.href,
          text: `
# ダウンロード履歴

${tasksText}
        `.trim(),
        },
      ],
    };
  }

  /**
   * ダウンロードタスクリソースのハンドラー
   * @param uri リソースURI
   * @param params URIパラメータ
   * @returns リソースレスポンス
   */
  async handleDownloadTask(uri: URL, params: { taskId: string }) {
    // タスクIDからタスクを取得
    const task = this.downloadContext.getTaskById(params.taskId);

    if (!task) {
      return {
        contents: [
          {
            uri: uri.href,
            text: `エラー: タスクID '${params.taskId}' のダウンロードタスクが見つかりません。`,
          },
        ],
      };
    }

    // タスク情報を構築
    return {
      contents: [
        {
          uri: uri.href,
          text: this.formatTaskInfo(task),
        },
      ],
    };
  }

  /**
   * ダウンロードタスク情報をフォーマットする
   * @param task ダウンロードタスク
   * @returns フォーマットされたタスク情報
   */
  private formatTaskInfo(task: DownloadTask): string {
    const video = task.video;
    const format = task.format;

    let statusText: string;
    switch (task.status) {
      case "pending":
        statusText = "待機中";
        break;
      case "downloading":
        statusText = `ダウンロード中 (${task.progress}%)`;
        break;
      case "converting":
        statusText = "変換中";
        break;
      case "completed":
        statusText = "完了";
        break;
      case "failed":
        statusText = `失敗 (${task.errorMessage})`;
        break;
      default:
        statusText = task.status;
    }

    return `
## ${video.title}

**タスクID**: ${task.id}
**ステータス**: ${statusText}
**品質**: ${format.quality} (${format.bitrate}kbps)
**出力パス**: ${task.outputPath}
**開始時間**: ${task.startTime.toLocaleString()}
${task.endTime ? `**終了時間**: ${task.endTime.toLocaleString()}` : ""}
${task.endTime ? `**所要時間**: ${task.getTotalTimeInSeconds().toFixed(1)}秒` : ""}
    `.trim();
  }
}
