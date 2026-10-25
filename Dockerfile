FROM node:24.22.1-bookworm@sha256:6449e19d8184d84062525b6a7524def03146c2cb04a7f08b076680d0e8e4240a AS builder

RUN apt-get update \
  && apt-get install -y --no-install-recommends libbrotli1 libbrotli-dev \
  && dpkg --compare-versions "$(dpkg-query -W -f='${Version}' libbrotli1)" ge '1.0.9-2+deb12u1' \
  && rm -rf /var/lib/apt/lists/*

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

FROM node:24.22.1-bookworm@sha256:6449e19d8184d84062525b6a7524def03146c2cb04a7f08b076680d0e8e4240a AS runner

RUN apt-get update \
  && apt-get install -y --no-install-recommends netcat-openbsd libbrotli1 libbrotli-dev \
  && dpkg --compare-versions "$(dpkg-query -W -f='${Version}' libbrotli1)" ge '1.0.9-2+deb12u1' \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NODE_USE_ENV_PROXY=1

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
