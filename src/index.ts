import { YouTubeMp3Server } from './protocols/MCPServer';
import { YouTubeContext } from './contexts/YouTubeContext';
import { DownloadContext } from './contexts/DownloadContext';
import { FileSystemContext } from './contexts/FileSystemContext';

/**
 * アプリケーションのメイン関数
 */
async function main() {
  try {
    console.log('YouTube MP3 Downloader を起動しています...');
    
    // コンテキストを作成
    const fileSystemContext = new FileSystemContext();
    const youtubeContext = new YouTubeContext();
    const downloadContext = new DownloadContext(fileSystemContext);
    
    // サーバーを作成
    const server = new YouTubeMp3Server(
      youtubeContext,
      downloadContext,
      fileSystemContext
    );
    
    // サーバーを初期化
    await server.initialize();
    
    // サーバーを起動
    await server.start();
    
    // プロセス終了時の処理
    process.on('SIGINT', async () => {
      console.log('\nシャットダウンしています...');
      await server.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('\nシャットダウンしています...');
      await server.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

// メイン関数を実行
main().catch(error => {
  console.error('予期しないエラーが発生しました:', error);
  process.exit(1);
});
