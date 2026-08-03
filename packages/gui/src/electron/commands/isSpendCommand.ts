import { Commands } from './Commands';

const SPEND_COMMANDS = new Set<keyof typeof Commands>([
  'cactus_wallet.send_transaction',
  'cactus_wallet.cat_spend',
  'cactus_wallet.nft_transfer_nft',
  'cactus_wallet.cancel_offer',
  'cactus_wallet.create_offer_for_ids',
  'cactus_wallet.take_offer',
  'cactus_wallet.spend_clawback_coins',
  'cactus_wallet.did_transfer_did',
  'cactus_wallet.push_transactions',
]);

export function isSpendCommand(command: string): boolean {
  return SPEND_COMMANDS.has(command);
}
