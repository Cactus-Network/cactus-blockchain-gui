import { type NFTInfo, type Wallet } from '@chia-network/api';
import {
  useGetNFTWallets,
  useLazyGetNFTsQuery,
  useLazyGetNFTsCountQuery,
  useNFTCoinAdded,
  useGetLoggedInFingerprintQuery,
} from '@chia-network/api-react';
import { uniqBy, sortBy } from 'lodash';
import React, { useMemo, useEffect, type ReactNode } from 'react';

import type Metadata from '../../../@types/Metadata';
import type NFTData from '../../../@types/NFTData';
import useCache from '../../../hooks/useCache';
import useStateAbort from '../../../hooks/useStateAbort';
import compareChecksums from '../../../util/compareChecksums';
import getNFTFileType from '../../../util/getNFTFileType';
import limit from '../../../util/limit';
import parseFileContent from '../../../util/parseFileContent';
import NFTProviderContext from './NFTProviderContext';

function parseMetadataFile(content: Buffer, headers: any) {
  const metadataString = parseFileContent(content, headers);

  return JSON.parse(metadataString) as Metadata;
}

type Change = {
  type: 'add' | 'remove';
  nftId: string;
};

export type NFTProviderProps = {
  children: ReactNode;
  pageSize?: number;
  concurrency?: number;
};

// private ongoingRequests: Map<string, Promise<Buffer>> = new Map();

