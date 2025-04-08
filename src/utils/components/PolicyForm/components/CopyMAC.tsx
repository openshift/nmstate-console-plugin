import React, { FC, FormEvent } from 'react';
import { useNMStateTranslation } from 'src/utils/hooks/useNMStateTranslation';

import { Content, ExpandableSection, FormGroup, TextInput } from '@patternfly/react-core';
import { NodeNetworkConfigurationInterface } from '@types';

type CopyMACProps = {
  id: number | string;
  policyInterface?: NodeNetworkConfigurationInterface;
  onInterfaceChange?: (
    updateInterface: (policyInterface: NodeNetworkConfigurationInterface) => void,
  ) => void;
};

const CopyMAC: FC<CopyMACProps> = ({ id, policyInterface, onInterfaceChange }) => {
  const { t } = useNMStateTranslation();

  const onPortChange = (event: FormEvent<HTMLInputElement>, value: string) => {
    onInterfaceChange((draftInterface) => {
      value ? (draftInterface['copy-mac-from'] = value) : delete draftInterface['copy-mac-from'];
    });
  };

  return (
    <ExpandableSection toggleText={t('Copy MAC address')} data-test-id={`copy-mac-${id}`}>
      <div className="pf-v6-u-ml-md">
        <Content
          component="p"
          className="pf-v6-u-mb-lg"
          style={{ color: 'var(--pf-t--global--text--color--subtle)' }}
        >
          {t(
            'This is the list of ports to copy MAC address from. Select one of the matched ports this policy will apply to',
          )}
        </Content>

        <FormGroup label={t('Port name')} fieldId={`copy-mac-port-${id}`}>
          <TextInput
            value={policyInterface?.['copy-mac-from']}
            type="text"
            id={`policy-interface-copy-mac-from-${id}`}
            onChange={onPortChange}
          />
        </FormGroup>
      </div>
    </ExpandableSection>
  );
};

export default CopyMAC;
