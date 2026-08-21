#!/usr/bin/env bash
# Builds the publishable site into dist/.
#
# Only the app itself ships. Left behind on purpose:
#   AtraOps-backend-LATEST.json  the dataset export — read server-side only
#   *.md, HOW-TO-OPEN.txt        internal docs, they print the admin password
#   js/recovered-data.js         the old embedded July seed
#
# That last one matters: it used to load whenever the server had no data,
# which meant a stale 2026-07-29 snapshot could quietly become the live
# dataset. The database is the home of the live data now, so the app has
# exactly one source and no fallback that can overwrite it.
set -euo pipefail

rm -rf dist
mkdir -p dist/js
cp index.html dist/
cp -r css dist/
cp js/app.js js/sync.js dist/js/

echo "dist/ contents:"
find dist -type f | sort
