FROM node:22-bookworm-slim
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.17.1 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile --filter @studyverse/api...

COPY apps/api apps/api
COPY packages/shared packages/shared

RUN pnpm --filter @studyverse/api build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]
