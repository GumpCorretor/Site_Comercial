param(
  [string]$ProjectRoot = "C:\Projetos\central-comercial-crm"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Invoke-Checked {
  param(
    [string]$Name,
    [scriptblock]$Command
  )

  Write-Host ""
  Write-Host "=== $Name ===" -ForegroundColor Cyan

  & $Command

  if ($LASTEXITCODE -ne 0) {
    throw "$Name falhou com codigo de saida $LASTEXITCODE."
  }
}

if (-not (Test-Path -LiteralPath $ProjectRoot -PathType Container)) {
  throw "Pasta do projeto nao encontrada: $ProjectRoot"
}

Set-Location -LiteralPath $ProjectRoot

$requiredPaths = @(
  "apps",
  "packages",
  "package.json",
  "pnpm-workspace.yaml",
  "turbo.json",
  "packages\db\package.json",
  "packages\db\tsconfig.json",
  "packages\db\prisma\schema.prisma"
)

foreach ($requiredPath in $requiredPaths) {
  if (-not (Test-Path -LiteralPath $requiredPath)) {
    throw "Estrutura inesperada. Caminho ausente: $requiredPath"
  }
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = Join-Path $env:TEMP "central-comercial-repair-$timestamp"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

$filesToBackup = @(
  "package.json",
  "packages\db\package.json",
  "packages\db\tsconfig.json",
  "packages\db\prisma\schema.prisma"
)

foreach ($relativePath in $filesToBackup) {
  $source = Join-Path $ProjectRoot $relativePath
  $backupName = $relativePath -replace '[\\/:*?"<>|]', '_'
  Copy-Item -LiteralPath $source -Destination (Join-Path $backupDir $backupName) -Force
}

Write-Host "Backup criado em: $backupDir" -ForegroundColor Yellow

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Write-JsonFile {
  param(
    [string]$RelativePath,
    [object]$Value
  )

  $json = $Value | ConvertTo-Json -Depth 20
  $absolutePath = Join-Path $ProjectRoot $RelativePath
  [System.IO.File]::WriteAllText(
    $absolutePath,
    $json + [Environment]::NewLine,
    $utf8NoBom
  )
}

$rootPackage = [ordered]@{
  name = "central-comercial"
  version = "0.0.0"
  private = $true
  engines = [ordered]@{
    node = ">=22.12.0 <23"
  }
  scripts = [ordered]@{
    build = "turbo run build"
    test = "turbo run test"
    lint = "turbo run lint"
    typecheck = "turbo run typecheck"
    e2e = "pnpm --filter @central-comercial/web e2e"
  }
  devDependencies = [ordered]@{
    "@central-comercial/config" = "workspace:*"
    "@eslint/js" = "^9.0.0"
    eslint = "^9.0.0"
    prettier = "^3.0.0"
    turbo = "^2.0.0"
    typescript = "^5.0.0"
    "typescript-eslint" = "^8.0.0"
  }
  packageManager = "pnpm@11.17.0"
}

$dbPackage = [ordered]@{
  name = "@central-comercial/db"
  version = "0.0.0"
  private = $true
  type = "commonjs"
  main = "./dist/index.js"
  types = "./dist/index.d.ts"
  exports = [ordered]@{
    "." = [ordered]@{
      types = "./dist/index.d.ts"
      require = "./dist/index.js"
      default = "./dist/index.js"
    }
  }
  files = @(
    "dist",
    "prisma"
  )
  engines = [ordered]@{
    node = ">=22.12.0 <23"
  }
  scripts = [ordered]@{
    build = "prisma generate && tsc -p tsconfig.build.json"
    test = "prisma validate"
    lint = 'eslint . --ignore-pattern "src/generated/**"'
    typecheck = "prisma generate && tsc --noEmit -p tsconfig.json"
    "prisma:generate" = "prisma generate"
    "prisma:validate" = "prisma validate"
    "prisma:migrate:dev" = "prisma migrate dev"
    "prisma:migrate:deploy" = "prisma migrate deploy"
    "prisma:migrate:status" = "prisma migrate status"
  }
  dependencies = [ordered]@{
    "@prisma/adapter-pg" = "7.9.0"
    "@prisma/client" = "7.9.0"
    dotenv = "17.4.2"
    pg = "8.22.0"
    prisma = "7.9.0"
  }
  devDependencies = [ordered]@{
    "@types/node" = "^22.0.0"
    "@types/pg" = "8.20.0"
  }
}

$dbTsconfig = [ordered]@{
  extends = "../config/tsconfig.base.json"
  compilerOptions = [ordered]@{
    target = "ES2023"
    module = "Node16"
    moduleResolution = "Node16"
    lib = @("ES2023")
    types = @("node")
    rootDir = "src"
    outDir = "dist"
    declaration = $true
    declarationMap = $true
    sourceMap = $true
    esModuleInterop = $true
  }
  include = @("src/**/*.ts")
  exclude = @("dist", "node_modules")
}

Write-JsonFile -RelativePath "package.json" -Value $rootPackage
Write-JsonFile -RelativePath "packages\db\package.json" -Value $dbPackage
Write-JsonFile -RelativePath "packages\db\tsconfig.json" -Value $dbTsconfig

$schemaPath = Join-Path $ProjectRoot "packages\db\prisma\schema.prisma"
$schema = [System.IO.File]::ReadAllText($schemaPath)

if ($schema -notmatch 'moduleFormat\s*=\s*"(?:esm|cjs)"') {
  throw 'Nao foi encontrada a propriedade moduleFormat no schema.prisma.'
}

$schema = $schema -replace 'moduleFormat\s*=\s*"(?:esm|cjs)"', 'moduleFormat = "cjs"'
[System.IO.File]::WriteAllText($schemaPath, $schema, $utf8NoBom)

Write-Host ""
Write-Host "Validando os arquivos reparados..." -ForegroundColor Cyan

$parsedRoot = Get-Content -LiteralPath ".\package.json" -Raw | ConvertFrom-Json
$parsedDb = Get-Content -LiteralPath ".\packages\db\package.json" -Raw | ConvertFrom-Json
$parsedTsconfig = Get-Content -LiteralPath ".\packages\db\tsconfig.json" -Raw | ConvertFrom-Json

if ($parsedRoot.name -ne "central-comercial") {
  throw "package.json da raiz continua incorreto."
}

if ($parsedDb.name -ne "@central-comercial/db") {
  throw "packages\db\package.json continua incorreto."
}

if ($parsedDb.type -ne "commonjs") {
  throw "O pacote db nao foi configurado como CommonJS."
}

if ($parsedTsconfig.compilerOptions.module -ne "Node16") {
  throw "O tsconfig do db nao foi configurado com module Node16."
}

if ($parsedTsconfig.compilerOptions.moduleResolution -ne "Node16") {
  throw "O tsconfig do db nao foi configurado com moduleResolution Node16."
}

if ((Get-Content -LiteralPath $schemaPath -Raw) -notmatch 'moduleFormat\s*=\s*"cjs"') {
  throw "O Prisma nao foi configurado para gerar CommonJS."
}

Write-Host "JSON, TypeScript config e Prisma schema validados." -ForegroundColor Green

Remove-Item -Recurse -Force ".\packages\db\dist" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force ".\packages\db\src\generated" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force ".\apps\api\dist" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force ".\.turbo" -ErrorAction SilentlyContinue

Invoke-Checked "Instalacao/atualizacao do workspace" {
  pnpm install
}

Invoke-Checked "Build isolado do pacote db" {
  pnpm --filter "@central-comercial/db" build
}

Invoke-Checked "Typecheck da API, incluindo testes" {
  pnpm --filter "@central-comercial/api" typecheck
}

Invoke-Checked "Build isolado da API" {
  pnpm --filter "@central-comercial/api" build
}

Invoke-Checked "Smoke tests da API" {
  pnpm --filter "@central-comercial/api" test
}

Invoke-Checked "Build integral do monorepo" {
  pnpm turbo run build --force
}

Invoke-Checked "Testes Vitest do monorepo" {
  pnpm test
}

Invoke-Checked "Lint do monorepo" {
  pnpm lint
}

Invoke-Checked "Typecheck do monorepo" {
  pnpm typecheck
}

Invoke-Checked "Instalacao do Chromium do Playwright" {
  pnpm --filter "@central-comercial/web" exec playwright install chromium
}

Invoke-Checked "Smoke E2E do Web" {
  pnpm e2e
}

Write-Host ""
Write-Host "REPARO E VALIDACOES CONCLUIDOS COM SUCESSO." -ForegroundColor Green
Write-Host "Backup dos arquivos anteriores: $backupDir" -ForegroundColor Yellow
