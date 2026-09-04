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

# ---------------------------------------------------------------------------
# Uploads only count if they land where the build reads.
#
# The served app is exactly index.html, css/, js/app.js and js/sync.js. An
# upload dropped anywhere else is invisible: the site keeps serving the old
# copy and nothing says so. That is how the Queue sat on main for a day
# without ever appearing — it was uploaded to ./app.js and to 01-App/, and
# the build reads neither.
#
# So refuse to build instead of shipping a stale app behind a fresh commit.
# A red build names the file; a silent one hides it.
# ---------------------------------------------------------------------------
strays=()
[ -f app.js ] && strays+=("app.js -> js/app.js")
for d in 01-App */app; do
  [ -e "$d/js/app.js" ] && strays+=("$d/js/app.js -> js/app.js")
  [ -e "$d/index.html" ] && strays+=("$d/index.html -> index.html")
done
if [ ${#strays[@]} -gt 0 ]; then
  echo "build.sh: app files uploaded outside the served paths." >&2
  echo "Nothing here reaches the site. Move each one and re-commit:" >&2
  printf '  %s\n' "${strays[@]}" >&2
  exit 1
fi

# Grok uploads large app.js as js/app.part-*.js when the contents API
# cannot take the whole file in one call. Assemble those first.
if ls js/app.part-*.js >/dev/null 2>&1; then
  cat js/app.part-*.js > js/app.js
fi

# The app is one IIFE; a truncated or half-uploaded app.js parses as a syntax
# error and every screen renders blank. Catch it here rather than in a browser.
if command -v node >/dev/null 2>&1; then
  node --check js/app.js
  node --check js/sync.js
fi

# js/sync.js is what actually loads the app, so a stylesheet or module the
# page never references is a build that looks fine and ships nothing.
grep -q 'js/app\.js' js/sync.js || { echo "build.sh: js/sync.js no longer loads js/app.js" >&2; exit 1; }
grep -q 'css/styles\.css' index.html || { echo "build.sh: index.html no longer loads css/styles.css" >&2; exit 1; }

rm -rf dist
mkdir -p dist/js
cp index.html dist/
cp -r css dist/
cp js/app.js js/sync.js dist/js/

echo "dist/ contents:"
find dist -type f | sort
