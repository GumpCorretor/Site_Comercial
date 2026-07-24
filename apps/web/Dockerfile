FROM node:22.12.0-bookworm-slim AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable \
  && corepack prepare pnpm@11.17.0 --activate

WORKDIR /workspace

FROM base AS build

ARG VITE_API_URL

ENV NODE_ENV=production
ENV VITE_API_URL=$VITE_API_URL

COPY . .

RUN pnpm install --frozen-lockfile
RUN test -n "$VITE_API_URL"
RUN pnpm turbo run build --filter=@central-comercial/web...

FROM base AS runtime

ENV NODE_ENV=production

COPY --from=build /workspace /workspace

EXPOSE 4173

CMD ["pnpm", "--filter", "@central-comercial/web", "exec", "vite", "preview", "--host", "0.0.0.0", "--port", "4173"]