export default function NFTProvider(props: NFTProviderProps) {
  const { children, pageSize = 12, concurrency = 5 } = props;

  const { data: fingerprint, isLoading: isLoadingFingerprint } = useGetLoggedInFingerprintQuery();

  // number of loaded NFTs
  const [loaded, setLoaded] = useStateAbort(0);
  // total number of NFTs
  const [total, setTotal] = useStateAbort(0);
  // list of NFTs
  const [nfts, setNfts] = useStateAbort<NFTData[]>([]);
  // status of loading
  const [isLoading, setIsLoading] = useStateAbort(false);
  const [error, setError] = useStateAbort<Error | undefined>(undefined);
  const cache = useCache();

  const [getNFTs] = useLazyGetNFTsQuery();
  const [getNFTsCount] = useLazyGetNFTsCountQuery();
  const { wallets: nftWallets, isLoading: isLoadingWallets } = useGetNFTWallets();

  const [, setChanges] = useStateAbort<Change[]>([]);

  const metadataAdd = limit(concurrency);

  useNFTCoinAdded((data) => {
    // console.log('NFT coin added', data);

    const { nftId } = data;

    setChanges((prevChanges) => [...prevChanges, { type: 'add', nftId }]);
  });

  async function fetchNFTsCount(walletId: number, signal?: AbortSignal) {
    const { total: count } = await getNFTsCount({
      walletIds: [walletId],
      signal,
    }).unwrap();

    return count;
  }

  async function fetchNFTsPage(walletId: number, pageIndex: number, signal: AbortSignal) {
    const startIndex = pageIndex * pageSize;
    const nftsByWallet = await getNFTs({
      walletIds: [walletId],
      startIndex,
      num: pageSize,
      signal,
    }).unwrap();

    if (signal?.aborted) {
      return;
    }

    const page = nftsByWallet[walletId];

    setNfts((prevNfts) => {
      const uniqueNfts = uniqBy(
        [
          ...prevNfts,
          ...page.map((nft: NFTInfo) => ({
            nft,
            type: getNFTFileType(nft),
          })),
        ],
        (nftItem) => nftItem.nft.$nftId
      );

      return sortBy(uniqueNfts, (nftItem) => nftItem.nft.nftCoinConfirmationHeight);
    }, signal);

    setLoaded((prevLoaded) => prevLoaded + page.length, signal);

    // try to get metadata for each NFT without await (we can show data without metadata)
    page.map((nft: NFTInfo) => metadataAdd(() => fetchMetadata(nft, signal)));
  }

  async function updateNft(id: string, data: Partial<NFTData>, signal: AbortSignal) {
    setNfts(
      (prevNfts) =>
        prevNfts.map((nftItem) => {
          if (nftItem.nft.$nftId === id) {
            return {
              ...nftItem,
              ...data,
            };
          }

          return nftItem;
        }),
      signal
    );
  }

  async function fetchAndProcessMetadata(uri: string, hash: string | undefined) {
    const { content, headers, checksum } = await cache.get(uri);

    if (hash && !compareChecksums(checksum, hash)) {
      throw new Error('Checksum mismatch');
    }

    return parseMetadataFile(content, headers);
  }

  async function fetchMetadata(nft: NFTInfo, signal: AbortSignal) {
    const { $nftId: nftId, metadataUris = [], metadataHash } = nft;

    try {
      const [firstUri] = metadataUris;
      if (!firstUri) {
        return undefined;
      }

      const existingNft = nfts.find((nftItem) => nftItem.nft.$nftId === nftId);
      if (existingNft?.metadataPromise) {
        return await existingNft.metadataPromise;
      }

      const promise = fetchAndProcessMetadata(firstUri, metadataHash);

      updateNft(
        nftId,
        {
          metadata: undefined,
          metadataError: undefined,
          metadataPromise: promise,
        },
        signal
      );

      promise.then(
        (metadata) => {
          updateNft(
            nftId,
            {
              metadata,
              metadataPromise: undefined,
            },
            signal
          );
        },
        () => {
          updateNft(
            nftId,
            {
              metadataPromise: undefined,
            },
            signal
          );
        }
      );

      const metadata = await promise;

      updateNft(
        nftId,
        {
          metadata,
          metadataPromise: undefined,
        },
        signal
      );

      return metadata;
    } catch (err) {
      updateNft(
        nftId,
        {
          metadataError: err as Error,
          metadataPromise: undefined,
        },
        signal
      );

      return undefined;
    }
  }

  async function fetchData(options: { signal: AbortSignal }) {
    const { signal } = options;
    if (isLoading) {
      return;
    }

    setIsLoading(true, signal);
    setError(undefined, signal);
    setChanges([], signal);

    const add = limit(concurrency);

    async function processWallet(wallet: Wallet) {
      const { id: walletId } = wallet;
      const count = await fetchNFTsCount(walletId, signal);
      if (signal?.aborted) {
        return;
      }

      setTotal((prevTotal) => prevTotal + count, signal);
      const numPages = Math.ceil(count / pageSize);

      const fetchLimited = (pageIndex: number) => add(() => fetchNFTsPage(walletId, pageIndex, signal));

      const pageIndices = [];
      for (let i = 0; i < numPages; i++) {
        pageIndices.push(i);
      }

      try {
        await Promise.all(pageIndices.map(fetchLimited));
      } catch (err) {
        if (signal?.aborted) {
          return;
        }

        setError(err as Error, signal);
      }
    }

    try {
      await Promise.all(nftWallets.map(processWallet));
    } catch (err) {
      setError(err as Error, signal);
    } finally {
      setIsLoading(false, signal);
    }

    // if changes changed while we were fetching, fetch again
    setChanges((prevChanges) => {
      if (prevChanges.length > 0) {
        return prevChanges;
      }

      return [];
    }, signal);
  }

  function reset() {
    setChanges([]);
    setNfts([]);
    setTotal(0);
    setLoaded(0);
    setIsLoading(false);
    setError(undefined);
  }

  useEffect(() => {
    if (!isLoadingWallets && nftWallets && fingerprint) {
      const abortController = new AbortController();
      fetchData({
        signal: abortController.signal,
      });

      return () => {
        abortController.abort();
        reset();
      };
    }

    return undefined;
  }, [isLoadingWallets, nftWallets, fingerprint]); // eslint-disable-line react-hooks/exhaustive-deps -- we want to fetch data only once

  const isLoadingNFTProvider = isLoading || isLoadingFingerprint;

  const context = useMemo(
    () => ({
      nfts,
      count: total,
      loaded,
      isLoading: isLoadingNFTProvider,
      error,
      progress: total > 0 ? (loaded / total) * 100 : 0,
    }),
    [nfts, total, loaded, isLoadingNFTProvider, error]
  );

  return <NFTProviderContext.Provider value={context}>{children}</NFTProviderContext.Provider>;
}
