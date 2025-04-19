import { AudioFormat, AudioQuality } from '../../src/models/AudioFormat';

describe('AudioFormat', () => {
  it('should create an AudioFormat instance with all properties', () => {
    const format: AudioFormat = {
      quality: 'high',
      bitrate: 320,
      extension: 'mp3'
    };

    expect(format.quality).toBe('high');
    expect(format.bitrate).toBe(320);
    expect(format.extension).toBe('mp3');
  });

  it('should get the correct bitrate for each quality', () => {
    expect(AudioQuality.getBitrateForQuality('low')).toBe(64);
    expect(AudioQuality.getBitrateForQuality('medium')).toBe(128);
    expect(AudioQuality.getBitrateForQuality('high')).toBe(320);
  });

  it('should get the correct format string for youtube-dl', () => {
    const lowFormat: AudioFormat = {
      quality: 'low',
      bitrate: 64,
      extension: 'mp3'
    };

    const mediumFormat: AudioFormat = {
      quality: 'medium',
      bitrate: 128,
      extension: 'mp3'
    };

    const highFormat: AudioFormat = {
      quality: 'high',
      bitrate: 320,
      extension: 'mp3'
    };

    expect(AudioQuality.getFormatString(lowFormat)).toBe('bestaudio[ext=m4a]/bestaudio');
    expect(AudioQuality.getFormatString(mediumFormat)).toBe('bestaudio[ext=m4a]/bestaudio');
    expect(AudioQuality.getFormatString(highFormat)).toBe('bestaudio[ext=m4a]/bestaudio');
  });

  it('should create a format from quality string', () => {
    const lowFormat = AudioQuality.createFromQuality('low');
    expect(lowFormat.quality).toBe('low');
    expect(lowFormat.bitrate).toBe(64);
    expect(lowFormat.extension).toBe('mp3');

    const mediumFormat = AudioQuality.createFromQuality('medium');
    expect(mediumFormat.quality).toBe('medium');
    expect(mediumFormat.bitrate).toBe(128);
    expect(mediumFormat.extension).toBe('mp3');

    const highFormat = AudioQuality.createFromQuality('high');
    expect(highFormat.quality).toBe('high');
    expect(highFormat.bitrate).toBe(320);
    expect(highFormat.extension).toBe('mp3');
  });
});
