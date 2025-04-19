# ===================================================================
# Stage 1: Build stage
# ステージ1: ビルドステージ
# ===================================================================
FROM node:20-alpine AS builder

# Install Python 3 and ffmpeg (required for youtube-dl-exec)
# Python 3とffmpeg（youtube-dl-execに必要）をインストール
RUN apk add --no-cache python3 ffmpeg

# Set working directory
# 作業ディレクトリを設定
WORKDIR /app

# Copy package files for dependency installation
# 依存関係のインストールのためのpackageファイルをコピー
COPY package*.json ./

# Set environment variable to skip Python check for youtube-dl-exec
# youtube-dl-execのPythonチェックをスキップするための環境変数を設定
ENV YOUTUBE_DL_SKIP_PYTHON_CHECK=1

# Install dependencies
# 依存関係をインストール
RUN npm ci

# Copy source files
# ソースファイルをコピー
COPY tsconfig.json ./
COPY src/ ./src/

# Build the application
# アプリケーションをビルド
RUN npm run build

# ===================================================================
# Stage 2: Production stage
# ステージ2: 本番ステージ
# ===================================================================
FROM node:20-alpine AS release

# Install Python 3 and ffmpeg (required for youtube-dl-exec)
# Python 3とffmpeg（youtube-dl-execに必要）をインストール
RUN apk add --no-cache python3 ffmpeg

# Set working directory
# 作業ディレクトリを設定
WORKDIR /app

# Copy package files for production dependencies
# 本番環境の依存関係のためのpackageファイルをコピー
COPY package*.json ./

# Install only production dependencies
# 本番環境の依存関係のみをインストール
RUN npm ci --omit=dev

# Copy built files from builder stage
# ビルドステージからビルドされたファイルをコピー
COPY --from=builder /app/dist ./dist

# Set environment variables with defaults
# デフォルト値を持つ環境変数を設定
ENV NODE_ENV=production \
    YOUTUBE_MP3_DEFAULT_QUALITY=high \
    YOUTUBE_MP3_TEMP_DIR=/tmp/youtube-mp3 \
    YOUTUBE_MP3_OUTPUT_DIR=/downloads

# Create necessary directories
# 必要なディレクトリを作成
RUN mkdir -p /tmp/youtube-mp3 /downloads

# Create a volume point for downloads
# ダウンロード用のボリュームポイントを作成
VOLUME ["/downloads"]


# Run the server
# サーバーを実行
CMD ["node", "dist/index.js"]
