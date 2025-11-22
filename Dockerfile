FROM m.daocloud.io/docker.io/library/node:20 AS builder

RUN corepack enable yarn && corepack prepare yarn@stable --activate

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock .yarnrc.yml ./
COPY prisma ./prisma

RUN yarn install --immutable

COPY . .
RUN yarn build

FROM m.daocloud.io/docker.io/library/node:20 AS runner

RUN apt-get update && apt-get install -y netcat-openbsd

WORKDIR /app

# Copy dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Copy built files
COPY --from=builder /app/dist ./dist

COPY . .

RUN chmod +x ./entrypoint.sh

EXPOSE 5173

ENTRYPOINT ["./entrypoint.sh"]
CMD ["npx", "tsx", "server/index.ts"]