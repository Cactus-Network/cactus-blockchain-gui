import { Commands } from './Commands';

// list of cactus commands that are allowed to be used by dapp without confirmation
const DAPP_ALLOWED_COMMANDS = new Set<keyof typeof Commands>([
  'cactus_wallet.get_wallets',
  'cactus_wallet.get_next_address',
  'cactus_wallet.get_sync_status',
  'cactus_wallet.get_coin_records_by_names',
  'cactus_wallet.select_coins',
  'cactus_wallet.get_height_info',
  'cactus_wallet.get_puzzle_and_solution',
  'cactus_wallet.get_timestamp_for_height',
  'cactus_wallet.get_transaction',
  'cactus_wallet.get_offer',
  'cactus_wallet.get_offer_summary',
  'cactus_wallet.check_offer_validity',
  'cactus_wallet.cat_get_asset_id',
  'cactus_wallet.cat_get_name',
  'cactus_wallet.cat_asset_id_to_name',
  'cactus_wallet.nft_get_info',
  'cactus_wallet.nft_get_wallet_did',
  'cactus_wallet.nft_calculate_royalties',
  'cactus_wallet.vc_get',
  'cactus_wallet.vc_get_proofs_for_root',
  'cactus_wallet.did_get_did',
  'cactus_wallet.did_get_info',
  'cactus_wallet.did_get_metadata',
  'cactus_wallet.did_get_pubkey',
  'cactus_wallet.did_get_current_coin_info',
  'cactus_wallet.did_get_wallet_name',
  'cactus_wallet.pw_status',
  'cactus_wallet.verify_signature',
  'cactus_wallet.ping',
]);

export function isDappAllowedCommand(command: string): boolean {
  return DAPP_ALLOWED_COMMANDS.has(command);
}
