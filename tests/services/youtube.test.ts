import { YouTubeService } from '../../src/services/youtube';
import youtubeDl from 'youtube-dl-exec';

// モックの設定
jest.mock('youtube-dl-exec');

describe('YouTubeService', () => {
  let service: YouTubeService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    service = new YouTubeService();
  });
  
  describe('validateUrl', () => {
    it('should return true for valid YouTube URL', async () => {
      // モックの設定
      (youtubeDl as jest.Mock).mockResolvedValueOnce({
        id: 'test-id',
        title: 'Test Video',
        uploader: 'Test Author',
        duration: 180,
        thumbnail: 'https://example.com/thumbnail.jpg'
      });
      
      const result = await service.validateUrl('https://www.youtube.com/watch?v=test-id');
      
      expect(result).toBe(true);
      expect(youtubeDl).toHaveBeenCalledWith('https://www.youtube.com/watch?v=test-id', expect.any(Object));
    });
    
    it('should return false for invalid URL format', async () => {
      const result = await service.validateUrl('not-a-url');
      
      expect(result).toBe(false);
      expect(youtubeDl).not.toHaveBeenCalled();
    });
    
    it('should return false when youtube-dl fails', async () => {
      // モックの設定
      (youtubeDl as jest.Mock).mockRejectedValueOnce(new Error('Not found'));
      
      const result = await service.validateUrl('https://www.youtube.com/watch?v=invalid-id');
      
      expect(result).toBe(false);
      expect(youtubeDl).toHaveBeenCalledWith('https://www.youtube.com/watch?v=invalid-id', expect.any(Object));
    });
  });
  
  describe('getVideoInfo', () => {
    it('should return video info for valid URL', async () => {
      // モックの設定
      (youtubeDl as jest.Mock).mockResolvedValueOnce({
        id: 'test-id',
        title: 'Test Video',
        uploader: 'Test Author',
        duration: 180,
        thumbnail: 'https://example.com/thumbnail.jpg'
      });
      
      const url = 'https://www.youtube.com/watch?v=test-id';
      const result = await service.getVideoInfo(url);
      
      expect(result).toEqual({
        id: 'test-id',
        title: 'Test Video',
        author: 'Test Author',
        duration: 180,
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
        url: url
      });
      expect(youtubeDl).toHaveBeenCalledWith(url, expect.any(Object));
    });
    
    it('should throw error when youtube-dl fails', async () => {
      // モックの設定
      (youtubeDl as jest.Mock).mockRejectedValueOnce(new Error('Not found'));
      
      await expect(service.getVideoInfo('https://www.youtube.com/watch?v=invalid-id'))
        .rejects.toThrow('動画情報の取得に失敗しました');
    });
  });
  
  describe('createAudioFormat', () => {
    it('should create low quality format', () => {
      const format = service.createAudioFormat('low');
      
      expect(format).toEqual({
        quality: 'low',
        bitrate: 128,
        extension: 'mp3'
      });
    });
    
    it('should create medium quality format', () => {
      const format = service.createAudioFormat('medium');
      
      expect(format).toEqual({
        quality: 'medium',
        bitrate: 192,
        extension: 'mp3'
      });
    });
    
    it('should create high quality format', () => {
      const format = service.createAudioFormat('high');
      
      expect(format).toEqual({
        quality: 'high',
        bitrate: 320,
        extension: 'mp3'
      });
    });
  });
});
