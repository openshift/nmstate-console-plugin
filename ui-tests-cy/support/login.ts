import { MINUTE, SECOND } from '../utils/const/base';

const KUBEADMIN_USERNAME = 'kubeadmin';
const KUBEADMIN_IDP = 'kube:admin';
const TOUR_DISMISS = '[data-test="tour-step-footer-secondary"]';

declare global {
  namespace Cypress {
    interface Chainable {
      login(providerName?: string, username?: string, password?: string): Chainable<Element>;
      logout(): void;
    }
  }
}

Cypress.Commands.add('login', (provider: string, username: string, password: string) => {
  cy.visit('');
  cy.get('.pf-v6-c-login__main, .pf-v5-c-login__main, #inputUsername', { timeout: 3 * MINUTE }).should('exist');
  const idp = provider || KUBEADMIN_IDP;
  cy.get('body').then(($body) => {
    if ($body.find('#inputUsername').length === 0 && $body.text().includes(idp)) {
      cy.contains(idp).should('be.visible').click();
    }
  });
  cy.get('#inputUsername', { timeout: 3 * MINUTE }).should('be.visible');
  cy.get('#inputUsername').type(username || KUBEADMIN_USERNAME);
  cy.get('#inputPassword').type(password || Cypress.env('BRIDGE_KUBEADMIN_PASSWORD'));
  cy.get('button[type=submit]').click();
  cy.get('#page-sidebar', { timeout: 3 * MINUTE }).should('exist');
  cy.get('body').then(($body) => {
    if ($body.find(TOUR_DISMISS).length) {
      cy.get(TOUR_DISMISS).click();
    }
  });
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-test="user-dropdown"]').click();
  cy.get('[data-test="log-out"]').should('be.visible');
  cy.get('[data-test="log-out"]').click({ force: true });
});
