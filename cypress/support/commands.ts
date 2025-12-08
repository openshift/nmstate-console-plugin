/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />
import { KUBEADMIN_IDP, KUBEADMIN_USERNAME, MINUTE, SKIP_TOUR } from './constants';
import { OCP_GUIDED_TOUR_MODAL, SUBMIT_BUTTON_SELECTOR } from './selectors';
import { ConsoleWindowType } from './types';

declare global {
  namespace Cypress {
    interface Chainable {
      login(provider?: string, username?: string, password?: string): Chainable<void>;
      logout(): Chainable<void>;
      byTestID(
        selector: string,
        options?: Partial<Loggable & Timeoutable & Withinable & Shadow>,
      ): Chainable;
      byLegacyTestID(selector: string): Chainable;
      clickOutside(): Chainable;
      skipOCPGuidedTour(): Chainable;
    }
  }
}

Cypress.Commands.add('login', (provider, username, password) => {
  cy.visit(''); // visits baseUrl which is set in plugins.js
  cy.task('log', `  Logging in as ${username || KUBEADMIN_USERNAME}`);
  cy.get('.pf-v6-c-login__main', { timeout: 3 * MINUTE }).should('exist');
  const idp = provider || KUBEADMIN_IDP;
  cy.get('body').then(($body) => {
    if ($body.text().includes(idp)) {
      cy.contains(idp).should('be.visible').click();
    }
  });
  cy.get('#inputUsername').type(username || KUBEADMIN_USERNAME);
  cy.get('#inputPassword').type(password || Cypress.env('BRIDGE_KUBEADMIN_PASSWORD'));
  cy.get(SUBMIT_BUTTON_SELECTOR).click();
  cy.byTestID(Cypress.env('BRIDGE_KUBEADMIN_PASSWORD') ? 'user-dropdown-toggle' : 'username', {
    timeout: MINUTE,
  }).should('be.visible');
  // wait for virtualization page appears, only for kubeadmin user
  if (idp === KUBEADMIN_IDP) {
    cy.contains('You are logged in as a temporary administrative user.').should('be.visible');
  }
  cy.task('log', '  Login is successful');
});

Cypress.Commands.add('logout', () => {
  // Check if auth is disabled (for a local development environment).
  cy.window().then((win: ConsoleWindowType) => {
    if (win.SERVER_FLAGS?.authDisabled) {
      cy.log('skipping logout, console is running with auth disabled');
      return;
    }
    cy.log('Logging out');
    cy.byTestID('user-dropdown').click();
    cy.byTestID('log-out').should('be.visible');
    cy.byTestID('log-out').click({ force: true });
    cy.byLegacyTestID('login').should('be.visible');
  });
});

Cypress.Commands.add('byTestID', (selector, options) =>
  cy.get(`[data-test="${selector}"]`, options),
);

Cypress.Commands.add('byLegacyTestID', (selector) => cy.get(`[data-test-id="${selector}"]`));

Cypress.Commands.add('clickOutside', () => {
  return cy.get('body').click(0, 0); //0,0 here are the x and y coordinates
});

Cypress.Commands.add('skipOCPGuidedTour', () =>
  cy.get('body').then(($body) => {
    if ($body.find(OCP_GUIDED_TOUR_MODAL).length) {
      cy.contains('button', SKIP_TOUR).click();
    }
  }),
);
