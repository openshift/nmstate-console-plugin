import React, { FC, MouseEventHandler, useCallback, useState } from 'react';
import { Trans } from 'react-i18next';
import { useNMStateTranslation } from 'src/utils/hooks/useNMStateTranslation';
import { Updater } from 'use-immer';

import {
  Alert,
  AlertVariant,
  Button,
  Content,
  Form,
  FormGroup,
  Popover,
  TextInput,
  Title,
  Wizard,
  WizardStep,
} from '@patternfly/react-core';
import { HelpIcon, PlusCircleIcon } from '@patternfly/react-icons';
import {
  InterfaceType,
  NodeNetworkConfigurationInterface,
  V1NodeNetworkConfigurationPolicy,
} from '@types';
import { isEmpty } from '@utils/helpers';

import NodeSelectorModal from '../NodeSelectorModal/NodeSelectorModal';

import ApplySelectorCheckbox from './ApplySelectorCheckbox';
import PolicyFormOVSBridgeMapping from './PolicyFormOVSBridgeMapping';
import PolicyInterfacesExpandable from './PolicyInterfaceExpandable';
import { isOVSBridgeExisting } from './utils';

import './policy-form.scss';

type PolicyWizardProps = {
  policy: V1NodeNetworkConfigurationPolicy;
  setPolicy: Updater<V1NodeNetworkConfigurationPolicy>;
  onSubmit: () => void | Promise<void>;
  onClose: () => void;
};

const PolicyWizard: FC<PolicyWizardProps> = ({ policy, setPolicy, onSubmit, onClose }) => {
  const { t } = useNMStateTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const isOVSBridge = isOVSBridgeExisting(policy);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>(null);

  const onDescriptionChange = (newDescription: string) => {
    setPolicy(({ metadata }) => {
      if (!metadata.annotations) metadata.annotations = {};

      metadata.annotations.description = newDescription;
    });
  };

  const addNewInterface = () => {
    setPolicy((draftPolicy) => {
      if (!draftPolicy.spec?.desiredState?.interfaces) {
        draftPolicy.spec.desiredState = {
          interfaces: [] as NodeNetworkConfigurationInterface[],
        };
      }

      draftPolicy.spec.desiredState.interfaces.unshift({
        type: InterfaceType.LINUX_BRIDGE,
        name: `interface-${draftPolicy.spec.desiredState.interfaces.length}`,
        state: 'up',
        bridge: {
          options: {
            stp: {
              enabled: false,
            },
          },
        },
      } as NodeNetworkConfigurationInterface);
    });
  };

  const onFormSubmit: MouseEventHandler<HTMLButtonElement> = useCallback(async () => {
    setLoading(true);

    try {
      await onSubmit();
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [onSubmit]);

  return (
    <Wizard onSave={onFormSubmit} onClose={onClose}>
      <WizardStep
        footer={{ isNextDisabled: isEmpty(policy.metadata.name) }}
        id="policy-wizard-basicinfo"
        name={t('Basic policy info')}
      >
        <Form>
          <Title headingLevel="h3">{t('General')}</Title>
          <>
            <NodeSelectorModal
              isOpen={modalOpen}
              policy={policy}
              onClose={() => setModalOpen(false)}
              onSubmit={(newPolicy) => {
                setPolicy(newPolicy);
                setModalOpen(false);
              }}
            />
            <FormGroup fieldId="text">
              <Content component="p">
                <Trans t={t} ns="plugin__nmstate-console-plugin">
                  Node network is configured and managed by NM state. Create a node network
                  configuration policy to describe the requested network configuration on your nodes
                  in the cluster. The node network configuration enactment reports the netwrok
                  policies enacted upon each node.
                </Trans>
              </Content>
            </FormGroup>
            <FormGroup fieldId="apply-selector">
              <ApplySelectorCheckbox
                isChecked={!!policy?.spec.nodeSelector}
                onChange={(_, checked) => {
                  if (checked) setModalOpen(true);
                  else
                    setPolicy((draftPolicy) => {
                      delete draftPolicy.spec.nodeSelector;
                    });
                }}
              />
            </FormGroup>
          </>
          <FormGroup label={t('Policy name')} isRequired fieldId="policy-name-group">
            <TextInput
              isRequired
              type="text"
              id="policy-name"
              name="policy-name"
              value={policy?.metadata?.name}
              onChange={(_, newName) =>
                setPolicy((draftPolicy) => {
                  draftPolicy.metadata.name = newName;
                })
              }
            />
          </FormGroup>
          <FormGroup label={t('Description')} fieldId="policy-description-group">
            <TextInput
              type="text"
              id="policy-description"
              name="policy-description"
              value={policy?.metadata?.annotations?.description}
              onChange={(_, newValue) => onDescriptionChange(newValue)}
            />
          </FormGroup>
        </Form>
      </WizardStep>
      <WizardStep
        id="policy-wizard-interfaces"
        name={t('Policy interfaces')}
        footer={{
          nextButtonProps: { isLoading: loading },
          isNextDisabled: loading,
          nextButtonText: 'Save',
        }}
      >
        <Form>
          <div>
            <Title headingLevel="h3">
              {t('Policy Interface(s)')}{' '}
              <Popover
                aria-label={'Help'}
                bodyContent={t(
                  'List of network interfaces that should be created, modified, or removed, as a part of this policy.',
                )}
              >
                <Button variant="plain" hasNoPadding icon={<HelpIcon />} />
              </Popover>
            </Title>
            <Content component="p" className="policy-form-content__add-new-interface pf-v6-u-mt-md">
              <Button
                icon={<PlusCircleIcon />}
                className="pf-m-link--align-left pf-v6-u-ml-md"
                onClick={addNewInterface}
                type="button"
                variant="link"
              >
                <span>{t('Add another interface to the policy')}</span>
              </Button>
            </Content>
            <PolicyInterfacesExpandable policy={policy} setPolicy={setPolicy} createForm />
          </div>
          {isOVSBridge && <PolicyFormOVSBridgeMapping policy={policy} setPolicy={setPolicy} />}

          {error && (
            <Alert
              isInline
              variant={AlertVariant.danger}
              title={t('An error occurred')}
              className="pf-v6-u-mt-md"
            >
              {error.message}
            </Alert>
          )}
        </Form>
      </WizardStep>
    </Wizard>
  );
};

export default PolicyWizard;
