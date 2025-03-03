import { useGetWalletBalanceQuery, useGetCurrentDerivationIndexQuery } from '@cactus-network/api-react';
import { CardSimple, Flex, TooltipIcon } from '@cactus-network/core';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import React, { ReactElement } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';

import useWallet from '../../hooks/useWallet';
import useWalletHumanValue from '../../hooks/useWalletHumanValue';
import WalletGraph from '../WalletGraph';

const StyledGraphContainer = styled.div`
  margin-left: -1rem;
  margin-right: -1rem;
  margin-top: 1rem;
  margin-bottom: -1rem;
  position: relative;
`;

type Props = {
  walletId: number;
  tooltip?: ReactElement<any>;
};

export default function WalletCardTotalBalance(props: Props) {
  const { walletId, tooltip } = props;
  const navigate = useNavigate();

  const { data } = useGetCurrentDerivationIndexQuery();

  const {
    data: walletBalance,
    isLoading: isLoadingWalletBalance,
    error,
  } = useGetWalletBalanceQuery(
    {
      walletId,
    },
    {
      pollingInterval: 10_000,
    },
  );

  const { wallet, unit = '', loading } = useWallet(walletId);

  const isLoading = loading || isLoadingWalletBalance;
  const value = walletBalance?.confirmedWalletBalance;

  const humanValue = useWalletHumanValue(wallet, value, unit);
  const hasDerivationIndex = data !== null && data !== undefined;

  function handleDerivationIndex() {
    navigate('/dashboard/settings/general');
  }

  return (
    <CardSimple
      loading={isLoading}
      title={<Trans>Total Balance</Trans>}
      tooltip={tooltip}
      value={humanValue}
      error={error}
      actions={
        hasDerivationIndex && (
          <Typography variant="body2" color="textSecondary" onClick={handleDerivationIndex} component="div">
            <Flex alignItems="center" gap={1}>
              <Trans>Derivation Index: {data?.index}</Trans>
              <TooltipIcon>
                <Trans>
                  The derivation index sets the range of wallet addresses that the wallet scans the blockchain for. This
                  number is generally higher if you have a lot of transactions or canceled offers for CAC, CATs, or
                  NFTs. If you believe your balance is incorrect because it’s missing coins, then increasing the
                  derivation index could help the wallet include the missing coins in the balance total.
                </Trans>
              </TooltipIcon>
            </Flex>
          </Typography>
        )
      }
    >
      <Flex flexGrow={1} />
      <StyledGraphContainer>
        <WalletGraph
          walletId={walletId}
          walletType={wallet.type}
          unit={unit.length > 0 ? unit.toUpperCase() : wallet.name}
          height={80}
        />
      </StyledGraphContainer>
    </CardSimple>
  );
}
