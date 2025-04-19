import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { YouTubeService } from "../src/services/youtube";
import { DownloaderService } from "../src/services/downloader";
import { z } from "zod";

// モックの設定
jest.mock("@modelcontextprotocol/sdk/server/mcp.js");
jest.mock("@modelcontextprotocol/sdk/server/stdio.js");
jest.mock("../src/services/youtube");
jest.mock("../src/services/downloader");

describe("MCPサーバー", () => {
  let mockServer: jest.Mocked<McpServer>;
  let mockTransport: jest.Mocked<StdioServerTransport>;
  let mockYouTubeService: jest.Mocked<YouTubeService>;
  let mockDownloaderService: jest.Mocked<DownloaderService>;

  beforeEach(() => {
    jest.clearAllMocks();

    // モックの設定
    mockServer = {
      connect: jest.fn().mockResolvedValue(undefined),
      resource: jest.fn().mockReturnThis(),
      tool: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<McpServer>;

    (McpServer as unknown as jest.Mock).mockImplementation(() => mockServer);

    mockTransport = {
      // 必要に応じてメソッドを追加
    } as unknown as jest.Mocked<StdioServerTransport>;

    (StdioServerTransport as unknown as jest.Mock).mockImplementation(
      () => mockTransport
    );

    mockYouTubeService = {
      validateUrl: jest.fn(),
      getVideoInfo: jest.fn(),
      createAudioFormat: jest.fn(),
    } as unknown as jest.Mocked<YouTubeService>;

    (YouTubeService as unknown as jest.Mock).mockImplementation(
      () => mockYouTubeService
    );

    mockDownloaderService = {
      downloadAudio: jest.fn(),
    } as unknown as jest.Mocked<DownloaderService>;

    (DownloaderService as unknown as jest.Mock).mockImplementation(
      () => mockDownloaderService
    );
  });

  it("should create MCP server with correct configuration", () => {
    // index.tsをインポート（モックが設定された後に）
    jest.isolateModules(() => {
      require("../src/index");
    });

    // MCPサーバーが正しく作成されたか確認
    expect(McpServer).toHaveBeenCalledWith({
      name: expect.any(String),
      version: expect.any(String),
    });
  });

  it("should register resources", () => {
    // index.tsをインポート
    jest.isolateModules(() => {
      require("../src/index");
    });

    // リソースが登録されたか確認
    expect(mockServer.resource).toHaveBeenCalledWith(
      "youtube-video-info",
      expect.anything(),
      expect.any(Function)
    );
  });

  it("should register tools", () => {
    // index.tsをインポート
    jest.isolateModules(() => {
      require("../src/index");
    });

    // ツールが登録されたか確認
    expect(mockServer.tool).toHaveBeenCalledWith(
      "download-mp3",
      expect.any(String),
      expect.anything(), // Zodオブジェクトの比較は複雑なので、ここでは簡略化
      expect.any(Function)
    );
  });

  it("should connect to transport", () => {
    // index.tsをインポート
    jest.isolateModules(() => {
      require("../src/index");
    });

    // トランスポートに接続されたか確認
    expect(StdioServerTransport).toHaveBeenCalled();
    expect(mockServer.connect).toHaveBeenCalledWith(mockTransport);
  });
});
