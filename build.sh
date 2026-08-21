#!/usr/bin/env bash
# Builds the publishable site into dist/.
# Only the app itself ships. The backend JSON export and the internal
# docs (which contain admin credentials) are deliberately left behind.
set -euo pipefail

rm -rf dist
mkdir -p dist
cp index.html dist/
cp -r css js dist/

echo "dist/ contents:"
find dist -type f | sort
