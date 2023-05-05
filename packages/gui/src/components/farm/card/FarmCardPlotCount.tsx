import { useGetTotalHarvestersSummaryQuery } from '@cactus-network/api-react';
import { FormatLargeNumber, CardSimple } from '@cactus-network/core';
import { Trans } from '@lingui/macro';
import React from 'react';

export default function FarmCardPlotCount() {
  const { plots, isLoading } = useGetTotalHarvestersSummaryQuery();

  return (
    <CardSimple title={<Trans>Plot Count</Trans>} value={<FormatLargeNumber value={plots} />} loading={isLoading} />
  );
}
