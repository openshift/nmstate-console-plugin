import { SKIP_WELCOME_BANNER_TEST_ID } from '../support/selectors';

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

  it('with bridge interface', () => {
    const testPolicyName = 'test-bridge-policy-name';
    cy.visit('/k8s/cluster/nmstate.io~v1~NodeNetworkConfigurationPolicy');
    cy.byTestID(SKIP_WELCOME_BANNER_TEST_ID).click();
    cy.byTestID('item-create').click();

    cy.contains('button', 'From Form').click();

    cy.get('input[name="policy-name"]').clear().type(`${testPolicyName}`);

    cy.get('input[name="policy-description"]').clear().type('test-policy-description');

    cy.contains('button', 'Review and create').click();

    cy.get('button#policy-wizard-review').click();

    cy.contains('button', 'Create policy').click();

    cy.contains('h1', testPolicyName);

    deletePolicyFromDetailsPage(testPolicyName);
  });
});
