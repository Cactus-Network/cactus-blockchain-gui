import type { NFTAttribute } from '@cactus-network/api';
import { Color, CopyToClipboard, Flex, Loading, TooltipIcon, truncateValue } from '@cactus-network/core';
import { t, Trans } from '@lingui/macro';
import { alpha, Box, Card, CardContent, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { useMemo } from 'react';
import styled from 'styled-components';

import useNFT from '../../hooks/useNFT';
import useNFTMetadata from '../../hooks/useNFTMetadata';
import isRankingAttribute from '../../util/isRankingAttribute';
import { launcherIdToNFTId } from '../../util/nfts';

import NFTPreview from './NFTPreview';
import { NFTProperty } from './NFTProperties';
import { NFTRanking } from './NFTRankings';
import NFTTitle from './NFTTitle';

const StyledTitle = styled(Box)`
  font-size: 0.625rem;
  color: ${alpha(Color.Neutral[50], 0.7)};
`;

const StyledValue = styled(Box)`
  word-break: break-all;
`;

export type NFTSummaryProps = {
  launcherId: string;
};

export default function NFTSummary(props: NFTSummaryProps) {
  const { launcherId } = props;
  const nftId = launcherIdToNFTId(launcherId);
  const theme = useTheme();
  const bottomPadding = `${theme.spacing(2)}`; // logic borrowed from Flex's gap computation
  const { nft, isLoading: isLoadingNFT } = useNFT(launcherId);
  const { metadata, isLoading: isLoadingMetadata } = useNFTMetadata(launcherId);

  const [properties, rankings] = useMemo(() => {
    if (!nft) {
      return [[], []];
    }

    const propertiesLocal: React.ReactElement[] = [];
    const rankingsLocal: React.ReactElement[] = [];

    const collectionNameProperty = metadata?.collection_name ? (
      <NFTProperty
        attribute={{ name: t`Collection`, value: metadata.collection_name }}
        size="small"
        color="secondary"
      />
    ) : null;

    const editionProperty =
      nft?.editionNumber && nft?.editionTotal > 1 ? (
        <NFTProperty
          attribute={{
            name: t`Edition #`,
            value: `${nft.editionNumber}/${nft.editionTotal}`,
          }}
          size="small"
          color="secondary"
        />
      ) : null;

    if (collectionNameProperty) {
      propertiesLocal.push(collectionNameProperty);
    }

    if (editionProperty) {
      propertiesLocal.push(editionProperty);
    }

    metadata?.attributes
      ?.filter((attribute: NFTAttribute) => !isRankingAttribute(attribute))
      .forEach((attribute: NFTAttribute) =>
        propertiesLocal.push(<NFTProperty attribute={attribute} size="small" color="secondary" />),
      );

    metadata?.attributes
      ?.filter((attribute: NFTAttribute) => isRankingAttribute(attribute))
      .forEach((attribute: NFTAttribute) =>
        rankingsLocal.push(
          <NFTRanking attribute={attribute} size="small" color="secondary" progressColor="secondary" />,
        ),
      );

    return [propertiesLocal, rankingsLocal];
  }, [nft, metadata]);

  const havePropertiesOrRankings = properties.length > 0 || rankings.length > 0;

  if (isLoadingNFT || isLoadingMetadata || !nft) {
    return (
      <Flex flexGrow={1} flexDirection="column" alignItems="center" gap={1}>
        <Typography variant="subtitle1">
          <Trans>Loading NFT</Trans>
        </Typography>
        <Loading center />
      </Flex>
    );
  }

  return (
    <Card>
      <CardContent style={{ paddingBottom: `${bottomPadding}` }}>
        <Flex flexDirection="column" gap={2}>
          <Flex flexDirection="row" gap={2}>
            <Box
              borderRadius={2}
              overflow="hidden"
              alignItems="center"
              justifyContent="center"
              width="80px"
              minWidth="80px"
              height="80px"
            >
              <NFTPreview id={nftId} width={80} disableInteractions />
            </Box>
            <Flex
              flexDirection="column"
              gap={0}
              style={{
                overflow: 'hidden',
                wordBreak: 'break-word',
                textOverflow: 'ellipsis',
              }}
            >
              <Typography variant="h6" fontWeight="bold" noWrap>
                <NFTTitle nftId={nftId} />
              </Typography>
              {metadata?.description && (
                <Typography variant="caption" noWrap>
                  {metadata.description}
                </Typography>
              )}
              <NFTIDComponent style={{ paddingTop: '0.5rem' }} nftId={nftId} launcherId={launcherId} />
            </Flex>
          </Flex>
          {havePropertiesOrRankings && (
            <Flex flexDirection="column" gap={2} style={{ overflowX: 'auto' }}>
              {properties.length > 0 && (
                <Flex flexDirection="row" gap={1}>
                  {properties?.map((property, index) => (
                    // eslint-disable-next-line react/no-array-index-key -- Its a list of react elements, we have nothing else to use
                    <React.Fragment key={index}>{property}</React.Fragment>
                  ))}
                </Flex>
              )}
              {rankings.length > 0 && (
                <Flex flexDirection="row" gap={1}>
                  {rankings?.map((ranking, index) => (
                    // eslint-disable-next-line react/no-array-index-key -- Its a list of react elements, we have nothing else to use
                    <React.Fragment key={index}>{ranking}</React.Fragment>
                  ))}
                </Flex>
              )}
            </Flex>
          )}
        </Flex>
      </CardContent>
    </Card>
  );
}

type NFTIDComponentProps = {
  launcherId: string;
  nftId: string;
};

function NFTIDComponent(props: NFTIDComponentProps) {
  const { nftId, launcherId, ...flexProps } = props;
  const truncatedNftId = truncateValue(nftId, {});

  return (
    <Flex flexDirection="row" alignItems="center" gap={1} {...flexProps}>
      <Typography variant="body2">{truncatedNftId}</Typography>
      <TooltipIcon>
        <Flex flexDirection="column" gap={1}>
          <Flex flexDirection="column" gap={0}>
            <Flex>
              <Box flexGrow={1}>
                <StyledTitle>NFT ID</StyledTitle>
              </Box>
            </Flex>
            <Flex alignItems="center" gap={1}>
              <StyledValue>{nftId}</StyledValue>
              <CopyToClipboard value={nftId} fontSize="small" invertColor />
            </Flex>
          </Flex>
          <Flex flexDirection="column" gap={0}>
            <Flex>
              <Box flexGrow={1}>
                <StyledTitle>Launcher ID</StyledTitle>
              </Box>
            </Flex>
            <Flex alignItems="center" gap={1}>
              <StyledValue>{launcherId}</StyledValue>
              <CopyToClipboard value={launcherId} fontSize="small" invertColor />
            </Flex>
          </Flex>
        </Flex>
      </TooltipIcon>
    </Flex>
  );
}
