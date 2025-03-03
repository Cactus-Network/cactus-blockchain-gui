import { type OfferSummaryRecord } from '@cactus-network/api';
import { Flex, FormatLargeNumber, StateColor, TooltipIcon, mojoToCactus, mojoToCAT } from '@cactus-network/core';
import { Plural, Trans } from '@lingui/macro';
import { Box, Divider, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { useMemo } from 'react';
import styled from 'styled-components';

import useAssetIdName from '../../hooks/useAssetIdName';

import OfferExchangeRate from './OfferExchangeRate';
import { OfferSummaryTokenRow } from './OfferSummaryRow';

const StyledWarningText = styled(Typography)`
  color: ${StateColor.WARNING};
`;

type Props = {
  isMyOffer: boolean;
  imported: boolean;
  summary: OfferSummaryRecord;
  makerTitle: React.ReactElement | string;
  takerTitle: React.ReactElement | string;
  rowIndentation?: number;
  setIsMissingRequestedAsset?: (isMissing: boolean) => void;
};

export default function OfferSummary(props: Props) {
  const {
    isMyOffer,
    imported,
    summary,
    makerTitle,
    takerTitle,
    rowIndentation = 3,
    setIsMissingRequestedAsset,
  } = props;
  const theme = useTheme();
  const { lookupByAssetId } = useAssetIdName();
  const horizontalPadding = `${theme.spacing(rowIndentation)}`; // logic borrowed from Flex's gap computation
  const makerEntries: [string, number][] = Object.entries(summary.offered);
  const takerEntries: [string, number][] = Object.entries(summary.requested);
  const makerFee: number = summary.fees;
  const makerAssetInfo = makerEntries.length === 1 ? lookupByAssetId(makerEntries[0][0]) : undefined;
  const takerAssetInfo = takerEntries.length === 1 ? lookupByAssetId(takerEntries[0][0]) : undefined;
  const makerAmount =
    makerEntries.length > 0
      ? ['cac', 'tcac'].includes(makerEntries[0][0].toLowerCase())
        ? mojoToCactus(makerEntries[0][1])
        : mojoToCAT(makerEntries[0][1])
      : undefined;
  const takerAmount =
    takerEntries.length > 0
      ? ['cac', 'tcac'].includes(takerEntries[0][0].toLowerCase())
        ? mojoToCactus(takerEntries[0][1])
        : mojoToCAT(takerEntries[0][1])
      : undefined;
  const canSetExchangeRate = makerAssetInfo && takerAssetInfo && makerAmount && takerAmount;
  const makerExchangeRate = canSetExchangeRate ? takerAmount / makerAmount : undefined;
  const takerExchangeRate = canSetExchangeRate ? makerAmount / takerAmount : undefined;

  const [takerUnknownCATs, makerUnknownCATs] = useMemo(() => {
    if (isMyOffer) {
      return [];
    }

    // Identify unknown CATs offered/requested by the maker
    const takerUnknownCATsLocal = makerEntries
      .filter(([assetId, _]) => lookupByAssetId(assetId) === undefined)
      .map(([assetId, _]) => assetId);
    const makerUnknownCATsLocal = takerEntries
      .filter(([assetId, _]) => lookupByAssetId(assetId) === undefined)
      .map(([assetId, _]) => assetId);

    return [takerUnknownCATsLocal, makerUnknownCATsLocal];
  }, [isMyOffer, lookupByAssetId, makerEntries, takerEntries]);

  const sections: {
    tradeSide: 'buy' | 'sell';
    title: React.ReactElement | string;
    entries: [string, number][];
    unknownCATs: string[] | undefined;
  }[] = [
    {
      tradeSide: isMyOffer ? 'sell' : 'buy',
      title: makerTitle,
      entries: isMyOffer ? makerEntries : takerEntries,
      unknownCATs: isMyOffer ? undefined : makerUnknownCATs,
    },
    {
      tradeSide: isMyOffer ? 'buy' : 'sell',
      title: takerTitle,
      entries: isMyOffer ? takerEntries : makerEntries,
      unknownCATs: isMyOffer ? undefined : takerUnknownCATs,
    },
  ];

  if (setIsMissingRequestedAsset) {
    const isMissingRequestedAsset = isMyOffer ? false : (makerUnknownCATs?.length !== 0 ?? false);

    setIsMissingRequestedAsset(isMissingRequestedAsset);
  }

  if (!isMyOffer) {
    sections.reverse();
  }

  return (
    <Flex flexDirection="column" flexGrow={1} gap={2}>
      {sections.map(({ tradeSide, title, entries, unknownCATs }, indexSections) => (
        <>
          {title}
          <Box
            sx={{
              marginLeft: `${horizontalPadding}`,
              marginRight: `${horizontalPadding}`,
            }}
          >
            <Flex flexDirection="column" gap={1}>
              <Flex flexDirection="column" gap={1}>
                {entries.map(([assetId, amount], indexEntries) => (
                  <OfferSummaryTokenRow
                    key={`${assetId}_${amount}`}
                    assetId={assetId}
                    amount={amount as number}
                    rowNumber={indexEntries + 1}
                  />
                ))}
              </Flex>
              {unknownCATs !== undefined && unknownCATs.length > 0 && (
                <Flex flexDirection="row" gap={1}>
                  {tradeSide === 'sell' && (
                    <StyledWarningText variant="caption">
                      <Trans>
                        Warning: Verify that the offered CAT asset IDs match the asset IDs of the tokens you expect to
                        receive.
                      </Trans>
                    </StyledWarningText>
                  )}
                  {tradeSide === 'buy' && (
                    <StyledWarningText variant="caption">
                      Offer cannot be accepted because you don't possess the requested assets
                    </StyledWarningText>
                  )}
                </Flex>
              )}
            </Flex>
          </Box>
          {indexSections !== sections.length - 1 && <Divider />}
        </>
      ))}
      {!!makerAssetInfo && !!takerAssetInfo && !!makerExchangeRate && !!takerExchangeRate && (
        <Flex flexDirection="column" gap={2}>
          <Divider />
          <OfferExchangeRate
            makerAssetInfo={makerAssetInfo}
            takerAssetInfo={takerAssetInfo}
            makerExchangeRate={makerExchangeRate}
            takerExchangeRate={takerExchangeRate}
          />
        </Flex>
      )}
      {makerFee > 0 && (
        <Flex flexDirection="column" gap={2}>
          <Divider />
          <Flex flexDirection="row" alignItems="center" gap={1}>
            <Typography variant="body1" color="secondary" style={{ fontWeight: 'bold' }}>
              <Trans>Fees included in offer:</Trans>
            </Typography>
            <Typography color="primary">
              <FormatLargeNumber value={makerFee} />
            </Typography>
            <Typography>
              <Plural value={makerFee} one="mojo" other="mojos" />
            </Typography>
            <TooltipIcon>
              {imported ? (
                <Trans>
                  This offer has a fee included to help expedite the transaction when the offer is accepted. You may
                  specify an additional fee if you feel that the included fee is too small.
                </Trans>
              ) : (
                <Trans>
                  This offer has a fee included to help expedite the transaction when the offer is accepted.
                </Trans>
              )}
            </TooltipIcon>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}
