import React, { FC } from 'react';
import { Updater } from 'use-immer';

import {
  Button,
  FormFieldGroupExpandable,
  FormFieldGroupHeader,
  Tooltip,
} from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import {
  InterfaceType,
  NodeNetworkConfigurationInterface,
  V1NodeNetworkConfigurationPolicy,
} from '@types';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';
import { getPolicyInterfaces } from '@utils/resources/policies/utils';

import { INTERFACE_TYPE_LABEL, onInterfaceChangeType } from '../../constants';
import { doesOVSBridgeExist, getExpandableTitle } from '../../utils';

import InterfaceDetails from './InterfaceDetails';

type InterfaceDetailsExpandableSectionProps = {
  policy: V1NodeNetworkConfigurationPolicy;
  setPolicy: Updater<V1NodeNetworkConfigurationPolicy>;
  interfaceTypes: InterfaceType[];
};

const InterfaceDetailsExpandableSection: FC<InterfaceDetailsExpandableSectionProps> = ({
  policy,
  setPolicy,
  interfaceTypes,
}) => {
  const { t } = useNMStateTranslation();

  const stepInterfaces: NodeNetworkConfigurationInterface[] =
    getPolicyInterfaces(policy)?.filter((iface) => interfaceTypes.includes(iface.type)) || [];

  const removeInterface = (interfaceIndex: number) => {
    setPolicy((draftPolicy) => {
      const interfaces = draftPolicy.spec.desiredState
        .interfaces as NodeNetworkConfigurationInterface[];

      const draftInterfaceIndex = interfaces.findIndex(
        (iface) => stepInterfaces[interfaceIndex].name === iface.name,
      );

      interfaces.splice(draftInterfaceIndex, 1);
      !doesOVSBridgeExist(draftPolicy) && delete draftPolicy.spec.desiredState.ovn;
    });
  };

  return (
    <>
      {stepInterfaces.map((policyInterface, index) => {
        return (
          <FormFieldGroupExpandable
            key={`${policyInterface.type}-${index}`}
            className="policy-interface__expandable"
            toggleAriaLabel={t('Details')}
            isExpanded={true}
            header={
              <FormFieldGroupHeader
                titleText={{
                  text: getExpandableTitle(policyInterface, t),
                  id: `nncp-interface-${index}`,
                }}
                actions={
                  <Tooltip content={t('Remove interface')}>
                    <span>
                      <Button
                        icon={<MinusCircleIcon />}
                        variant="plain"
                        aria-label={t('Remove')}
                        onClick={() => removeInterface(index)}
                      />
                    </span>
                  </Tooltip>
                }
              />
            }
          >
            <InterfaceDetails
              id={index}
              isInterfaceCreated={false}
              policyInterface={policyInterface}
              label={t('{{label}} name', { label: INTERFACE_TYPE_LABEL[policyInterface.type] })}
              onInterfaceChange={(updateInterface: onInterfaceChangeType) =>
                setPolicy((draftPolicy) => {
                  const draftInterface = draftPolicy.spec.desiredState.interfaces.find(
                    (iface) => policyInterface.name === iface.name,
                  );
                  updateInterface(draftInterface, draftPolicy);
                })
              }
            />
          </FormFieldGroupExpandable>
        );
      })}
    </>
  );
};

export default InterfaceDetailsExpandableSection;
