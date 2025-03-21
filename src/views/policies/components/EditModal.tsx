import React, { FC, MouseEventHandler, useState } from 'react';
import NodeNetworkConfigurationPolicyModel from 'src/console-models/NodeNetworkConfigurationPolicyModel';
import { useNMStateTranslation } from 'src/utils/hooks/useNMStateTranslation';
import { useImmer } from 'use-immer';

import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import {
  ActionList,
  ActionListItem,
  Alert,
  AlertVariant,
  Button,
  ButtonType,
  ButtonVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Modal } from '@patternfly/react-core/deprecated';
import { V1NodeNetworkConfigurationPolicy } from '@types';
import PolicyForm from '@utils/components/PolicyForm/PolicyForm';

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
      className="ocs-modal"
      onClose={closeModal}
      variant={'small'}
      position="top"
      title={t('Edit NodeNetworkConfigurationPolicy')}
      footer={
        <Stack className="edit-modal-footer pf-v6-u-flex-fill" hasGutter>
          {error && (
            <StackItem>
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
            </StackItem>
          )}
          <StackItem>
            <ActionList>
              <ActionListItem>
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
              </ActionListItem>
              <ActionListItem>
                <Button onClick={closeModal} variant={ButtonVariant.secondary}>
                  {t('Cancel')}
                </Button>
              </ActionListItem>
            </ActionList>
          </StackItem>
        </Stack>
      }
      isOpen={isOpen}
      id="edit-modal"
    >
      <PolicyForm policy={editablePolicy} setPolicy={setEditablePolicy} formId="edit-policy-form" />
    </Modal>
  );
};

export default EditModal;
