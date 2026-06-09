import { adminOnlyDescribe, MINUTE, SECOND, K8S_KIND } from '../../utils/const/base';
import { PHYSICAL_NETWORK_TEST_NAME, createPhysicalNetwork } from '../../views/physicalNetwork';

adminOnlyDescribe('Test Physical networks', () => {
  before(() => {
    cy.deleteResource(K8S_KIND.NNCP, PHYSICAL_NETWORK_TEST_NAME);
  });

  it('create Physical network', () => {
    cy.visitPhysicalNetworks();
    createPhysicalNetwork(PHYSICAL_NETWORK_TEST_NAME);
  });

  it('verify Physical network in list', () => {
    cy.visitPhysicalNetworks();
    cy.contains(PHYSICAL_NETWORK_TEST_NAME, { timeout: MINUTE }).should('be.visible');
  });

  it('expand Physical network row and verify configuration', () => {
    cy.contains('td', PHYSICAL_NETWORK_TEST_NAME)
      .closest('tr')
      .find('td:first-child button')
      .first()
      .click();
    // Wait for expand animation to complete
    cy.wait(2 * SECOND);

    cy.contains('td', PHYSICAL_NETWORK_TEST_NAME)
      .closest('tbody')
      .contains(PHYSICAL_NETWORK_TEST_NAME)
      .should('be.visible');
  });
});
