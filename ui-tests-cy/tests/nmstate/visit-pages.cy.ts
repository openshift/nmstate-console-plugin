import { MINUTE } from '../../utils/const/base';

describe('Visit NMState pages via sidebar', () => {
  it('should navigate to Virtual machine networks page', () => {
    cy.get('#page-sidebar').then(($sidebar) => {
      if ($sidebar.text().includes('Virtualization')) {
        cy.clickNavLink(['Virtualization', 'Virtual machine networks']);
        cy.contains('h1', 'Virtual machine networks', { timeout: MINUTE }).should('exist');
      } else {
        cy.log('Virtualization section not present — skipping');
      }
    });
  });

  it('should navigate to Physical networks page', () => {
    cy.clickNavLink(['Networking', 'Physical networks']);
    cy.contains('h1', 'Physical networks', { timeout: MINUTE }).should('exist');
  });

  it('should navigate to NodeNetworkConfigurationPolicy page', () => {
    cy.clickNavLink(['Networking', 'NodeNetworkConfigurationPolicy']);
    cy.contains('h1', 'NodeNetworkConfigurationPolicy', { timeout: MINUTE }).should('exist');
  });

  it('should navigate to Node network configuration page', () => {
    cy.clickNavLink(['Networking', 'Node network configuration']);
    cy.contains('h2', 'Node network configuration', { timeout: MINUTE }).should('exist');
  });
});
