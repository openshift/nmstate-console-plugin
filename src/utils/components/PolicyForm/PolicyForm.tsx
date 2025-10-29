import React, { FC, useState } from 'react';
import { Trans } from 'react-i18next';
import { useNMStateTranslation } from 'src/utils/hooks/useNMStateTranslation';
import { Updater } from 'use-immer';

import {
  InterfaceType,
  NodeNetworkConfigurationInterface,
  V1NodeNetworkConfigurationPolicy,
} from '@kubevirt-ui/kubevirt-api/nmstate';
import {
  Button,
  Content,
  Form,
  FormGroup,
  Popover,
  TextInput,
  Title,
} from '@patternfly/react-core';
import { HelpIcon, PlusCircleIcon } from '@patternfly/react-icons';

import NodeSelectorModal from '../NodeSelectorModal/NodeSelectorModal';

import ApplySelectorCheckbox from './components/ApplySelectorCheckbox';
import PolicyFormOVSBridgeMapping from './components/PolicyFormOVSBridgeMapping';
import PolicyInterfacesExpandable from './PolicyInterfaceExpandable';
import { doesOVSBridgeExist } from './utils';

import './policy-form.scss';

type PolicyFormProps = {
  policy: V1NodeNetworkConfigurationPolicy;
  setPolicy: Updater<V1NodeNetworkConfigurationPolicy>;
  createForm?: boolean;
  formId?: string;
};

const PolicyForm: FC<PolicyFormProps> = ({ policy, setPolicy, createForm = false, formId }) => {
  const { t } = useNMStateTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const isOVSBridge = doesOVSBridgeExist(policy);

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

  return (
    <Form className="policy-form-content" id={formId}>
      {createForm && (
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
                in the cluster. The node network configuration enactment reports the network
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
      )}
      <FormGroup label={t('Policy name')} isRequired fieldId="policy-name-group">
        <TextInput
          isRequired
          type="text"
          id="policy-name"
          name="policy-name"
          value={policy?.metadata?.name}
          isDisabled={!createForm}
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
        <PolicyInterfacesExpandable policy={policy} setPolicy={setPolicy} createForm={createForm} />
      </div>
      {isOVSBridge && <PolicyFormOVSBridgeMapping policy={policy} setPolicy={setPolicy} />}
    </Form>
  );
};

export default PolicyForm;
