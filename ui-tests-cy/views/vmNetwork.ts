import { MINUTE, SECOND } from '../utils/const/base';
import { NNCP_VMN_NAME } from './nncp';
import { PHYSICAL_NETWORK_VMN_NAME, fillPhysicalNetworkWizard } from './physicalNetwork';
import { itemCreateBtn, actionsDropdownBtn, vmnNameInput, submitBtn } from './selector-common';

export const VM_NETWORK_PROJECT_NAME = 'test-project-vmn';
export const VM_NETWORK_LABELED_NAME = 'test-labeled-vmn';
export const VMN_URL = '/k8s/cluster/virtualmachine-networks';
export const REQ_PHYSICAL_NETWORK_NAME = 'test-req-phys-net';
export const REQ_NNCP_NAME = 'test-req-nncp';

export const navigateToVMN = () => {
  cy.visit(VMN_URL);
  cy.contains('h1', 'Virtual machine networks', { timeout: MINUTE }).should('exist');
};

export const attemptToCreateVMNetwork = () => {
  navigateToVMN();

  // Check if Create button is already enabled (physical network exists from prior run)
  cy.get(itemCreateBtn, { timeout: MINUTE }).then(($btn) => {
    if (!$btn.prop('disabled')) {
      return;
    }
    // Button is disabled — click "Create physical network" to create prerequisite
    cy.contains('button', 'Create physical network').click({ force: true });
    fillPhysicalNetworkWizard(REQ_PHYSICAL_NETWORK_NAME, REQ_NNCP_NAME);
    navigateToVMN();
    cy.get(itemCreateBtn, { timeout: 5 * MINUTE }).should('not.be.disabled');
  });
};

export const createVMNetwork = (
  name: string,
  physicalNetworkName: string,
  projectName?: string,
  label?: string,
) => {
  cy.get(itemCreateBtn).click();
  cy.contains('h1', 'Create virtual machine network', { timeout: MINUTE }).should('exist');
  cy.wait(2 * SECOND);

  cy.get(vmnNameInput, { timeout: MINUTE })
    .should('be.visible')
    .clear()
    .type(name);

  // Select physical network mapping from combobox
  cy.get('input[role="combobox"]').first().click();
  cy.get('input[role="combobox"]').first().clear().type(physicalNetworkName);
  cy.wait(SECOND);
  cy.get('button[role="option"]').contains(physicalNetworkName).click();

  cy.contains('button', 'Next').click();

  // Project mapping step
  if (projectName) {
    // Select "Select projects from list" radio
    cy.get('#project-list').click();
    cy.get('input[role="combobox"][aria-label="Type to filter"]').first().click();
    cy.get('input[role="combobox"][aria-label="Type to filter"]').first().clear().type(projectName);
    cy.wait(SECOND);
    // force: true needed — PF6 checkbox styling hides the actual input element
    cy.contains('li', projectName).find('input[type="checkbox"]').click({ force: true });
    cy.contains('1 project selected').should('be.visible');
  } else if (label) {
    // Select "Select labels to specify qualifying projects" radio
    cy.get('#project-labels').click();
    cy.contains('button', 'Add label').click();

    const parts = label.split('=');
    cy.get('input#label-0-key-input').clear().type(parts[0]);
    if (parts.length > 1 && parts[1]) {
      cy.get('input#label-0-value-input').clear().type(parts[1]);
    }
    cy.contains('1 project selected').should('be.visible');
  }
  // If neither projectName nor label — default "All projects" is already selected

  cy.contains(submitBtn, 'Create').click();
  cy.wait(5 * SECOND);
  cy.get('body').then(($body) => {
    if ($body.text().includes('already exists')) {
      navigateToVMN();
    }
  });
};

export const deleteVMNetwork = (name: string) => {
  cy.contains('tr', name)
    .find(actionsDropdownBtn)
    .click();
  cy.contains('button', 'Delete').click();
  cy.wait(2 * SECOND);
  // force: true needed — PF6 modal checkbox/button styling requires bypassing visibility checks
  cy.get('#delete-vm-network-modal-acknowledge-checkbox').click({ force: true });
  cy.wait(SECOND);
  cy.get('button').contains('Delete').last().click({ force: true });
  cy.wait(3 * SECOND);
};
