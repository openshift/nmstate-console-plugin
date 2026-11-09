#!/usr/bin/env bash
set -euo pipefail

# Fail if the generated translation catalogs are not up to date with the source.
# Runs the i18n extraction and then requires the result to match the committed files.

yarn i18n

if [ -n "$(git status --short --untracked-files locales)" ]; then
  echo "i18n files are not up to date. Commit them to fix."
  git diff
  exit 1
fi
