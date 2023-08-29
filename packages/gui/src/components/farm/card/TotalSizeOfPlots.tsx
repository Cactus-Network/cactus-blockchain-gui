import { useGetTotalHarvestersSummaryQuery } from '@cactus-network.net/api-react';
import { FormatBytes, CardSimple } from '@cactus-network.net/core';
import { Trans } from '@lingui/macro';
import React from 'react';

export default React.memo(TotalSizeOfPlots);
function TotalSizeOfPlots() {
  const { totalEffectivePlotSize, isLoading } = useGetTotalHarvestersSummaryQuery();

  return (
    <CardSimple
      title={<Trans>Farming Space</Trans>}
      value={<FormatBytes value={totalEffectivePlotSize} precision={3} effectiveSize />}
      loading={isLoading}
    />
  );
}
