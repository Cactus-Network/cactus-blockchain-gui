import { OfferSummaryRecord } from '@cactus-network.net/api';
import { mojoToCAT, mojoToCactus } from '@cactus-network.net/core';
import BigNumber from 'bignumber.js';

import type OfferBuilderData from '../@types/OfferBuilderData';
import type OfferSummary from '../@types/OfferSummary';
import { launcherIdToNFTId } from './nfts';

export default function offerToOfferBuilderData(
  offerSummary: OfferSummary | OfferSummaryRecord,
  setDefaultOfferedFee?: boolean,
  defaultFee?: string // in mojos
): OfferBuilderData {
  const { fees, offered, requested, infos } = offerSummary;

  const defaultFeeCAC = defaultFee ? mojoToCactus(defaultFee).toFixed() : '';

  const offeredXch: OfferBuilderData['offered']['cac'] = [];
  const offeredTokens: OfferBuilderData['offered']['tokens'] = [];
  const offeredNfts: OfferBuilderData['offered']['nfts'] = [];
  const offeredFee: OfferBuilderData['offered']['fee'] = setDefaultOfferedFee ? [{ amount: defaultFeeCAC }] : [];
  const requestedXch: OfferBuilderData['requested']['cac'] = [];
  const requestedTokens: OfferBuilderData['requested']['tokens'] = [];
  const requestedNfts: OfferBuilderData['requested']['nfts'] = [];

  // processing requested first because it's what you/we will give

  Object.keys(requested).forEach((id) => {
    const amount = new BigNumber(requested[id]);
    const info = infos[id];

    if (info?.type === 'CAT') {
      offeredTokens.push({
        amount: mojoToCAT(amount).toFixed(),
        assetId: id,
      });
    } else if (info?.type === 'singleton') {
      offeredNfts.push({
        nftId: launcherIdToNFTId(info.launcherId),
      });
    } else if (id === 'cac') {
      offeredXch.push({
        amount: mojoToCactus(amount).toFixed(),
      });
    }
  });

  Object.keys(offered).forEach((id) => {
    const amount = new BigNumber(offered[id]);
    const info = infos[id];

    if (info?.type === 'CAT') {
      requestedTokens.push({
        amount: mojoToCAT(amount).toFixed(),
        assetId: id,
      });
    } else if (info?.type === 'singleton') {
      requestedNfts.push({
        nftId: launcherIdToNFTId(info.launcherId),
      });
    } else if (id === 'cac') {
      requestedXch.push({
        amount: mojoToCactus(amount).toFixed(),
      });
    }
  });

  return {
    offered: {
      cac: offeredXch,
      tokens: offeredTokens,
      nfts: offeredNfts,
      fee: offeredFee,
    },
    requested: {
      cac: requestedXch,
      tokens: requestedTokens,
      nfts: requestedNfts,
      fee: [
        {
          amount: mojoToCactus(fees).toFixed(),
        },
      ],
    },
  };
}
