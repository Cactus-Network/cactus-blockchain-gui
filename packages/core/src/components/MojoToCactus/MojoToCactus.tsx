import BigNumber from 'bignumber.js';
import React from 'react';

import useCurrencyCode from '../../hooks/useCurrencyCode';
import mojoToCactus from '../../utils/mojoToCactusLocaleString';
import FormatLargeNumber from '../FormatLargeNumber';

export type MojoToCactusProps = {
  value: number | BigNumber;
};

export default function MojoToCactus(props: MojoToCactusProps) {
  const { value } = props;
  const currencyCode = useCurrencyCode();
  const updatedValue = mojoToCactus(value);

  return (
    <>
      <FormatLargeNumber value={updatedValue} />
      &nbsp;{currencyCode ?? ''}
    </>
  );
}
