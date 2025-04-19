# YouTube MP3 ダウンローダー アーキテクチャ設計

## 1. プロジェクト構造

```
youtube-mp3-mcp/
├── src/
│   ├── models/           # データモデルの実装
│   │   ├── YouTubeVideo.ts
│   │   ├── DownloadTask.ts
│   │   └── AudioFormat.ts
│   ├── contexts/         # コンテキスト層の実装
│   │   ├── YouTubeContext.ts
│   │   ├── DownloadContext.ts
│   │   └── FileSystemContext.ts
│   ├── protocols/        # プロトコル層の実装
│   │   ├── MCPServer.ts
│   │   ├── ResourceHandlers.ts
│   │   └── ToolHandlers.ts
│   ├── types/            # 型定義
│   │   ├── models.ts
│   │   ├── contexts.ts
│   │   ├── protocols.ts
│   │   ├── utils.ts
│   │   └── index.ts
│   ├── utils/            # ユーティリティ関数
│   │   ├── validators.ts
│   │   └── formatters.ts
│   ├── config.ts         # 設定ファイル
│   └── index.ts          # エントリーポイント
├── tests/                # テストファイル
│   ├── models/
│   ├── contexts/
│   └── protocols/
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

## 2. コンポーネント詳細設計

### 2.1 型定義層 (Types)

#### 2.1.1 モデル関連の型定義 (models.ts)

```typescript
// 音声品質の種類
export type AudioQuality = 'low' | 'medium' | 'high';

// 音声フォーマットを表すインターフェース
export interface AudioFormat {
  quality: AudioQuality;
  bitrate: number;
  extension: 'mp3';
}

// YouTubeの動画情報を表すインターフェース
export interface YouTubeVideoData {
  id: string;
  title: string;
  author: string;
  duration: number;
  thumbnailUrl: string;
  url: string;
}

// ダウンロードタスクのステータス
export type DownloadStatus = 'pending' | 'downloading' | 'converting' | 'completed' | 'failed';

// ダウンロードタスクの初期化パラメータ
export interface DownloadTaskParams {
  id: string;
  video: YouTubeVideoData;
  format: AudioFormat;
  outputPath: string;
}
```

#### 2.1.2 コンテキスト関連の型定義 (contexts.ts)

```typescript
// YouTubeコンテキストのインターフェース
export interface IYouTubeContext {
  validateUrl(url: string): Promise<boolean>;
  getVideoInfo(url: string): Promise<YouTubeVideoData>;
  getAvailableFormats(video: YouTubeVideoData): Promise<AudioFormat[]>;
}

// ファイルシステムコンテキストのインターフェース
export interface IFileSystemContext {
  createDirectory(dirPath: string): Promise<void>;
  saveFile(filePath: string, data: Buffer): Promise<void>;
  fileExists(filePath: string): Promise<boolean>;
  getAvailableSpace(): Promise<number>;
}

// ダウンロードコンテキストのインターフェース
export interface IDownloadContext {
  createDownloadTask(video: YouTubeVideoData, format: AudioFormat, outputDir?: string): DownloadTask;
  downloadAudio(video: YouTubeVideoData, format: AudioFormat, progressCallback?: (progress: number) => void): Promise<string>;
  cancelDownload(taskId: string): Promise<boolean>;
  getActiveDownloads(): DownloadTask[];
  getAllDownloads(): DownloadTask[];
  getTaskById(taskId: string): DownloadTask | undefined;
}
```

#### 2.1.3 プロトコル関連の型定義 (protocols.ts)

```typescript
// MCPサーバーのインターフェース
export interface IMCPServer {
  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
}

// リソースハンドラーのインターフェース
export interface IResourceHandlers {
  handleVideoInfo(uri: URL, params: { videoId: string }): Promise<{ contents: Array<{ uri: string; text: string; }> }>;
  handleDownloadHistory(uri: URL): Promise<{ contents: Array<{ uri: string; text: string; }> }>;
  handleDownloadTask(uri: URL, params: { taskId: string }): Promise<{ contents: Array<{ uri: string; text: string; }> }>;
}

// ツールハンドラーのインターフェース
export interface IToolHandlers {
  handleDownloadMp3(args: { url: string; quality?: AudioQuality; outputPath?: string; }): Promise<{ content: Array<{ type: string; text: string; }>; isError?: boolean; }>;
  handleCancelDownload(args: { taskId: string }): Promise<{ content: Array<{ type: string; text: string; }>; isError?: boolean; }>;
}
```

### 2.2 モデル層 (Models)

#### 2.2.1 YouTubeVideo

YouTubeの動画情報を表すクラス。

```typescript
export class YouTubeVideo implements YouTubeVideoData {
  id: string;
  title: string;
  author: string;
  duration: number;
  thumbnailUrl: string;
  url: string;
  
  constructor(params: YouTubeVideoData);
  formatDuration(): string;
  static extractVideoId(url: string): string | null;
}
```

#### 2.2.2 DownloadTask

ダウンロードタスクを表すクラス。

```typescript
export class DownloadTask {
  id: string;
  video: YouTubeVideo;
  format: AudioFormat;
  status: DownloadStatus;
  progress: number;
  outputPath: string;
  errorMessage?: string;
  startTime: Date;
  endTime?: Date;
  
