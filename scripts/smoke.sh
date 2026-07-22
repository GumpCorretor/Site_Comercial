#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "[smoke] root: $ROOT"

# 1. package.json com engines.node e packageManager
node -e '
const pkg = require("./package.json");
if (!pkg.engines || !pkg.engines.node) { console.error("[smoke] FAIL: engines.node ausente"); process.exit(1); }
if (!pkg.packageManager) { console.error("[smoke] FAIL: packageManager ausente"); process.exit(1); }
if (!pkg.scripts.build.includes("turbo") || !pkg.scripts.test.includes("turbo") || !pkg.scripts.lint.includes("turbo")) {
  console.error("[smoke] FAIL: scripts root nao delegam via turbo"); process.exit(1);
}
console.log("[smoke] package.json OK");
' "$ROOT"

# 2. .nvmrc fixa Node 22
if ! grep -Eq '^22\.' "$ROOT/.nvmrc"; then
  echo "[smoke] FAIL: .nvmrc nao fixa Node 22"
  exit 1
fi
echo "[smoke] .nvmrc OK"

# 3. pnpm-workspace.yaml inclui apps/* e packages/*
if ! grep -q "apps/\*" "$ROOT/pnpm-workspace.yaml" || ! grep -q "packages/\*" "$ROOT/pnpm-workspace.yaml"; then
  echo "[smoke] FAIL: pnpm-workspace.yaml nao inclui apps/* e packages/*"
  exit 1
fi
echo "[smoke] pnpm-workspace.yaml OK"

# 4. turbo.json com pipelines build, test, lint
node -e '
const turbo = require("./turbo.json");
const tasks = turbo.tasks || turbo.pipeline || {};
for (const task of ["build", "test", "lint"]) {
  if (!tasks[task]) { console.error(`[smoke] FAIL: task ${task} ausente no turbo.json`); process.exit(1); }
}
console.log("[smoke] turbo.json OK");
' "$ROOT"

# 5. esqueleto de apps e packages/config
for dir in apps/web apps/api apps/worker packages/config; do
  if [ ! -f "$ROOT/$dir/package.json" ]; then
    echo "[smoke] FAIL: $dir/package.json ausente"
    exit 1
  fi
  echo "[smoke] $dir/package.json OK"
done

echo "[smoke] PASS"
