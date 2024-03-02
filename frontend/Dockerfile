# Node.jsの公式イメージをベースにする
FROM node:14

# 作業ディレクトリを設定
WORKDIR /app

# パッケージ.jsonとパッケージロックファイルをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# serveパッケージをグローバルにインストール
RUN npm install -g serve

# ソースコードをコピー
COPY . .

# Reactアプリケーションをビルド
RUN npm run build

# ビルドされたアプリケーションをサーブ
CMD ["serve", "-s", "build"]
