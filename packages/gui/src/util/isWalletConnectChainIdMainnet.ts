import { WcError, WcErrorCode } from '../@types/WcError';

export function isWalletConnectChainIdMainnet(chainId: string): boolean {
  if (chainId === 'cactus:mainnet') {
    return true;
  }

  if (chainId === 'cactus:testnet') {
    return false;
  }

  throw new WcError('Network not supported', WcErrorCode.UNSUPPORTED_CHAINS);
}
