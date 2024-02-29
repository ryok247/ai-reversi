# Node.jsの公式イメージをベースにする
FROM node:14

# 作業ディレクトリを設定
WORKDIR /app

# パッケージ.jsonとパッケージロックファイルをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# ソースコードをコピー
COPY . .

# 開発サーバーを起動
CMD ["npm", "start"]


