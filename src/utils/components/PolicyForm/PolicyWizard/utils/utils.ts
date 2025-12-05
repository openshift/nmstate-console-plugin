import {
  InterfaceType,
  NodeNetworkConfigurationInterfaceBridgePort,
  V1NodeNetworkConfigurationPolicy,
} from '@kubevirt-ui/kubevirt-api/nmstate';
import {
  DEFAULT_OVN_BRIDGE_NAME,
  DEFAULT_OVS_BRIDGE_NAME,
  LINK_AGGREGATION,
  MIN_NUM_INTERFACES_FOR_BOND,
  NUM_INTERFACES_FOR_SINGLE_INTERFACE_UPLINK,
} from '@utils/components/PolicyForm/PolicyWizard/utils/constants';
import {
  getInitialBridgeInterface,
  getInitialLinuxBondInterface,
} from '@utils/components/PolicyForm/PolicyWizard/utils/initialState';
import {
  getAggregationMode,
  getBondInterface,
  getBondName,
  getBondPortNames,
  getBondPorts,
  getBridgeInterface,
  getBridgePorts,
  getLinkAggregationSettings,
  getOVNBridgeMapping,
  getOVNBridgeName,
  getOVSBridgeBondPort,
} from '@utils/components/PolicyForm/PolicyWizard/utils/selectors';
import { ConnectionOption } from '@utils/components/PolicyForm/PolicyWizard/utils/types';
import { getRandomChars, isEmpty } from '@utils/helpers';
import { getPolicyInterfaces } from '@utils/resources/policies/utils';

import { NodeNetworkConfigurationInterfaceBondMode as AggregationMode } from '../../../../../nmstate-types/custom-models/NodeNetworkConfigurationInterfaceBondMode';

export const generateBondName = () => `bond-${getRandomChars(10)}`;

const uplinkPortsValid = (policy: V1NodeNetworkConfigurationPolicy) => {
  const uplinkConnectionOption = getUplinkConnectionOption(policy);

  if (uplinkConnectionOption === ConnectionOption.SINGLE_DEVICE)
    return getBridgePorts(policy)?.length === NUM_INTERFACES_FOR_SINGLE_INTERFACE_UPLINK;

  if (uplinkConnectionOption === ConnectionOption.BONDING_INTERFACE) {
    const numPortNames = getBondPorts(policy)?.length;
    return numPortNames >= MIN_NUM_INTERFACES_FOR_BOND;
  }
};

export const uplinkSettingsValid = (policy: V1NodeNetworkConfigurationPolicy): boolean => {
  const uplinkConnectionOption = getUplinkConnectionOption(policy);
  if (uplinkConnectionOption === ConnectionOption.BREX) return true;

  if (uplinkConnectionOption === ConnectionOption.SINGLE_DEVICE) return uplinkPortsValid(policy);

  if (uplinkConnectionOption === ConnectionOption.BONDING_INTERFACE)
    return uplinkPortsValid(policy) && !isEmpty(getAggregationMode(policy));
};

export const getUplinkConnectionOption = (policy: V1NodeNetworkConfigurationPolicy) => {
  if (getOVNBridgeName(policy) === DEFAULT_OVN_BRIDGE_NAME) return ConnectionOption.BREX;
  if (getBondName(policy)) return ConnectionOption.BONDING_INTERFACE;
  return ConnectionOption.SINGLE_DEVICE;
};

export const updateBridgeName = (
  policy: V1NodeNetworkConfigurationPolicy,
  newBridgeName: string,
) => {
  getOVNBridgeMapping(policy).bridge = newBridgeName;
  const bridgeInterface = getBridgeInterface(policy);
  if (bridgeInterface) bridgeInterface.name = newBridgeName;
};

const isCustomBridgeName = (bridgeName: string) =>
  bridgeName && bridgeName !== DEFAULT_OVN_BRIDGE_NAME && bridgeName !== DEFAULT_OVS_BRIDGE_NAME;

export const updateBridgeNameAfterOptionChange = (
  policy: V1NodeNetworkConfigurationPolicy,
  bridgeName: string,
) => {
  const isCustomName = isCustomBridgeName(bridgeName);
  if (isCustomName) updateBridgeName(policy, bridgeName);
  else updateBridgeName(policy, DEFAULT_OVS_BRIDGE_NAME);
};

export const isLinuxBond = (policy: V1NodeNetworkConfigurationPolicy) =>
  getBondInterface(policy)?.[LINK_AGGREGATION];

export const isOVSBond = (policy: V1NodeNetworkConfigurationPolicy) => getOVSBridgeBondPort(policy);

export const getPortNamesAsPorts = (portNames: string[]) =>
  portNames.map((name) => {
    return { name } as NodeNetworkConfigurationInterfaceBridgePort;
  });

export const getPortNamesFromPorts = (ports: NodeNetworkConfigurationInterfaceBridgePort[]) =>
  ports?.map((port) => port?.name);

export const updateBondInterfaces = (
  policy: V1NodeNetworkConfigurationPolicy,
  portNames: string[],
) => {
  if (isLinuxBond(policy)) {
    getLinkAggregationSettings(policy).port = portNames;
  }

  if (isOVSBond(policy)) {
    getLinkAggregationSettings(policy).port = getPortNamesAsPorts(portNames);
  }

  getLinkAggregationSettings(policy).port = getBondPorts(policy);
};

export const updateBondType = (
  policy: V1NodeNetworkConfigurationPolicy,
  selectedAggregationMode: string,
) => {
  const bondPortNames = getBondPortNames(policy);

  if (selectedAggregationMode === AggregationMode.BALANCE_RR) {
    const bondInterface = getBondInterface(policy);

    if (!bondInterface) {
      const interfaces = policy?.spec?.desiredState?.interfaces;
      policy.spec.desiredState.interfaces = [
        ...interfaces,
        getInitialLinuxBondInterface(generateBondName(), bondPortNames),
      ];
      getBridgeInterface(policy).bridge.port = getBridgePorts(policy).filter(
        (port) => !port?.[LINK_AGGREGATION],
      );
    }
  } else {
    const bridgeBondPort = getOVSBridgeBondPort(policy);
    const bridgePorts = getBridgePorts(policy)?.filter(
      (port) => port?.name !== getBondName(policy),
    );

    if (!bridgeBondPort) {
      getBridgeInterface(policy).bridge.port = [
        ...bridgePorts,
        {
          name: getBondName(policy) || generateBondName(),
          [LINK_AGGREGATION]: {
            mode: selectedAggregationMode,
            port: getPortNamesAsPorts(bondPortNames),
          },
        },
      ];
    }
    policy.spec.desiredState.interfaces = getPolicyInterfaces(policy)?.filter(
      (iface) => iface?.type !== InterfaceType.BOND,
    );
  }
};
