import { useGetTotalHarvestersSummaryQuery } from '@cactus-network/api-react';
import { FormatLargeNumber, CardSimple } from '@cactus-network/core';
import { Trans } from '@lingui/macro';
import React from 'react';

export default function PlotCardPlotsDuplicate() {
  const { duplicates, initializedHarvesters, isLoading } = useGetTotalHarvestersSummaryQuery();

  return (
    <CardSimple
      title={<Trans>Duplicate Plots</Trans>}
      value={<FormatLargeNumber value={duplicates} />}
      loading={isLoading || !initializedHarvesters}
    />
  );
}
