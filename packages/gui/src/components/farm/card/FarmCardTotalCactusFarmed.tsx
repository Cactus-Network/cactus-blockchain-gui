import { useGetFarmedAmountQuery } from '@cactus-network/api-react';
import { useCurrencyCode, mojoToCactusLocaleString, CardSimple, useLocale } from '@cactus-network/core';
import { Trans } from '@lingui/macro';
import React, { useMemo } from 'react';

export default function FarmCardTotalCactusFarmed() {
  const currencyCode = useCurrencyCode();
  const [locale] = useLocale();
  const { data, isLoading, error } = useGetFarmedAmountQuery();

  const farmedAmount = data?.farmedAmount;

  const totalCactusFarmed = useMemo(() => {
    if (farmedAmount !== undefined) {
      return (
        <>
          {mojoToCactusLocaleString(farmedAmount, locale)}
          &nbsp;
          {currencyCode}
        </>
      );
    }
    return undefined;
  }, [farmedAmount, locale, currencyCode]);

  return (
    <CardSimple title={<Trans>Total Cactus Farmed</Trans>} value={totalCactusFarmed} loading={isLoading} error={error} />
  );
}
