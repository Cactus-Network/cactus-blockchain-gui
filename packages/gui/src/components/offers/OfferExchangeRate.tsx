import { WalletType } from '@cactus-network/api';
import { Flex } from '@cactus-network/core';
import { ImportExport } from '@mui/icons-material';
import { InputAdornment, TextField, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { NumericFormat } from 'react-number-format';

import { AssetIdMapEntry } from '../../hooks/useAssetIdName';

interface OfferExchangeRateNumberFormatProps {
  inputRef: (instance: typeof NumericFormat | null) => void;
  name: string;
}

function OfferExchangeRateNumberFormat(props: OfferExchangeRateNumberFormatProps) {
  const { inputRef, ...other } = props;

  return <NumericFormat {...other} getInputRef={inputRef} allowNegative={false} valueIsNumericString />;
}

type Props = {
  readOnly?: boolean;
  makerAssetInfo: AssetIdMapEntry;
  takerAssetInfo: AssetIdMapEntry;
  makerExchangeRate?: number;
  takerExchangeRate?: number;
  takerExchangeRateChanged: (newRate: number) => void;
  makerExchangeRateChanged: (newRate: number) => void;
};
export default function OfferExchangeRate(props: Props) {
  const {
    readOnly = true,
    makerAssetInfo,
    takerAssetInfo,
    makerExchangeRate,
    takerExchangeRate,
    takerExchangeRateChanged,
    makerExchangeRateChanged,
  } = props;

  const [editingMakerExchangeRate, setEditingMakerExchangeRate] = useState(false);
  const [editingTakerExchangeRate, setEditingTakerExchangeRate] = useState(false);
  const [makerDisplayRate, takerDisplayRate] = useMemo(
    () =>
      [
        {
          rate: makerExchangeRate,
          walletType: makerAssetInfo.walletType,
          counterCurrencyName: takerAssetInfo.displayName,
        },
        {
          rate: takerExchangeRate,
          walletType: takerAssetInfo.walletType,
          counterCurrencyName: makerAssetInfo.displayName,
        },
      ].map(({ rate, walletType }) => {
        let displayRate = '';

        if (Number.isInteger(rate)) {
          displayRate = `${rate}`;
        } else if (rate && Number.isFinite(rate)) {
          // !(NaN or Infinity)
          const fixed = rate.toFixed(walletType === WalletType.STANDARD_WALLET ? 9 : 12);

          // remove trailing zeros
          displayRate = fixed.replace(/\.0+$/, '');
        }
        return `${displayRate}`;
      }),
    [makerAssetInfo, takerAssetInfo, makerExchangeRate, takerExchangeRate],
  );

  const makerValueProps = editingMakerExchangeRate === false ? { value: makerDisplayRate } : {};
  const takerValueProps = editingTakerExchangeRate === false ? { value: takerDisplayRate } : {};

  return (
    <Flex flexDirection="row">
      <Flex flexDirection="row" flexGrow={1} justifyContent="flex-end" gap={3} style={{ width: '45%' }}>
        <Flex alignItems="baseline" gap={1}>
          <Typography variant="subtitle1" noWrap>
            1 {makerAssetInfo.displayName} =
          </Typography>
          <TextField
            {...makerValueProps}
            key={`makerExchangeRate-${takerAssetInfo.displayName}`}
            id={`makerExchangeRate-${takerAssetInfo.displayName}`}
            variant="outlined"
            size="small"
            onFocus={() => setEditingMakerExchangeRate(true)}
            onBlur={() => setEditingMakerExchangeRate(false)}
            onChange={(event) => takerExchangeRateChanged(Number(event.target.value))}
            InputProps={{
              inputComponent: OfferExchangeRateNumberFormat as any,
              inputProps: {
                decimalScale: takerAssetInfo.walletType === WalletType.STANDARD_WALLET ? 12 : 9,
              },
              endAdornment: <InputAdornment position="end">{takerAssetInfo.displayName}</InputAdornment>,
              readOnly,
            }}
            fullWidth={false}
          />
        </Flex>
      </Flex>
      <Flex flexDirection="column" alignItems="center" justifyContent="center" style={{ width: '2em' }}>
        <ImportExport style={{ transform: 'rotate(90deg)' }} />
      </Flex>
      <Flex flexDirection="row" gap={3} flexGrow={1} style={{ width: '45%' }}>
        <Flex alignItems="baseline" gap={1}>
          <TextField
            {...takerValueProps}
            key={`takerExchangeRate-${makerAssetInfo.displayName}`}
            id={`takerExchangeRate-${makerAssetInfo.displayName}`}
            variant="outlined"
            size="small"
            onFocus={() => setEditingTakerExchangeRate(true)}
            onBlur={() => setEditingTakerExchangeRate(false)}
            onChange={(event) => makerExchangeRateChanged(Number(event.target.value))}
            InputProps={{
              inputComponent: OfferExchangeRateNumberFormat as any,
              inputProps: {
                decimalScale: makerAssetInfo.walletType === WalletType.STANDARD_WALLET ? 12 : 9,
              },
              endAdornment: <InputAdornment position="end">{makerAssetInfo.displayName}</InputAdornment>,
              readOnly,
            }}
            fullWidth={false}
          />
          <Typography variant="subtitle1" noWrap>
            = 1 {takerAssetInfo.displayName}
          </Typography>
        </Flex>
      </Flex>
    </Flex>
  );
}
