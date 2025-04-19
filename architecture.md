# YouTube MP3 ダウンローダー アーキテクチャ設計

## 1. プロジェクト構造

```
youtube-mp3-mcp/
├── src/
│   ├── services/           # サービス層の実装
│   │   ├── youtube.ts      # YouTube関連の機能
│   │   └── downloader.ts   # ダウンロード関連の機能
│   ├── types/              # 型定義
│   │   ├── youtube.ts      # YouTube関連の型
│   │   ├── downloader.ts   # ダウンロード関連の型
│   │   └── index.ts        # 型のエクスポート
│   ├── utils/              # ユーティリティ関数
│   │   ├── validators.ts   # バリデーション関数
│   │   └── formatters.ts   # フォーマット関数
│   ├── config.ts           # 設定ファイル
│   └── index.ts            # エントリーポイント（MCPサーバー実装）
├── tests/                  # テストファイル
│   ├── services/
│   └── utils/
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

## 2. コンポーネント詳細設計

### 2.1 型定義 (Types)

#### 2.1.1 YouTube関連の型定義 (youtube.ts)

```typescript
/**
 * 音声品質の種類
 */
export type AudioQuality = 'low' | 'medium' | 'high';

/**
 * 音声フォーマットを表すインターフェース
 */
export interface AudioFormat {
  quality: AudioQuality;
  bitrate: number;
  extension: 'mp3';
}

/**
 * YouTubeの動画情報を表すインターフェース
 */
export interface YouTubeVideoInfo {
  id: string;
  title: string;
  author: string;
  duration: number;
  thumbnailUrl: string;
  url: string;
}
```

#### 2.1.2 ダウンロード関連の型定義 (downloader.ts)

```typescript
/**
 * ダウンロード関連の型定義
 */
import { AudioFormat, YouTubeVideoInfo } from './youtube';

/**
 * ダウンロードタスクのステータス
 */
export type DownloadStatus = 'pending' | 'downloading' | 'converting' | 'completed' | 'failed';

/**
 * ダウンロード結果を表すインターフェース
 */
export interface DownloadResult {
  videoInfo: YouTubeVideoInfo;
  format: AudioFormat;
  outputPath: string;
  status: DownloadStatus;
  error?: string;
}
```

### 2.2 サービス層 (Services)

#### 2.2.1 YouTubeService (youtube.ts)

YouTube動画の情報取得や検証を行うサービス。

```typescript
/**
 * YouTubeサービスクラス
 * YouTube動画の情報取得や検証を行う
 */
export class YouTubeService {
  /**
   * YouTubeのURLを検証する
   * @param url 検証するURL
   * @returns URLが有効な場合はtrue、そうでない場合はfalse
   */
  async validateUrl(url: string): Promise<boolean>;

  /**
   * YouTube動画の情報を取得する
   * @param url 動画のURL
   * @returns 動画情報
   */
  async getVideoInfo(url: string): Promise<YouTubeVideoInfo>;

  /**
   * 指定した品質の音声フォーマットを作成する
   * @param quality 音声品質
   * @returns 音声フォーマット
   */
  createAudioFormat(quality: AudioQuality): AudioFormat;
}
```

#### 2.2.2 DownloaderService (downloader.ts)

動画から音声をダウンロードし、MP3に変換するサービス。

```typescript
/**
 * ダウンロードサービスクラス
 * YouTube動画からMP3をダウンロードする機能を提供
 */
export class DownloaderService {
  /**
   * YouTube動画から音声をダウンロードする
   * @param video 動画情報
   * @param format 音声フォーマット
   * @param outputDir 出力ディレクトリ（指定がない場合はデフォルト）
   * @param progressCallback 進捗コールバック
   * @returns 出力ファイルパス
   */
  async downloadAudio(
    video: YouTubeVideoInfo,
    format: AudioFormat,
    outputDir?: string,
    progressCallback?: (progress: number) => void
  ): Promise<string>;
  
