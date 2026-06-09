import { MINUTE, SECOND } from '../utils/const/base';
import { itemCreateBtn, actionsBtn } from './selector-common';
import { fillPhysicalNetworkWizard } from './physicalNetwork';

export const NNCP_TEST_NAME = 'test-form-nncp';
export const NNCP_VMN_NAME = 'test-vmn-nncp';

export const createNNCPFromForm = (
  policyName: string,
  physicalNetworkName: string,
  description?: string,
) => {
  cy.get(itemCreateBtn).click();
  cy.contains('button', 'From Form').click();
  fillPhysicalNetworkWizard(physicalNetworkName, policyName, description);
  cy.contains('h1', policyName, { timeout: MINUTE }).should('exist');
};

export const createNNCPFromYAML = () => {
  cy.get(itemCreateBtn).click();
  cy.contains('button', 'With YAML').click();
  cy.url({ timeout: MINUTE }).should('include', '~new');
  cy.wait(3 * SECOND);
  cy.get('button').contains('Create').click();
  cy.wait(5 * SECOND);
  cy.get('body').then(($body) => {
    if ($body.text().includes('already exists')) {
      cy.contains('button', 'Cancel').click();
    }
  });
};

export const deleteNNCP = (name: string) => {
  cy.contains('tr', name).within(() => {
    cy.get(actionsBtn).first().click();
  });
  cy.contains('button', 'Delete').click();
  cy.get('#text-confirmation').type(name);
  cy.contains('button', 'Delete').click();
  cy.contains(name).should('not.exist');
};

export const editNNCP = (name: string) => {
  cy.contains('tr', name).within(() => {
    cy.get(actionsBtn).first().click();
  });
  cy.contains('button', 'Edit').click();
  cy.url({ timeout: MINUTE }).should('include', name);
  cy.contains(name, { timeout: MINUTE }).should('be.visible');
};
