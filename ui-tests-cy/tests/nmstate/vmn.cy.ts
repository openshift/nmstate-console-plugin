import { adminOnlyDescribe, MINUTE, K8S_KIND, TEST_NS } from '../../utils/const/base';
import {
  VM_NETWORK_PROJECT_NAME,
  VM_NETWORK_LABELED_NAME,
  REQ_PHYSICAL_NETWORK_NAME,
  REQ_NNCP_NAME,
  navigateToVMN,
  attemptToCreateVMNetwork,
  createVMNetwork,
  deleteVMNetwork,
} from '../../views/vmNetwork';

adminOnlyDescribe('Test Virtual machine networks', () => {
  before(() => {
    cy.deleteResource(K8S_KIND.NNCP, REQ_NNCP_NAME);
  });

  it('create prerequisites for Virtual machine network', () => {
    attemptToCreateVMNetwork();
  });

  it('create Virtual machine network for project', () => {
    createVMNetwork(VM_NETWORK_PROJECT_NAME, REQ_PHYSICAL_NETWORK_NAME, TEST_NS);
    navigateToVMN();
    cy.contains(VM_NETWORK_PROJECT_NAME, { timeout: MINUTE }).should('exist');
  });

  it('create Virtual machine network with labels', () => {
    createVMNetwork(VM_NETWORK_LABELED_NAME, REQ_PHYSICAL_NETWORK_NAME, undefined, 'kubernetes.io/metadata.name=default');
    navigateToVMN();
    cy.contains(VM_NETWORK_LABELED_NAME, { timeout: MINUTE }).should('exist');
  });

  it('view Virtual machine network details', () => {
    cy.contains('a', VM_NETWORK_PROJECT_NAME).click();
    cy.contains('h1', VM_NETWORK_PROJECT_NAME, { timeout: MINUTE }).should('exist');
    cy.contains('Virtual machine network details').should('be.visible');
    cy.contains('Connected projects').should('be.visible');
  });

  it('delete Virtual machine networks', () => {
    navigateToVMN();
    deleteVMNetwork(VM_NETWORK_PROJECT_NAME);
    deleteVMNetwork(VM_NETWORK_LABELED_NAME);
  });

  after(() => {
    cy.deleteResource(K8S_KIND.NNCP, REQ_NNCP_NAME);
  });
});
