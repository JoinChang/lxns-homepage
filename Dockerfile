FROM node:24 AS builder

RUN corepack enable yarn && corepack prepare yarn@stable --activate

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock .yarnrc.yml ./
COPY prisma ./prisma

RUN yarn install --immutable --inline-builds > /tmp/yarn-install.log 2>&1 \
  || (echo "=== yarn install failed ===" && cat /tmp/yarn-install.log && exit 1)

COPY . .

RUN yarn prisma:generate
RUN yarn build

FROM node:24 AS runner

RUN apt-get update && apt-get install -y netcat-openbsd

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma
COPY prisma.config.ts entrypoint.sh ./

RUN chmod +x ./entrypoint.sh

EXPOSE 5173

ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "dist/server/index.js"]
