#!/usr/bin/env bash
set -e

echo "[WonderSpace] Building Theia IDE..."
docker compose build

echo "[WonderSpace] Starting Theia IDE..."
docker compose up -d

echo "WonderSpace is running at http://localhost:3000"
