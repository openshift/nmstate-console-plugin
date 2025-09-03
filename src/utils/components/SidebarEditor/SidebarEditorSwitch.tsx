import React, { FC, memo } from 'react';

import { Switch } from '@patternfly/react-core';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

import { useSidebarEditorContext } from './SidebarEditorContext';

// eslint-disable-next-line react/display-name
const SidebarEditorSwitch: FC = memo(() => {
  const { t } = useNMStateTranslation();
  const { setEditorVisible, showEditor, showSwitch } = useSidebarEditorContext();

  if (!showSwitch) return null;

  return (
    <Switch
      className="regular-font-weight"
      id="sidebar-editor-switch"
      isChecked={showEditor}
      label={t('Edit YAML')}
      onChange={(_, checked: boolean) => setEditorVisible(checked)}
    />
  );
});

export default SidebarEditorSwitch;
