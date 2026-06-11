import { adminOnlyDescribe } from '../../utils/const/base';
import { itemFilter } from '../../views/selector-common';
import { NNCP_TEST_NAME, createNNCPFromForm, createNNCPFromYAML, deleteNNCP, editNNCP } from '../../views/nncp';
import { PHYSICAL_NETWORK_TEST_NAME } from '../../views/physicalNetwork';

adminOnlyDescribe('Test NodeNetworkConfigurationPolicy', () => {
  before(() => {
    cy.visitNNCP();
  });

  it('create NNCP from form', () => {
    createNNCPFromForm(NNCP_TEST_NAME, PHYSICAL_NETWORK_TEST_NAME, 'test nncp by wizard');
    cy.visitNNCP();
    cy.contains('tr', NNCP_TEST_NAME).should('exist');
  });

  it('create NNCP with YAML', () => {
    createNNCPFromYAML();
    cy.visitNNCP();
    cy.contains('example').should('exist');
  });

  it('test NNCP nodes summary', () => {
    cy.contains('tr', NNCP_TEST_NAME).within(() => {
      cy.get('[data-label="Matched nodes"], [data-label="nodes"]').should('exist');
    });
  });

  it('test NNCP page controls', () => {
    cy.get(itemFilter).should('be.visible');
    cy.get(itemFilter).clear().type(NNCP_TEST_NAME);
    cy.contains('tr', NNCP_TEST_NAME).should('exist');
    cy.get(itemFilter).clear();
  });

  it('test Edit NNCP modal', () => {
    editNNCP(NNCP_TEST_NAME);
  });

  it('delete NNCP', () => {
    cy.visitNNCP();
    deleteNNCP(NNCP_TEST_NAME);
  });
});
