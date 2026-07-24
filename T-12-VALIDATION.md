# T-12 — Vitest e Playwright

## Dependências

- T-03: **não verificado** quanto ao status formal. O scaffold da API e referências explícitas à T-03 existem no projeto.
- T-04: **não verificado** quanto ao status formal. O app `web` existe e possui scaffold executável e smoke unitário.
- T-05: **não verificado** quanto ao status formal. O app `worker` existe e possui ciclo de inicialização/parada e smoke próprio.
- Não foi encontrado arquivo de acompanhamento que declare essas tarefas como concluídas.

## Estrutura confirmada

- Root: pnpm workspace + Turborepo.
- Apps: `apps/web`, `apps/api`, `apps/worker`.
- Pacotes: `packages/config`, `packages/db`.
- Unitários/integração: Vitest por app, orquestrado no root pelo Turbo.
- E2E: Playwright no app `web`, invocável diretamente no app ou pelo root.

## Scripts finais

### Root

- `pnpm test`: executa `turbo run test` no workspace.
- `pnpm e2e`: executa o Playwright do `@central-comercial/web`.

### Web

- `pnpm --filter @central-comercial/web test`
- `pnpm --filter @central-comercial/web e2e`

### API

- `pnpm --filter @central-comercial/api test`

### Worker

- `pnpm --filter @central-comercial/worker test`

## Smoke tests encontrados

- Web Vitest: `apps/web/src/app.smoke.test.tsx` — renderização do esqueleto React.
- API Vitest: `apps/api/test/app.smoke.spec.ts` — inicialização Nest/Fastify, `GET /` e OpenAPI.
- Worker Vitest: `apps/worker/test/worker.smoke.test.ts` — processo inicia e encerra com `SIGTERM`, sem trabalho externo.
- Web Playwright: `apps/web/e2e/app.smoke.spec.ts` — abre a home e confirma título, texto do scaffold e URL configurada da API.

## Ambiente E2E

O `webServer` do Playwright inicia automaticamente o Vite em `http://127.0.0.1:4173` com `VITE_API_URL=http://127.0.0.1:3001`. O fluxo atual apenas valida o scaffold visual e não exige que a API esteja ativa.

Preparação esperada em ambiente com acesso ao registry:

```sh
corepack enable
pnpm install
pnpm exec playwright install chromium
```

Execução:

```sh
pnpm test
pnpm --filter @central-comercial/web test
pnpm --filter @central-comercial/api test
pnpm --filter @central-comercial/worker test
pnpm e2e
```

## Comandos executados nesta validação

| Comando                                     | Resultado                                                                                      |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `node --version`                            | aprovado: `v22.16.0`, compatível com `>=22.12.0 <23`                                           |
| `pnpm --version`                            | não executado: binário não instalado diretamente                                               |
| `corepack pnpm --version`                   | não executado: Corepack tentou acessar `registry.npmjs.org` e o ambiente respondeu `EAI_AGAIN` |
| leitura e validação JSON dos `package.json` | aprovado                                                                                       |
| `pnpm install`                              | não executado: ambiente sem acesso ao registry e pacote sem `node_modules`/lockfile            |
| `pnpm test`                                 | não executado: dependências não instaladas                                                     |
| testes individuais por app                  | não executado: dependências não instaladas                                                     |
| `pnpm e2e`                                  | não executado: dependências e navegador Playwright não instalados                              |

## Lacunas e conflitos

- **não verificado**: conclusão formal de T-03, T-04 e T-05.
- **não executado**: suíte Vitest e Playwright, por indisponibilidade de rede para restaurar dependências.
- **indeterminado**: lockfile oficial, pois o ZIP recebido não contém `pnpm-lock.yaml`.
- Nenhuma configuração criada referencia serviço ou caminho inexistente.
- O E2E não executa chamadas externas; a URL da API é somente exibida pelo scaffold atual.

## Atendimento da T-12

- Configuração Vitest no root e por app: **atendido por configuração**, execução **não verificada**.
- Smoke real para web, API e worker: **atendido**.
- Playwright configurado contra o web: **atendido por configuração**, execução **não verificada**.
- Fluxo Playwright do web: **atendido**.
- CI/pipeline e regras de negócio fora do escopo: **não alterados**.
- Critério de execução integral: **não atendido neste ambiente**, exclusivamente porque as dependências não puderam ser instaladas.
