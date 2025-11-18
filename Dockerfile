FROM dockerproxy.com/library/node:20

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

RUN npm run build

EXPOSE 5173

CMD ["node", "server/index.js"]