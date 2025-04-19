import { DownloadTask } from "../../src/models/DownloadTask";
import { YouTubeVideo } from "../../src/models/YouTubeVideo";
import { AudioFormat } from "../../src/models/AudioFormat";

describe("DownloadTask", () => {
  const mockVideo = new YouTubeVideo({
    id: "test-id",
    title: "Test Video",
    author: "Test Author",
    duration: 180,
    thumbnailUrl: "https://example.com/thumbnail.jpg",
    url: "https://www.youtube.com/watch?v=test-id",
  });

  // formatDurationメソッドをモック化
  mockVideo.formatDuration = jest.fn().mockReturnValue("3:00");

  const mockFormat: AudioFormat = {
    quality: "medium",
    bitrate: 128,
    extension: "mp3",
  };

  it("should create a DownloadTask instance with all properties", () => {
    const task = new DownloadTask({
      id: "task-1",
      video: mockVideo,
      format: mockFormat,
      outputPath: "/downloads/test.mp3",
    });

    expect(task.id).toBe("task-1");
    expect(task.video).toBe(mockVideo);
    expect(task.format).toBe(mockFormat);
    expect(task.status).toBe("pending");
    expect(task.progress).toBe(0);
    expect(task.outputPath).toBe("/downloads/test.mp3");
    expect(task.errorMessage).toBeUndefined();
    expect(task.startTime).toBeInstanceOf(Date);
    expect(task.endTime).toBeUndefined();
  });

  it("should update status correctly", () => {
    const task = new DownloadTask({
      id: "task-1",
      video: mockVideo,
      format: mockFormat,
      outputPath: "/downloads/test.mp3",
    });

    task.updateStatus("downloading");
    expect(task.status).toBe("downloading");

    task.updateStatus("completed");
    expect(task.status).toBe("completed");
    expect(task.endTime).toBeInstanceOf(Date);
  });

  it("should update progress correctly", () => {
    const task = new DownloadTask({
      id: "task-1",
      video: mockVideo,
      format: mockFormat,
      outputPath: "/downloads/test.mp3",
    });

    task.updateProgress(50);
    expect(task.progress).toBe(50);

    // Progress should be clamped between 0 and 100
    task.updateProgress(-10);
    expect(task.progress).toBe(0);

    task.updateProgress(120);
    expect(task.progress).toBe(100);
  });

  it("should set error message correctly", () => {
    const task = new DownloadTask({
      id: "task-1",
      video: mockVideo,
      format: mockFormat,
      outputPath: "/downloads/test.mp3",
    });

    task.setError("Download failed");
    expect(task.status).toBe("failed");
    expect(task.errorMessage).toBe("Download failed");
    expect(task.endTime).toBeInstanceOf(Date);
  });

  it("should calculate elapsed time correctly", () => {
    const task = new DownloadTask({
      id: "task-1",
      video: mockVideo,
      format: mockFormat,
      outputPath: "/downloads/test.mp3",
    });

    // Mock the startTime to be 5 seconds ago
    const now = new Date();
    task.startTime = new Date(now.getTime() - 5000);

    expect(task.getElapsedTimeInSeconds()).toBeCloseTo(5, 0);
  });

  it("should calculate total time correctly for completed tasks", () => {
    const task = new DownloadTask({
      id: "task-1",
      video: mockVideo,
      format: mockFormat,
      outputPath: "/downloads/test.mp3",
    });

    // Mock the startTime and endTime to be 10 seconds apart
    const now = new Date();
    task.startTime = new Date(now.getTime() - 10000);
    task.updateStatus("completed");
    task.endTime = now;

    expect(task.getTotalTimeInSeconds()).toBeCloseTo(10, 0);
  });
});
