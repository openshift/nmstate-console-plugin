import React, { FC, MouseEventHandler, useState } from 'react';
import NodeNetworkConfigurationPolicyModel from 'src/console-models/NodeNetworkConfigurationPolicyModel';
import { useNMStateTranslation } from 'src/utils/hooks/useNMStateTranslation';
import { useImmer } from 'use-immer';

import { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui/kubevirt-api/nmstate';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonType,
  ButtonVariant,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import PolicyForm from '@utils/components/PolicyForm/PolicyForm';
import { ensureNoEmptyBridgeMapping } from '@utils/components/PolicyForm/utils';

type EditModalProps = {
  closeModal?: () => void;
  isOpen?: boolean;
  policy: V1NodeNetworkConfigurationPolicy;
};

const EditModal: FC<EditModalProps> = ({ closeModal, isOpen, policy }) => {
  const { t } = useNMStateTranslation();
  const [error, setError] = useState(undefined);
  const [editablePolicy, setEditablePolicy] = useImmer(policy);
  const [loading, setLoading] = useState(false);

  const handleSubmit: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();

    const error = ensureNoEmptyBridgeMapping(policy);
    if (error) return setError(error);

    setError(undefined);
    setLoading(true);

    return k8sUpdate({
      model: NodeNetworkConfigurationPolicyModel,
      data: editablePolicy,
      ns: editablePolicy?.metadata?.namespace,
      name: editablePolicy?.metadata?.name,
    })
      .then(() => closeModal())
      .catch(setError)
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Modal
      onClose={closeModal}
      variant={ModalVariant.small}
      position="top"
      isOpen={isOpen}
      id="edit-modal"
    >
      <ModalHeader title={t('Edit NodeNetworkConfigurationPolicy')} />
      <ModalBody>
        <PolicyForm
          policy={editablePolicy}
          setPolicy={setEditablePolicy}
          formId="edit-policy-form"
        />
        {error && (
          <Alert isInline variant={AlertVariant.danger} title={t('An error occurred')}>
            <Stack hasGutter>
              <StackItem>{error.message}</StackItem>
              {error?.href && (
                <StackItem>
                  <a href={error.href} target="_blank" rel="noreferrer">
                    {error.href}
                  </a>
                </StackItem>
              )}
            </Stack>
          </Alert>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          onClick={handleSubmit}
          isDisabled={loading}
          isLoading={loading}
          variant={ButtonVariant.primary}
          type={ButtonType.submit}
          form="edit-policy-form"
        >
          {t('Save')}
        </Button>
        <Button onClick={closeModal} variant={ButtonVariant.secondary}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditModal;
