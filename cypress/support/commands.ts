/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />
import { KUBEADMIN_IDP, KUBEADMIN_USERNAME, SELECTORS } from './constants';
import { ConsoleWindowType } from './types';

import Loggable = Cypress.Loggable;
import Timeoutable = Cypress.Timeoutable;
import Withinable = Cypress.Withinable;
import Shadow = Cypress.Shadow;

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
  const idp = provider || KUBEADMIN_IDP;
  const user = username || KUBEADMIN_USERNAME;
  const pass = password || Cypress.env('KUBEADMIN_PASSWORD');

  const selectIdpIfPresent = (idpName: string) => {
    cy.get('body').then(($body) => {
      if ($body.text().includes(idpName)) {
        cy.contains(idpName).should('be.visible').click();
      }
    });
  };

  const fillAndSubmitLoginForm = (args: {
    idpName: string;
    usernameSel: string;
    passwordSel: string;
    submitSel: string;
    user: string;
    pass: string;
  }) => {
    cy.get('main form').should('be.visible');
    selectIdpIfPresent(args.idpName);
    cy.get(args.usernameSel).type(args.user);
    cy.get(args.passwordSel).type(args.pass);
    cy.get(args.submitSel).click();
  };

  const closeTourPopupIfPresent = () => {
    cy.get('body').then(($body) => {
      if ($body.find(SELECTORS.tourPopup).length) {
        cy.get(SELECTORS.tourPopup).click();
      }
    });
  };

  cy.visit('/'); // visits baseUrl

  // If auth is disabled (local dev), skip the login flow entirely.
  cy.window().then((win: ConsoleWindowType) => {
    if (win.SERVER_FLAGS?.authDisabled) {
      cy.log('skipping login, console is running with auth disabled');
      cy.contains('li[data-test="nav"]', 'Networking').click();
      cy.contains(
        '*[data-test-id="nodenetworkconfigurationpolicy-nav-item"]',
        'NodeNetworkConfigurationPolicy',
      ).should('be.visible');
      return 'authDisabled' as const;
    }
    return 'authEnabled' as const;
  }).then((authMode) => {
    if (authMode === 'authDisabled') return;

    // OpenShift redirects unauthenticated users to oauth-openshift.apps... (different origin than
    // console-openshift-console...). Cypress 12+ requires cy.origin() for commands on that page.
    cy.url().then((currentUrl) => {
      const url = new URL(currentUrl);
      const isOauthOrigin = url.hostname.includes('oauth-openshift');

      cy.clearCookie('openshift-session-token');

      if (isOauthOrigin) {
        cy.origin(
          url.origin,
          {
            args: {
              idpName: idp,
              user,
              pass,
              usernameSel: SELECTORS.usernameInput,
              passwordSel: SELECTORS.passwordInput,
              submitSel: SELECTORS.submitButton,
            },
          },
          ({ idpName, user, pass, usernameSel, passwordSel, submitSel }) => {
            cy.get('main form').should('be.visible');

            cy.get('body').then(($body) => {
              if ($body.text().includes(idpName)) {
                cy.contains(idpName).should('be.visible').click();
              }
            });

            cy.get(usernameSel).type(user);
            cy.get(passwordSel).type(pass);
            cy.get(submitSel).click();
          },
        );
      } else {
        fillAndSubmitLoginForm({
          idpName: idp,
          user,
          pass,
          usernameSel: SELECTORS.usernameInput,
          passwordSel: SELECTORS.passwordInput,
          submitSel: SELECTORS.submitButton,
        });
      }

      cy.wait(20000);
      closeTourPopupIfPresent();
    });
  });
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
