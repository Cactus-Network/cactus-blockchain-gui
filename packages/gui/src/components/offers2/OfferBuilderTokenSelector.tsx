import { WalletType } from '@cactus-network/api';
import type { CATToken, Wallet } from '@cactus-network/api';
import { useGetCatListQuery, useGetWalletsQuery } from '@cactus-network/api-react';
import { Trans, t } from '@lingui/macro';
import { FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { orderBy } from 'lodash';
import React, { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import useOfferBuilderContext from '../../hooks/useOfferBuilderContext';

export type OfferBuilderTokenSelectorProps = {
  name: string;
  readOnly?: boolean;
  warnUnknownCAT?: boolean;
};

export default function OfferBuilderTokenSelector(props: OfferBuilderTokenSelectorProps) {
  const { name, readOnly = false, warnUnknownCAT = false } = props;
  const { usedAssetIds } = useOfferBuilderContext();
  const { setValue } = useFormContext();
  const currentValue = useWatch({ name });
  const { data: wallets = [], isLoading: isLoadingWallets } = useGetWalletsQuery();
  const { data: catList = [], isLoading: isLoadingCATs } = useGetCatListQuery();
  const isLoading = isLoadingWallets || isLoadingCATs;

  const [selectedOption, options] = useMemo(() => {
    if (isLoading) {
      return [];
    }

    const allOptions = wallets
      .filter((wallet: Wallet) => [WalletType.CAT, WalletType.CRCAT].includes(wallet.type))
      .map((wallet: Wallet) => {
        const assetId = wallet.meta?.assetId ? wallet.meta.assetId.toLowerCase() : '';

        const cat: CATToken | undefined = catList.find(
          (catItem: CATToken) => catItem.assetId.toLowerCase() === assetId,
        );

        if (assetId && assetId !== currentValue && usedAssetIds.includes(assetId)) {
          return undefined;
        }

        return {
          assetId,
          displayName: wallet.name + (cat?.symbol ? ` (${cat.symbol})` : ''),
        };
      })
      .filter(Boolean);

    const orderedAllOptions = orderBy(allOptions, ['displayName'], ['asc']);

    const selected = orderedAllOptions.find((option) => option.assetId.toString() === currentValue);

    return [selected, orderedAllOptions];
  }, [isLoading, wallets, catList, currentValue, usedAssetIds]);

  function handleSelection(selection: { assetId: number }) {
    setValue(name, selection.assetId);
  }

  if (readOnly) {
    return (
      <Typography variant="h6" noWrap>
        {warnUnknownCAT ? t`Unknown` : (selectedOption?.displayName ?? currentValue)}
      </Typography>
    );
  }

  return (
    <FormControl variant="filled" fullWidth>
      <InputLabel required focused>
        <Trans>Asset Type</Trans>
      </InputLabel>
      <Select value={currentValue} fullWidth>
        {isLoading ? (
          <MenuItem disabled value={-1}>
            <Trans>Loading...</Trans>
          </MenuItem>
        ) : (
          options.map((option) => (
            <MenuItem value={option.assetId} key={option.assetId} onClick={() => handleSelection(option)}>
              {option.displayName}
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
  );
}
