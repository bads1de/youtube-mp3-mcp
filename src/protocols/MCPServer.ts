import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { YouTubeContext } from "../contexts/YouTubeContext";
import { DownloadContext } from "../contexts/DownloadContext";
import { FileSystemContext } from "../contexts/FileSystemContext";
import { ResourceHandlers } from "./ResourceHandlers";
import { ToolHandlers } from "./ToolHandlers";
import { IMCPServer } from "../types";

/**
 * YouTube MP3ダウンローダーのMCPサーバー
 */
export class YouTubeMp3Server implements IMCPServer {
  /** MCPサーバーインスタンス */
  private server: McpServer;

  /** リソースハンドラー */
  private resourceHandlers: ResourceHandlers;

  /** ツールハンドラー */
  private toolHandlers: ToolHandlers;

  /** サーバートランスポート */
  private transport?: StdioServerTransport;

  /**
   * YouTubeMp3Serverのコンストラクタ
   * @param youtubeContext YouTubeコンテキスト
   * @param downloadContext ダウンロードコンテキスト
   * @param fileSystemContext ファイルシステムコンテキスト
   */
  constructor(
    private youtubeContext: YouTubeContext,
    private downloadContext: DownloadContext,
    private fileSystemContext: FileSystemContext
  ) {
    // MCPサーバーを作成
    this.server = new McpServer({
      name: "YouTube MP3 Downloader",
      version: "1.0.0",
    });

    // ハンドラーを作成
    this.resourceHandlers = new ResourceHandlers(
      youtubeContext,
      downloadContext
    );
    this.toolHandlers = new ToolHandlers(youtubeContext, downloadContext);
  }

  /**
   * サーバーを初期化する
   */
  async initialize(): Promise<void> {
    // リソースを登録
    this.registerResources();

    // ツールを登録
    this.registerTools();
  }

  /**
   * サーバーを起動する
   */
  async start(): Promise<void> {
    // トランスポートを作成
    this.transport = new StdioServerTransport();

    // サーバーを接続
    await this.server.connect(this.transport);

    console.log("YouTube MP3 Downloader MCPサーバーが起動しました");
  }

  /**
   * サーバーを停止する
   */
  async stop(): Promise<void> {
    // 現在のところ、特に何もしない
    console.log("YouTube MP3 Downloader MCPサーバーを停止しました");
  }

  /**
   * リソースを登録する
   */
  private registerResources(): void {
    // YouTube動画情報リソース
    this.server.resource(
      "youtube-video-info",
      new ResourceTemplate("youtube://{videoId}/info", { list: undefined }),
      async (uri, params) =>
        this.resourceHandlers.handleVideoInfo(
          uri,
          params as { videoId: string }
        )
    );

    // ダウンロード履歴リソース
    this.server.resource(
      "download-history",
      "downloads://history",
      async (uri) => this.resourceHandlers.handleDownloadHistory(uri)
    );

    // ダウンロードタスクリソース
    this.server.resource(
      "download-task",
      new ResourceTemplate("downloads://task/{taskId}", { list: undefined }),
      async (uri, params) =>
        this.resourceHandlers.handleDownloadTask(
          uri,
          params as { taskId: string }
        )
    );
  }

  /**
   * ツールを登録する
   */
  private registerTools(): void {
    // MP3ダウンロードツール
    this.server.tool(
      "download-mp3",
      {
        url: z.string().url("有効なURLを入力してください"),
        quality: z.enum(["low", "medium", "high"]).optional(),
        outputPath: z.string().optional(),
      },
      async (args) => this.toolHandlers.handleDownloadMp3(args)
    );

    // ダウンロードキャンセルツール
    this.server.tool(
      "cancel-download",
      {
        taskId: z.string(),
      },
      async (args) => this.toolHandlers.handleCancelDownload(args)
    );
  }
}
