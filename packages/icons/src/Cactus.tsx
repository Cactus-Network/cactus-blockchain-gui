import { SvgIcon, SvgIconProps } from '@mui/material';
import React from 'react';

import CactusBlackIcon from './images/cactus-black.svg';
import CactusIcon from './images/cactus.svg';

export default function Keys(props: SvgIconProps) {
  return <SvgIcon component={CactusIcon} viewBox="0 0 150 58" {...props} />;
}

export function CactusBlack(props: SvgIconProps) {
  return <SvgIcon component={CactusBlackIcon} viewBox="0 0 100 39" sx={{ width: '100px', height: '39px' }} {...props} />;
}
