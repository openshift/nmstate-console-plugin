import React, { FC, MouseEventHandler, useState } from 'react';
import { Trans } from 'react-i18next';
import { useHistory } from 'react-router';
import NodeNetworkConfigurationPolicyModel from 'src/console-models/NodeNetworkConfigurationPolicyModel';
import { useNMStateTranslation } from 'src/utils/hooks/useNMStateTranslation';

import { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui/kubevirt-api/nmstate';
import { k8sDelete } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonType,
  ButtonVariant,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  StackItem,
  TextInput,
} from '@patternfly/react-core';
import ExternalLink from '@utils/components/ExternalLink/ExternalLink';
import { getResourceUrl } from '@utils/helpers';

type DeleteModalProps = {
  closeModal: () => void;
  isOpen?: boolean;
  policy: V1NodeNetworkConfigurationPolicy;
};

const DeleteModal: FC<DeleteModalProps> = ({ closeModal, isOpen, policy }) => {
  const { t } = useNMStateTranslation();
  const history = useHistory();
  const [error, setError] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleSubmit: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    setLoading(true);

    return k8sDelete({
      model: NodeNetworkConfigurationPolicyModel,
      resource: policy,
      ns: policy?.metadata?.namespace,
      name: policy?.metadata?.name,
    })
      .then(() => history.push(getResourceUrl({ model: NodeNetworkConfigurationPolicyModel })))
      .catch(setError)
      .finally(() => {
        setError(undefined);
        setLoading(false);
        closeModal();
      });
  };

  return (
    <Modal onClose={closeModal} variant="medium" position="top" isOpen={isOpen} id="delete-modal">
      <ModalHeader title={t('Delete NodeNetworkConfigurationPolicy?')} titleIconVariant="warning" />
      <ModalBody>
        <form id="delete-policy-form">
          <p className="pf-v6-u-mb-sm">
            <Trans t={t} ns="plugin__nmstate-console-plugin">
              Deleting the node network policy that added an interface does not change the
              configuration of the policy on the node. To remove the instances of the policy from
              the nodes, you must manually set each interface to <code>absent</code> in the{' '}
              <code>Edit</code> action.
              <ExternalLink href="https://docs.openshift.com/container-platform/4.12/networking/k8s_nmstate/k8s-nmstate-updating-node-network-config.html#virt-removing-interface-from-nodes_k8s_nmstate-updating-node-network-config" />
            </Trans>
          </p>
          <p className="pf-v6-u-mb-md pf-v6-u-mt-sm">
            <Trans t={t} ns="plugin__nmstate-console-plugin">
              Confirm deletion by typing <strong>{{ name: policy?.metadata?.name }}</strong> below:
            </Trans>
          </p>
          <FormGroup fieldId="text-confirmation">
            <TextInput
              id="text-confirmation"
              className="pf-v6-c-form-control"
              aria-label={t('Enter name')}
              placeholder={t('Enter name')}
              value={inputValue}
              onChange={(_, value) => setInputValue(value)}
            />
          </FormGroup>
        </form>
        {error && (
          <Alert
            isInline
            variant={AlertVariant.danger}
            title={t('An error occurred')}
            className="pf-v6-u-mt-md"
          >
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
          isDisabled={loading || inputValue !== policy?.metadata?.name}
          isLoading={loading}
          variant={ButtonVariant.danger}
          type={ButtonType.submit}
          form="delete-policy-form"
        >
          {t('Delete')}
        </Button>
        <Button onClick={closeModal} variant={ButtonVariant.secondary}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteModal;
