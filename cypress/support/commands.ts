/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />
import { KUBEADMIN_IDP, KUBEADMIN_USERNAME } from './constants';
import { ConsoleWindowType } from './types';

import Loggable = Cypress.Loggable;
import Timeoutable = Cypress.Timeoutable;
import Withinable = Cypress.Withinable;
import Shadow = Cypress.Shadow;

const MINUTE = 60 * 1000;
const GUIDED_TOUR_SETTINGS = JSON.stringify({
  'console.guidedTour': { admin: { completed: true } },
});

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
    }
  }
}

Cypress.Commands.add('login', (provider, username, password) => {
  // Pre-dismiss the guided tour by setting the flag in localStorage before the page renders
  cy.visit('', {
    onBeforeLoad(win) {
      win.localStorage.setItem('console-user-settings', GUIDED_TOUR_SETTINGS);
    },
  });
  cy.window().then((win: ConsoleWindowType) => {
    if (win.SERVER_FLAGS?.authDisabled) {
      cy.log('skipping login, console is running with auth disabled');

      cy.contains('li[data-test="nav"]', 'Networking').click();
      cy.contains(
        '*[data-test-id="nodenetworkconfigurationpolicy-nav-item"]',
        'NodeNetworkConfigurationPolicy',
      ).should('be.visible');
      return;
    }

    cy.clearCookie('openshift-session-token');

    const idp = provider || KUBEADMIN_IDP;
    const loginUsername = username || KUBEADMIN_USERNAME;
    const loginPassword = password || Cypress.env('KUBEADMIN_PASSWORD');

    cy.origin(
      Cypress.config('baseUrl').replace('console-openshift-console', 'oauth-openshift'),
      { args: { idp, loginUsername, loginPassword } },
      ({ idp: originIdp, loginUsername: originUsr, loginPassword: originPwd }) => {
        cy.get('body', { timeout: 3 * 60_000 }).should('be.visible');
        cy.get('body').then(($body) => {
          if ($body.find('#inputUsername').length === 0) {
            if ($body.text().includes(originIdp)) {
              cy.contains('a', originIdp).click();
            } else if ($body.text().includes('kubeadmin')) {
              cy.contains('a', 'kubeadmin').click();
            } else {
              cy.get('a').first().click();
            }
          }
        });
        cy.get('#inputUsername', { timeout: 3 * 60_000 }).should('be.visible');
        cy.get('#inputUsername').type(originUsr);
        cy.get('#inputPassword').type(originPwd, { log: false });
        cy.get('button[type=submit]').click();
      },
    );

    cy.url({ timeout: 2 * MINUTE }).should('include', 'console-openshift-console');

    // Dismiss the guided tour for CI by setting localStorage after returning to console origin
    cy.window().then((w) =>
      w.localStorage.setItem('console-user-settings', GUIDED_TOUR_SETTINGS),
    );
    cy.reload();

    cy.get('[data-test="user-dropdown"], [data-test="user-dropdown-toggle"], #page-sidebar', {
      timeout: MINUTE,
    }).should('exist');
  });
});

Cypress.Commands.add('logout', () => {
  cy.window().then((win: ConsoleWindowType) => {
    if (win.SERVER_FLAGS?.authDisabled) {
      cy.log('skipping logout, console is running with auth disabled');
      return;
    }
    cy.log('Logging out');
    cy.visit('/');
    cy.get('body').then(($body) => {
      if ($body.find('[data-test="user-dropdown"]').length === 0) {
        cy.log('logout skipped: user menu not present');
        return;
      }
      cy.get('[data-test="user-dropdown"]').click();
      cy.get('[data-test="log-out"]').should('be.visible');
      cy.get('[data-test="log-out"]').click({ force: true });
    });
  });
});

Cypress.Commands.add('byTestID', (selector, options) =>
  cy.get(`[data-test="${selector}"]`, options),
);

Cypress.Commands.add('byLegacyTestID', (selector) => cy.get(`[data-test-id="${selector}"]`));

Cypress.Commands.add('clickOutside', () => {
  return cy.get('body').click(0, 0); //0,0 here are the x and y coordinates
});
