import { BlockchainState } from '@cactus-network/api';
import { useGetBlockchainStateQuery } from '@cactus-network/api-react';

import FullNodeState from '../constants/FullNodeState';

export default function useFullNodeState(): {
  isLoading: boolean;
  state?: FullNodeState;
  data?: BlockchainState;
  error?: Error;
} {
  const {
    data: blockchainState,
    isLoading,
    error,
  } = useGetBlockchainStateQuery(
    {},
    {
      pollingInterval: 10_000,
    },
  );
  const blockchainSynced = blockchainState?.sync?.synced;
  const blockchainSynching = blockchainState?.sync?.syncMode;

  let state: FullNodeState;
  if (blockchainSynching) {
    state = FullNodeState.SYNCHING;
  } else if (blockchainSynced) {
    state = FullNodeState.SYNCED;
  } else {
    state = FullNodeState.ERROR;
  }

  return {
    isLoading,
    state,
    data: blockchainState,
    error: error as Error,
  };
}
