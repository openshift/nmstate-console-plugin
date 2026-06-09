#!/usr/bin/env bash

set +e

source ./cleanup.sh
source ./setup.sh

set -x

while getopts g:s: flag
do
  case "${flag}" in
    g) gui=${OPTARG};;
    s) spec=${OPTARG};;
  esac
done

if [ -z "${spec-}" ]; then
  spec="tests/all.cy.ts"
fi

# Run cleanup and setup before tests
cleanup
setup

cd ui-tests-cy
npm ci
mkdir -p gui-test-screenshots

if [ -n "${gui-}" ]; then
  npx cypress open --env openshift=true --spec "$spec"
else
  node --max-old-space-size=4096 ./node_modules/.bin/cypress run --env openshift=true --browser "${BRIDGE_E2E_BROWSER_NAME:=electron}" --spec "$spec" | tee ./gui-test-screenshots/build.log
     test_exit_code=${PIPESTATUS[0]}
  cd ..
  cd ui-tests-cy && npm run cypress-postreport && cd ..

  # Copy JUnit XML to path expected by Jenkins pipeline
  mkdir -p cypress/gui-test-screenshots
  cp ui-tests-cy/gui-test-screenshots/junit_cypress-*.xml cypress/gui-test-screenshots/ 2>/dev/null || true

  cleanup
  exit "${test_exit_code}"
fi
