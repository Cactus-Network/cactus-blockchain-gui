import type { Wallet } from '@cactus-network.net/api';
import { WalletType } from '@cactus-network.net/api';

export default function findCATWalletByAssetId(wallets: Wallet[], assetId: string) {
  return wallets.find(
    (wallet) => wallet.type === WalletType.CAT && wallet.meta?.assetId?.toLowerCase() === assetId.toLowerCase()
  );
}
