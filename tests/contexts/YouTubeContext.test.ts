import { YouTubeContext } from '../../src/contexts/YouTubeContext';
import { YouTubeVideo } from '../../src/models/YouTubeVideo';
import { AudioFormat } from '../../src/models/AudioFormat';

// youtube-dl-execのモック
jest.mock('youtube-dl-exec', () => {
  return jest.fn().mockImplementation(() => {
    return {
      exec: jest.fn().mockResolvedValue({
        stdout: JSON.stringify({
          id: 'test-id',
          title: 'Test Video',
          uploader: 'Test Author',
          duration: 180,
          thumbnail: 'https://example.com/thumbnail.jpg',
          webpage_url: 'https://www.youtube.com/watch?v=test-id',
          formats: [
            { format_id: '140', ext: 'm4a', acodec: 'mp4a.40.2', abr: 128 },
            { format_id: '251', ext: 'webm', acodec: 'opus', abr: 160 }
          ]
        })
      })
    };
  });
});

describe('YouTubeContext', () => {
  let context: YouTubeContext;

  beforeEach(() => {
    context = new YouTubeContext();
  });

  it('should validate a correct YouTube URL', async () => {
    const validUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const isValid = await context.validateUrl(validUrl);
    expect(isValid).toBe(true);
  });

  it('should invalidate an incorrect URL', async () => {
    const invalidUrl = 'https://example.com/not-youtube';
    const isValid = await context.validateUrl(invalidUrl);
    expect(isValid).toBe(false);
  });

  it('should get video info from URL', async () => {
    const url = 'https://www.youtube.com/watch?v=test-id';
    const video = await context.getVideoInfo(url);

    expect(video).toBeInstanceOf(YouTubeVideo);
    expect(video.id).toBe('test-id');
    expect(video.title).toBe('Test Video');
    expect(video.author).toBe('Test Author');
    expect(video.duration).toBe(180);
    expect(video.thumbnailUrl).toBe('https://example.com/thumbnail.jpg');
    expect(video.url).toBe('https://www.youtube.com/watch?v=test-id');
  });

  it('should get available formats', async () => {
    const video = new YouTubeVideo({
      id: 'test-id',
      title: 'Test Video',
      author: 'Test Author',
      duration: 180,
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      url: 'https://www.youtube.com/watch?v=test-id'
    });

    const formats = await context.getAvailableFormats(video);
    
    expect(formats).toHaveLength(3); // low, medium, high
    expect(formats[0].quality).toBe('low');
    expect(formats[1].quality).toBe('medium');
    expect(formats[2].quality).toBe('high');
  });
});
