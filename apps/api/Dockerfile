FROM node:22.12.0-bookworm-slim AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable \
  && corepack prepare pnpm@11.15.1 --activate

WORKDIR /workspace

FROM base AS build

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@central-comercial/api...

FROM base AS runtime

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=build /workspace /workspace

EXPOSE 3001

CMD ["sh", "-c", "pnpm --filter @central-comercial/db prisma:migrate:deploy && node apps/api/dist/main.js"]
