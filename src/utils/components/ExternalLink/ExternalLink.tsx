import React, { FC } from 'react';

import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

type ExternalLinkProps = {
  href: string;
  label?: string;
};

const ExternalLink: FC<ExternalLinkProps> = ({ href, label }) => {
  const { t } = useNMStateTranslation();
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="co-external-link">
      {label || t('Learn more')}
      <ExternalLinkAltIcon className="pf-v6-u-ml-xs" />
    </a>
  );
};

export default ExternalLink;
