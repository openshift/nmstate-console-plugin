#!/usr/bin/env bash

# Cleanup nmstate test resources from previous runs
# Sources .env for namespace names

source .env 2>/dev/null || true
#TEST_NS="${TEST_NS:-cy-test-ns}"

cleanup () {
  echo "Cleaning up nmstate ui test resources..."
  # NNCPs and VirtualMachineNetworks are cluster-scoped resources — no namespace flag needed
  oc delete nncp test-form-nncp test-req-nncp example test-nncp-physical-network --ignore-not-found --wait=true --timeout=180s
  oc delete --ignore-not-found=true virtualmachinenetwork test-project-vmn test-labeled-vmn --wait=true --timeout=60s 2>/dev/null || true
  echo "Cleanup done."
}
