export default [
  'cactus_full_node.push_tx',

  'cactus_wallet.create_new_wallet',
  'cactus_wallet.send_transaction',
  'cactus_wallet.create_signed_transaction',

  'cactus_wallet.send_transaction_multi',
  'cactus_wallet.push_transactions',
  'cactus_wallet.spend_clawback_coins',
  'cactus_wallet.send_notification',
  'cactus_wallet.cat_spend',
  'cactus_wallet.create_offer_for_ids',
  'cactus_wallet.take_offer',
  'cactus_wallet.cancel_offer',
  'cactus_wallet.cancel_offers',

  'cactus_wallet.sign_message_by_id',
  'cactus_wallet.sign_message_by_address',

  'cactus_wallet.did_update_recovery_ids',
  'cactus_wallet.did_message_spend',
  'cactus_wallet.did_update_metadata',
  'cactus_wallet.did_recovery_spend',
  'cactus_wallet.did_create_attest',
  'cactus_wallet.did_transfer_did',

  'cactus_wallet.vc_spend',
  'cactus_wallet.vc_revoke',

  'cactus_wallet.pw_join_pool',
  'cactus_wallet.pw_self_pool',
  'cactus_wallet.pw_absorb_rewards',

  'cactus_wallet.create_new_wallet',
  'cactus_wallet.delete_key',
  'cactus_wallet.delete_all_keys',

  // data layer commands
  'cactus_data_layer.cancel_offer',
  'cactus_data_layer.create_data_store',
  'cactus_data_layer.delete_key',
  'cactus_data_layer.delete_mirror',
  'cactus_data_layer.insert',
  'cactus_data_layer.make_offer',
  'cactus_data_layer.take_offer',
  'cactus_data_layer.add_mirror',
  'cactus_data_layer.batch_update',

  // NFT commands
  'cactus_wallet.nft_mint_nft',
  'cactus_wallet.nft_set_nft_did',
  'cactus_wallet.nft_set_did_bulk',
  'cactus_wallet.nft_transfer_bulk',
  'cactus_wallet.nft_transfer_nft',
  'cactus_wallet.nft_add_uri',
  'cactus_wallet.nft_mint_bulk',

  'cactus_farmer.set_payout_instructions',

  'daemon.stop_plotting',
  /*
  'daemon.set_keyring_passphrase',
  'daemon.remove_keyring_passphrase',
  'daemon.unlock_keyring',
  'daemon.migrate_keyring',
  */
];
