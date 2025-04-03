import React, { FC } from 'react';

import {
  Button,
  ButtonVariant,
  Level,
  LevelItem,
  Stack,
  StackItem,
  useWizardContext,
} from '@patternfly/react-core';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

import './info-box.scss';

type InfoBoxProps = {
  title: string;
  editStepId: string;
};

const InfoBox: FC<InfoBoxProps> = ({ children, title, editStepId }) => {
  const { t } = useNMStateTranslation();

  const { goToStepById } = useWizardContext();

  return (
    <Stack hasGutter>
      <StackItem>
        <Level>
          <LevelItem>{title}</LevelItem>
          <LevelItem>
            <Button variant={ButtonVariant.link} onClick={() => goToStepById(editStepId)}>
              {t('Edit step')}
            </Button>
          </LevelItem>
        </Level>
      </StackItem>

      <StackItem className="nmstate-infobox-container">{children}</StackItem>
    </Stack>
  );
};

export default InfoBox;
