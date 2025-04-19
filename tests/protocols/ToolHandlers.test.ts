import { ToolHandlers } from "../../src/protocols/ToolHandlers";
import { YouTubeContext } from "../../src/contexts/YouTubeContext";
import { DownloadContext } from "../../src/contexts/DownloadContext";
import { YouTubeVideo } from "../../src/models/YouTubeVideo";
import { AudioQuality } from "../../src/models/AudioFormat";

// コンテキストのモック
jest.mock("../../src/contexts/YouTubeContext");
jest.mock("../../src/contexts/DownloadContext");

describe("ToolHandlers", () => {
  let handlers: ToolHandlers;
  let mockYouTubeContext: jest.Mocked<YouTubeContext>;
  let mockDownloadContext: jest.Mocked<DownloadContext>;

  const mockVideo = new YouTubeVideo({
    id: "test-id",
    title: "Test Video",
    author: "Test Author",
    duration: 180,
    thumbnailUrl: "https://example.com/thumbnail.jpg",
    url: "https://www.youtube.com/watch?v=test-id",
  });

  beforeEach(() => {
    mockYouTubeContext = new YouTubeContext() as jest.Mocked<YouTubeContext>;
    mockDownloadContext = new DownloadContext(
      {} as any
    ) as jest.Mocked<DownloadContext>;

    mockYouTubeContext.validateUrl = jest.fn().mockResolvedValue(true);
    mockYouTubeContext.getVideoInfo = jest.fn().mockResolvedValue(mockVideo);
    mockDownloadContext.downloadAudio = jest
      .fn()
      .mockResolvedValue("/downloads/test.mp3");
    mockDownloadContext.cancelDownload = jest.fn().mockResolvedValue(true);

    handlers = new ToolHandlers(mockYouTubeContext, mockDownloadContext);
  });

  it("should handle download mp3 tool", async () => {
    const args = {
      url: "https://www.youtube.com/watch?v=test-id",
      quality: "medium",
    };

    const result = await handlers.handleDownloadMp3(args);

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("ダウンロードが完了しました");
    expect(mockYouTubeContext.validateUrl).toHaveBeenCalledWith(args.url);
    expect(mockYouTubeContext.getVideoInfo).toHaveBeenCalledWith(args.url);
    expect(mockDownloadContext.downloadAudio).toHaveBeenCalled();
  });

  it("should return error for invalid URL", async () => {
    mockYouTubeContext.validateUrl = jest.fn().mockResolvedValue(false);

    const args = {
      url: "https://example.com/not-youtube",
      quality: "medium",
    };

    const result = await handlers.handleDownloadMp3(args);

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("無効なYouTube URL");
    expect(result.isError).toBe(true);
  });

  it("should handle cancel download tool", async () => {
    const args = {
      taskId: "task-1",
    };

    const result = await handlers.handleCancelDownload(args);

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("キャンセルしました");
    expect(mockDownloadContext.cancelDownload).toHaveBeenCalledWith(
      args.taskId
    );
  });

  it("should return error when cancellation fails", async () => {
    mockDownloadContext.cancelDownload = jest.fn().mockResolvedValue(false);

    const args = {
      taskId: "non-existent",
    };

    const result = await handlers.handleCancelDownload(args);

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("キャンセルできませんでした");
    expect(result.isError).toBe(true);
  });
});
