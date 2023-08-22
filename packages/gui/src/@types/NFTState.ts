import { type NFTInfo } from '@cactus-network/api';

type NFTState = {
  nft?: NFTInfo;
  isLoading: boolean;
  error?: Error;
};

export default NFTState;
