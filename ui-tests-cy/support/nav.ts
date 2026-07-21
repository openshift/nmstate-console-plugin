import { MINUTE, SECOND } from '../utils/const/base';

declare global {
  namespace Cypress {
    interface Chainable {
      visitNNCP(): void;
      visitNNS(): void;
      visitPhysicalNetworks(): void;
      visitTopology(): void;
    }
  }
}

Cypress.Commands.add('visitNNCP', () => {
  cy.visit('/k8s/cluster/nmstate.io~v1~NodeNetworkConfigurationPolicy');
  cy.url({ timeout: MINUTE }).should('include', 'NodeNetworkConfigurationPolicy');
  cy.contains('h1', 'NodeNetworkConfigurationPolicy', { timeout: MINUTE }).should('exist');
});

Cypress.Commands.add('visitNNS', () => {
  cy.visit('/k8s/cluster/nmstate.io~v1beta1~NodeNetworkState');
  cy.url({ timeout: MINUTE }).should('include', 'NodeNetworkState');
  cy.contains('h1', 'NodeNetworkState', { timeout: MINUTE }).should('exist');
});

Cypress.Commands.add('visitPhysicalNetworks', () => {
  cy.visit('/physical-networks');
  cy.url({ timeout: MINUTE }).should('include', 'physical-networks');
  cy.contains('h1', 'Physical networks', { timeout: MINUTE }).should('exist');
});

Cypress.Commands.add('visitTopology', () => {
  cy.visit('/node-network-configuration');
  cy.url({ timeout: MINUTE }).should('include', '/node-network-configuration');
  cy.wait(3 * SECOND);
});
