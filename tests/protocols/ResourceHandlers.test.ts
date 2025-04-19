import { ResourceHandlers } from '../../src/protocols/ResourceHandlers';
import { YouTubeContext } from '../../src/contexts/YouTubeContext';
import { DownloadContext } from '../../src/contexts/DownloadContext';
import { YouTubeVideo } from '../../src/models/YouTubeVideo';
import { DownloadTask } from '../../src/models/DownloadTask';
import { AudioQuality } from '../../src/models/AudioFormat';

// コンテキストのモック
jest.mock('../../src/contexts/YouTubeContext');
jest.mock('../../src/contexts/DownloadContext');

describe('ResourceHandlers', () => {
  let handlers: ResourceHandlers;
  let mockYouTubeContext: jest.Mocked<YouTubeContext>;
  let mockDownloadContext: jest.Mocked<DownloadContext>;
  
  const mockVideo = new YouTubeVideo({
    id: 'test-id',
    title: 'Test Video',
    author: 'Test Author',
    duration: 180,
    thumbnailUrl: 'https://example.com/thumbnail.jpg',
    url: 'https://www.youtube.com/watch?v=test-id'
  });
  
  const mockTask = new DownloadTask({
    id: 'task-1',
    video: mockVideo,
    format: AudioQuality.createFromQuality('medium'),
    outputPath: '/downloads/test.mp3'
  });
  
  beforeEach(() => {
    mockYouTubeContext = new YouTubeContext() as jest.Mocked<YouTubeContext>;
    mockDownloadContext = new DownloadContext({} as any) as jest.Mocked<DownloadContext>;
    
    mockYouTubeContext.getVideoInfo = jest.fn().mockResolvedValue(mockVideo);
    mockDownloadContext.getAllDownloads = jest.fn().mockReturnValue([mockTask]);
    mockDownloadContext.getTaskById = jest.fn().mockReturnValue(mockTask);
    
    handlers = new ResourceHandlers(mockYouTubeContext, mockDownloadContext);
  });
  
  it('should handle video info resource', async () => {
    const uri = new URL('youtube://test-id/info');
    const params = { videoId: 'test-id' };
    
    const result = await handlers.handleVideoInfo(uri, params);
    
    expect(result.contents).toHaveLength(1);
    expect(result.contents[0].uri).toBe(uri.href);
    expect(result.contents[0].text).toContain('Test Video');
    expect(mockYouTubeContext.getVideoInfo).toHaveBeenCalled();
  });
  
  it('should handle download history resource', async () => {
    const uri = new URL('downloads://history');
    
    const result = await handlers.handleDownloadHistory(uri);
    
    expect(result.contents).toHaveLength(1);
    expect(result.contents[0].uri).toBe(uri.href);
    expect(result.contents[0].text).toContain('Test Video');
    expect(mockDownloadContext.getAllDownloads).toHaveBeenCalled();
  });
  
  it('should handle download task resource', async () => {
    const uri = new URL('downloads://task/task-1');
    const params = { taskId: 'task-1' };
    
    const result = await handlers.handleDownloadTask(uri, params);
    
    expect(result.contents).toHaveLength(1);
    expect(result.contents[0].uri).toBe(uri.href);
    expect(result.contents[0].text).toContain('Test Video');
    expect(mockDownloadContext.getTaskById).toHaveBeenCalledWith('task-1');
  });
  
  it('should return error for non-existent task', async () => {
    const uri = new URL('downloads://task/non-existent');
    const params = { taskId: 'non-existent' };
    
    mockDownloadContext.getTaskById = jest.fn().mockReturnValue(undefined);
    
    const result = await handlers.handleDownloadTask(uri, params);
    
    expect(result.contents).toHaveLength(1);
    expect(result.contents[0].uri).toBe(uri.href);
    expect(result.contents[0].text).toContain('見つかりません');
  });
});
