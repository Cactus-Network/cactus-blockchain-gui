import { useGetTotalHarvestersSummaryQuery } from '@cactus-network/api-react';
import { FormatLargeNumber, CardSimple } from '@cactus-network/core';
import { Trans } from '@lingui/macro';
import React from 'react';

export default function PlotCardTotalPlots() {
  const { plots, initializedHarvesters, isLoading } = useGetTotalHarvestersSummaryQuery();

  return (
    <CardSimple
      title={<Trans>Total Plots</Trans>}
      value={<FormatLargeNumber value={plots} />}
      loading={isLoading || !initializedHarvesters}
    />
  );
}
