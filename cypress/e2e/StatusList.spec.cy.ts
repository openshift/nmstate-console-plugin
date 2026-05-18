import {
  CHECKBOX_FILTER_TOGGLE_SELECTOR,
  EXPAND_INTERFACE_INFO,
  EXPAND_INTERFACES_LIST_TEST_ID,
  INTERFACE_DRAWER_TEST_ID,
  LLDP_DRAWER_DETAILS_SECTION_TEST_ID,
  LLDP_NAME_FILTER_INPUT,
  LLDP_SYSTEM_NAME_FILTER_INPUT,
  STATES_LIST_FILTERS,
} from '../support/selectors';

describe('NodeNetworkState list', () => {
  beforeEach(() => {
    cy.login();
  });

  it('Empty state', () => {
    cy.intercept('GET', '/api/kubernetes/apis/nmstate.io/v1beta1/nodenetworkstates*', {
      fixture: 'NodeNetworkStatusEmpty.json',
    }).as('getStatuses');

    cy.visit('/k8s/cluster/nmstate.io~v1beta1~NodeNetworkState');

    cy.wait(['@getStatuses'], { timeout: 40000 });

    cy.get('h5').should('contain', 'No NodeNetworkStates found');
  });

  it('with one VID instace ', () => {
    cy.intercept('GET', '/api/kubernetes/apis/nmstate.io/v1beta1/nodenetworkstates*', {
      fixture: 'NodeNetworkStatusWithVID.json',
    }).as('getStatuses');

    cy.fixture('NodeNetworkStatusWithVID.json').then((nnsResponse) => {
      const nns = nnsResponse.items[0];
      const iface = nns.status.currentState.interfaces[0];

      cy.visit('/k8s/cluster/nmstate.io~v1beta1~NodeNetworkState');

      cy.wait(['@getStatuses'], { timeout: 40000 });

      cy.get('table').should('contain', nns.metadata.name);

      cy.get(EXPAND_INTERFACES_LIST_TEST_ID).click();
      cy.byTestID(EXPAND_INTERFACE_INFO).find('button').click();

      cy.byTestID(`${iface.type}-${iface.name}-open-drawer`).contains(iface.name).click();

      cy.byTestID(INTERFACE_DRAWER_TEST_ID).should('be.visible').should('contain', 'Details');

      cy.byTestID(LLDP_DRAWER_DETAILS_SECTION_TEST_ID)
        .should('contain', 'LLDP')
        .should('contain', 'Enabled');
    });
  });

  it('with LLDP informations ', () => {
    cy.intercept('GET', '/api/kubernetes/apis/nmstate.io/v1beta1/nodenetworkstates*', {
      fixture: 'NodeNetworkStatusWithLLDP.json',
    }).as('getStatuses');

    cy.fixture('NodeNetworkStatusWithLLDP.json').then((nnsResponse) => {
      const nns = nnsResponse.items[0];
      const iface = nns.status.currentState.interfaces.find((iface) => iface.lldp?.enabled);

      cy.visit('/k8s/cluster/nmstate.io~v1beta1~NodeNetworkState');

      cy.wait(['@getStatuses'], { timeout: 40000 });

      cy.get('table').should('contain', nns.metadata.name);

      cy.get(EXPAND_INTERFACES_LIST_TEST_ID).click();
      cy.byTestID(EXPAND_INTERFACE_INFO).find('button').click();

      cy.byTestID(`${iface.type}-${iface.name}-open-drawer`).contains(iface.name).click();

      cy.byTestID(INTERFACE_DRAWER_TEST_ID).should('be.visible').should('contain', 'Details');

      cy.byTestID(LLDP_DRAWER_DETAILS_SECTION_TEST_ID)
        .should('contain', 'LLDP')
        .should('contain', 'Enabled');

      cy.byTestID(LLDP_DRAWER_DETAILS_SECTION_TEST_ID)
        .should('contain', 'Neighbors')
        .should('contain', 'MAC address')
        .should('contain', 'Port')
        .should('contain', 'VLANS');
    });
  });

  it('filter by lldp', () => {
    cy.intercept('GET', '/api/kubernetes/apis/nmstate.io/v1beta1/nodenetworkstates*', {
      fixture: 'NodeNetworkStatusWithLLDP.json',
    }).as('getStatuses');

    cy.fixture('NodeNetworkStatusWithLLDP.json').then((nnsResponse) => {
      const nns = nnsResponse.items[0];
      const ifaceWithLLDP = nns.status.currentState.interfaces.find((iface) => iface.lldp?.enabled);
      const ifaceWithoutLLDP = nns.status.currentState.interfaces.find(
        (iface) => !iface.lldp?.enabled,
      );

      cy.visit('/k8s/cluster/nmstate.io~v1beta1~NodeNetworkState');

      cy.wait(['@getStatuses'], { timeout: 40000 });

      cy.get('table').should('contain', nns.metadata.name);

      // open the filter-type dropdown and select "LLDP"
      cy.byTestID(STATES_LIST_FILTERS).find('button:visible').first().click();
      cy.get('[role="menuitem"] button')
        .contains(/^LLDP$/)
        .click();

      // open the LLDP checkbox filter and check "Enabled"
      cy.get(CHECKBOX_FILTER_TOGGLE_SELECTOR).click();
      cy.get('[data-ouia-component-id="DataViewCheckboxFilter-filter-item-enabled"] label').click();

      cy.get('table').should('contain', nns.metadata.name);
      cy.get(EXPAND_INTERFACES_LIST_TEST_ID).click();
      cy.byTestID(EXPAND_INTERFACE_INFO).find('button').click();

      cy.byTestID(`${ifaceWithLLDP.type}-${ifaceWithLLDP.name}-open-drawer`).contains(
        ifaceWithLLDP.name,
      );

      cy.byTestID(`${ifaceWithoutLLDP.type}-expandable-section-toggle`).should('not.exist');
    });
  });

  it('search by lldp vlan ID', () => {
    cy.intercept('GET', '/api/kubernetes/apis/nmstate.io/v1beta1/nodenetworkstates*', {
      fixture: 'NodeNetworkStatusWithLLDP.json',
    }).as('getStatuses');

    cy.fixture('NodeNetworkStatusWithLLDP.json').then((nnsResponse) => {
      const nns = nnsResponse.items[0];
      const ifaceWithLLDP = nns.status.currentState.interfaces.find((iface) => iface.lldp?.enabled);
      const ifaceWithoutLLDP = nns.status.currentState.interfaces.find(
        (iface) => !iface.lldp?.enabled,
      );

      const VLAN_NAME = '1000';

      cy.visit('/k8s/cluster/nmstate.io~v1beta1~NodeNetworkState');

      cy.wait(['@getStatuses'], { timeout: 40000 });

      cy.get('table').should('contain', nns.metadata.name);

      // switch the filter type to "LLDP VLAN name" and type the search value
      cy.byTestID(STATES_LIST_FILTERS).find('button:visible').first().click();
      cy.contains('[role="menuitem"] button', 'LLDP VLAN name').click();
      cy.get(LLDP_NAME_FILTER_INPUT).type(VLAN_NAME);

      cy.get('table').should('contain', nns.metadata.name);
      cy.get(EXPAND_INTERFACES_LIST_TEST_ID).click();
      cy.byTestID(EXPAND_INTERFACE_INFO).find('button').click();

      cy.byTestID(`${ifaceWithLLDP.type}-${ifaceWithLLDP.name}-open-drawer`).contains(
        ifaceWithLLDP.name,
      );

      cy.byTestID(`${ifaceWithoutLLDP.type}-expandable-section-toggle`).should('not.exist');
    });
  });

  it('search by lldp system name', () => {
    cy.intercept('GET', '/api/kubernetes/apis/nmstate.io/v1beta1/nodenetworkstates*', {
      fixture: 'NodeNetworkStatusWithLLDP.json',
    }).as('getStatuses');

    cy.fixture('NodeNetworkStatusWithLLDP.json').then((nnsResponse) => {
      const nns = nnsResponse.items[0];
      const ifaceWithLLDP = nns.status.currentState.interfaces.find((iface) => iface.lldp?.enabled);
      const ifaceWithoutLLDP = nns.status.currentState.interfaces.find(
        (iface) => !iface.lldp?.enabled,
      );

      const SYSTEM_NAME = 'sw01-access-f1.tlv2.redhat.com';

      cy.visit('/k8s/cluster/nmstate.io~v1beta1~NodeNetworkState');

      cy.wait(['@getStatuses'], { timeout: 40000 });

      cy.get('table').should('contain', nns.metadata.name);

      // switch the filter type to "LLDP system name" and type the search value
      cy.byTestID(STATES_LIST_FILTERS).find('button:visible').first().click();
      cy.contains('[role="menuitem"] button', 'LLDP system name').click();
      cy.get(LLDP_SYSTEM_NAME_FILTER_INPUT).type(SYSTEM_NAME);

      cy.get('table').should('contain', nns.metadata.name);
      cy.get(EXPAND_INTERFACES_LIST_TEST_ID).click();
      cy.byTestID(EXPAND_INTERFACE_INFO).find('button').click();

      cy.byTestID(`${ifaceWithLLDP.type}-${ifaceWithLLDP.name}-open-drawer`).contains(
        ifaceWithLLDP.name,
      );

      cy.byTestID(`${ifaceWithoutLLDP.type}-expandable-section-toggle`).should('not.exist');
    });
  });
});
