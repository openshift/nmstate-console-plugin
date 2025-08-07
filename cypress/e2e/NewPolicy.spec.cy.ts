import { SKIP_WELCOME_BANNER_TEST_ID } from '../support/selectors';

const deletePolicyFromDetailsPage = (policyName: string) => {
  cy.contains('button', 'Actions', { matchCase: false }).click();
  cy.contains('button', 'Delete').click();

  cy.contains('button[disabled]', 'Delete');

  cy.get('input#text-confirmation').clear().type(`${policyName}`);

  cy.contains('button', 'Delete').click();

  cy.contains('h1', 'NodeNetworkConfigurationPolicy');
};

describe.skip('Create new policy with form', () => {
  beforeEach(() => {
    cy.login();
  });

  it('with bridge interface', () => {
    const testPolicyName = 'test-bridge-policy-name';
    cy.visit('/k8s/cluster/nmstate.io~v1~NodeNetworkConfigurationPolicy');
    cy.byTestID(SKIP_WELCOME_BANNER_TEST_ID).click();
    cy.byTestID('item-create').click();

    cy.contains('button', 'From Form').click();

    cy.get('input[name="policy-name"]').clear().type(`${testPolicyName}`);

    cy.get('input[name="policy-description"]').clear().type('test-policy-description');

    cy.contains('button', 'Bridging').click();
    cy.get(`button#add-bridging-interface-button`).click();
    cy.contains('button', 'Next').click();
    cy.contains('button', 'Create policy').click();

    cy.contains('h1', testPolicyName);

    deletePolicyFromDetailsPage(testPolicyName);
  });
});
