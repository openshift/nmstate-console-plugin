import { MINUTE, SECOND } from '../utils/const/base';
import { physicalNetworkNameInput, policyNameInput, policyDescriptionInput, submitBtn } from './selector-common';

export const PHYSICAL_NETWORK_TEST_NAME = 'test-nncp-physical-network';
export const PHYSICAL_NETWORK_VMN_NAME = 'test-vmn-physical-network';

/**
 * Fills and submits the Physical network creation wizard (steps 1-5).
 * Assumes the wizard is already open.
 */
export const fillPhysicalNetworkWizard = (
  networkName: string,
  nncpName: string,
  description?: string,
) => {
  // Step 1: Network identity
  cy.get(physicalNetworkNameInput, { timeout: MINUTE }).should('be.visible');
  // Wait for form auto-generated name to settle before clearing
  cy.wait(2 * SECOND);
  cy.get(physicalNetworkNameInput).clear();
  cy.get(physicalNetworkNameInput).type(networkName);
  cy.contains(submitBtn, 'Next').click();

  // Step 2: Nodes configuration
  cy.get(policyNameInput, { timeout: MINUTE }).should('be.visible');
  cy.get(policyNameInput).clear();
  cy.get(policyNameInput).type(nncpName);
  if (description) {
    cy.get(policyDescriptionInput).type(description);
  }
  cy.contains(submitBtn, 'Next').click();

  // Step 3: Uplink connection
  cy.get('.pf-v6-c-wizard__main', { timeout: MINUTE }).should('contain', 'Uplink');
  cy.contains(submitBtn, 'Next').click();

  // Step 4: Settings
  // Page is disabled
 
  // Step 5: Review and Create
  cy.contains('button', 'Create network', { timeout: MINUTE }).should('be.visible');
  cy.contains('button', 'Create network').click();
  cy.wait(3 * SECOND);
};

export const createPhysicalNetwork = (networkName: string, nncpName?: string) => {
  cy.contains('button', 'Create network').click();
  fillPhysicalNetworkWizard(networkName, nncpName || networkName);
};

