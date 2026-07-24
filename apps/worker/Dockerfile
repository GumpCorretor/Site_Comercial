FROM node:22.12.0-bookworm-slim AS build

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable \
  && corepack prepare pnpm@11.17.0 --activate

WORKDIR /workspace

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@central-comercial/worker...

FROM node:22.12.0-bookworm-slim AS runtime

ENV NODE_ENV=production

WORKDIR /workspace

COPY --from=build /workspace/apps/worker/dist ./apps/worker/dist

CMD ["node", "apps/worker/dist/index.js"]
