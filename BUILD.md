# Builds filtrados

Execute os comandos a partir da raiz do workspace. O Turbo orquestra a ordem; cada pacote mantém o próprio script `build`.

## API

```sh
pnpm turbo run build --filter=@central-comercial/api
```

## Worker

```sh
pnpm turbo run build --filter=@central-comercial/worker
```

Como `build` declara `dependsOn: ["^build"]`, o Turbo executa primeiro o `build` das dependências internas declaradas no workspace e depois o app filtrado.
