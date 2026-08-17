#!/usr/bin/env bash

set -exuo pipefail

source ./i18n-scripts/languages.sh

# zh-cn locales live under locales/zh/. Without this mapping, i18n-to-po
# cannot merge existing Chinese translations and uploads empty msgstr.
if [ ! -L locales/zh-cn ]; then
  echo "ERROR: locales/zh-cn must be a symlink to zh before export-pos" >&2
  echo "Run: ln -sfn zh locales/zh-cn" >&2
  exit 1
fi
if [ ! -d locales/zh ]; then
  echo "ERROR: locales/zh directory is missing" >&2
  exit 1
fi

repo_root=$(pwd -P)
expected_zh=$(cd locales/zh && pwd -P)
actual_zh=$(cd locales/zh-cn && pwd -P)
if [ "$expected_zh" != "$repo_root/locales/zh" ]; then
  echo "ERROR: locales/zh must resolve to $repo_root/locales/zh (got $expected_zh)" >&2
  exit 1
fi
if [ "$actual_zh" != "$expected_zh" ]; then
  echo "ERROR: locales/zh-cn must resolve to locales/zh (got $actual_zh)" >&2
  exit 1
fi

for f in locales/en/* ; do
  for i in "${LANGUAGES[@]}"
  do
  npm run i18n-to-po -- -f "$(basename "$f" .json)" -l "$i"
  done
done

# Fail closed: every language must produce at least one PO file.
for i in "${LANGUAGES[@]}"
do
  shopt -s nullglob
  po_files=(po-files/"$i"/*.po)
  shopt -u nullglob
  if [ "${#po_files[@]}" -eq 0 ]; then
    echo "ERROR: no PO files generated for language $i" >&2
    exit 1
  fi
done

# Clear msgstr that still equal msgid (English placeholders from secondary locales).
# Phrase treats empty msgstr as needing translation. Redundant after migrating to
# ocp-plugin-i18n-scripts (that package filters English during PO generation).
node ./i18n-scripts/clear-english-msgstr.js
