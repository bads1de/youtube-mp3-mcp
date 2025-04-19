# YouTube MP3 ダウンローダー アプリケーション要件定義

## 1. プロジェクト概要

このプロジェクトは、YouTubeのURLからMP3形式の音声をダウンロードするアプリケーションを開発するものです。Model-Context-Protocol（MCP）アーキテクチャを採用し、TypeScriptで実装します。

## 2. 技術スタック

- **言語**: TypeScript
- **アーキテクチャ**: Model-Context-Protocol (MCP)
- **依存ライブラリ**:
  - `@modelcontextprotocol/sdk`: MCPの実装に使用
  - `youtube-dl-exec` または `yt-dlp-exec`: YouTubeからの動画/音声ダウンロードに使用
  - `zod`: スキーマ検証に使用

## 3. Model-Context-Protocol アーキテクチャについて

Model-Context-Protocol（MCP）は、アプリケーションがLLM（大規模言語モデル）に標準化された方法でコンテキストを提供するためのオープンプロトコルです。このプロジェクトでは、MCPアーキテクチャを以下のように適用します：

### 3.1 MCPの主要コンポーネント

1. **Server**: アプリケーションのコア部分で、リソース、ツール、プロンプトを管理します
2. **Resources**: データを公開するための仕組み（YouTubeの動画情報など）
3. **Tools**: アクションを実行するための機能（MP3ダウンロードなど）
4. **Transport**: クライアントとサーバー間の通信方法（stdio, HTTP等）

## 4. 機能要件

### 4.1 基本機能

1. YouTubeのURLを入力として受け取る
2. 入力されたURLから動画情報を取得する
3. 動画から音声をMP3形式で抽出する
4. 抽出したMP3ファイルをローカルに保存する
5. ダウンロード進捗状況を表示する

### 4.2 拡張機能（オプション）

1. 音質の選択オプション（低、中、高）
2. プレイリストのサポート（複数の動画を一括ダウンロード）
3. メタデータの編集（タイトル、アーティスト名など）
4. ダウンロード履歴の管理

## 5. アーキテクチャ設計

### 5.1 Model（モデル）

データと業務ロジックを担当します：

- `YouTubeVideo`: YouTube動画の情報を表すモデル
- `DownloadTask`: ダウンロードタスクを表すモデル
- `AudioFormat`: 音声フォーマットを表すモデル

### 5.2 Context（コンテキスト）

モデルとプロトコル間の橋渡しを行います：

- `YouTubeContext`: YouTube APIとの通信を管理
- `DownloadContext`: ダウンロード処理を管理
- `FileSystemContext`: ファイルシステムとの相互作用を管理

### 5.3 Protocol（プロトコル）

外部とのインターフェースを提供します：

- `MCPServer`: MCPサーバーの実装
- `ResourceHandlers`: リソースハンドラーの実装
- `ToolHandlers`: ツールハンドラーの実装

## 6. 実装計画

### 6.1 フェーズ1: 基本設定

1. プロジェクト初期化とパッケージのインストール
2. MCPサーバーの基本構造の実装
3. 基本的なリソースとツールの定義

### 6.2 フェーズ2: コア機能実装

1. YouTube情報取得機能の実装
2. MP3抽出機能の実装
3. ファイル保存機能の実装

### 6.3 フェーズ3: 拡張機能と最適化

1. 進捗表示機能の実装
2. エラーハンドリングの強化
3. オプション機能の実装

## 7. テスト計画

1. ユニットテスト: 各コンポーネントの機能テスト
2. 統合テスト: コンポーネント間の連携テスト
3. エンドツーエンドテスト: 実際のYouTube URLを使用したテスト

## 8. 制約事項と注意点

1. YouTubeの利用規約を遵守すること
2. 著作権保護されたコンテンツのダウンロードに関する法的責任はユーザーにあることを明示すること
3. 過度のリクエストによるAPIの制限に注意すること

## 9. 将来の拡張性

1. 他の動画プラットフォーム（Vimeo, Dailymotionなど）のサポート
2. GUIインターフェースの追加
3. クラウドストレージへの直接保存機能

## 10. 参考資料

- [Model Context Protocol 公式ドキュメント](https://modelcontextprotocol.io)
- [TypeScript SDK GitHub リポジトリ](https://github.com/modelcontextprotocol/typescript-sdk)
- [youtube-dl-exec NPMパッケージ](https://www.npmjs.com/package/youtube-dl-exec)
