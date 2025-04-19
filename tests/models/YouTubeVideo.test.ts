import { YouTubeVideo } from "../../src/models/YouTubeVideo";

describe("YouTubeVideo", () => {
  it("should create a YouTubeVideo instance with all properties", () => {
    const video = new YouTubeVideo({
      id: "dQw4w9WgXcQ",
      title: "Rick Astley - Never Gonna Give You Up (Official Music Video)",
      author: "Rick Astley",
      duration: 213, // 3:33 in seconds
      thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });

    expect(video.id).toBe("dQw4w9WgXcQ");
    expect(video.title).toBe(
      "Rick Astley - Never Gonna Give You Up (Official Music Video)"
    );
    expect(video.author).toBe("Rick Astley");
    expect(video.duration).toBe(213);
    expect(video.thumbnailUrl).toBe(
      "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
    );
    expect(video.url).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  });

  it("should format duration correctly", () => {
    const video = new YouTubeVideo({
      id: "test",
      title: "Test Video",
      author: "Test Author",
      duration: 185, // 3:05 in seconds
      thumbnailUrl: "https://example.com/thumbnail.jpg",
      url: "https://www.youtube.com/watch?v=test",
    });

    expect(video.formatDuration()).toBe("3:05");
  });

  it("should format duration with hours correctly", () => {
    const video = new YouTubeVideo({
      id: "test",
      title: "Test Video",
      author: "Test Author",
      duration: 3725, // 1:02:05 in seconds
      thumbnailUrl: "https://example.com/thumbnail.jpg",
      url: "https://www.youtube.com/watch?v=test",
    });

    expect(video.formatDuration()).toBe("1:02:05");
  });

  it("should extract video ID from URL", () => {
    const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    const id = YouTubeVideo.extractVideoId(url);
    expect(id).toBe("dQw4w9WgXcQ");
  });

  it("should extract video ID from short URL", () => {
    const url = "https://youtu.be/dQw4w9WgXcQ";
    const id = YouTubeVideo.extractVideoId(url);
    expect(id).toBe("dQw4w9WgXcQ");
  });

  it("should return null for invalid URL", () => {
    const url = "https://example.com/not-youtube";
    const id = YouTubeVideo.extractVideoId(url);
    expect(id).toBeNull();
  });
});
