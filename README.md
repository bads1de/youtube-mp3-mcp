# YouTube MP3 ダウンローダー (MCP アーキテクチャ)

Model-Context-Protocol (MCP) アーキテクチャを使用して実装されたYouTube MP3ダウンローダーアプリケーションです。

## 概要

このアプリケーションは、YouTubeのURLを入力として受け取り、その動画から音声をMP3形式で抽出してダウンロードする機能を提供します。Model-Context-Protocolアーキテクチャを採用し、TypeScriptで実装されています。

Model-Context-Protocolは、Anthropicが開発したオープンプロトコルで、アプリケーションがLLM（大規模言語モデル）に標準化された方法でコンテキストを提供するための仕組みです。

## 機能

- YouTubeのURLからMP3形式の音声をダウンロード
- 音質の選択（低、中、高）
- ダウンロード進捗状況の表示
- ダウンロード履歴の管理

## 技術スタック

- **言語**: TypeScript
- **アーキテクチャ**: Model-Context-Protocol (MCP)
- **主要ライブラリ**:
  - `@modelcontextprotocol/sdk`: MCPの実装
  - `youtube-dl-exec`: YouTubeからの動画/音声ダウンロード
  - `zod`: スキーマ検証

## インストール

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/youtube-mp3-mcp.git
cd youtube-mp3-mcp

# 依存関係のインストール
npm install

# ビルド
npm run build
```

## 使用方法

### 環境変数の設定

以下の環境変数を設定することで、アプリケーションの動作をカスタマイズできます：

- `YOUTUBE_MP3_OUTPUT_DIR`: MP3ファイルのデフォルト出力ディレクトリ（デフォルト: `~/Downloads`）
- `YOUTUBE_MP3_DEFAULT_QUALITY`: デフォルトの音質設定（`low`, `medium`, `high`のいずれか、デフォルト: `medium`）
- `YOUTUBE_MP3_TEMP_DIR`: 一時ファイルの保存先（デフォルト: システムの一時ディレクトリ）

### Claude Desktopでの設定

`claude_desktop_config.json`に以下のように設定します：

```json
{
  "mcpServers": {
    "youtube-mp3": {
      "command": "node",
      "args": ["path/to/youtube-mp3-mcp/dist/index.js"],
      "env": {
        "YOUTUBE_MP3_OUTPUT_DIR": "/path/to/your/music/folder",
        "YOUTUBE_MP3_DEFAULT_QUALITY": "high"
      }
    }
  }
}
```

### アプリケーションの起動

```bash
# アプリケーションの起動
npm start

# または開発モードで起動
npm run dev
```

## アーキテクチャ

このプロジェクトはシンプルなサービス指向アーキテクチャを採用し、Model-Context-Protocol (MCP) を実装しています：

1. **サービス層**: アプリケーションの主要機能を提供

   - YouTubeService: YouTube動画情報の取得やURL検証を行う
   - DownloaderService: 動画から音声をダウンロードし、MP3への変換を行う

2. **MCP層**: Model Context Protocolの実装

   - リソース: YouTube動画情報を提供
   - ツール: MP3ダウンロード機能を提供

3. **型定義**: アプリケーション全体で使用される型を定義

   - youtube.ts: YouTube関連の型定義
   - downloader.ts: ダウンロード関連の型定義

4. **設定管理**: アプリケーションの設定を管理
   - 環境変数からの設定読み込み
   - ダウンロードパスのカスタマイズ

このシンプルなアーキテクチャにより、コードの理解と保守が容易になり、拡張性も向上します。

## 開発

```bash
# テストの実行
npm test

# リントの実行
npm run lint

# コードのフォーマット
npm run format
```

## MCPの活用

Model-Context-Protocolを活用して、以下のリソースとツールを提供しています：

**リソース**:

- `youtube://{videoId}/info`: YouTube動画の情報を提供

**ツール**:

- `download-mp3`: YouTubeのURLからMP3をダウンロード
  - `url`: YouTube動画のURL (必須)
  - `quality`: 音質設定 (`low`, `medium`, `high`) (オプション、デフォルトは環境変数から読み込み)
  - `outputDir`: 出力ディレクトリ (オプション、デフォルトは環境変数から読み込み)

## 注意事項

- このアプリケーションはYouTubeの利用規約を遵守する範囲でのみ使用してください
- 著作権保護されたコンテンツのダウンロードに関する法的責任はユーザーにあります
- 過度のリクエストによるAPIの制限に注意してください

## ライセンス

MIT
