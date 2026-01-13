const deletePolicyFromDetailsPage = (policyName: string) => {
  cy.contains('button', 'Actions', { matchCase: false }).click();
  cy.contains('button', 'Delete').click();

  cy.contains('button[disabled]', 'Delete');

  cy.get('input#text-confirmation').clear().type(`${policyName}`);

  cy.contains('button', 'Delete').click();

  cy.contains('h1', 'NodeNetworkConfigurationPolicy');
};

describe('Create new policy with form', () => {
  beforeEach(() => {
    cy.login();
  });

  it('with default node network', () => {
    const testPolicyName = 'test-bridge-policy-name';
    const testDescription = 'Test description';

    cy.visit('/k8s/cluster/nmstate.io~v1~NodeNetworkConfigurationPolicy');
    cy.byTestID('item-create').click();

    cy.contains('button', 'From Form').click();

    // Network identity step
    cy.get('input[name="physical-network-name"]').clear().type(`${testPolicyName}`);
    cy.contains('button', 'Next').click();

    // Nodes configuration step
    cy.get('input[name="policy-name"]').clear().type(`${testPolicyName}`);
    cy.get('input[name="policy-description"]').clear().type(`${testDescription}`);
    cy.contains('button', 'Next').click();

    // Uplink connection step - 'Default node network' selected by default
    cy.contains('button', 'Next').click();

    // Settings step is skipped because 'Default node network' is selected

    // Review and Create step
    cy.byLegacyTestID('review-physical-network-name').should('have.text', testPolicyName);
    cy.byLegacyTestID('review-network-description').should('have.text', testDescription);
    cy.contains('button', 'Create network').click();

    cy.contains('h1', testPolicyName);

    deletePolicyFromDetailsPage(testPolicyName);
  });
});
