import { DownloaderService } from '../../src/services/downloader';
import { AudioFormat, YouTubeVideoData } from '../../src/types/models';
import youtubeDl from 'youtube-dl-exec';
import fs from 'fs/promises';
import path from 'path';
import { config } from '../../src/config';

// モックの設定
jest.mock('youtube-dl-exec');
jest.mock('fs/promises');
jest.mock('path', () => ({
  ...jest.requireActual('path'),
  join: jest.fn().mockImplementation((...args) => args.join('/'))
}));

describe('DownloaderService', () => {
  let service: DownloaderService;
  let mockVideo: YouTubeVideoData;
  let mockFormat: AudioFormat;
  
  beforeEach(() => {
    jest.clearAllMocks();
    service = new DownloaderService();
    
    // モックデータの設定
    mockVideo = {
      id: 'test-id',
      title: 'Test Video',
      author: 'Test Author',
      duration: 180,
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      url: 'https://www.youtube.com/watch?v=test-id'
    };
    
    mockFormat = {
      quality: 'medium',
      bitrate: 192,
      extension: 'mp3'
    };
    
    // fs.accessのモック
    (fs.access as jest.Mock).mockResolvedValue(undefined);
  });
  
  describe('downloadAudio', () => {
    it('should download audio with default output directory', async () => {
      // モックの設定
      (youtubeDl as jest.Mock).mockResolvedValueOnce({});
      
      const expectedOutputPath = `${config.download.defaultOutputDir}/Test Video.mp3`;
      
      const result = await service.downloadAudio(mockVideo, mockFormat);
      
      expect(result).toBe(expectedOutputPath);
      expect(fs.access).toHaveBeenCalledWith(config.download.defaultOutputDir);
      expect(youtubeDl).toHaveBeenCalledWith(
        mockVideo.url,
        expect.objectContaining({
          extractAudio: true,
          audioFormat: 'mp3',
          audioQuality: 192,
          output: expectedOutputPath
        })
      );
    });
    
    it('should download audio with custom output directory', async () => {
      // モックの設定
      (youtubeDl as jest.Mock).mockResolvedValueOnce({});
      
      const customOutputDir = '/custom/output/dir';
      const expectedOutputPath = `${customOutputDir}/Test Video.mp3`;
      
      const result = await service.downloadAudio(mockVideo, mockFormat, customOutputDir);
      
      expect(result).toBe(expectedOutputPath);
      expect(fs.access).toHaveBeenCalledWith(customOutputDir);
      expect(youtubeDl).toHaveBeenCalledWith(
        mockVideo.url,
        expect.objectContaining({
          extractAudio: true,
          audioFormat: 'mp3',
          audioQuality: 192,
          output: expectedOutputPath
        })
      );
    });
    
    it('should create output directory if it does not exist', async () => {
      // モックの設定
      (youtubeDl as jest.Mock).mockResolvedValueOnce({});
      (fs.access as jest.Mock).mockRejectedValueOnce(new Error('Directory does not exist'));
      
      const customOutputDir = '/custom/output/dir';
      
      await service.downloadAudio(mockVideo, mockFormat, customOutputDir);
      
      expect(fs.mkdir).toHaveBeenCalledWith(customOutputDir, { recursive: true });
    });
    
    it('should call progress callback', async () => {
      // モックの設定
      (youtubeDl as jest.Mock).mockResolvedValueOnce({});
      
      const progressCallback = jest.fn();
      
      await service.downloadAudio(mockVideo, mockFormat, undefined, progressCallback);
      
      expect(progressCallback).toHaveBeenCalledWith(0);
      expect(progressCallback).toHaveBeenCalledWith(100);
    });
    
    it('should throw error when youtube-dl fails', async () => {
      // モックの設定
      (youtubeDl as jest.Mock).mockRejectedValueOnce(new Error('Download failed'));
      
      await expect(service.downloadAudio(mockVideo, mockFormat))
        .rejects.toThrow('音声のダウンロードに失敗しました');
    });
    
    it('should sanitize filename', async () => {
      // モックの設定
      (youtubeDl as jest.Mock).mockResolvedValueOnce({});
      
      // 特殊文字を含むタイトル
      const videoWithSpecialChars = {
        ...mockVideo,
        title: 'Test: Video? With* Special/ Characters"'
      };
      
      const expectedSanitizedTitle = 'Test_ Video_ With_ Special_ Characters_';
      const expectedOutputPath = `${config.download.defaultOutputDir}/${expectedSanitizedTitle}.mp3`;
      
      const result = await service.downloadAudio(videoWithSpecialChars, mockFormat);
      
      expect(result).toBe(expectedOutputPath);
      expect(youtubeDl).toHaveBeenCalledWith(
        mockVideo.url,
        expect.objectContaining({
          output: expectedOutputPath
        })
      );
    });
  });
});
