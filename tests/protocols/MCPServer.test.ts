import { YouTubeMp3Server } from "../../src/protocols/MCPServer";
import { YouTubeContext } from "../../src/contexts/YouTubeContext";
import { DownloadContext } from "../../src/contexts/DownloadContext";
import { FileSystemContext } from "../../src/contexts/FileSystemContext";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// MCPサーバーのモック
const mockResource = jest.fn().mockReturnThis();
const mockTool = jest.fn().mockReturnThis();
const mockConnect = jest.fn().mockResolvedValue(undefined);

jest.mock("@modelcontextprotocol/sdk/server/mcp.js", () => {
  return {
    McpServer: jest.fn().mockImplementation(() => {
      return {
        resource: mockResource,
        tool: mockTool,
        connect: mockConnect,
      };
    }),
    ResourceTemplate: jest.fn().mockImplementation((template) => template),
  };
});

// コンテキストのモック
jest.mock("../../src/contexts/YouTubeContext");
jest.mock("../../src/contexts/DownloadContext");
jest.mock("../../src/contexts/FileSystemContext");

describe("YouTubeMp3Server", () => {
  let server: YouTubeMp3Server;
  let mockYouTubeContext: jest.Mocked<YouTubeContext>;
  let mockDownloadContext: jest.Mocked<DownloadContext>;
  let mockFileSystemContext: jest.Mocked<FileSystemContext>;

  beforeEach(() => {
    mockYouTubeContext = new YouTubeContext() as jest.Mocked<YouTubeContext>;
    mockDownloadContext = new DownloadContext(
      mockFileSystemContext
    ) as jest.Mocked<DownloadContext>;
    mockFileSystemContext =
      new FileSystemContext() as jest.Mocked<FileSystemContext>;

    server = new YouTubeMp3Server(
      mockYouTubeContext,
      mockDownloadContext,
      mockFileSystemContext
    );
  });

  it("should initialize correctly", () => {
    expect(server).toBeInstanceOf(YouTubeMp3Server);
    expect(McpServer).toHaveBeenCalledWith({
      name: expect.any(String),
      version: expect.any(String),
    });
  });

  it("should register resources and tools during initialization", async () => {
    await server.initialize();

    // MCPサーバーのresourceメソッドが呼ばれたことを確認
    expect(mockResource).toHaveBeenCalled();

    // MCPサーバーのtoolメソッドが呼ばれたことを確認
    expect(mockTool).toHaveBeenCalled();
  });

  it("should start the server", async () => {
    await server.initialize();
    await server.start();

    // MCPサーバーのconnectメソッドが呼ばれたことを確認
    expect(mockConnect).toHaveBeenCalled();
  });

  it("should stop the server", async () => {
    await server.initialize();
    await server.start();
    await server.stop();

    // 現在の実装ではstopメソッドは何もしないため、エラーが発生しないことだけを確認
    expect(true).toBe(true);
  });
});
