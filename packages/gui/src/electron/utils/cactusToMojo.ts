import type BigNumber from 'bignumber.js';

import Unit from '../constants/Unit';

import cactusFormatter from './cactusFormatter';

export default function cactusToMojo(cactus: string | number | bigint | BigNumber): BigInt {
  return BigInt(cactusFormatter(cactus, Unit.CACTUS).to(Unit.MOJO).toBigNumber().toFixed(0));
}
