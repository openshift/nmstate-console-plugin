import React, { FC } from 'react';
import { Trans } from 'react-i18next';
import { useNMStateTranslation } from 'src/utils/hooks/useNMStateTranslation';

import { NodeNetworkConfigurationInterface } from '@kubevirt-ui/kubevirt-api/nmstate';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';

import { capitalizeFirstLetter } from '../utils';

type DeleteInterfaceModalProps = {
  closeModal: () => void;
  isOpen?: boolean;
  policyInterface: NodeNetworkConfigurationInterface;
  onSubmit: (policyInterface: NodeNetworkConfigurationInterface) => void;
};

const DeleteInterfaceModal: FC<DeleteInterfaceModalProps> = ({
  closeModal,
  isOpen,
  policyInterface,
  onSubmit,
}) => {
  const { t } = useNMStateTranslation();

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(policyInterface);
    closeModal();
  };

  return (
    <Modal onClose={closeModal} variant="medium" position="top" isOpen={isOpen} id="delete-modal">
      <ModalHeader
        title={t('Delete NodeNetworkConfigurationPolicyInterface?')}
        titleIconVariant="warning"
      />
      <ModalBody>
        <form id="delete-interface-form">
          <p className="pf-v6-u-mb-md pf-v6-u-mt-sm">
            <Trans t={t} ns="plugin__nmstate-console-plugin">
              Are you sure you want to remove{' '}
              {{ interfaceType: capitalizeFirstLetter(policyInterface?.type) }} interface{' '}
              <strong>{{ name: policyInterface.name }}</strong>?
            </Trans>
          </p>
        </form>
      </ModalBody>
      <ModalFooter>
        <Button onClick={handleSubmit} variant={ButtonVariant.danger} form="delete-interface-form">
          {t('Delete')}
        </Button>
        <Button onClick={closeModal} variant={ButtonVariant.secondary}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteInterfaceModal;