  constructor(params: DownloadTaskParams);
  updateStatus(status: DownloadStatus): void;
  updateProgress(progress: number): void;
  setError(message: string): void;
  getElapsedTimeInSeconds(): number;
  getTotalTimeInSeconds(): number;
}
```

#### 2.2.3 AudioQualityUtils

音声品質に関するユーティリティクラス。

```typescript
export class AudioQualityUtils {
  static getBitrateForQuality(quality: AudioQuality): number;
  static createFromQuality(quality: AudioQuality): AudioFormat;
  static getFormatString(format: AudioFormat): string;
}
```

### 2.3 コンテキスト層 (Contexts)

#### 2.3.1 YouTubeContext

YouTube APIとの通信を管理するコンテキスト。

```typescript
export class YouTubeContext implements IYouTubeContext {
  async validateUrl(url: string): Promise<boolean>;
  async getVideoInfo(url: string): Promise<YouTubeVideo>;
  async getAvailableFormats(video: YouTubeVideo): Promise<AudioFormat[]>;
}
```

#### 2.3.2 DownloadContext

ダウンロード処理を管理するコンテキスト。

```typescript
export class DownloadContext implements IDownloadContext {
  private tasks: Map<string, DownloadTask>;
  private defaultOutputDir: string;
  
  constructor(private fileSystemContext: FileSystemContext);
  
  createDownloadTask(video: YouTubeVideo, format: AudioFormat, outputDir?: string): DownloadTask;
  async downloadAudio(video: YouTubeVideo, format: AudioFormat, progressCallback?: (progress: number) => void): Promise<string>;
  async cancelDownload(taskId: string): Promise<boolean>;
  getActiveDownloads(): DownloadTask[];
  getAllDownloads(): DownloadTask[];
  getTaskById(taskId: string): DownloadTask | undefined;
}
```

#### 2.3.3 FileSystemContext

ファイルシステムとの相互作用を管理するコンテキスト。

```typescript
export class FileSystemContext implements IFileSystemContext {
  async createDirectory(dirPath: string): Promise<void>;
  async saveFile(filePath: string, data: Buffer): Promise<void>;
  async fileExists(filePath: string): Promise<boolean>;
  async getAvailableSpace(): Promise<number>;
}
```

### 2.4 プロトコル層 (Protocols)

#### 2.4.1 MCPServer

MCPサーバーの実装。

```typescript
export class YouTubeMp3Server implements IMCPServer {
  private server: McpServer;
  private resourceHandlers: ResourceHandlers;
  private toolHandlers: ToolHandlers;
  private transport?: StdioServerTransport;
  
  constructor(
    private youtubeContext: YouTubeContext,
    private downloadContext: DownloadContext,
    private fileSystemContext: FileSystemContext
  );
  
  async initialize(): Promise<void>;
  async start(): Promise<void>;
  async stop(): Promise<void>;
  
  private registerResources(): void;
  private registerTools(): void;
}
```

#### 2.4.2 ResourceHandlers

リソースハンドラーの実装。

```typescript
export class ResourceHandlers implements IResourceHandlers {
  constructor(
    private youtubeContext: YouTubeContext,
    private downloadContext: DownloadContext
  );
  
  async handleVideoInfo(uri: URL, params: { videoId: string });
  async handleDownloadHistory(uri: URL);
  async handleDownloadTask(uri: URL, params: { taskId: string });
  private formatTaskInfo(task: DownloadTask): string;
}
```

#### 2.4.3 ToolHandlers

ツールハンドラーの実装。

```typescript
export class ToolHandlers implements IToolHandlers {
  constructor(
    private youtubeContext: YouTubeContext,
    private downloadContext: DownloadContext
  );
  
  async handleDownloadMp3(args: { url: string; quality?: AudioQuality; outputPath?: string; });
  async handleCancelDownload(args: { taskId: string });
}
```

## 3. データフロー

1. クライアントがYouTube URLを入力
2. `download-mp3`ツールが呼び出される
3. `YouTubeContext`がURLを検証し、動画情報を取得
4. `DownloadContext`が動画から音声をダウンロード・変換
5. `FileSystemContext`が変換されたMP3ファイルを保存
6. クライアントに結果を返す

## 4. エラーハンドリング戦略

1. **入力検証エラー**: Zodスキーマを使用して入力を検証し、不正な入力に対してはエラーメッセージを返す
2. **YouTube APIエラー**: APIからのエラーレスポンスを適切に処理し、ユーザーフレンドリーなメッセージに変換
3. **ダウンロードエラー**: ネットワークエラーや変換エラーを捕捉し、再試行メカニズムを実装
4. **ファイルシステムエラー**: ディスク容量不足や権限エラーを適切に処理

## 5. パフォーマンス考慮事項

1. **並行ダウンロード**: 複数のダウンロードを並行して処理する機能
2. **キャッシング**: 頻繁にアクセスされる動画情報をキャッシュして再利用
3. **ストリーミング**: 大きなファイルをメモリに完全に読み込まずにストリーミング処理
4. **リソース制限**: CPU、メモリ、ネットワーク帯域幅の使用を制限するメカニズム

## 6. セキュリティ考慮事項

1. **入力サニタイズ**: すべてのユーザー入力を適切にサニタイズ
2. **ファイルパス検証**: ディレクトリトラバーサル攻撃を防止するためのパス検証
3. **リソース制限**: DoS攻撃を防ぐためのリクエスト制限
4. **エラーメッセージ**: センシティブな情報を漏らさないエラーメッセージ

## 7. テスト戦略

1. **ユニットテスト**: 各クラスとメソッドの個別テスト
2. **統合テスト**: コンテキスト間の相互作用のテスト
3. **モック**: 外部依存関係（YouTube API、ファイルシステム）のモック
4. **エンドツーエンドテスト**: 実際のYouTube URLを使用した完全なフローのテスト
