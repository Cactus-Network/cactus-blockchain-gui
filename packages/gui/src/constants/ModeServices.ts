import { ServiceName } from '@cactus-network/api';
import { Mode } from '@cactus-network/core';

export default {
  [Mode.WALLET]: [ServiceName.WALLET],
  [Mode.FARMING]: [ServiceName.WALLET, ServiceName.FULL_NODE, ServiceName.FARMER, ServiceName.HARVESTER],
};

export const SimulatorServices = [ServiceName.WALLET, ServiceName.SIMULATOR];
