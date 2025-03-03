import type { Wallet } from '@cactus-network/api';
import { useGetDIDsQuery, useGetNFTWallets, useGetNFTWalletsWithDIDsQuery } from '@cactus-network/api-react';
import { DropdownActions, MenuItem } from '@cactus-network/core';
import { NFTsSmall as NFTsSmallIcon } from '@cactus-network/icons';
import { Trans } from '@lingui/macro';
import { AutoAwesome as AutoAwesomeIcon, PermIdentity as PermIdentityIcon } from '@mui/icons-material';
import { ListItemIcon } from '@mui/material';
import { orderBy } from 'lodash';
import React, { useMemo } from 'react';

import useNachoNFTs from '../../hooks/useNachoNFTs';

import { getNFTInbox } from './utils';

type Profile = Wallet & {
  nftWalletId: number;
};

function useProfiles() {
  // const { data: wallets, isLoading, error } = useGetWalletsQuery();
  const { data: dids, isLoading, error } = useGetDIDsQuery();
  const { data: nftWallets, isLoading: loadingNFTWallets } = useGetNFTWalletsWithDIDsQuery();

  const profiles: Profile[] = useMemo(() => {
    if (!dids || !nftWallets) {
      return [];
    }
    const profilesLocal = nftWallets.map((nftWallet: Wallet) => ({
      ...dids.find((didWallet: Wallet) => didWallet.id === nftWallet.didWalletId),
      nftWalletId: nftWallet.walletId,
    }));

    return orderBy(profilesLocal, ['name'], ['asc']);
  }, [dids, nftWallets]);

  return {
    isLoading: isLoading || loadingNFTWallets,
    data: profiles,
    error,
  };
}

export type NFTGallerySidebarProps = {
  walletId?: number;
  onChange: (walletId?: number) => void;
};

export default function NFTProfileDropdown(props: NFTGallerySidebarProps) {
  const { onChange, walletId } = props;
  const { isLoading: isLoadingProfiles, data: profiles } = useProfiles();
  const { wallets: nftWallets, isLoading: isLoadingNFTWallets } = useGetNFTWallets();
  const { data: nachoNFTs, isLoading: isLoadingNachoNFTs } = useNachoNFTs();
  const haveNachoNFTs = !isLoadingNachoNFTs && nachoNFTs?.length > 0;

  const inbox: Wallet | undefined = useMemo(() => {
    if (isLoadingNFTWallets) {
      return undefined;
    }

    return getNFTInbox(nftWallets);
  }, [nftWallets, isLoadingNFTWallets]);

  const remainingNFTWallets = useMemo(() => {
    if (isLoadingProfiles || isLoadingNFTWallets || !inbox) {
      return undefined;
    }

    const nftWalletsWithoutDIDs = nftWallets.filter(
      (nftWallet: Wallet) =>
        nftWallet.id !== inbox.id &&
        profiles.find((profile: Profile) => profile.nftWalletId === nftWallet.id) === undefined,
    );

    return nftWalletsWithoutDIDs;
  }, [profiles, nftWallets, inbox, isLoadingProfiles, isLoadingNFTWallets]);

  const label = useMemo(() => {
    if (isLoadingProfiles || isLoadingNFTWallets) {
      return 'Loading...';
    }

    if (walletId === -1) {
      return 'Nacho NFTs';
    }

    if (inbox && inbox.id === walletId) {
      return <Trans>Unassigned NFTs</Trans>;
    }

    const profile = profiles?.find((item: Profile) => item.nftWalletId === walletId);

    if (profile) {
      return profile.name;
    }

    const nftWallet = remainingNFTWallets?.find((wallet: Wallet) => wallet.id === walletId);

    if (nftWallet) {
      return `${nftWallet.name} ${nftWallet.id}`;
    }

    return <Trans>All NFTs</Trans>;
  }, [profiles, remainingNFTWallets, isLoadingProfiles, isLoadingNFTWallets, walletId, inbox]);

  function handleWalletChange(newWalletId?: number) {
    onChange?.(newWalletId);
  }

  return (
    <DropdownActions onSelect={handleWalletChange} label={label} variant="text" color="secondary" size="large">
      <MenuItem key="all" onClick={() => handleWalletChange()} selected={walletId === undefined} close>
        <ListItemIcon>
          <AutoAwesomeIcon />
        </ListItemIcon>
        <Trans>All NFTs</Trans>
      </MenuItem>
      {inbox && (
        <MenuItem key="inbox" onClick={() => handleWalletChange(inbox.id)} selected={walletId === inbox.id} close>
          <ListItemIcon>
            <NFTsSmallIcon />
          </ListItemIcon>
          <Trans>Unassigned NFTs</Trans>
        </MenuItem>
      )}
      {(remainingNFTWallets ?? []).map((wallet: Wallet) => (
        <MenuItem key={wallet.id} onClick={() => handleWalletChange(wallet.id)} selected={walletId === wallet.id} close>
          <ListItemIcon>
            <NFTsSmallIcon />
          </ListItemIcon>
          {wallet.name} {wallet.id}
        </MenuItem>
      ))}
      {(profiles ?? []).map((profile: Profile) => (
        <MenuItem
          key={profile.nftWalletId}
          onClick={() => handleWalletChange(profile.nftWalletId)}
          selected={profile.nftWalletId === walletId}
          close
        >
          <ListItemIcon>
            <PermIdentityIcon />
          </ListItemIcon>
          {profile.name}
        </MenuItem>
      ))}
      {haveNachoNFTs && (
        <MenuItem key="nacho" onClick={() => handleWalletChange(-1)} selected={walletId === -1} close>
          <ListItemIcon>
            <NFTsSmallIcon />
          </ListItemIcon>
          Nacho NFTs
        </MenuItem>
      )}
    </DropdownActions>
  );
}
