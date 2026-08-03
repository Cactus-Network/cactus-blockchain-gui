import Client from '@walletconnect/sign-client';
import { useState, useEffect, useCallback, useMemo } from 'react';

import useWalletConnectPreferences from './useWalletConnectPreferences';

function clearWalletConnectStorage(): void {
  if (typeof indexedDB === 'undefined') return;
  try {
    indexedDB.deleteDatabase('WALLET_CONNECT_V2_INDEXED_DB');
  } catch {
    /* best-effort */
  }
}

const defaultMetadata = {
  name: 'Cactus Blockchain',
  description: 'GUI for Cactus Blockchain',
  url: 'https://www.cactus-network.net',
  icons: ['https://www.cactus-network.net/wp-content/uploads/2022/09/cactus-logo.svg'],
};

export type UseWalletConnectConfig = {
  projectId: string;
  relayUrl?: string;
  metadata?: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
  debug?: boolean;
};

type WalletConnectSingleton = {
  client?: Client;
  initPromise?: Promise<Client>;
  configKey?: string;
};

function getSingleton(): WalletConnectSingleton {
  const globalStore = globalThis as typeof globalThis & {
    cactusWalletConnectSingleton?: WalletConnectSingleton;
  };
  if (!globalStore.cactusWalletConnectSingleton) {
    globalStore.cactusWalletConnectSingleton = {};
  }
  return globalStore.cactusWalletConnectSingleton;
}

let clientRequestId = 1;

export default function useWalletConnectClient(config: UseWalletConnectConfig) {
  const { projectId, relayUrl = 'wss://relay.walletconnect.com', metadata = defaultMetadata, debug = false } = config;

  const { enabled } = useWalletConnectPreferences();

  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<Client | undefined>();
  const [error, setError] = useState<Error | undefined>();

  const metadataString = JSON.stringify(metadata);
  const memoizedMetadata = useMemo(() => JSON.parse(metadataString), [metadataString]);
  const configKey = useMemo(
    () => JSON.stringify({ projectId, relayUrl, metadata: memoizedMetadata, debug }),
    [projectId, relayUrl, memoizedMetadata, debug],
  );

  const prepareClient = useCallback(async () => {
    const currentRequestId = ++clientRequestId;
    const singleton = getSingleton();

    try {
      setError(undefined);
      setIsLoading(true);

      if (!enabled) {
        setClient(undefined);
        return;
      }

      if (singleton.client) {
        if (singleton.configKey && singleton.configKey !== configKey) {
          console.warn('[WC singleton] Reusing existing client with different config');
        }
        if (currentRequestId === clientRequestId) {
          setClient(singleton.client);
        }
        return;
      }

      if (!singleton.initPromise) {
        singleton.configKey = configKey;
        singleton.initPromise = Client.init({
          // Keep internal WC protocol errors visible even in non-debug mode.
          logger: debug ? 'debug' : 'error',
          projectId,
          relayUrl,
          metadata: memoizedMetadata,
        })
          .then((createdClient) => {
            singleton.client = createdClient;
            return createdClient;
          })
          .catch((initError) => {
            console.error('[WC] Client.init() failed, clearing storage', initError);
            clearWalletConnectStorage();
            singleton.initPromise = undefined;
            singleton.configKey = undefined;
            throw initError;
          });
      }

      const newClient = await singleton.initPromise;
      if (currentRequestId === clientRequestId) {
        setClient(newClient);
      }
    } catch (e) {
      if (currentRequestId === clientRequestId) {
        setError(e as Error);
      }
    } finally {
      if (currentRequestId === clientRequestId) {
        setIsLoading(false);
      }
    }
  }, [projectId, relayUrl, memoizedMetadata, debug, enabled, configKey]);

  useEffect(() => {
    prepareClient();
  }, [prepareClient]);

  return {
    isLoading,
    client,
    error,
  };
}
