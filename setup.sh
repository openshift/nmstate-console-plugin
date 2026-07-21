#!/usr/bin/env bash

# Setup test namespaces (create if they don't exist)
# Sources .env for namespace names

source .env 2>/dev/null || true
TEST_NS="${TEST_NS:-cy-test-ns}"

setup () {
  echo "Setting up test namespaces..."
  oc get namespace "${TEST_NS}" 2>/dev/null || oc create namespace "${TEST_NS}"
  echo "Setup done."
}