  /**
   * ディレクトリが存在することを確認し、存在しない場合は作成する
   * @param dirPath ディレクトリパス
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void>;
}
```

### 2.3 MCPサーバー実装 (index.ts)

MCPサーバーの実装。リソースとツールを提供する。

```typescript
/**
 * アプリケーションのメイン関数
 */
async function main() {
  // サービスを初期化
  const youtubeService = new YouTubeService();
  const downloaderService = new DownloaderService();

  // MCPサーバーを作成
  const server = new McpServer({
    name: config.app.name,
    version: config.app.version,
  });

  // リソースを登録
  registerResources(server, youtubeService, downloaderService);

  // ツールを登録
  registerTools(server, youtubeService, downloaderService);

  // サーバーを起動
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

/**
 * リソースを登録する
 */
function registerResources(
  server: McpServer,
  youtubeService: YouTubeService,
  downloaderService: DownloaderService
) {
  // YouTube動画情報リソース
  server.resource(
    "youtube-video-info",
    new ResourceTemplate("youtube://{videoId}/info", { list: undefined }),
    async (uri, params) => {
      // 実装...
    }
  );
}

/**
 * ツールを登録する
 */
function registerTools(
  server: McpServer,
  youtubeService: YouTubeService,
  downloaderService: DownloaderService
) {
  // MP3ダウンロードツール
  server.tool(
    "download-mp3",
    "YouTubeのURLからMP3をダウンロードするツール",
    {
      url: z.string().url("有効なURLを入力してください"),
      quality: z.enum(["low", "medium", "high"]).optional(),
      outputDir: z.string().optional(),
    },
    async (args) => {
      // 実装...
    }
  );
}
```

### 2.4 設定管理 (config.ts)

アプリケーションの設定を管理する。

```typescript
/**
 * アプリケーション設定
 */
export const config = {
  /**
   * アプリケーション情報
   */
  app: {
    name: "YouTube MP3 Downloader",
    version: "1.0.0",
  },
  
  /**
   * ダウンロード設定
   */
  download: {
    /**
     * デフォルトの出力ディレクトリ
     * 環境変数 YOUTUBE_MP3_OUTPUT_DIR で上書き可能
     */
    defaultOutputDir: process.env.YOUTUBE_MP3_OUTPUT_DIR || path.join(os.homedir(), "Downloads"),
    
    /**
     * デフォルトの音声品質
     * 環境変数 YOUTUBE_MP3_DEFAULT_QUALITY で上書き可能
     */
    defaultAudioQuality: (process.env.YOUTUBE_MP3_DEFAULT_QUALITY as "low" | "medium" | "high") || "medium",
    
    /**
     * 一時ファイルディレクトリ
     * 環境変数 YOUTUBE_MP3_TEMP_DIR で上書き可能
     */
    tempDir: process.env.YOUTUBE_MP3_TEMP_DIR || os.tmpdir(),
  },
  
  /**
   * YouTube API設定
   */
  youtube: {
    /**
     * youtube-dl-execのオプション
     */
    ytdlOptions: {
      noWarnings: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
    },
  },
};
```

## 3. データフロー

1. クライアントがYouTube URLを入力
2. `download-mp3`ツールが呼び出される
3. `YouTubeService`がURLを検証し、動画情報を取得
4. `DownloaderService`が動画から音声をダウンロード・変換
5. 変換されたMP3ファイルが指定されたディレクトリに保存される
6. クライアントに結果を返す

## 4. エラーハンドリング戦略

1. **入力検証エラー**: Zodスキーマを使用して入力を検証し、不正な入力に対してはエラーメッセージを返す
2. **YouTube APIエラー**: APIからのエラーレスポンスを適切に処理し、ユーザーフレンドリーなメッセージに変換
3. **ダウンロードエラー**: ネットワークエラーや変換エラーを捕捉し、明確なエラーメッセージを提供
4. **ファイルシステムエラー**: ディスク容量不足や権限エラーを適切に処理

## 5. 設定管理

1. **環境変数**: 環境変数を使用して設定を上書き可能
   - `YOUTUBE_MP3_OUTPUT_DIR`: MP3ファイルの出力ディレクトリ
   - `YOUTUBE_MP3_DEFAULT_QUALITY`: デフォルトの音質設定
   - `YOUTUBE_MP3_TEMP_DIR`: 一時ファイルの保存先

2. **ツールパラメータ**: ツール呼び出し時にパラメータを指定可能
   - `url`: YouTube動画のURL (必須)
   - `quality`: 音質設定 (`low`, `medium`, `high`) (オプション)
   - `outputDir`: 出力ディレクトリ (オプション)

## 6. セキュリティ考慮事項

1. **入力サニタイズ**: すべてのユーザー入力を適切にサニタイズ
2. **ファイルパス検証**: ディレクトリトラバーサル攻撃を防止するためのパス検証
3. **エラーメッセージ**: センシティブな情報を漏らさないエラーメッセージ

## 7. テスト戦略

1. **ユニットテスト**: 各サービスとユーティリティ関数の個別テスト
2. **統合テスト**: サービス間の相互作用のテスト
3. **モック**: 外部依存関係（YouTube API、ファイルシステム）のモック
4. **エンドツーエンドテスト**: 実際のYouTube URLを使用した完全なフローのテスト
