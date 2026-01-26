#!/usr/bin/env bash
set -euo pipefail

echo "[EB predeploy] Ensuring pnpm is installed..."
if ! command -v pnpm >/dev/null 2>&1; then
  npm i -g pnpm
fi

echo "[EB predeploy] Installing dependencies with pnpm (including devDeps)..."
pnpm install

echo "[EB predeploy] Building with pnpm..."
pnpm run build:dev

echo "[EB predeploy] Skipping build (using start:dev_noname watch mode)"