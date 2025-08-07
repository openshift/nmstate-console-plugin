import React, { FC, ReactNode } from 'react';

import HelpTextIcon from '@utils/components/HelpTextIcon/HelpTextIcon';

type TextWithHelpIconProps = {
  helpBodyContent: ReactNode;
  helpHeaderContent?: ReactNode;
  text: ReactNode;
};

const TextWithHelpIcon: FC<TextWithHelpIconProps> = ({
  helpBodyContent,
  helpHeaderContent,
  text,
}) => {
  return (
    <>
      <span className="pf-v6-u-mr-xs">{text}</span>
      <HelpTextIcon bodyContent={helpBodyContent} headerContent={helpHeaderContent} />
    </>
  );
};

export default TextWithHelpIcon;
