# Arquitetura da API

A API separa código de negócio puro dos detalhes de transporte e framework.

## Camadas

- `src/domain/`: tipos e regras puras. Não importa NestJS, Fastify, Swagger, DTOs HTTP, interface ou infraestrutura.
- `src/interface/`: entrada e saída da aplicação. Controllers, DTOs HTTP, presenters e documentação OpenAPI ficam aqui. Pode depender de domínio e, quando existir, aplicação.
- `src/application/`: deve ser criada somente quando houver casos de uso que coordenem o domínio. Pode depender do domínio, mas não da interface.
- `src/infrastructure/`: deve ser criada somente quando houver implementações técnicas, persistência ou integrações.

As duas últimas pastas não existem ainda porque o scaffold atual não precisa delas.

## Sentido das dependências

Permitido:

```text
interface -> application/domain
```

Proibido:

```text
domain -> interface
```

A configuração `apps/api/eslint.config.mjs` aplica `no-restricted-imports` a todo arquivo em `src/domain/**/*.ts`. Uma expressão regular identifica qualquer import cujo caminho contenha o segmento `interface` e faz o lint falhar com uma mensagem sobre a fronteira.

## Onde colocar novos arquivos

- Regra ou tipo independente de framework: `src/domain/`.
- Controller, DTO HTTP, presenter ou configuração OpenAPI: `src/interface/`.
- Coordenação de um caso de uso: `src/application/`, criada quando necessária.
- Adapter técnico ou integração: `src/infrastructure/`, criada quando necessária.

O arquivo `src/app.controller.ts` é apenas um reexport de compatibilidade do scaffold T-03. A implementação HTTP está em `src/interface/http/app.controller.ts`.

## Verificação

Execute:

```bash
pnpm --filter @central-comercial/api lint
```

Uma violação apresenta a mensagem:

```text
The domain layer must not import the interface layer. Move the dependency to interface or application.
```

Para corrigir, remova a dependência da interface no domínio. Inverta a chamada para que a interface consuma o domínio ou mova a coordenação para a camada de aplicação.
