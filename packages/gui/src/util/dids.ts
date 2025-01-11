import { toBech32m, fromBech32m } from '@cactus-network/api';

import removeHexPrefix from './removeHexPrefix';

export function didToDIDId(did: string): string {
  return toBech32m(removeHexPrefix(did), 'did:cactus:');
}

export function didFromDIDId(didId: string): string | undefined {
  let decoded: string | undefined;

  try {
    decoded = fromBech32m(didId);
  } catch (e) {
    return undefined;
  }

  return decoded;
}
