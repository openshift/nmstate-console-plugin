import { adminOnlyDescribe, MINUTE, SECOND } from '../../utils/const/base';

adminOnlyDescribe('Test NodeNetworkState and Topology', () => {
  it('verify bridge on NodeNetworkState', () => {
    cy.visitNNS();
    cy.get('table', { timeout: MINUTE }).should('be.visible');
    cy.get('table tbody tr').should('have.length.at.least', 1);

    // Verify interface type buttons exist in the first worker row
    cy.contains('table tbody tr', 'worker').first().within(() => {
      cy.get('td button').should('have.length.at.least', 3);
      cy.get('td button').filter(':contains("ethernet")').should('exist');
      cy.get('td button').filter(':contains("linux-bridge")').should('exist');
      cy.get('td button').filter(':contains("ovs-bridge")').should('exist');
    });
  });

  it('verify expand all and collapse all', { retries: 2 }, () => {
    cy.visitNNS();
    cy.get('table', { timeout: MINUTE }).should('be.visible');

    // Click "Expand all" and retry if click didn't register
    cy.contains('button', 'Expand all').should('be.visible').click();
    cy.get('[class*="expanded-true"], tbody.pf-m-expanded', { timeout: MINUTE })
      .should('have.length.at.least', 1);

    // Click "Collapse all"
    cy.contains('button', 'Collapse all').should('be.visible').click();
    cy.get('[class*="expanded-true"], tbody.pf-m-expanded', { timeout: MINUTE })
      .should('not.exist');
  });

  it('check NNC topology view', () => {
    cy.visitTopology();
    cy.get('.pf-topology-visualization-surface, [data-test-id="topology"]', { timeout: MINUTE })
      .should('exist');
  });
});
