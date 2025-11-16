FROM node:22 AS builder
WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./
COPY . .

RUN npm ci
RUN npm run build
RUN npm prune --production

FROM node:22-slim AS runner
WORKDIR /usr/app

ENV NODE_ENV=production

COPY --from=builder /usr/src/app/dist ./src
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/tsconfig.json ./
COPY --from=builder /usr/src/app/src/core/infra/config/data/spawn ./src/core/infra/config/data/spawn

CMD ["node", "-r", "tsconfig-paths/register", "src/auth/main.js"]
