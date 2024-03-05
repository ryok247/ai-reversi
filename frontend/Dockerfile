FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install

# serveのインストールは不要になる可能性がありますが、必要に応じて
# RUN npm install -g serve

COPY . .

# ビルドコマンドを削除
# CMD ["serve", "-s", "build"] を変更または削除
CMD ["npm", "start"]
