FROM m.daocloud.io/docker.io/library/node:20

RUN corepack enable yarn && corepack prepare yarn@stable --activate

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

EXPOSE 5173

CMD ["node", "server/index.js"]