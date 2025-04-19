import { FileSystemContext } from '../../src/contexts/FileSystemContext';
import * as fs from 'fs/promises';
import * as path from 'path';

// fs/promisesのモック
jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  access: jest.fn(),
  stat: jest.fn()
}));

describe('FileSystemContext', () => {
  let context: FileSystemContext;

  beforeEach(() => {
    context = new FileSystemContext();
    jest.clearAllMocks();
  });

  it('should create a directory', async () => {
    const dirPath = path.join('downloads', 'test');
    await context.createDirectory(dirPath);
    
    expect(fs.mkdir).toHaveBeenCalledWith(dirPath, { recursive: true });
  });

  it('should save a file', async () => {
    const filePath = path.join('downloads', 'test.mp3');
    const data = Buffer.from('test data');
    
    await context.saveFile(filePath, data);
    
    expect(fs.writeFile).toHaveBeenCalledWith(filePath, data);
  });

  it('should check if a file exists', async () => {
    const filePath = path.join('downloads', 'test.mp3');
    
    // ファイルが存在する場合
    (fs.access as jest.Mock).mockResolvedValueOnce(undefined);
    let exists = await context.fileExists(filePath);
    expect(exists).toBe(true);
    
    // ファイルが存在しない場合
    (fs.access as jest.Mock).mockRejectedValueOnce(new Error('ENOENT'));
    exists = await context.fileExists(filePath);
    expect(exists).toBe(false);
  });

  it('should get available space', async () => {
    const mockStats = {
      size: 1024, // 1KB
      blocks: 8,
      blksize: 4096, // 4KB
      available: 1024 * 1024 * 1024 // 1GB
    };
    
    (fs.stat as jest.Mock).mockResolvedValueOnce(mockStats);
    
    const availableSpace = await context.getAvailableSpace();
    expect(availableSpace).toBe(1024 * 1024 * 1024);
  });
});
