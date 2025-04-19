/**
 * [EN] YouTube MP3 Downloader MCP Server
 * Entry point for the application
 *
 * [JA] YouTube MP3 Downloader MCPサーバー
 * アプリケーションのエントリーポイント
 */
import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { YouTubeService } from "./services/youtube";
import { DownloaderService } from "./services/downloader";
import { config } from "./config";

// Execute main function
// メイン関数を実行
main().catch((error) => {
  console.error("Unexpected error occurred:", error);
  process.exit(1);
});

/**
 * [EN] Main application function
 *
 * [JA] アプリケーションのメイン関数
 */
async function main() {
  try {
    console.log(`Starting ${config.app.name} v${config.app.version}...`);

    // Initialize services
    // サービスを初期化
    const youtubeService = new YouTubeService();
    const downloaderService = new DownloaderService();

    // Create MCP server
    // MCPサーバーを作成
    const server = new McpServer({
      name: config.app.name,
      version: config.app.version,
    });

    // Register resources
    // リソースを登録
    registerResources(server, youtubeService, downloaderService);

    // Register tools
    // ツールを登録
    registerTools(server, youtubeService, downloaderService);

    // Start the server
    // サーバーを起動
    await startServer(server);
  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1);
  }
}

/**
 * [EN] Register resources to the MCP server
 *
 * [JA] リソースを登録する
 */
function registerResources(
  server: McpServer,
  youtubeService: YouTubeService,
  downloaderService: DownloaderService
) {
  // YouTube video information resource
  // YouTube動画情報リソース
  server.resource(
    "youtube-video-info",
    new ResourceTemplate("youtube://{videoId}/info", { list: undefined }),
    async (uri, params) => {
      try {
        const videoId = (params as { videoId: string }).videoId;
        const url = `https://www.youtube.com/watch?v=${videoId}`;

        // Get video information
        // 動画情報を取得
        const videoInfo = await youtubeService.getVideoInfo(url);

        return {
          contents: [
            {
              uri: uri.href,
              text: `# ${videoInfo.title}

              **Channel/チャンネル**: ${videoInfo.author}
              **Duration/長さ**: ${formatDuration(videoInfo.duration)}
              **URL**: ${videoInfo.url}

              ![Thumbnail/サムネイル](${videoInfo.thumbnailUrl})`,
            },
          ],
        };
      } catch (error) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error/エラー: Failed to get video information - 動画情報の取得に失敗しました - ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );
}

/**
 * [EN] Register tools to the MCP server
 *
 * [JA] ツールを登録する
 */
function registerTools(
  server: McpServer,
  youtubeService: YouTubeService,
  downloaderService: DownloaderService
) {
  // MP3 download tool
  // MP3ダウンロードツール
  server.tool(
    "download-mp3",
    "Tool to download MP3 from YouTube URL / YouTubeのURLからMP3をダウンロードするツール",
    {
      url: z
        .string()
        .url("Please enter a valid URL / 有効なURLを入力してください"),
      quality: z.enum(["low", "medium", "high"]).optional(),
      outputDir: z.string().optional(),
    },
    async (args) => {
      try {
        // Validate URL
        // URLを検証
        const isValidUrl = await youtubeService.validateUrl(args.url);
        if (!isValidUrl) {
          return {
            content: [
              {
                type: "text",
                text: "Error: Invalid YouTube URL. / エラー: 無効なYouTube URLです。",
              },
            ],
            isError: true,
          };
        }

        // Get video information
        // 動画情報を取得
        const videoInfo = await youtubeService.getVideoInfo(args.url);

        // Create audio format
        // 音声フォーマットを作成
        const quality = args.quality || config.download.defaultAudioQuality;
        const format = youtubeService.createAudioFormat(quality);

        // Download audio
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
            Download completed for "${videoInfo.title}".
            「${videoInfo.title}」のダウンロードが完了しました。

            **File/ファイル**: ${outputPath}
            **Quality/品質**: ${quality} (${format.bitrate}kbps)
                          `.trim(),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: Download failed - エラー: ダウンロードに失敗しました - ${(error as Error).message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}

/**
 * [EN] Format seconds to hours:minutes:seconds format
 * @param seconds Number of seconds
 * @returns Formatted time string
 *
 * [JA] 秒数を時間:分:秒の形式にフォーマットする
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

// Execute main function
// メイン関数を実行
main().catch((error) => {
  console.error("Unexpected error occurred:", error);
  process.exit(1);
});

/**
 * [EN] Start the MCP server and establish connection
 *
 * [JA] MCPサーバーを起動し、接続を確立する
 */
async function startServer(server: McpServer) {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.log(
    `${config.app.name} MCP server started / MCPサーバーが起動しました`
  );

  // Process termination handling
  // プロセス終了時の処理
  process.on("SIGINT", () => {
    console.log("\nShutting down...");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("\nShutting down...");
    process.exit(0);
  });
}
