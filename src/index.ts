/**
 * YouTube MP3 Downloader MCPサーバー
 * エントリーポイント
 */
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { YouTubeService } from "./services/youtube";
import { DownloaderService } from "./services/downloader";
import { config } from "./config";

/**
 * アプリケーションのメイン関数
 */
async function main() {
  try {
    console.log(`${config.app.name} v${config.app.version} を起動しています...`);

    // サービスを初期化
    const youtubeService = new YouTubeService();
    const downloaderService = new DownloaderService();

    // MCPサーバーを作成
    const server = new McpServer({
      name: config.app.name,
      version: config.app.version,
    });

    // リソースを登録
    registerResources(server, youtubeService, downloaderService);

    // ツールを登録
    registerTools(server, youtubeService, downloaderService);

    // サーバーを起動
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.log(`${config.app.name} MCPサーバーが起動しました`);

    // プロセス終了時の処理
    process.on("SIGINT", () => {
      console.log("\nシャットダウンしています...");
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      console.log("\nシャットダウンしています...");
      process.exit(0);
    });
  } catch (error) {
    console.error("エラーが発生しました:", error);
    process.exit(1);
  }
}

/**
 * リソースを登録する
 */
function registerResources(
  server: McpServer,
  youtubeService: YouTubeService,
  downloaderService: DownloaderService
) {
  // YouTube動画情報リソース
  server.resource(
    "youtube-video-info",
    new ResourceTemplate("youtube://{videoId}/info", { list: undefined }),
    async (uri, params) => {
      try {
        const videoId = (params as { videoId: string }).videoId;
        const url = `https://www.youtube.com/watch?v=${videoId}`;
        
        // 動画情報を取得
        const videoInfo = await youtubeService.getVideoInfo(url);
        
        return {
          contents: [
            {
              uri: uri.href,
              text: `# ${videoInfo.title}

**チャンネル**: ${videoInfo.author}
**長さ**: ${formatDuration(videoInfo.duration)}
**URL**: ${videoInfo.url}

![サムネイル](${videoInfo.thumbnailUrl})
`,
            },
          ],
        };
      } catch (error) {
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
  );
}

/**
 * ツールを登録する
 */
function registerTools(
  server: McpServer,
  youtubeService: YouTubeService,
  downloaderService: DownloaderService
) {
  // MP3ダウンロードツール
  server.tool(
    "download-mp3",
    "YouTubeのURLからMP3をダウンロードするツール",
    {
      url: z.string().url("有効なURLを入力してください"),
      quality: z.enum(["low", "medium", "high"]).optional(),
      outputDir: z.string().optional(),
    },
    async (args) => {
      try {
        // URLを検証
        const isValidUrl = await youtubeService.validateUrl(args.url);
        if (!isValidUrl) {
          return {
            content: [
              {
                type: "text",
                text: "エラー: 無効なYouTube URLです。",
              },
            ],
            isError: true,
          };
        }

        // 動画情報を取得
        const videoInfo = await youtubeService.getVideoInfo(args.url);

        // 音声フォーマットを作成
        const quality = args.quality || config.download.defaultAudioQuality;
        const format = youtubeService.createAudioFormat(quality);

        // 音声をダウンロード
        const outputPath = await downloaderService.downloadAudio(
          videoInfo,
          format,
          args.outputDir
        );

        return {
          content: [
            {
              type: "text",
              text: `
「${videoInfo.title}」のダウンロードが完了しました。

**ファイル**: ${outputPath}
**品質**: ${quality} (${format.bitrate}kbps)
              `.trim(),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `エラー: ダウンロードに失敗しました - ${(error as Error).message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}

/**
 * 秒数を時間:分:秒の形式にフォーマットする
 * @param seconds 秒数
 * @returns フォーマットされた時間
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }
}

// メイン関数を実行
main().catch((error) => {
  console.error("予期しないエラーが発生しました:", error);
  process.exit(1);
});
